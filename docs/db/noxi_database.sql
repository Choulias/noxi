-- ============================================================
-- NOXI - Script SQL de creation de la base de donnees
-- Compatible MySQL 5.7+ / MariaDB 10+
-- Derniere mise a jour : 2026-03-31
-- ============================================================

-- Creation de la base de donnees
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
-- Profils associes aux utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_profiles` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userId` INT DEFAULT NULL,
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
-- Modeles de jeux disponibles sur la plateforme
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
-- Parties en cours ou terminees
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
    `gameMode` VARCHAR(255) DEFAULT 'classique',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_gameplayers
-- Joueurs participant a une partie
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
-- Evenements communautaires
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_events` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) DEFAULT NULL,
    `theme` VARCHAR(255) DEFAULT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `image` VARCHAR(255) DEFAULT NULL,
    `spotlight` INT DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_eventattendees
-- Participants aux evenements
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
-- Likes sur les evenements
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
-- Amities entre utilisateurs
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
-- Demandes d'amitie en attente
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
-- TABLE : ncs_gamemodes
-- Modes de jeu disponibles par modele de jeu
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_gamemodes` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `gameSlug` VARCHAR(255) DEFAULT NULL,
    `value` VARCHAR(255) DEFAULT NULL,
    `label` VARCHAR(255) DEFAULT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE : ncs_messages
-- Messages prives et chat en jeu
-- ============================================================
CREATE TABLE IF NOT EXISTS `ncs_messages` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `senderId` INT NOT NULL,
    `receiverId` INT DEFAULT NULL,
    `senderName` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `read` TINYINT(1) DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_sender` (`senderId`),
    INDEX `idx_receiver` (`receiverId`),
    INDEX `idx_conversation` (`senderId`, `receiverId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DONNEES INITIALES
-- ============================================================

-- Modeles de jeux
INSERT INTO `ncs_gamemodels` (`name`, `slug`, `description`, `image`, `playersMin`, `playersLimit`) VALUES
('Tic Tac Toe', 'tictactoe', 'Le classique morpion en ligne, affrontez un adversaire en temps reel !', '/images/tictactoe.png', 2, 2),
('Board Game', 'board', 'Jeu de plateau multijoueur, placez vos pions et dominez le terrain !', '/images/board.png', 2, 3),
('Mascarade', 'mascarade', 'Jeu de bluff et d''identite cachee. Devinez votre masque, bluffez vos adversaires et soyez le premier a atteindre 13 pieces !', '/images/mascarade.png', 4, 12);

-- Modes de jeu pour Mascarade
INSERT INTO `ncs_gamemodes` (`gameSlug`, `value`, `label`, `description`) VALUES
('mascarade', 'classique', 'CLASSIQUE', 'Les masques sont reveles au debut puis retournes face cachee.'),
('mascarade', 'cache', 'CACHE', 'Les masques restent caches des le depart. Phase preparatoire avec possibilite de regarder sa carte.');

-- ============================================================
-- UTILISATEURS
-- ============================================================

-- Compte administrateur (mot de passe : Admin123!)
INSERT INTO `ncs_users` (`username`, `password`, `mail`, `role`, `status`, `verificationString`) VALUES
('admin', '$2a$10$2tu7uUInZ4dEKTKN2/oEv.S7o..eEAoe1HNjnzb44I2/4Lombt2Oa', 'admin@noxi.local', 'admin', 'verified', NULL);

-- Joueur 1 (mot de passe : Player1!)
INSERT INTO `ncs_users` (`username`, `password`, `mail`, `role`, `status`, `verificationString`) VALUES
('NoxiPlayer1', '$2a$10$7A96EnAtFQEMUNouvhZb3OdYTeVF2eQGSevT6KRl7RLQRKsc/2KcG', 'player1@noxi.local', 'user', 'verified', NULL);

-- Joueur 2 (mot de passe : Player2!)
INSERT INTO `ncs_users` (`username`, `password`, `mail`, `role`, `status`, `verificationString`) VALUES
('NoxiPlayer2', '$2a$10$NuaHJavSklEZrG8PiMrGVOP.61PWSW74EFoS8A8nDW/n2Na/ZgDGe', 'player2@noxi.local', 'user', 'verified', NULL);

-- ============================================================
-- PROFILS
-- ============================================================

INSERT INTO `ncs_profiles` (`userId`, `nickname`, `age`, `bio`, `picture`) VALUES
(1, 'Admin', NULL, 'Administrateur de la plateforme Noxi', NULL),
(2, 'Player One', 22, 'Joueur passionne de TicTacToe, imbattable au morpion !', NULL),
(3, 'Player Two', 25, 'Fan de jeux de plateau, toujours pret pour un defi.', NULL);

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
-- AMITIE ENTRE LES DEUX JOUEURS
-- ============================================================

INSERT INTO `ncs_friendships` (`uid_1`, `uid_2`) VALUES
(2, 3);

-- ============================================================
-- EVENEMENTS
-- ============================================================

INSERT INTO `ncs_events` (`title`, `theme`, `description`, `image`, `spotlight`) VALUES
('Soiree Lancement Noxi', 'tictactoe', 'Premier evenement de la plateforme ! Venez jouer et tester les jeux disponibles.', NULL, 1),
('Tournoi TicTacToe', 'tictactoe', 'Affrontez les meilleurs joueurs dans un tournoi de morpion en ligne. Qui sera le champion ?', NULL, 0),
('Soiree Board Game', 'board', 'Venez decouvrir le jeu de plateau multijoueur ! Parties ouvertes toute la soiree.', NULL, 0),
('Noxi Game Night #1', 'tictactoe', 'Premiere soiree jeux hebdomadaire. Rejoignez-nous chaque vendredi soir pour des parties endiablees !', NULL, 0),
('Defi entre amis', 'board', 'Invitez vos amis et montrez qui est le meilleur stratege sur le Board Game.', NULL, 0);

-- Participants aux evenements
INSERT INTO `ncs_eventattendees` (`eventId`, `userId`) VALUES
(1, 1), (1, 2), (1, 3),
(2, 2), (2, 3),
(3, 2), (3, 3),
(4, 2),
(5, 3);

-- Likes sur les evenements
INSERT INTO `ncs_eventlikers` (`eventId`, `userId`) VALUES
(1, 2), (1, 3),
(2, 2), (2, 3),
(3, 2),
(4, 3);

-- ============================================================
-- MIGRATION : Si la base existe deja, appliquer ces ALTER
-- ============================================================
-- ALTER TABLE `ncs_events` ADD COLUMN `image` VARCHAR(255) DEFAULT NULL AFTER `description`;
-- ALTER TABLE `ncs_events` DROP COLUMN `attendees`;
-- ALTER TABLE `ncs_events` DROP COLUMN `likes`;
-- ALTER TABLE `ncs_games` ADD COLUMN `gameMode` VARCHAR(255) DEFAULT 'classique' AFTER `reach`;
-- CREATE TABLE IF NOT EXISTS `ncs_messages` (
--     `id` INT NOT NULL AUTO_INCREMENT,
--     `senderId` INT NOT NULL,
--     `receiverId` INT DEFAULT NULL,
--     `senderName` VARCHAR(255) NOT NULL,
--     `content` TEXT NOT NULL,
--     `read` TINYINT(1) DEFAULT 0,
--     `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     PRIMARY KEY (`id`),
--     INDEX `idx_sender` (`senderId`),
--     INDEX `idx_receiver` (`receiverId`),
--     INDEX `idx_conversation` (`senderId`, `receiverId`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
