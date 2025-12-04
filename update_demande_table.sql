-- Script pour ajouter les colonnes direction et statut_demandeur à la table demande

USE conge_db;

-- Ajouter la colonne direction
ALTER TABLE demande 
ADD COLUMN direction VARCHAR(255) DEFAULT NULL;

-- Ajouter la colonne statut_demandeur
ALTER TABLE demande 
ADD COLUMN statut_demandeur VARCHAR(100) DEFAULT NULL;

-- Mise à jour des demandes existantes avec les données des utilisateurs
UPDATE demande d 
INNER JOIN utilisateur u ON d.matricule = u.matricule 
SET d.direction = u.direction, 
    d.statut_demandeur = u.statut;

-- Vérification des données
SELECT 
    id, 
    matricule, 
    nom_demandeur, 
    direction, 
    statut_demandeur, 
    niveau_validation, 
    statut 
FROM demande 
ORDER BY id DESC;