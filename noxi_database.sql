-- ============================================================
-- NOXI - Script SQL de création de la base de données
-- Compatible MySQL 5.7+ / MariaDB 10+
-- ============================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS `noxi` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `noxi`;

-- ============================================================
-- TABLE : ncs_users
-- Utilisateurs de la plateforme
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) DEFAULT NULL,
    `password` VARCHAR(255) DEFAULT NULL,
    `mail` VARCHAR(255) DEFAULT NULL,
    `role` VARCHAR(255) DEFAULT 'user',
    `status` VARCHAR(255) DEFAULT 'pending',
    `verificationString` VARCHAR(255) DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_profiles
-- Profils associés aux utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_profiles` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userid` INT DEFAULT NULL,
    `nickname` VARCHAR(255) DEFAULT NULL,
    `age` INT DEFAULT NULL,
    `bio` VARCHAR(255) DEFAULT NULL,
    `picture` VARCHAR(255) DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_gamemodels
-- Modèles de jeux disponibles sur la plateforme
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_gamemodels` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) DEFAULT NULL,
    `slug` VARCHAR(255) DEFAULT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `image` VARCHAR(255) DEFAULT NULL,
    `playersMin` INT DEFAULT NULL,
    `playersLimit` INT DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_games
-- Parties en cours ou terminées
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_games` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `gameId` VARCHAR(255) DEFAULT NULL,
    `ownerId` INT DEFAULT NULL,
    `numberPlayers` INT DEFAULT NULL,
    `maxPlayers` INT DEFAULT NULL,
    `status` VARCHAR(255) DEFAULT NULL,
    `gameModel` VARCHAR(255) DEFAULT NULL,
    `reach` VARCHAR(255) DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_gameplayers
-- Joueurs participant à une partie
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_gameplayers` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `gameId` VARCHAR(255) DEFAULT NULL,
    `playerId` INT DEFAULT NULL,
    `clientId` VARCHAR(255) DEFAULT NULL,
    `clientName` VARCHAR(255) DEFAULT NULL,
    `score` INT DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_playerscores
-- Meilleurs scores par joueur et par jeu
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_playerscores` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `gameSlug` VARCHAR(255) DEFAULT NULL,
    `playerId` INT DEFAULT NULL,
    `clientName` VARCHAR(255) DEFAULT NULL,
    `bestScore` INT DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_events
-- Événements communautaires
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_events` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) DEFAULT NULL,
    `theme` VARCHAR(255) DEFAULT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `attendees` INT DEFAULT 0,
    `likes` INT DEFAULT 0,
    `spotlight` INT DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_eventattendees
-- Participants aux événements
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_eventattendees` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `eventId` INT DEFAULT NULL,
    `userId` INT DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_eventlikers
-- Likes sur les événements
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_eventlikers` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `eventId` INT DEFAULT NULL,
    `userId` INT DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_friendships
-- Amitiés entre utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_friendships` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `uid_1` INT DEFAULT NULL,
    `uid_2` INT DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_friendrequests
