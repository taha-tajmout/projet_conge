package com.example.demo.model;

import jakarta.persistence.*;


@Entity
@Table(name = "utilisateur")
public class Utilisateur {

    
   
    @Id
    private Long matricule;

    @Column( name ="nom" ,nullable = false, length = 50)
    private String nom;

    @Column(name ="prenom",nullable = false, length = 50)
    private String prenom;

    @Column( name ="statut",nullable = false)
    private String statut;

    @Column(name ="sexe",nullable = false, length = 50)
    private String sexe;

    @Column(name = "soldeConge", nullable = false)
    private int soldeConge=0;

    @Column(name = "email", nullable = false, length = 50)
    private String email;

    @Column(name = "motDePasse", nullable = false, length = 50)
    private String motDePasse;

    @Column(name = "direction", nullable = false, length = 200)
    private String direction;

    // Constructeur par défaut
    public Utilisateur() {
    }

    // Constructeur avec arguments (sauf matricule car auto-généré)
    public Utilisateur(String nom, String prenom, String email, String motDePasse, String statut, String sexe, int soldeConge, String direction)
    {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.motDePasse = motDePasse;
        this.statut = statut;
        this.sexe = sexe;
        this.soldeConge = soldeConge;
        this.direction = direction;
    }
    // Getters
    public Long getMatricule() { return matricule; }
    public String getNom()  { return nom; }
    public String getPrenom() { return prenom;}
    public String getEmail() { return email; }
    public String getMotDePasse() { return motDePasse; }
    public String getStatut() { return statut; }
    public String getSexe() { return sexe; }
    public int getSoldeConge() { return soldeConge; }
    public String getDirection() { return direction; }
    // Setters
    public void setMatricule(Long matricule) { this.matricule = matricule; }
    public void setNom(String nom) {this.nom = nom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public void setEmail(String email) { this.email = email; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
    public void setStatut(String statut) { this.statut = statut;}
    public void setSexe(String sexe) { this.sexe = sexe;}
    public void setSoldeConge(int soldeConge) { this.soldeConge = soldeConge;}
    public void setDirection(String direction) { this.direction = direction;}
    // Dans Utilisateur.java



}