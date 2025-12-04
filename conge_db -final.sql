-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 12 août 2025 à 17:58
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `conge_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `admin`
--

CREATE TABLE `admin` (
  `Email` varchar(70) NOT NULL,
  `MotDePasse` varchar(70) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `admin`
--

INSERT INTO `admin` (`Email`, `MotDePasse`) VALUES
('admin@gmail.com', 'admin');

-- --------------------------------------------------------

--
-- Structure de la table `demande`
--

CREATE TABLE `demande` (
  `id` bigint(20) NOT NULL,
  `duree` int(11) NOT NULL,
  `date_debut` datetime(6) DEFAULT NULL,
  `date_fin` datetime(6) DEFAULT NULL,
  `matricule` int(7) DEFAULT NULL,
  `type_demande` varchar(255) DEFAULT NULL,
  `interime` varchar(255) DEFAULT NULL,
  `statut` varchar(255) DEFAULT NULL,
  `sous_types` varchar(255) DEFAULT NULL,
  `date_demande` datetime(6) DEFAULT NULL,
  `destinataire` varchar(255) DEFAULT NULL,
  `motif_rejet` varchar(255) DEFAULT NULL,
  `nom_demandeur` varchar(255) DEFAULT NULL,
  `etape_validation` varchar(255) DEFAULT NULL,
  `niveau_validation` varchar(255) DEFAULT NULL,
  `sexe` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `demande`
--

INSERT INTO `demande` (`id`, `duree`, `date_debut`, `date_fin`, `matricule`, `type_demande`, `interime`, `statut`, `sous_types`, `date_demande`, `destinataire`, `motif_rejet`, `nom_demandeur`, `etape_validation`, `niveau_validation`, `sexe`) VALUES
(164, 8, '2025-07-06 01:00:00.000000', '2025-07-13 01:00:00.000000', 1, 'administratif', '5', 'En attente', NULL, '2025-07-28 11:40:57.000000', NULL, NULL, 'tajmout taha', NULL, 'chef_service', NULL),
(165, 8, '2025-07-06 01:00:00.000000', '2025-07-13 01:00:00.000000', 6, 'administratif', '6', 'Approuvé', NULL, '2025-07-28 14:56:27.000000', NULL, NULL, 'ezzoubair ahmed', NULL, 'finalise', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `matricule` bigint(20) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `statut` varchar(255) NOT NULL,
  `sexe` varchar(50) NOT NULL,
  `soldeConge` int(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `motDePasse` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`matricule`, `nom`, `prenom`, `statut`, `sexe`, `soldeConge`, `email`, `motDePasse`) VALUES
(1, 'tajmout', 'taha', 'cadre', 'H', 22, 'cadre@gmail.com', 'cadre'),
(2, 'tajmout', 'achraf', 'directeur', 'H', 22, 'directeur@gmail.com', 'directeur'),
(3, 'tajmout', 'ahmed', 'chef de division', 'F', 22, 'chefdedivision@gmail.com', 'chefdedivision'),
(4, 'mourid', 'mounir', 'chef de service', 'H', 22, 'mourid@gmail.com', 'mourid'),
(5, 'loukili', 'ahmed', 'technicien', 'H', 22, 'technicien@gmail.com', 'technicien'),
(6, 'ezzoubair', 'ahmed', 'RH', 'F', 14, 'rh@gmail.com', 'rh'),
(7, 'youssfi', 'mouad', 'chef de service', 'H', 22, 'chefservice@gmail.com', 'chefservice'),
(38, 'd', 'd', 'chef de division', 'H', 22, 'chefdivision@gmail.com', 'chefdivision');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`Email`);

--
-- Index pour la table `demande`
--
ALTER TABLE `demande`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Matricule` (`matricule`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`matricule`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `demande`
--
ALTER TABLE `demande`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