-- Demandes d'amitié en attente
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_friendrequests` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `inviterId` INT DEFAULT NULL,
    `invitedId` INT DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- Modèles de jeux (nécessaires pour l'inscription et le fonctionnement)
INSERT INTO `ncs_gamemodels` (`name`, `slug`, `description`, `image`, `playersMin`, `playersLimit`) VALUES
('Tic Tac Toe', 'tictactoe', 'Le classique morpion en ligne, affrontez un adversaire en temps réel !', '/images/tictactoe.png', 2, 2),
('Board Game', 'board', 'Jeu de plateau multijoueur, placez vos pions et dominez le terrain !', '/images/board.png', 2, 3);

-- ============================================================
-- UTILISATEURS
-- ============================================================

-- Compte administrateur (mot de passe : Admin123!)
INSERT INTO `ncs_users` (`username`, `password`, `mail`, `role`, `status`, `verificationString`) VALUES
('admin', '$2a$10$DqUJoQFH9taU.9T4vHFY7.CTaICAQ7MJ/4WkxSpJpPeMo9hG9LQKC', 'admin@noxi.local', 'admin', 'verified', NULL);

-- Joueur 1 (mot de passe : Player1!)
INSERT INTO `ncs_users` (`username`, `password`, `mail`, `role`, `status`, `verificationString`) VALUES
('NoxiPlayer1', '$2a$10$DqUJoQFH9taU.9T4vHFY7.CTaICAQ7MJ/4WkxSpJpPeMo9hG9LQKC', 'player1@noxi.local', 'user', 'verified', NULL);

-- Joueur 2 (mot de passe : Player2!)
INSERT INTO `ncs_users` (`username`, `password`, `mail`, `role`, `status`, `verificationString`) VALUES
('NoxiPlayer2', '$2a$10$UXmQYl7WJ8q9smNI64k.E.GKZjl2oLPKVVy.FGl3yVR1CUD7JcHt2', 'player2@noxi.local', 'user', 'verified', NULL);

-- ============================================================
-- PROFILS
-- ============================================================

INSERT INTO `ncs_profiles` (`userid`, `nickname`, `age`, `bio`, `picture`) VALUES
(1, 'Admin', NULL, 'Administrateur de la plateforme Noxi', NULL),
(2, 'Player One', 22, 'Joueur passionné de TicTacToe, imbattable au morpion !', NULL),
(3, 'Player Two', 25, 'Fan de jeux de plateau, toujours prêt pour un défi.', NULL);

-- ============================================================
-- SCORES DES JOUEURS
-- ============================================================

INSERT INTO `ncs_playerscores` (`gameSlug`, `playerId`, `clientName`, `bestScore`) VALUES
('tictactoe', 1, 'admin', 0),
('board', 1, 'admin', 0),
('tictactoe', 2, 'NoxiPlayer1', 5),
('board', 2, 'NoxiPlayer1', 3),
('tictactoe', 3, 'NoxiPlayer2', 3),
('board', 3, 'NoxiPlayer2', 7);

-- ============================================================
-- AMITIÉ ENTRE LES DEUX JOUEURS
-- ============================================================

INSERT INTO `ncs_friendships` (`uid_1`, `uid_2`) VALUES
(2, 3);

-- ============================================================
-- ÉVÉNEMENTS
-- ============================================================

INSERT INTO `ncs_events` (`title`, `theme`, `description`, `attendees`, `likes`, `spotlight`) VALUES
('Soirée Lancement Noxi', 'tictactoe', 'Premier événement de la plateforme ! Venez jouer et tester les jeux disponibles.', 3, 5, 1),
('Tournoi TicTacToe', 'tictactoe', 'Affrontez les meilleurs joueurs dans un tournoi de morpion en ligne. Qui sera le champion ?', 8, 12, 0),
('Soirée Board Game', 'board', 'Venez découvrir le jeu de plateau multijoueur ! Parties ouvertes toute la soirée.', 5, 7, 0),
('Noxi Game Night #1', 'tictactoe', 'Première soirée jeux hebdomadaire. Rejoignez-nous chaque vendredi soir pour des parties endiablées !', 6, 9, 0),
('Défi entre amis', 'board', 'Invitez vos amis et montrez qui est le meilleur stratège sur le Board Game.', 4, 3, 0);

-- Participants aux événements
INSERT INTO `ncs_eventattendees` (`eventId`, `userId`) VALUES
(1, 1), (1, 2), (1, 3),
(2, 2), (2, 3),
(3, 2), (3, 3),
(4, 2),
(5, 3);

-- Likes sur les événements
INSERT INTO `ncs_eventlikers` (`eventId`, `userId`) VALUES
(1, 2), (1, 3),
(2, 2), (2, 3),
(3, 2),
(4, 3);

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
