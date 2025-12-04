package com.example.demo.controller;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Utilisateur;
import com.example.demo.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.config.ConfigDataResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.lang.Boolean.TRUE;

@RestController
@RequestMapping("/api/v1/")
public class UtilisateurController
{
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    //derniere ajouté
    @GetMapping("/utilisateurs/by-email/{email}")
    public ResponseEntity<Utilisateur> getUtilisateurByEmail(@PathVariable String email) {
        String decodedEmail = URLDecoder.decode(email, StandardCharsets.UTF_8);
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email);
        if (utilisateur == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(utilisateur);
    }

    //pour editer
    @GetMapping("/utilisateurs/check-email")
    public ResponseEntity<Boolean> checkEmailExistsExcludingUser(
            @RequestParam String email,
            @RequestParam int currentMatricule) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email);
        boolean emailExists = utilisateur != null && utilisateur.getMatricule() != currentMatricule;
        return ResponseEntity.ok(emailExists);
    }

    //   pour vérification unique
    @GetMapping("/utilisateurs/check")
    public ResponseEntity<Map<String, Boolean>> checkEmailAndMatricule(
            @RequestParam String email,
            @RequestParam int matricule) {
        boolean emailExists = utilisateurRepository.existsByEmail(email);
        boolean matriculeExists = utilisateurRepository.existsById((long) matricule);

        Map<String, Boolean> result = new HashMap<>();
        result.put("emailExists", emailExists);
        result.put("matriculeExists", matriculeExists);
        return ResponseEntity.ok(result);
    }



    //get all empolyes
    @GetMapping("/utilisateurs")
    public List<Utilisateur> getAllUtilisateur()
    { return utilisateurRepository.findAll();}
    //create utilisateur REST API
    // @PostMapping("/utilisateurs")
    //public Utilisateur createUtilisateur(@RequestBody Utilisateur utilisateur)
    //{
    //  return utilisateurRepository.save(utilisateur);
    //}
  @PostMapping("/utilisateurs")
