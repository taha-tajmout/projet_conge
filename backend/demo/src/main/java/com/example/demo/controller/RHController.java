package com.example.demo.controller;

import java.util.ArrayList;

import com.example.demo.model.Utilisateur;
import com.example.demo.repository.UtilisateurRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/rh")
@CrossOrigin(origins = "http://localhost:4200")
public class RHController {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @GetMapping("/email")
    public ResponseEntity<?> getAllRHEmails() {
        try {
            // Chercher tous les utilisateurs RH
            List<Utilisateur> rhUsers = utilisateurRepository.findByStatutIgnoreCase("RH");
            
            if (!rhUsers.isEmpty()) {
                // Créer une liste avec tous les utilisateurs RH
                List<Map<String, Object>> rhList = new ArrayList<>();
                for (Utilisateur rhUser : rhUsers) {
                    Map<String, Object> rhInfo = new HashMap<>();
                    rhInfo.put("id", rhUser.getMatricule());
                    rhInfo.put("email", rhUser.getEmail());
                    rhInfo.put("nom", rhUser.getNom() + " " + rhUser.getPrenom());
                    rhInfo.put("nomComplet", rhUser.getNom() + " " + rhUser.getPrenom() + " (" + rhUser.getEmail() + ")");
                    rhList.add(rhInfo);
                }
                
                 return ResponseEntity.ok(rhList);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Aucun utilisateur RH trouvé"));
            }
        } catch (Exception error) {
            error.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Erreur serveur: " + error.getMessage()));
        }
    }
}