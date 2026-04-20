-- Nettoyage BDD Noxi
-- À exécuter UNIQUEMENT après avoir fait un backup (phpMyAdmin → Exporter)
-- Analyse issue du dump docs/db/noxi_recent.sql (20 avril 2026)

-- ════════════════════════════════════════════════════════════════
-- PARTIE 1 : Supprimer les doublons évidents
-- ════════════════════════════════════════════════════════════════

-- 1a. Undercover dupliqué dans ncs_gamemodels
--     (id=6 sans image, id=7 avec image → on garde id=7)
DELETE FROM `ncs_gamemodels` WHERE id = 6 AND slug = 'undercover';

-- 1b. Profile Admin dupliqué (id=1 et id=2 ont tous les deux userid=1)
--     On garde le plus ancien (id=1)
DELETE FROM `ncs_profiles` WHERE id = 2 AND userid = 1;

-- 1c. Score playerscore admin/tictactoe dupliqué (id=1 et id=3)
DELETE FROM `ncs_playerscores` WHERE id = 3 AND gameSlug = 'tictactoe' AND playerId = 1;


-- ════════════════════════════════════════════════════════════════
-- PARTIE 2 : Nettoyer les références orphelines
-- ════════════════════════════════════════════════════════════════
-- Les users actuels ont les IDs 5, 6, 7 mais plusieurs tables pointent
-- encore vers les IDs 1-4 de users qui n'existent plus.

-- 2a. Profiles qui pointent vers des users inexistants
DELETE FROM `ncs_profiles` WHERE userid NOT IN (SELECT id FROM `ncs_users`);

-- 2b. Scores qui pointent vers des players inexistants
DELETE FROM `ncs_playerscores` WHERE playerId NOT IN (SELECT id FROM `ncs_users`);

-- 2c. Friendships cassées
DELETE FROM `ncs_friendships`
  WHERE uid_1 NOT IN (SELECT id FROM `ncs_users`)
     OR uid_2 NOT IN (SELECT id FROM `ncs_users`);

-- 2d. Event likes orphelins
DELETE FROM `ncs_eventlikers` WHERE userId NOT IN (SELECT id FROM `ncs_users`);

-- 2e. Event attendees orphelins
DELETE FROM `ncs_eventattendees` WHERE userId NOT IN (SELECT id FROM `ncs_users`);

-- 2f. User badges orphelins (la colonne est userId)
DELETE FROM `ncs_user_badges` WHERE userId NOT IN (SELECT id FROM `ncs_users`);

-- 2g. Friend requests orphelins (à vérifier selon ton schéma)
DELETE FROM `ncs_friendrequests`
  WHERE senderId NOT IN (SELECT id FROM `ncs_users`)
     OR receiverId NOT IN (SELECT id FROM `ncs_users`);


-- ════════════════════════════════════════════════════════════════
-- PARTIE 3 : (Optionnel) Recréer les profils manquants pour les 3 users
-- ════════════════════════════════════════════════════════════════
-- Après cleanup, les users id=5,6,7 n'ont plus de profiles associés.
-- On en crée un vide pour chacun.

INSERT IGNORE INTO `ncs_profiles` (userid, nickname, age, bio, picture, createdAt, updatedAt)
SELECT u.id, u.username, NULL, NULL, NULL, NOW(), NOW()
FROM `ncs_users` u
LEFT JOIN `ncs_profiles` p ON p.userid = u.id
WHERE p.id IS NULL;


-- ════════════════════════════════════════════════════════════════
-- VÉRIFICATIONS POST-CLEANUP
-- ════════════════════════════════════════════════════════════════
-- À exécuter après le nettoyage pour s'assurer que tout est cohérent.

-- Doit retourner 0 ligne (plus de doublons sur slug)
-- SELECT slug, COUNT(*) FROM `ncs_gamemodels` GROUP BY slug HAVING COUNT(*) > 1;

-- Doit retourner 0 ligne (plus d'orphelins profiles)
-- SELECT * FROM `ncs_profiles` WHERE userid NOT IN (SELECT id FROM `ncs_users`);

-- Doit retourner 3 (un profile par user)
-- SELECT COUNT(*) FROM `ncs_profiles`;
