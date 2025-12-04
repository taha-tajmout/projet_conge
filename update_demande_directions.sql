-- Mettre à jour les demandes existantes avec la direction des utilisateurs
-- Ce script corrige les demandes qui ont direction = NULL

UPDATE demande d 
JOIN utilisateur u ON d.matricule = u.matricule 
SET d.direction = u.direction 
WHERE d.direction IS NULL OR d.direction = '';

-- Vérifier les résultats
SELECT 
    d.id,
    d.matricule,
    u.nom,
    u.prenom,
    u.direction as user_direction,
    d.direction as demande_direction,
    d.niveau_validation,
    d.statut
FROM demande d
JOIN utilisateur u ON d.matricule = u.matricule
ORDER BY d.id;

-- Afficher les demandes par direction pour vérifier
SELECT 
    d.direction,
    COUNT(*) as nombre_demandes,
    d.niveau_validation,
    d.statut
FROM demande d
WHERE d.direction IS NOT NULL
GROUP BY d.direction, d.niveau_validation, d.statut
ORDER BY d.direction, d.niveau_validation;