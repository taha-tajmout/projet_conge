-- Script pour mettre à jour les demandes existantes avec la direction des utilisateurs
USE conge_db;

-- Mettre à jour les demandes avec la direction du demandeur
UPDATE demande d
INNER JOIN utilisateur u ON d.matricule = u.matricule
SET d.direction = u.direction, d.statut_demandeur = u.statut
WHERE d.direction IS NULL OR d.direction = '';

-- Vérifier le résultat
SELECT d.id, d.matricule, d.nom_demandeur, d.direction, d.statut_demandeur, u.statut, u.direction
FROM demande d
INNER JOIN utilisateur u ON d.matricule = u.matricule;