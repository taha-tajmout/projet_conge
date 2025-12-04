package com.example.demo.repository;

import com.example.demo.model.demande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DemandeRepository extends JpaRepository<demande, Long> {
    List<demande> findByMatricule(int matricule);

    List<demande> findByStatut(String statut);

    // NOUVELLES MÉTHODES pour la hiérarchie de validation
    List<demande> findByStatutAndNiveauValidation(String statut, String niveauValidation);
    
    // Méthode pour filtrer par statut, niveau de validation ET direction
    List<demande> findByStatutAndNiveauValidationAndDirection(String statut, String niveauValidation, String direction);

    // Méthode pour récupérer les demandes selon le statut et le niveau de validation

    //pour etre plius specifique
    @Query("SELECT d FROM demande d WHERE d.statut = 'Approuvé' ORDER BY d.dateDemande DESC")
    List<demande> findAllApprovedDemandes();
}
