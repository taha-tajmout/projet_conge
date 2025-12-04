package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admin")
public class Admin {
    @Id
    @Column(name = "Email", nullable = false, length = 70)
    private String email; // Propriété Java en camelCase

    @Column(name = "MotDePasse", nullable = false, length = 70)
    private String motDePasse; // Propriété Java en camelCase

    // Constructeurs
    public Admin() {}

    public Admin(String email, String motDePasse) {
        this.email = email;
        this.motDePasse = motDePasse;
    }

    // Getters (nommage Java standard)
    public String getEmail() { return email; }
    public String getMotDePasse() { return motDePasse; }

    // Setters
    public void setEmail(String email) { this.email = email; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }
}