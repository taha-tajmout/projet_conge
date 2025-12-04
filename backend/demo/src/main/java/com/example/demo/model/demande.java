package com.example.demo.model;

import java.util.Date;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonFormat;

@Getter
@Setter
@Entity
@Table(name = "demande")
public class demande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "duree")
    private int duree;

    @Column(name = "date_debut")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date dateDebut;

    @Column(name = "date_fin")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date dateFin;



    @Column(name = "matricule")
    private int matricule;

    @Column(name = "type_demande")
    private String typeDemande;

    @Column(name = "interime")
    private String interime;

    @Column(name = "statut")
    private String statut = "En attente";

    @Column(name = "sous_types")
    private String sousType;

    // Ajoutez ces champs
    @Column(name = "destinataire")
    private String destinataire;

    @Column(name = "motif_rejet")
    private String motifRejet;

    @Column(name = "sexe")
    private String sexe; // Ajoutez ce champ

    @Column(name = "nom_demandeur")
    private String nomDemandeur;

    @Column(name = "date_demande")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date dateDemande;


    @Column(name = "niveau_validation")
    private String niveauValidation; // "chef_service", "chef_division", "directeur", "finalise"

    @Column(name = "direction")
    private String direction; // Direction de l'utilisateur qui fait la demande

    @Column(name = "statut_demandeur")
    private String statutDemandeur; // "cadre", "technicien", "chef_service", "chef_division", "directeur"

    // Constructeur par défaut
    public demande() {
        this.dateDemande = new Date();
    }

    // Constructeur avec paramètres
    public demande(int duree, Date dateDebut, Date dateFin, int matricule,
                   String typeDemande, String interime, String sousType) {
        this.duree = duree;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.matricule = matricule;
        this.typeDemande = typeDemande;
        this.interime = interime;
        this.sousType = sousType;
        this.dateDemande = new Date();
    }

    // Méthodes utilitaires
    @Override
    public String toString() {
        return "demande{" +
                "id=" + id +
                ", duree=" + duree +
                ", dateDebut=" + dateDebut +
                ", dateFin=" + dateFin +
                ", matricule=" + matricule +
                ", typeDemande='" + typeDemande + '\'' +
                ", interime='" + interime + '\'' +
                ", statut='" + statut + '\'' +
                ", sousType='" + sousType + '\'' +
                ", dateDemande=" + dateDemande +
                '}';
    }
    // Ajoutez ces méthodes à la classe demande
     public String getNomDemandeur() {
        return this.nomDemandeur; // À remplir lors de la création de la demande
    }

    public void setNomDemandeur(String nom, String prenom) {
        this.nomDemandeur = nom + " " + prenom;
    }

/*zzzzzzzzzzzzzzzzz
    rr
        r
    r
                r
    r
                        r
    r
                                r
    r
                                        r
    r
    */

}