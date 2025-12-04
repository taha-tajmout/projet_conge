package com.example.demo.controller;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.demande;
import com.example.demo.repository.DemandeRepository;
import com.example.demo.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.Utilisateur;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/demande")
@CrossOrigin(origins = "http://localhost:4200")
public class DemandeController {

    @Autowired
    private DemandeRepository demandeRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @PostMapping
    public ResponseEntity<?> createDemande(@RequestBody demande demande) {
        try {
            Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findById((long) demande.getMatricule());
            if (utilisateurOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Utilisateur non trouvé");
            }

            Utilisateur utilisateur = utilisateurOpt.get();
            demande.setNomDemandeur(utilisateur.getNom() + " " + utilisateur.getPrenom());
            
            // Ajouter la direction et le statut du demandeur
            demande.setDirection(utilisateur.getDirection());
            demande.setStatutDemandeur(utilisateur.getStatut());

            // NOUVELLE LOGIQUE : Hiérarchie stricte par direction
            String statutUtilisateur = utilisateur.getStatut().toLowerCase();

            switch(statutUtilisateur) {
                case "cadre":
                case "technicien":
                    // Cadres et techniciens → chef de service DE MÊME DIRECTION
                    demande.setNiveauValidation("chef_service");
                    break;

                case "rh":
                    // RH → directeur DE MÊME DIRECTION (pas de hiérarchie intermédiaire)
                    demande.setNiveauValidation("directeur");
                    break;

                case "directeur":
                    // ❌ DIRECTEUR NE PEUT PAS FAIRE DE DEMANDE
                    return ResponseEntity.badRequest().body("Un directeur ne peut pas faire de demande de congé");

                case "chef de service":
                case "chef de division":
                    // Pour les autres niveaux hiérarchiques (cas exceptionnels)
                    demande.setNiveauValidation("chef_division");
                    break;

                default:
                    demande.setNiveauValidation("chef_service"); // Par défaut
            }

            // Vérification du solde pour les congés administratifs
            if ("administratif".equals(demande.getTypeDemande()) &&
                    utilisateur.getSoldeConge() < demande.getDuree()) {
                return ResponseEntity.badRequest().body("Solde de congé insuffisant");
            }

            demande.setStatut("En attente");
            demande.setDateDemande(new Date());
            demande savedDemande = demandeRepository.save(demande);

            return ResponseEntity.ok(savedDemande);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/utilisateur/{matricule}")
    public ResponseEntity<List<demande>> getDemandesByMatricule(@PathVariable int matricule) {
        try {
            System.out.println("Récupération des demandes pour matricule: " + matricule);
            List<demande> demandes = demandeRepository.findByMatricule(matricule);
            System.out.println("Demandes trouvées: " + demandes.size());
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<demande>> getAllDemandes() {
        try {
            List<demande> demandes = demandeRepository.findAll();
            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération de toutes les demandes: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<demande> updateStatut(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String statut = body.get("statut");
            Optional<demande> optionalDemande = demandeRepository.findById(id);
            if (optionalDemande.isPresent()) {
                demande demande = optionalDemande.get();
                demande.setStatut(statut);
                demande savedDemande = demandeRepository.save(demande);
                return ResponseEntity.ok(savedDemande);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Erreur lors de la mise à jour du statut: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/interimaires")
    public ResponseEntity<List<String>> getInterimaires() {
        try {
            List<String> interimaires = utilisateurRepository.findAllNoms();
            return ResponseEntity.ok(interimaires);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des intérimaires: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // MODIFICATION MAJEURE : Récupération des demandes selon le niveau hiérarchique


    // Remplacez les méthodes dans votre DemandeController.java

    @GetMapping("/en-attente")
    public ResponseEntity<List<demande>> getDemandesEnAttente(
            @RequestParam String userRole, 
            @RequestParam String userDirection) {
        try {
            System.out.println("Rôle utilisateur reçu: " + userRole + " | Direction: " + userDirection); // Log important

            String niveauValidation = switch(userRole.toLowerCase()) {
                case "chef de service" -> "chef_service";
                case "chef de division" -> "chef_division";
                case "directeur", "rh" -> "directeur";
                default -> throw new IllegalArgumentException("Rôle non géré: " + userRole);
            };

            // FILTRAGE PAR DIRECTION : utiliser la méthode avec direction
            List<demande> demandes = demandeRepository.findByStatutAndNiveauValidationAndDirection(
                "En attente", 
                niveauValidation, 
                userDirection
            );

            System.out.println("Nombre de demandes trouvées pour direction '" + userDirection + "': " + demandes.size()); // Debug
            demandes.forEach(d -> System.out.println(
                    "Demande ID: " + d.getId() +
                            " | Niveau: " + d.getNiveauValidation() +
                            " | Direction: " + d.getDirection() +
                            " | Demandeur: " + d.getNomDemandeur()
            ));

            return ResponseEntity.ok(demandes);
        } catch (Exception e) {
            System.err.println("ERREUR: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptDemande(@PathVariable Long id, @RequestParam String userRole) {
        try {
            demande demande = demandeRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Demande non trouvée"));

            System.out.println("Acceptation demande ID: " + id + " par rôle: " + userRole);
            System.out.println("Niveau actuel: " + demande.getNiveauValidation());

            // HIÉRARCHIE STRICTE PAR DIRECTION
            switch(userRole.toLowerCase()) {
                case "chef de service":
                    // Vérifier que la demande est bien au bon niveau
                    if (!"chef_service".equals(demande.getNiveauValidation())) {
                        System.out.println("❌ ERREUR: Demande ID " + id + " au niveau '" + demande.getNiveauValidation() + "' mais chef de service attendu 'chef_service'");
                        return ResponseEntity.badRequest().body("Cette demande n'est pas à votre niveau de validation");
                    }
                    System.out.println("🔄 AVANT modification - Demande ID " + id + ":");
                    System.out.println("   - Niveau actuel: " + demande.getNiveauValidation());
                    System.out.println("   - Direction: " + demande.getDirection());
                    System.out.println("   - Statut: " + demande.getStatut());
                    
                    // Chef de service → Chef de division (MÊME DIRECTION)
                    demande.setNiveauValidation("chef_division");
                    
                    System.out.println("🔄 APRÈS setNiveauValidation - Demande ID " + id + ":");
                    System.out.println("   - Nouveau niveau: " + demande.getNiveauValidation());
                    System.out.println("   - Direction: " + demande.getDirection());
                    System.out.println("   - Statut: " + demande.getStatut());
                    System.out.println("✅ Chef de service accepte demande ID " + id + " → niveau chef_division | Direction: " + demande.getDirection());
                    break;

                case "chef de division":
                    // Vérifier que la demande est bien au bon niveau
                    if (!"chef_division".equals(demande.getNiveauValidation())) {
                        return ResponseEntity.badRequest().body("Cette demande n'est pas à votre niveau de validation");
                    }
                    // Chef de division → Directeur (MÊME DIRECTION)
                    demande.setNiveauValidation("directeur");
                    System.out.println("✅ Chef de division accepte demande ID " + id + " → niveau directeur | Direction: " + demande.getDirection());
                    break;

                case "directeur":
                    // Vérifier que la demande est bien au bon niveau
                    if (!"directeur".equals(demande.getNiveauValidation())) {
                        return ResponseEntity.badRequest().body("Cette demande n'est pas à votre niveau de validation");
                    }
                    // Directeur → VALIDATION FINALE
                    demande.setNiveauValidation("finalise");
                    demande.setStatut("Approuvé");
                    System.out.println("✅ Directeur accepte demande ID " + id + " → VALIDATION FINALE | Direction: " + demande.getDirection());

                    // Déduire le solde si c'est un congé administratif
                    if ("administratif".equals(demande.getTypeDemande())) {
                        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findById((long) demande.getMatricule());
                        if (utilisateurOpt.isPresent()) {
                            Utilisateur utilisateur = utilisateurOpt.get();
                            utilisateur.setSoldeConge(utilisateur.getSoldeConge() - demande.getDuree());
                            utilisateurRepository.save(utilisateur);
                            System.out.println("💰 Solde mis à jour pour matricule: " + demande.getMatricule());
                        }
                    }
                    break;

                default:
                    return ResponseEntity.badRequest().body("Rôle non reconnu: " + userRole);
            }

            demande savedDemande = demandeRepository.save(demande);
            System.out.println("🔄 Demande ID " + savedDemande.getId() + " sauvegardée:");
            System.out.println("   - Nouveau niveau: " + savedDemande.getNiveauValidation());
            System.out.println("   - Direction: " + savedDemande.getDirection()); 
            System.out.println("   - Statut: " + savedDemande.getStatut());
            System.out.println("   - Demandeur: " + savedDemande.getNomDemandeur());
            
            // VÉRIFICATION IMMÉDIATE : Rechercher cette demande dans la base
            List<demande> verification = demandeRepository.findByStatutAndNiveauValidationAndDirection(
                "En attente", 
                savedDemande.getNiveauValidation(), 
                savedDemande.getDirection()
            );
            
            System.out.println("🔍 VÉRIFICATION: " + verification.size() + " demande(s) trouvée(s) au niveau '" + 
                             savedDemande.getNiveauValidation() + "' pour direction '" + savedDemande.getDirection() + "'");
            
            verification.forEach(d -> System.out.println("   - Demande ID: " + d.getId() + " | Demandeur: " + d.getNomDemandeur()));

            return ResponseEntity.ok(savedDemande);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'acceptation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erreur lors de l'acceptation: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<demande> rejectDemande(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            demande demande = demandeRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Demande non trouvée"));

            demande.setStatut("Rejeté");
            demande.setMotifRejet(body.get("motif"));
            // Quand une demande est rejetée, elle ne passe plus au niveau suivant
            demande.setNiveauValidation("rejetee");

            return ResponseEntity.ok(demandeRepository.save(demande));
        } catch (Exception e) {
            System.err.println("Erreur lors du rejet: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    // Ajouter cette méthode
    // Ajoutez cette méthode corrigée dans votre DemandeController.java

    @GetMapping("/validees")
    public ResponseEntity<List<demande>> getDemandesValidees() {
        try {
            System.out.println("🚀 Endpoint /validees appelé");



            List<demande> demandesApprouvees = demandeRepository.findByStatut("Approuvé");
            // Pour chaque demande, récupérer le sexe du demandeur
            for (demande d : demandesApprouvees) {
                Utilisateur demandeur = utilisateurRepository.findById((long) d.getMatricule()).orElse(null);
                if (demandeur != null) {
                    d.setSexe(demandeur.getSexe()); // Ajoutez cette ligne dans votre classe demande
                }
            }

            System.out.println(" Nombre total de demandes approuvées: " + demandesApprouvees.size());

            // Debug détaillé
            demandesApprouvees.forEach(d -> {
                System.out.println("✅ Demande validée:");
                System.out.println("   - ID: " + d.getId());
                System.out.println("   - Demandeur: " + d.getNomDemandeur());
                System.out.println("   - Type: " + d.getTypeDemande());
                System.out.println("   - Statut: " + d.getStatut());
                System.out.println("   - Niveau: " + d.getNiveauValidation());
                System.out.println("   - Matricule: " + d.getMatricule());
                System.out.println("   - Durée: " + d.getDuree());
                System.out.println("   - Date début: " + d.getDateDebut());
                System.out.println("   - Date fin: " + d.getDateFin());
                System.out.println("   - Intérimaire: " + d.getInterime());
                System.out.println("   - Sexe: " + d.getSexe()); // Ajouté pour debug
                System.out.println("   ---");
            });

            return ResponseEntity.ok(demandesApprouvees);

        } catch (Exception e) {
            System.err.println(" ERREUR dans /validees: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Méthode de debug pour vérifier l'état des demandes
    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugDemandes() {
        try {
            List<demande> allDemandes = demandeRepository.findAll();
            Map<String, Object> debug = new HashMap<>();
            
            debug.put("totalDemandes", allDemandes.size());
            
            // Grouper par niveau de validation
            Map<String, Long> parNiveau = allDemandes.stream()
                .collect(Collectors.groupingBy(
                    d -> d.getNiveauValidation() != null ? d.getNiveauValidation() : "null",
                    Collectors.counting()
                ));
            debug.put("parNiveau", parNiveau);
            
            // Grouper par direction
            Map<String, Long> parDirection = allDemandes.stream()
                .collect(Collectors.groupingBy(
                    d -> d.getDirection() != null ? d.getDirection() : "null",
                    Collectors.counting()
                ));
            debug.put("parDirection", parDirection);
            
            // Demandes récentes avec détails
            List<Map<String, Object>> details = allDemandes.stream()
                .limit(10)
                .map(d -> {
                    Map<String, Object> detail = new HashMap<>();
                    detail.put("id", d.getId());
                    detail.put("nomDemandeur", d.getNomDemandeur());
                    detail.put("direction", d.getDirection());
                    detail.put("niveauValidation", d.getNiveauValidation());
                    detail.put("statut", d.getStatut());
                    return detail;
                })
                .collect(Collectors.toList());
            debug.put("dernieresDemandes", details);
            
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            System.err.println("Erreur debug: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // MÉTHODE DE DEBUG TEMPORAIRE pour tracer le flux
    @GetMapping("/debug-flux")
    public ResponseEntity<Map<String, Object>> debugFlux(@RequestParam String direction) {
        try {
            List<demande> allDemandes = demandeRepository.findAll();
            Map<String, Object> debug = new HashMap<>();
            
            // Filtrer les demandes par direction
            List<demande> demandesDirection = allDemandes.stream()
                .filter(d -> direction.equals(d.getDirection()))
                .collect(Collectors.toList());
            
            debug.put("totalDemandes", allDemandes.size());
            debug.put("demandesDirection", demandesDirection.size());
            
            // Grouper par niveau pour cette direction
            Map<String, List<Map<String, Object>>> parNiveau = demandesDirection.stream()
                .collect(Collectors.groupingBy(
                    d -> d.getNiveauValidation() != null ? d.getNiveauValidation() : "null",
                    Collectors.mapping(d -> {
                        Map<String, Object> detail = new HashMap<>();
                        detail.put("id", d.getId());
                        detail.put("nomDemandeur", d.getNomDemandeur());
                        detail.put("statut", d.getStatut());
                        detail.put("dateDebut", d.getDateDebut());
                        return detail;
                    }, Collectors.toList())
                ));
            debug.put("parNiveau", parNiveau);
            
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            System.err.println("Erreur debug flux: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}