package com.example.demo.controller;

import com.example.demo.model.Admin;
import com.example.demo.model.Utilisateur;
import com.example.demo.repository.AdminRepository;
import com.example.demo.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private AdminRepository adminRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("=== LOGIN ATTEMPT ===");
            System.out.println("Email: " + loginRequest.getEmail());
            System.out.println("Password: " + loginRequest.getMotDePasse());
            
            // 1. Vérification admin en premier
            System.out.println("Looking for admin with email: " + loginRequest.getEmail());
            Admin admin = adminRepository.findByEmail(loginRequest.getEmail());
            System.out.println("Admin found: " + (admin != null));
            
            if (admin != null) {
                System.out.println("Admin email from DB: " + admin.getEmail());
                System.out.println("Admin password from DB: " + admin.getMotDePasse());
                System.out.println("Password match: " + admin.getMotDePasse().equals(loginRequest.getMotDePasse()));
                
                if (admin.getMotDePasse().equals(loginRequest.getMotDePasse())) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Connexion admin réussie");
                    response.put("userType", "admin");
                    response.put("email", admin.getEmail());
                    response.put("statut", "admin"); // Important pour le frontend
                    response.put("userData", Map.of(
                            "email", admin.getEmail(),
                            "role", "admin",
                            "statut", "admin" // Cohérence avec le reste
                    ));
                    return ResponseEntity.ok(response);
                }
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Mot de passe admin incorrect"
                ));
            }

            // 2. Vérification utilisateur normal
            Utilisateur utilisateur = utilisateurRepository.findByEmail(loginRequest.getEmail());
            if (utilisateur != null) {
                if (utilisateur.getMotDePasse().equals(loginRequest.getMotDePasse())) {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Connexion utilisateur réussie");
                    response.put("userType", "user");
                    response.put("email", utilisateur.getEmail());
                    response.put("matricule", utilisateur.getMatricule());
                    response.put("statut", utilisateur.getStatut()); // Statut spécifique
                    response.put("direction", utilisateur.getDirection()); // AJOUT: Direction de l'utilisateur
                    response.put("nom", utilisateur.getNom());
                    response.put("prenom", utilisateur.getPrenom());
                    response.put("soldeConge", utilisateur.getSoldeConge());
                    
                    System.out.println("✅ Login réussi pour " + utilisateur.getEmail() + 
                                     " | Statut: " + utilisateur.getStatut() + 
                                     " | Direction: " + utilisateur.getDirection());
                    
                    response.put("userData", Map.of(
                            "email", utilisateur.getEmail(),
                            "nom", utilisateur.getNom(),
                            "prenom", utilisateur.getPrenom(),
                            "soldeConge", utilisateur.getSoldeConge(),
                            "matricule", utilisateur.getMatricule(),
                            "statut", utilisateur.getStatut(),
                            "direction", utilisateur.getDirection() != null ? utilisateur.getDirection() : ""
                    ));
                    return ResponseEntity.ok(response);
                }
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Mot de passe utilisateur incorrect"
                ));
            }

            // 3. Échec d'authentification
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Email ou mot de passe incorrect"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Erreur serveur: " + e.getMessage()
            ));
        }
    }

    // Méthode pour mettre à jour l'admin
    @PutMapping("/admin")
    public ResponseEntity<Map<String, Object>> updateAdmin(@RequestBody Admin adminUpdate) {
        try {
            System.out.println("🔄 Tentative de mise à jour admin avec email: " + adminUpdate.getEmail());
            
            // Trouver l'admin existant par email
            Admin existingAdmin = adminRepository.findByEmail(adminUpdate.getEmail());
            
            if (existingAdmin == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Admin non trouvé"
                ));
            }
            
            // Mettre à jour uniquement le mot de passe si fourni
            if (adminUpdate.getMotDePasse() != null && !adminUpdate.getMotDePasse().isEmpty()) {
                existingAdmin.setMotDePasse(adminUpdate.getMotDePasse());
            }
            
            // Sauvegarder les modifications
            Admin updatedAdmin = adminRepository.save(existingAdmin);
            
            System.out.println("✅ Admin mis à jour avec succès");
            
            // Retourner les données mises à jour (sans le mot de passe)
            Map<String, Object> response = Map.of(
                "email", updatedAdmin.getEmail(),
                "role", "admin",
                "statut", "admin"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la mise à jour admin: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Erreur lors de la mise à jour: " + e.getMessage()
            ));
        }
    }

    // ... (keep other methods like testAdmin)

    public static class LoginRequest {
        private String email;
        private String motDePasse;

        // Getters et Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMotDePasse() { return motDePasse; }
        public void setMotDePasse(String motDePasse) {
            this.motDePasse = motDePasse;
        }
    }
}