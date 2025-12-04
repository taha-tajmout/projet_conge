package com.example.demo.repository;

import com.example.demo.model.Utilisateur;  // à adapter selon l'emplacement de ton entité
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository <Utilisateur, Long>
{
   

List<Utilisateur> findByStatutIgnoreCase(String statut);
    
    // Ajouter cette méthode
    @Query("SELECT CONCAT(u.nom, ' ', u.prenom) FROM Utilisateur u")
    List<String> findAllNoms();
    Utilisateur findByMatricule(int matricule);
    Utilisateur findByEmail(String email);
    boolean existsByMatricule(int matricule);
    boolean existsByEmail(String email);

}
