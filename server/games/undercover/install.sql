-- Undercover : insertion dans la BDD
-- À exécuter une seule fois (en local puis en prod) via phpMyAdmin ou client MySQL.

INSERT INTO ncs_gamemodels (name, slug, description, image, playersMin, playersLimit)
VALUES (
    'Undercover',
    'undercover',
    'Jeu de déduction : identifiez les imposteurs parmi les personnages d''anime. Tous les joueurs ont un personnage similaire sauf 1 à 3 imposteurs. Chacun donne un indice — démasquez qui n''a pas le bon perso.',
    NULL,
    3,
    10
);

INSERT INTO ncs_gamemode (gameSlug, value, label, description) VALUES
    ('undercover', 'easy',     'Facile',    'Paires distinctes, erreurs visibles rapidement'),
    ('undercover', 'medium',   'Moyen',     'Paires similaires, discussion utile'),
    ('undercover', 'hard',     'Difficile', 'Paires très proches, micro-indices décisifs'),
    ('undercover', 'hardcore', 'Hardcore',  'Paires quasi-jumelles, ultra-serré');