public ResponseEntity<?> createUtilisateur(@RequestBody Utilisateur utilisateur) {
    try {
        // Debug : afficher toutes les données reçues
        System.out.println("=== DEBUG CRÉATION UTILISATEUR ===");
        System.out.println("Matricule reçu: " + utilisateur.getMatricule());
        System.out.println("Nom reçu: " + utilisateur.getNom());
        System.out.println("Prénom reçu: " + utilisateur.getPrenom());
        System.out.println("Email reçu: " + utilisateur.getEmail());
        System.out.println("Statut reçu: " + utilisateur.getStatut());
        System.out.println("Sexe reçu: " + utilisateur.getSexe());
        System.out.println("Mot de passe reçu: " + utilisateur.getMotDePasse());
        
        // Validation des champs obligatoires
        if (utilisateur.getMatricule() == null || utilisateur.getMatricule() <= 0) {
            return ResponseEntity.badRequest().body("Matricule invalide");
        }
        
        if (utilisateur.getEmail() == null || utilisateur.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email requis");
        }
        
        if (utilisateur.getNom() == null || utilisateur.getNom().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Nom requis");
        }
        
       
        
        System.out.println("Avant sauvegarde - Solde congé: " + utilisateur.getSoldeConge());
        
        // Tentative de sauvegarde
        Utilisateur saved = utilisateurRepository.save(utilisateur);
        
        System.out.println("Utilisateur sauvegardé avec succès, ID: " + saved.getMatricule());
        System.out.println("=== FIN DEBUG ===");
        
        return ResponseEntity.ok(saved);
        
    } catch (Exception e) {
        System.err.println("=== ERREUR LORS DE LA CRÉATION ===");
        System.err.println("Message d'erreur: " + e.getMessage());
        System.err.println("Type d'exception: " + e.getClass().getName());
        e.printStackTrace();
        System.err.println("=== FIN ERREUR ===");
        
        return ResponseEntity.status(500).body("Erreur côté serveur : " + e.getMessage());
    }
}
    //get employee by matricule rest api

    @GetMapping("/utilisateurs/{matricule}")
    public ResponseEntity<Utilisateur> getUtilisateurByMatricule(@PathVariable Long matricule) {
        Utilisateur utilisateur = utilisateurRepository.findById(matricule)
                .orElseThrow(() -> new ResourceNotFoundException("Employé n'existe pas avec le matricule : " + matricule));
        return ResponseEntity.ok(utilisateur);
    }

    //updateutilisateur rest api
    @PutMapping("/utilisateurs/{matricule}")
    public ResponseEntity<Utilisateur> updateUtilisateur(@PathVariable Long matricule,@RequestBody Utilisateur utilisateurDetails)
    {
        System.out.println("=== DEBUG MISE À JOUR UTILISATEUR ===");
        System.out.println("Matricule: " + matricule);
        System.out.println("Direction reçue: " + utilisateurDetails.getDirection());
        
        Utilisateur utilisateur = utilisateurRepository.findById(matricule)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur n'existe pas avec le matricule : " + matricule));

        utilisateur.setNom(utilisateurDetails.getNom());
        utilisateur.setPrenom(utilisateurDetails.getPrenom());
        utilisateur.setStatut(utilisateurDetails.getStatut());
        utilisateur.setSexe(utilisateurDetails.getSexe());
        utilisateur.setSoldeConge(utilisateurDetails.getSoldeConge());
        utilisateur.setEmail(utilisateurDetails.getEmail());
        utilisateur.setMotDePasse(utilisateurDetails.getMotDePasse());
        utilisateur.setDirection(utilisateurDetails.getDirection()); // ✅ AJOUT DE LA DIRECTION
        
        System.out.println("Direction après mise à jour: " + utilisateur.getDirection());
        
        Utilisateur updatedUtilisateur= utilisateurRepository.save(utilisateur);
        
        System.out.println("Direction sauvegardée: " + updatedUtilisateur.getDirection());
        System.out.println("=== FIN DEBUG MISE À JOUR ===");
        
        return ResponseEntity.ok(updatedUtilisateur);
    }
    //delete utilisateur rest api
   /* @DeleteMapping("/utilisateurs/{matricule}")
    public ResponseEntity<Map<String,Boolean>> deleteUtilisateur(@PathVariable Long matricule)
    {
        System.out.println(">>> suppression utilisateur avec matricule: " + matricule);
        Utilisateur utilisateur = utilisateurRepository.findById(matricule)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur n'existe pas avec le matricule : " + matricule));
        utilisateurRepository.delete(utilisateur);
        Map<String,Boolean> response =new HashMap<>();
        response.put("deleted",Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    */
    @DeleteMapping("/utilisateurs/{matricule}")
    public ResponseEntity<?> deleteUtilisateur(@PathVariable Long matricule) {
        try {
            System.out.println(">>> Suppression utilisateur avec matricule: " + matricule);

            Utilisateur utilisateur = utilisateurRepository.findById(matricule)
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur n'existe pas avec le matricule : " + matricule));

            utilisateurRepository.delete(utilisateur);

            Map<String, Boolean> response = new HashMap<>();
            response.put("deleted", Boolean.TRUE);

            System.out.println(">>> Utilisateur supprimé avec succès");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Erreur lors de la suppression: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur lors de la suppression: " + e.getMessage());
        }
    }

    //de demande de conge
    // Add this to UtilisateurController.java
    @GetMapping
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }
    //interrimaure
    @GetMapping("/interimaires")
    public ResponseEntity<List<Map<String, Object>>> getInterimaires() {
        List<Utilisateur> utilisateurs = utilisateurRepository.findAll();

        System.out.println("Nombre d'utilisateurs trouvés : " + utilisateurs.size()); // Debug

        List<Map<String, Object>> interimaires = utilisateurs.stream()
                .map(u -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("matricule", u.getMatricule());
                    userMap.put("nomComplet", u.getNom() );
                    userMap.put("statut", u.getStatut());
                    return userMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(interimaires);
    }
    // Ajoutez cette méthode dans votre contrôleur utilisateur existant

}