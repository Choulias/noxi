// Base de personnages pour Undercover.
// Conventions :
//   - Tags en snake_case, normalisés (jamais de variantes lexicales)
//   - 4-8 tags par catégorie, viser 5-6 en moyenne
//   - Tags doivent être des choses qu'un joueur pourrait dire en indice
//   - Privilégier des tags PARTAGEABLES entre personnages pour nourrir la similarité
//
// Catégories :
//   visual       -> cheveux, yeux, tenue, marques, corps
//   personality  -> traits de caractère
//   powers       -> énergies, éléments, capacités, classes/archétypes, yeux spéciaux
//   themes       -> narratif (orphelin, vengeance, famille, pouvoir…)

export const CHARACTERS = [
  // ─── Naruto ──────────────────────────────────────────────────────────────
  {
    id: "naruto",
    name: "Naruto Uzumaki",
    anime: "Naruto",
    image: "/assets/img/undercover/naruto.png",
    visual: ["cheveux_blonds", "cheveux_courts", "cheveux_herisses", "yeux_bleus", "moustaches_renard", "bandeau_frontal", "tenue_ninja", "adolescent"],
    personality: ["optimiste", "bruyant", "loyal", "impulsif", "tenace", "chaleureux", "naif"],
    powers: ["chakra", "clones", "vent", "regeneration", "ninja", "transformation", "combat_rapproche", "heritage_pouvoir"],
    themes: ["orphelin", "rejet_enfance", "amitie", "rever_de_leader", "bete_scellee", "destin", "heritage", "survivant", "eleve"]
  },
  {
    id: "sasuke",
    name: "Sasuke Uchiha",
    anime: "Naruto",
    image: "/assets/img/undercover/sasuke.png",
    visual: ["cheveux_noirs", "cheveux_courts", "cheveux_herisses", "yeux_noirs", "yeux_rouges", "bandeau_frontal", "tenue_ninja", "regard_froid", "adolescent"],
    personality: ["froid", "serieux", "vengeur", "solitaire", "orgueilleux", "determine", "intelligent", "noble"],
    powers: ["chakra", "sharingan", "rinnegan", "feu", "foudre", "ninja", "epeiste", "oeil_special", "combat_rapproche"],
    themes: ["vengeance", "perte_proches", "frere_ennemi", "trahison", "rivalite", "redemption", "genocide_famille", "survivant"]
  },
  {
    id: "sakura",
    name: "Sakura Haruno",
    anime: "Naruto",
    image: "/assets/img/undercover/sakura.png",
    visual: ["cheveux_roses", "cheveux_mi_longs", "yeux_verts", "bandeau_frontal", "tenue_ninja", "femme", "adolescent"],
    personality: ["colerique", "determine", "loyal", "intelligent", "protectrice"],
    powers: ["chakra", "super_force", "ninja", "guerison", "medecin", "combat_rapproche"],
    themes: ["amitie", "ascension", "protection_proches", "rivalite", "amour_impossible", "eleve", "inferieur_a_genie"]
  },
  {
    id: "kakashi",
    name: "Kakashi Hatake",
    anime: "Naruto",
    image: "/assets/img/undercover/kakashi.png",
    visual: ["cheveux_blancs", "cheveux_herisses", "yeux_rouges", "masque_visage", "cicatrice_oeil", "bandeau_frontal", "tenue_ninja", "adulte"],
    personality: ["calme", "cynique", "serieux", "charismatique", "paresseux", "solitaire", "noble"],
    powers: ["chakra", "sharingan", "foudre", "clones", "ninja", "oeil_special", "combat_rapproche"],
    themes: ["perte_proches", "amitie", "heritage", "mentor", "devoir", "survivant", "orphelin", "solitude"]
  },
  {
    id: "itachi",
    name: "Itachi Uchiha",
    anime: "Naruto",
    image: "/assets/img/undercover/itachi.png",
    visual: ["cheveux_noirs", "cheveux_longs", "queue_de_cheval", "yeux_noirs", "yeux_rouges", "manteau_noir", "regard_froid", "regard_intense", "adulte"],
    personality: ["calme", "froid", "noble", "solitaire", "serieux", "intelligent", "manipulateur"],
    powers: ["chakra", "sharingan", "feu", "illusion", "ninja", "oeil_special", "epeiste", "combat_rapproche"],
    themes: ["sacrifice", "frere_ennemi", "tuer_les_siens", "double_identite", "redemption", "perte_proches", "devoir"]
  },
  {
    id: "madara",
    name: "Madara Uchiha",
    anime: "Naruto",
    image: "/assets/img/undercover/madara.png",
    visual: ["cheveux_noirs", "cheveux_longs", "yeux_rouges", "armure", "cape", "regard_froid", "regard_intense", "adulte", "age_mur"],
    personality: ["arrogant", "charismatique", "orgueilleux", "colerique", "sadique", "intelligent", "strategique", "determine", "serieux", "noble"],
    powers: ["chakra", "sharingan", "rinnegan", "feu", "ninja", "oeil_special", "super_force", "super_vitesse", "combat_rapproche", "epeiste"],
    themes: ["pouvoir_absolu", "guerre", "frere_ennemi", "rebelle", "tyran", "immortalite", "leader", "survivant", "perte_proches", "devenir_le_plus_fort", "genie"]
  },
  {
    id: "gaara",
    name: "Gaara",
    anime: "Naruto",
    image: "/assets/img/undercover/gaara.png",
    visual: ["cheveux_rouges", "cheveux_courts", "yeux_verts", "cicatrice_front", "cernes", "tenue_ninja", "regard_froid", "adolescent"],
    personality: ["calme", "froid", "solitaire", "serieux", "protecteur", "noble", "determine"],
    powers: ["chakra", "terre", "ninja", "super_force", "combat_rapproche"],
    themes: ["orphelin", "rejet_enfance", "bete_scellee", "redemption", "solitude", "leader", "perte_proches", "famille_difficile"]
  },
  {
    id: "jiraiya",
    name: "Jiraiya",
    anime: "Naruto",
    image: "/assets/img/undercover/jiraiya.png",
    visual: ["cheveux_blancs", "cheveux_longs", "cheveux_herisses", "cicatrice_joue", "age_mur", "grand", "adulte"],
    personality: ["charismatique", "humoristique", "gourmand", "loyal", "noble", "chaleureux", "determine", "serieux"],
    powers: ["chakra", "ninja", "super_force", "transformation", "combat_rapproche"],
    themes: ["mentor", "sacrifice", "heritage", "amitie", "devoir", "perte_proches", "solitude", "eleve"]
  },
  {
    id: "minato",
    name: "Minato Namikaze",
    anime: "Naruto",
    image: "/assets/img/undercover/minato.png",
    visual: ["cheveux_blonds", "cheveux_courts", "cheveux_herisses", "yeux_bleus", "bandeau_frontal", "tenue_ninja", "manteau_blanc", "adulte"],
    personality: ["calme", "noble", "loyal", "determine", "chaleureux", "intelligent", "serieux"],
    powers: ["chakra", "teleportation", "ninja", "vent", "super_vitesse", "combat_rapproche"],
    themes: ["sacrifice", "leader", "protection_proches", "heritage", "devoir", "mentor", "eleve", "perte_proches"]
  },

  // ─── One Piece ───────────────────────────────────────────────────────────
  {
    id: "luffy",
    name: "Monkey D. Luffy",
    anime: "One Piece",
    image: "/assets/img/undercover/luffy.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_noirs", "chapeau_paille", "cicatrice_joue", "cicatrice_oeil", "adolescent", "muscle"],
    personality: ["optimiste", "bruyant", "loyal", "impulsif", "gourmand", "naif", "chaleureux", "tenace", "determine"],
    powers: ["haki", "super_force", "super_vitesse", "combat_rapproche", "fruit_demon", "transformation", "pirate", "heritage_pouvoir"],
    themes: ["rever_de_leader", "liberte", "amitie", "heritage", "leader", "perte_proches", "frere_ennemi", "devenir_le_plus_fort"]
  },
  {
    id: "zoro",
    name: "Roronoa Zoro",
    anime: "One Piece",
    image: "/assets/img/undercover/zoro.png",
    visual: ["cheveux_verts", "cheveux_courts", "cicatrice_oeil", "cicatrices", "bandana", "muscle", "adulte", "regard_froid", "regard_intense"],
    personality: ["serieux", "loyal", "determine", "silencieux", "tenace", "noble", "solitaire", "colerique"],
    powers: ["epeiste", "haki", "super_force", "super_vitesse", "combat_rapproche", "pirate"],
    themes: ["devenir_le_plus_fort", "promesse", "amitie", "rivalite", "devoir", "heritage", "perte_proches"]
  },
  {
    id: "sanji",
    name: "Sanji Vinsmoke",
    anime: "One Piece",
    image: "/assets/img/undercover/sanji.png",
    visual: ["cheveux_blonds", "cheveux_mi_longs", "yeux_bleus", "costume", "cigarette", "adulte"],
    personality: ["charismatique", "loyal", "colerique", "gourmand", "noble", "impulsif", "chaleureux"],
    powers: ["combat_rapproche", "super_force", "super_vitesse", "feu", "haki", "pirate", "transformation"],
    themes: ["amitie", "famille_difficile", "promesse", "devoir", "survivant", "rejet_enfance", "heritage", "perte_proches"]
  },
  {
    id: "nami",
    name: "Nami",
    anime: "One Piece",
    image: "/assets/img/undercover/nami.png",
    visual: ["cheveux_oranges", "cheveux_longs", "yeux_noisette", "tatouages", "femme", "adulte", "adolescent"],
    personality: ["intelligent", "manipulatrice", "determine", "charismatique", "loyal", "tenace", "colerique"],
    powers: ["foudre", "pirate", "deduction", "combat_rapproche"],
    themes: ["amitie", "liberte", "perte_proches", "ascension", "famille", "orphelin", "survivant", "rejet_enfance", "sacrifice", "protection_proches"]
  },
  {
    id: "ace",
    name: "Portgas D. Ace",
    anime: "One Piece",
    image: "/assets/img/undercover/ace.png",
    visual: ["cheveux_noirs", "cheveux_courts", "cicatrices", "tatouages", "muscle", "adulte", "chapeau"],
    personality: ["calme", "loyal", "charismatique", "chaleureux", "protecteur", "noble", "determine"],
    powers: ["feu", "fruit_demon", "super_force", "super_vitesse", "combat_rapproche", "haki", "pirate", "transformation"],
    themes: ["heritage", "famille", "sacrifice", "frere_ennemi", "liberte", "perte_proches", "orphelin", "rejet_enfance", "survivant"]
  },
  {
    id: "law",
    name: "Trafalgar Law",
    anime: "One Piece",
    image: "/assets/img/undercover/law.png",
    visual: ["cheveux_noirs", "cheveux_courts", "tatouages", "yeux_gris", "manteau_noir", "regard_froid", "regard_intense", "adulte"],
    personality: ["calme", "cynique", "serieux", "determine", "intelligent", "strategique", "noble", "solitaire"],
    powers: ["fruit_demon", "epeiste", "haki", "teleportation", "medecin", "pirate", "combat_rapproche"],
    themes: ["vengeance", "perte_proches", "redemption", "devoir", "survivant", "genocide_famille", "orphelin", "solitude", "heritage"]
  },
  {
    id: "shanks",
    name: "Shanks le Roux",
    anime: "One Piece",
    image: "/assets/img/undercover/shanks.png",
    visual: ["cheveux_rouges", "cheveux_mi_longs", "cicatrice_oeil", "bras_prothese", "cape", "adulte", "age_mur", "barbe", "regard_intense"],
    personality: ["calme", "charismatique", "noble", "humoristique", "chaleureux", "serieux", "loyal"],
    powers: ["haki", "epeiste", "super_force", "super_vitesse", "combat_rapproche", "pirate"],
    themes: ["mentor", "leader", "heritage", "liberte", "sacrifice", "devoir", "symbole"]
  },

  // ─── Dragon Ball Z ───────────────────────────────────────────────────────
  {
    id: "goku",
    name: "Son Goku",
    anime: "Dragon Ball Z",
    image: "/assets/img/undercover/goku.png",
    visual: ["cheveux_noirs", "cheveux_herisses", "yeux_noirs", "muscle", "cicatrices", "adulte"],
    personality: ["optimiste", "naif", "loyal", "gourmand", "determine", "chaleureux", "impulsif", "tenace"],
    powers: ["ki", "super_force", "super_vitesse", "vol", "transformation", "teleportation", "saiyan", "combat_rapproche", "heritage_pouvoir"],
    themes: ["amitie", "rivalite", "devenir_le_plus_fort", "protection_proches", "heritage", "orphelin", "survivant", "genocide_famille", "mentor"]
  },
  {
    id: "vegeta",
    name: "Vegeta",
    anime: "Dragon Ball Z",
    image: "/assets/img/undercover/vegeta.png",
    visual: ["cheveux_noirs", "cheveux_courts", "cheveux_herisses", "yeux_noirs", "armure", "muscle", "regard_froid", "regard_intense", "adulte"],
    personality: ["arrogant", "orgueilleux", "colerique", "determine", "noble", "serieux", "tenace", "vengeur"],
    powers: ["ki", "super_force", "super_vitesse", "vol", "transformation", "saiyan", "combat_rapproche", "heritage_pouvoir"],
    themes: ["rivalite", "redemption", "heritage", "frere_ennemi", "noblesse", "survivant", "genocide_famille", "leader", "devenir_le_plus_fort", "ascension"]
  },
  {
    id: "gohan",
    name: "Son Gohan",
    anime: "Dragon Ball Z",
    image: "/assets/img/undercover/gohan.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_noirs", "lunettes", "adolescent"],
    personality: ["calme", "intelligent", "timide", "loyal", "serieux", "noble", "determine"],
    powers: ["ki", "super_force", "super_vitesse", "vol", "transformation", "saiyan", "combat_rapproche", "heritage_pouvoir"],
    themes: ["heritage", "famille", "sacrifice", "amitie", "destin", "eleve", "mentor", "protection_proches", "inferieur_a_genie"]
  },
  {
    id: "piccolo",
    name: "Piccolo",
    anime: "Dragon Ball Z",
    image: "/assets/img/undercover/piccolo.png",
    visual: ["cape", "yeux_rouges", "cornes", "grand", "adulte", "regard_froid"],
    personality: ["serieux", "calme", "protecteur", "noble", "froid", "solitaire"],
    powers: ["ki", "super_force", "vol", "regeneration", "combat_rapproche", "telekinesie", "transformation"],
    themes: ["mentor", "redemption", "amitie", "sacrifice", "survivant", "genocide_famille", "solitude", "perte_proches"]
  },
  {
    id: "frieza",
    name: "Freezer",
    anime: "Dragon Ball Z",
    image: "/assets/img/undercover/frieza.png",
    visual: ["yeux_rouges", "cornes", "regard_froid", "regard_intense", "adulte"],
    personality: ["arrogant", "sadique", "psychopathe", "manipulateur", "cynique", "charismatique", "colerique", "orgueilleux"],
    powers: ["ki", "super_force", "vol", "transformation", "super_vitesse", "combat_rapproche", "regeneration"],
    themes: ["pouvoir_absolu", "tyran", "rivalite", "immortalite", "dieu", "genocide_famille", "leader"]
  },
  {
    id: "broly",
    name: "Broly",
    anime: "Dragon Ball Z",
    image: "/assets/img/undercover/broly.png",
    visual: ["cheveux_noirs", "cheveux_herisses", "cheveux_verts", "muscle", "cicatrices", "grand", "adulte", "regard_intense"],
    personality: ["colerique", "sauvage", "silencieux", "determine", "impulsif", "naif"],
    powers: ["ki", "super_force", "super_vitesse", "transformation", "saiyan", "combat_rapproche", "vol", "heritage_pouvoir"],
    themes: ["solitude", "destin", "perte_proches", "rejet_enfance", "survivant", "genocide_famille", "demon_interieur", "orphelin"]
  },

  // ─── Bleach ──────────────────────────────────────────────────────────────
  {
    id: "ichigo",
    name: "Ichigo Kurosaki",
    anime: "Bleach",
    image: "/assets/img/undercover/ichigo.png",
    visual: ["cheveux_oranges", "cheveux_courts", "cheveux_herisses", "yeux_noisette", "uniforme_scolaire", "regard_intense", "adolescent"],
    personality: ["colerique", "loyal", "protecteur", "determine", "serieux", "impulsif", "noble", "tenace"],
    powers: ["reiatsu", "epeiste", "zanpakuto", "super_vitesse", "shinigami", "transformation", "combat_rapproche", "heritage_pouvoir"],
    themes: ["protection_proches", "amitie", "perte_proches", "heritage", "double_identite", "survivant", "demon_interieur", "famille", "eleve"]
  },
  {
    id: "rukia",
    name: "Rukia Kuchiki",
    anime: "Bleach",
    image: "/assets/img/undercover/rukia.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_violets", "kimono", "femme", "petit", "adolescent", "regard_froid"],
    personality: ["serieux", "noble", "loyal", "determine", "froid", "calme"],
    powers: ["reiatsu", "epeiste", "zanpakuto", "glace", "shinigami", "super_vitesse"],
    themes: ["amitie", "noblesse", "heritage", "famille", "devoir", "orphelin", "survivant", "perte_proches"]
  },
  {
    id: "byakuya",
    name: "Byakuya Kuchiki",
    anime: "Bleach",
    image: "/assets/img/undercover/byakuya.png",
    visual: ["cheveux_noirs", "cheveux_longs", "yeux_gris", "manteau_blanc", "kimono", "regard_froid", "regard_intense", "adulte"],
    personality: ["froid", "noble", "serieux", "orgueilleux", "silencieux", "solitaire", "determine"],
    powers: ["reiatsu", "epeiste", "zanpakuto", "super_vitesse", "shinigami", "combat_rapproche"],
    themes: ["noblesse", "famille", "perte_proches", "devoir", "promesse", "survivant", "solitude", "leader"]
  },
  {
    id: "aizen",
    name: "Sosuke Aizen",
    anime: "Bleach",
    image: "/assets/img/undercover/aizen.png",
    visual: ["cheveux_bruns", "cheveux_mi_longs", "lunettes", "manteau_blanc", "kimono", "adulte", "regard_intense", "regard_froid"],
    personality: ["calme", "manipulateur", "arrogant", "charismatique", "sadique", "intelligent", "strategique", "noble", "orgueilleux"],
    powers: ["reiatsu", "epeiste", "zanpakuto", "illusion", "shinigami", "transformation", "super_force", "super_vitesse"],
    themes: ["trahison", "pouvoir_absolu", "tyran", "dieu", "double_identite", "ascension", "chute", "immortalite"]
  },
  {
    id: "grimmjow",
    name: "Grimmjow Jaegerjaquez",
    anime: "Bleach",
    image: "/assets/img/undercover/grimmjow.png",
    visual: ["cheveux_bleus", "cheveux_courts", "yeux_bleus", "masque_visage", "muscle", "cicatrice_oeil", "cicatrices", "adulte", "regard_intense", "regard_froid"],
    personality: ["sauvage", "colerique", "orgueilleux", "impulsif", "rebelle", "arrogant", "determine", "tenace"],
    powers: ["reiatsu", "super_force", "super_vitesse", "combat_rapproche", "transformation", "demon"],
    themes: ["rivalite", "devenir_le_plus_fort", "liberte", "rejet_enfance", "solitude", "frere_ennemi"]
  },

  // ─── Death Note ──────────────────────────────────────────────────────────
  {
    id: "light",
    name: "Light Yagami",
    anime: "Death Note",
    image: "/assets/img/undercover/light.png",
    visual: ["cheveux_bruns", "cheveux_courts", "yeux_noisette", "uniforme_scolaire", "regard_intense", "regard_froid", "adolescent"],
    personality: ["intelligent", "arrogant", "manipulateur", "charismatique", "psychopathe", "determine", "strategique", "serieux", "sadique", "noble"],
    powers: ["deduction", "detective", "cahier_mort"],
    themes: ["pouvoir_absolu", "dieu", "justice", "double_identite", "chute", "rivalite", "heritage", "genie"]
  },
  {
    id: "l",
    name: "L Lawliet",
    anime: "Death Note",
    image: "/assets/img/undercover/l.png",
    visual: ["cheveux_noirs", "cheveux_courts", "cheveux_herisses", "yeux_noirs", "cernes", "adulte", "fin", "regard_intense"],
    personality: ["intelligent", "calme", "excentrique", "gourmand", "solitaire", "strategique", "determine", "serieux", "cynique"],
    powers: ["deduction", "detective"],
    themes: ["rivalite", "justice", "solitude", "devoir", "orphelin", "heritage", "genie", "secret_obscur"]
  },
  {
    id: "near",
    name: "Near",
    anime: "Death Note",
    image: "/assets/img/undercover/near.png",
    visual: ["cheveux_blancs", "cheveux_boucles", "yeux_noirs", "enfant", "petit", "regard_froid", "regard_intense", "fin"],
    personality: ["intelligent", "calme", "solitaire", "froid", "serieux", "strategique", "determine", "timide", "humble"],
    powers: ["deduction", "detective"],
    themes: ["heritage", "justice", "rivalite", "orphelin", "devoir", "solitude", "genie"]
  },

  // ─── Attack on Titan ─────────────────────────────────────────────────────
  {
    id: "eren",
    name: "Eren Yeager",
    anime: "Attack on Titan",
    image: "/assets/img/undercover/eren.png",
    visual: ["cheveux_bruns", "cheveux_mi_longs", "yeux_verts", "uniforme_militaire", "regard_intense", "regard_froid", "adolescent"],
    personality: ["colerique", "determine", "impulsif", "loyal", "vengeur", "serieux", "manipulateur"],
    powers: ["transformation", "super_force", "regeneration", "combat_rapproche", "titan_shifter", "heritage_pouvoir"],
    themes: ["liberte", "vengeance", "heritage", "perte_proches", "radicalisation", "destin", "survivant", "genocide_famille", "orphelin", "sacrifice", "double_identite"]
  },
  {
    id: "mikasa",
    name: "Mikasa Ackerman",
    anime: "Attack on Titan",
    image: "/assets/img/undercover/mikasa.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_noirs", "echarpe_rouge", "uniforme_militaire", "femme", "adolescent", "regard_froid"],
    personality: ["calme", "loyal", "protectrice", "silencieux", "determine", "froid", "serieux", "solitaire"],
    powers: ["super_force", "super_vitesse", "epeiste", "combat_rapproche", "heritage_pouvoir"],
    themes: ["protection_proches", "amour_impossible", "perte_proches", "heritage", "orphelin", "survivant", "genocide_famille", "solitude", "devoir"]
  },
  {
    id: "armin",
    name: "Armin Arlert",
    anime: "Attack on Titan",
    image: "/assets/img/undercover/armin.png",
    visual: ["cheveux_blonds", "cheveux_mi_longs", "yeux_bleus", "uniforme_militaire", "fin", "adolescent"],
    personality: ["intelligent", "timide", "loyal", "determine", "noble", "strategique", "chaleureux"],
    powers: ["transformation", "titan_shifter", "super_force", "regeneration"],
    themes: ["amitie", "sacrifice", "heritage", "ascension", "survivant", "orphelin", "inferieur_a_genie"]
  },
  {
    id: "levi",
    name: "Levi Ackerman",
    anime: "Attack on Titan",
    image: "/assets/img/undercover/levi.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_gris", "uniforme_militaire", "cape", "petit", "regard_froid", "regard_intense", "adulte"],
    personality: ["froid", "serieux", "solitaire", "loyal", "cynique", "determine", "noble", "silencieux"],
    powers: ["super_vitesse", "super_force", "epeiste", "combat_rapproche", "heritage_pouvoir"],
    themes: ["devoir", "perte_proches", "leader", "solitude", "promesse", "orphelin", "survivant", "heritage", "famille_difficile"]
  },
  {
    id: "reiner",
    name: "Reiner Braun",
    anime: "Attack on Titan",
    image: "/assets/img/undercover/reiner.png",
    visual: ["cheveux_blonds", "cheveux_courts", "yeux_noisette", "muscle", "uniforme_militaire", "grand", "adolescent", "regard_intense"],
    personality: ["loyal", "serieux", "protecteur", "noble", "determine", "cynique", "solitaire"],
    powers: ["transformation", "super_force", "regeneration", "titan_shifter", "armure", "combat_rapproche", "heritage_pouvoir"],
    themes: ["double_identite", "trahison", "sacrifice", "devoir", "famille_difficile", "survivant", "perte_proches", "chute", "radicalisation"]
  },

  // ─── Jujutsu Kaisen ──────────────────────────────────────────────────────
  {
    id: "gojo",
    name: "Satoru Gojo",
    anime: "Jujutsu Kaisen",
    image: "/assets/img/undercover/gojo.png",
    visual: ["cheveux_blancs", "cheveux_herisses", "yeux_bleus", "bandeau_yeux", "lunettes_de_soleil", "grand", "adulte", "regard_intense"],
    personality: ["arrogant", "charismatique", "humoristique", "calme", "intelligent", "noble", "orgueilleux", "serieux"],
    powers: ["cursed_energy", "oeil_special", "sorcier", "teleportation", "domaine", "super_vitesse", "super_force", "combat_rapproche", "heritage_pouvoir"],
    themes: ["pouvoir_absolu", "mentor", "solitude", "heritage", "devoir", "genie", "symbole", "perte_proches"]
  },
  {
    id: "yuji",
    name: "Yuji Itadori",
    anime: "Jujutsu Kaisen",
    image: "/assets/img/undercover/yuji.png",
    visual: ["cheveux_roses", "cheveux_courts", "yeux_noisette", "uniforme_scolaire", "muscle", "adolescent"],
    personality: ["optimiste", "loyal", "impulsif", "naif", "determine", "chaleureux", "tenace", "bruyant"],
    powers: ["cursed_energy", "super_force", "super_vitesse", "combat_rapproche", "sorcier", "transformation", "heritage_pouvoir"],
    themes: ["sacrifice", "amitie", "bete_scellee", "demon_interieur", "destin", "orphelin", "perte_proches", "eleve", "double_identite"]
  },
  {
    id: "megumi",
    name: "Megumi Fushiguro",
    anime: "Jujutsu Kaisen",
    image: "/assets/img/undercover/megumi.png",
    visual: ["cheveux_noirs", "cheveux_courts", "cheveux_herisses", "yeux_verts", "uniforme_scolaire", "regard_froid", "regard_intense", "adolescent"],
    personality: ["froid", "serieux", "solitaire", "loyal", "intelligent", "noble", "silencieux", "determine"],
    powers: ["cursed_energy", "ombre", "sorcier", "combat_rapproche", "heritage_pouvoir"],
    themes: ["heritage", "famille", "destin", "protection_proches", "eleve", "famille_difficile", "orphelin"]
  },
  {
    id: "sukuna",
    name: "Ryomen Sukuna",
    anime: "Jujutsu Kaisen",
    image: "/assets/img/undercover/sukuna.png",
    visual: ["cheveux_roses", "yeux_rouges", "tatouages", "cicatrices", "regard_froid", "regard_intense", "adulte", "muscle"],
    personality: ["arrogant", "sadique", "psychopathe", "charismatique", "cynique", "orgueilleux", "froid", "colerique"],
    powers: ["cursed_energy", "super_force", "super_vitesse", "feu", "combat_rapproche", "domaine", "regeneration", "demon", "transformation"],
    themes: ["pouvoir_absolu", "tyran", "demon_interieur", "immortalite", "dieu", "leader"]
  },
  {
    id: "geto",
    name: "Suguru Geto",
    anime: "Jujutsu Kaisen",
    image: "/assets/img/undercover/geto.png",
    visual: ["cheveux_noirs", "cheveux_longs", "queue_de_cheval", "kimono", "yeux_noirs", "adulte", "regard_froid", "regard_intense"],
    personality: ["calme", "charismatique", "noble", "manipulateur", "serieux", "intelligent", "froid", "determine"],
    powers: ["cursed_energy", "sorcier", "combat_rapproche"],
    themes: ["radicalisation", "chute", "trahison", "rivalite", "frere_ennemi", "perte_proches", "solitude", "amitie", "sacrifice"]
  },

  // ─── My Hero Academia ────────────────────────────────────────────────────
  {
    id: "deku",
    name: "Izuku Midoriya (Deku)",
    anime: "My Hero Academia",
    image: "/assets/img/undercover/deku.png",
    visual: ["cheveux_verts", "cheveux_herisses", "yeux_verts", "cicatrices", "costume_hero", "uniforme_scolaire", "adolescent"],
    personality: ["timide", "loyal", "determine", "intelligent", "tenace", "naif", "chaleureux", "optimiste", "strategique"],
    powers: ["super_force", "super_vitesse", "quirk", "heritage_pouvoir", "combat_rapproche", "transformation", "hero"],
    themes: ["heritage", "rever_de_leader", "amitie", "rivalite", "ascension", "mentor", "eleve", "rejet_enfance", "inferieur_a_genie", "protection_proches"]
  },
  {
    id: "bakugo",
    name: "Katsuki Bakugo",
    anime: "My Hero Academia",
    image: "/assets/img/undercover/bakugo.png",
    visual: ["cheveux_blonds", "cheveux_courts", "cheveux_herisses", "yeux_rouges", "regard_intense", "regard_froid", "costume_hero", "uniforme_scolaire", "adolescent"],
    personality: ["arrogant", "colerique", "rebelle", "determine", "bruyant", "orgueilleux", "impulsif", "tenace", "intelligent"],
    powers: ["quirk", "super_vitesse", "combat_rapproche", "explosion", "hero", "super_force"],
    themes: ["rivalite", "ascension", "rever_de_leader", "devenir_le_plus_fort", "frere_ennemi", "eleve"]
  },
  {
    id: "todoroki",
    name: "Shoto Todoroki",
    anime: "My Hero Academia",
    image: "/assets/img/undercover/todoroki.png",
    visual: ["cheveux_blancs", "cheveux_rouges", "cheveux_heterochromes", "yeux_heterochromes", "cicatrice_oeil", "costume_hero", "uniforme_scolaire", "adolescent", "regard_froid"],
    personality: ["calme", "serieux", "froid", "solitaire", "noble", "determine", "silencieux"],
    powers: ["feu", "glace", "quirk", "combat_rapproche", "hero", "heritage_pouvoir"],
    themes: ["famille_difficile", "heritage", "redemption", "frere_ennemi", "rejet_enfance", "pere_abusif", "perte_proches"]
  },
  {
    id: "all_might",
    name: "All Might",
    anime: "My Hero Academia",
    image: "/assets/img/undercover/all_might.png",
    visual: ["cheveux_blonds", "cheveux_courts", "cheveux_herisses", "yeux_bleus", "muscle", "grand", "costume_hero", "adulte", "regard_intense", "sourire_perpetuel"],
    personality: ["charismatique", "optimiste", "noble", "protecteur", "chaleureux", "determine", "loyal", "serieux"],
    powers: ["super_force", "super_vitesse", "quirk", "heritage_pouvoir", "transformation", "hero", "combat_rapproche"],
    themes: ["mentor", "leader", "heritage", "sacrifice", "symbole", "devoir", "perte_proches", "eleve"]
  },

  // ─── Demon Slayer ────────────────────────────────────────────────────────
  {
    id: "tanjiro",
    name: "Tanjiro Kamado",
    anime: "Demon Slayer",
    image: "/assets/img/undercover/tanjiro.png",
    visual: ["cheveux_rouges", "cheveux_courts", "yeux_rouges", "cicatrice_front", "kimono", "adolescent"],
    personality: ["chaleureux", "determine", "protecteur", "loyal", "naif", "noble", "optimiste", "tenace"],
    powers: ["epeiste", "eau", "feu", "super_vitesse", "combat_rapproche", "chasseur_demon", "heritage_pouvoir"],
    themes: ["famille", "perte_proches", "protection_proches", "devenir_le_plus_fort", "heritage", "survivant", "genocide_famille", "orphelin", "eleve", "amitie"]
  },
  {
    id: "nezuko",
    name: "Nezuko Kamado",
    anime: "Demon Slayer",
    image: "/assets/img/undercover/nezuko.png",
    visual: ["cheveux_noirs", "cheveux_longs", "cheveux_degrades", "yeux_roses", "kimono", "femme", "adolescent"],
    personality: ["protectrice", "silencieux", "chaleureux", "loyal", "determine", "naif"],
    powers: ["demon", "feu", "regeneration", "transformation", "super_force", "super_vitesse", "combat_rapproche"],
    themes: ["famille", "protection_proches", "demon_interieur", "perte_proches", "survivant", "genocide_famille", "double_identite"]
  },
  {
    id: "zenitsu",
    name: "Zenitsu Agatsuma",
    anime: "Demon Slayer",
    image: "/assets/img/undercover/zenitsu.png",
    visual: ["cheveux_blonds", "cheveux_courts", "yeux_dores", "kimono", "adolescent"],
    personality: ["peureux", "bruyant", "loyal", "impulsif", "colerique", "naif", "chaleureux"],
    powers: ["epeiste", "foudre", "super_vitesse", "combat_rapproche", "chasseur_demon"],
    themes: ["amitie", "ascension", "heritage", "mentor", "orphelin", "eleve", "inferieur_a_genie"]
  },
  {
    id: "inosuke",
    name: "Inosuke Hashibira",
    anime: "Demon Slayer",
    image: "/assets/img/undercover/inosuke.png",
    visual: ["cheveux_noirs", "cheveux_mi_longs", "masque_visage", "muscle", "adolescent"],
    personality: ["sauvage", "bruyant", "impulsif", "colerique", "loyal", "naif", "determine", "tenace"],
    powers: ["epeiste", "combat_rapproche", "super_force", "super_vitesse", "chasseur_demon"],
    themes: ["amitie", "origine_inconnue", "rivalite", "orphelin", "perte_proches", "heritage"]
  },
  {
    id: "giyu",
    name: "Giyu Tomioka",
    anime: "Demon Slayer",
    image: "/assets/img/undercover/giyu.png",
    visual: ["cheveux_noirs", "cheveux_longs", "queue_de_cheval", "yeux_bleus", "kimono", "cape", "regard_froid", "regard_intense", "adulte"],
    personality: ["froid", "serieux", "solitaire", "silencieux", "noble", "determine", "loyal"],
    powers: ["epeiste", "eau", "super_vitesse", "combat_rapproche", "chasseur_demon"],
    themes: ["perte_proches", "solitude", "devoir", "promesse", "survivant", "orphelin", "mentor"]
  },
  {
    id: "muzan",
    name: "Muzan Kibutsuji",
    anime: "Demon Slayer",
    image: "/assets/img/undercover/muzan.png",
    visual: ["cheveux_noirs", "cheveux_longs", "yeux_rouges", "costume", "regard_froid", "regard_intense", "adulte"],
    personality: ["arrogant", "sadique", "manipulateur", "cynique", "psychopathe", "froid", "charismatique", "orgueilleux"],
    powers: ["demon", "regeneration", "super_force", "super_vitesse", "transformation", "metamorphose", "combat_rapproche"],
    themes: ["pouvoir_absolu", "tyran", "immortalite", "dieu", "leader", "double_identite"]
  },

  // ─── Fullmetal Alchemist ─────────────────────────────────────────────────
  {
    id: "edward",
    name: "Edward Elric",
    anime: "Fullmetal Alchemist",
    image: "/assets/img/undercover/edward.png",
    visual: ["cheveux_blonds", "cheveux_longs", "tresse", "yeux_dores", "manteau_rouge", "bras_prothese", "jambe_prothese", "petit", "adolescent", "regard_intense"],
    personality: ["colerique", "arrogant", "intelligent", "determine", "loyal", "orgueilleux", "impulsif", "strategique", "noble"],
    powers: ["alchimie", "combat_rapproche", "transformation", "super_force"],
    themes: ["famille", "sacrifice", "heritage", "redemption", "perte_proches", "ascension", "survivant", "orphelin", "protection_proches", "frere_ennemi"]
  },
  {
    id: "alphonse",
    name: "Alphonse Elric",
    anime: "Fullmetal Alchemist",
    image: "/assets/img/undercover/alphonse.png",
    visual: ["armure", "grand", "yeux_rouges"],
    personality: ["chaleureux", "loyal", "noble", "calme", "determine", "intelligent", "naif", "protecteur"],
    powers: ["alchimie", "combat_rapproche", "super_force", "transformation"],
    themes: ["famille", "sacrifice", "perte_proches", "ascension", "survivant", "orphelin", "redemption", "protection_proches", "heritage"]
  },
  {
    id: "roy_mustang",
    name: "Roy Mustang",
    anime: "Fullmetal Alchemist",
    image: "/assets/img/undercover/roy_mustang.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_noirs", "uniforme_militaire", "adulte", "regard_froid", "regard_intense"],
    personality: ["charismatique", "arrogant", "noble", "determine", "serieux", "intelligent", "strategique", "cynique"],
    powers: ["alchimie", "feu", "combat_rapproche"],
    themes: ["vengeance", "guerre", "perte_proches", "leader", "ascension", "survivant", "genocide_famille", "redemption", "devoir", "mentor"]
  },

  // ─── One Punch Man ───────────────────────────────────────────────────────
  {
    id: "saitama",
    name: "Saitama",
    anime: "One Punch Man",
    image: "/assets/img/undercover/saitama.png",
    visual: ["chauve", "cape", "costume_hero", "yeux_noirs", "adulte", "muscle"],
    personality: ["calme", "blase", "humoristique", "naif", "solitaire", "chaleureux", "determine", "humble"],
    powers: ["super_force", "super_vitesse", "invincibilite", "combat_rapproche", "vol", "hero"],
    themes: ["solitude", "ennui", "rivalite", "mentor", "devenir_le_plus_fort", "symbole", "inferieur_a_genie"]
  },
  {
    id: "genos",
    name: "Genos",
    anime: "One Punch Man",
    image: "/assets/img/undercover/genos.png",
    visual: ["cheveux_blonds", "cheveux_courts", "yeux_dores", "bras_prothese", "muscle", "adolescent", "regard_intense"],
    personality: ["serieux", "loyal", "determine", "noble", "colerique", "vengeur", "solitaire"],
    powers: ["super_force", "super_vitesse", "feu", "combat_rapproche", "hero", "cyborg", "transformation"],
    themes: ["vengeance", "mentor", "perte_proches", "heritage", "survivant", "genocide_famille", "orphelin", "eleve", "redemption"]
  },

  // ─── Hunter x Hunter ─────────────────────────────────────────────────────
  {
    id: "gon",
    name: "Gon Freecss",
    anime: "Hunter x Hunter",
    image: "/assets/img/undercover/gon.png",
    visual: ["cheveux_noirs", "cheveux_herisses", "yeux_noisette", "enfant"],
    personality: ["optimiste", "determine", "naif", "loyal", "impulsif", "chaleureux", "tenace", "bruyant"],
    powers: ["nen", "super_force", "combat_rapproche", "chasseur", "transformation", "heritage_pouvoir"],
    themes: ["famille", "amitie", "heritage", "rever_de_leader", "orphelin", "quete_pere", "eleve"]
  },
  {
    id: "killua",
    name: "Killua Zoldyck",
    anime: "Hunter x Hunter",
    image: "/assets/img/undercover/killua.png",
    visual: ["cheveux_blancs", "cheveux_herisses", "yeux_bleus", "enfant", "regard_froid", "regard_intense"],
    personality: ["froid", "intelligent", "loyal", "impulsif", "cynique", "determine", "noble", "strategique"],
    powers: ["nen", "foudre", "super_vitesse", "combat_rapproche", "chasseur", "super_force", "heritage_pouvoir"],
    themes: ["amitie", "famille_difficile", "redemption", "heritage", "rejet_enfance", "protection_proches", "noblesse"]
  },
  {
    id: "hisoka",
    name: "Hisoka Morow",
    anime: "Hunter x Hunter",
    image: "/assets/img/undercover/hisoka.png",
    visual: ["cheveux_rouges", "cheveux_herisses", "yeux_dores", "regard_intense", "adulte", "muscle"],
    personality: ["sadique", "psychopathe", "charismatique", "excentrique", "manipulateur", "cynique", "calme", "arrogant"],
    powers: ["nen", "combat_rapproche", "chasseur", "super_force", "super_vitesse"],
    themes: ["rivalite", "devenir_le_plus_fort", "solitude", "origine_inconnue"]
  },
  {
    id: "kurapika",
    name: "Kurapika",
    anime: "Hunter x Hunter",
    image: "/assets/img/undercover/kurapika.png",
    visual: ["cheveux_blonds", "cheveux_mi_longs", "yeux_bleus", "yeux_rouges", "regard_intense", "regard_froid", "adolescent"],
    personality: ["serieux", "intelligent", "vengeur", "loyal", "noble", "froid", "determine", "solitaire"],
    powers: ["nen", "chaines", "oeil_special", "super_force", "combat_rapproche", "chasseur"],
    themes: ["vengeance", "perte_proches", "sacrifice", "solitude", "famille", "genocide_famille", "survivant"]
  },

  // ─── Autres (top tier) ───────────────────────────────────────────────────
  {
    id: "lelouch",
    name: "Lelouch Lamperouge",
    anime: "Code Geass",
    image: "/assets/img/undercover/lelouch.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_violets", "yeux_rouges", "uniforme_scolaire", "cape", "masque_visage", "regard_intense", "regard_froid", "adolescent"],
    personality: ["intelligent", "arrogant", "charismatique", "manipulateur", "determine", "serieux", "strategique", "noble", "froid"],
    powers: ["geass", "oeil_special", "deduction"],
    themes: ["vengeance", "double_identite", "sacrifice", "leader", "pouvoir_absolu", "famille", "survivant", "perte_proches", "orphelin", "rever_de_leader", "chute"]
  },
  {
    id: "kirito",
    name: "Kirito",
    anime: "Sword Art Online",
    image: "/assets/img/undercover/kirito.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_noirs", "manteau_noir", "adolescent", "regard_froid", "regard_intense"],
    personality: ["calme", "solitaire", "loyal", "determine", "serieux", "noble", "intelligent", "silencieux"],
    powers: ["epeiste", "combat_rapproche", "super_vitesse", "super_force"],
    themes: ["solitude", "amitie", "amour_impossible", "protection_proches", "monde_virtuel", "survivant", "perte_proches", "heritage"]
  },
  {
    id: "natsu",
    name: "Natsu Dragneel",
    anime: "Fairy Tail",
    image: "/assets/img/undercover/natsu.png",
    visual: ["cheveux_roses", "cheveux_herisses", "yeux_noirs", "echarpe_rouge", "cicatrices", "adolescent", "muscle"],
    personality: ["bruyant", "optimiste", "loyal", "impulsif", "colerique", "naif"],
    powers: ["feu", "magie", "super_force", "super_vitesse", "combat_rapproche", "dragon_slayer"],
    themes: ["famille", "amitie", "heritage", "frere_ennemi", "quete_pere", "dragon_parent", "rever_de_leader"]
  },
  {
    id: "mob",
    name: "Shigeo Kageyama (Mob)",
    anime: "Mob Psycho 100",
    image: "/assets/img/undercover/mob.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_noirs", "uniforme_scolaire", "adolescent"],
    personality: ["calme", "timide", "naif", "chaleureux", "silencieux", "humble", "loyal", "determine"],
    powers: ["telekinesie", "telepathie", "transformation", "super_force", "super_vitesse"],
    themes: ["amitie", "mentor", "ascension", "solitude", "eleve", "inferieur_a_genie", "demon_interieur"]
  },
  {
    id: "denji",
    name: "Denji",
    anime: "Chainsaw Man",
    image: "/assets/img/undercover/denji.png",
    visual: ["cheveux_blonds", "cheveux_courts", "yeux_noisette", "cicatrices", "cornes", "adolescent", "muscle"],
    personality: ["impulsif", "naif", "loyal", "sauvage", "gourmand", "bruyant", "chaleureux", "tenace"],
    powers: ["transformation", "demon", "regeneration", "super_force", "super_vitesse", "combat_rapproche"],
    themes: ["liberte", "amitie", "protection_proches", "demon_interieur", "rejet_enfance", "orphelin", "survivant", "perte_proches", "famille_difficile"]
  },
  {
    id: "makima",
    name: "Makima",
    anime: "Chainsaw Man",
    image: "/assets/img/undercover/makima.png",
    visual: ["cheveux_rouges", "cheveux_longs", "tresse", "yeux_jaunes", "costume", "femme", "regard_intense", "regard_froid", "adulte"],
    personality: ["manipulatrice", "calme", "froid", "sadique", "charismatique", "intelligent", "strategique", "noble", "cynique"],
    powers: ["demon", "super_force", "regeneration", "telepathie", "super_vitesse", "transformation", "controle"],
    themes: ["pouvoir_absolu", "tyran", "dieu", "double_identite", "immortalite", "leader"]
  },

  // ─── Naruto (extensions) ─────────────────────────────────────────────────
  {
    id: "boruto",
    name: "Boruto Uzumaki",
    anime: "Boruto",
    image: "/assets/img/undercover/boruto.png",
    visual: ["cheveux_blonds", "cheveux_courts", "cheveux_herisses", "yeux_bleus", "moustaches_renard", "bandeau_frontal", "tenue_ninja", "adolescent"],
    personality: ["rebelle", "loyal", "impulsif", "orgueilleux", "tenace", "determine", "chaleureux", "bruyant"],
    powers: ["chakra", "clones", "vent", "ninja", "oeil_special", "combat_rapproche", "super_vitesse", "heritage_pouvoir"],
    themes: ["heritage", "amitie", "rejet_enfance", "destin", "frere_ennemi", "eleve", "rivalite"]
  },
  {
    id: "pain",
    name: "Pain (Nagato)",
    anime: "Naruto",
    image: "/assets/img/undercover/pain.png",
    visual: ["cheveux_oranges", "cheveux_courts", "cheveux_herisses", "yeux_violets", "manteau_noir", "regard_froid", "regard_intense", "adulte"],
    personality: ["calme", "froid", "noble", "serieux", "manipulateur", "charismatique", "intelligent", "strategique", "determine"],
    powers: ["chakra", "rinnegan", "ninja", "oeil_special", "super_force", "super_vitesse", "telekinesie", "combat_rapproche"],
    themes: ["pouvoir_absolu", "guerre", "radicalisation", "perte_proches", "dieu", "genocide_famille", "survivant", "leader", "orphelin", "eleve"]
  },
  {
    id: "obito",
    name: "Obito Uchiha",
    anime: "Naruto",
    image: "/assets/img/undercover/obito.png",
    visual: ["cheveux_noirs", "cheveux_courts", "cheveux_herisses", "yeux_noirs", "yeux_rouges", "masque_visage", "manteau_noir", "cicatrices", "regard_intense", "adulte"],
    personality: ["manipulateur", "froid", "vengeur", "solitaire", "charismatique", "serieux", "determine"],
    powers: ["chakra", "sharingan", "rinnegan", "feu", "ninja", "oeil_special", "teleportation", "combat_rapproche"],
    themes: ["vengeance", "double_identite", "radicalisation", "perte_proches", "redemption", "amour_impossible", "orphelin", "survivant", "chute", "sacrifice"]
  },

  // ─── Hunter x Hunter (extensions) ────────────────────────────────────────
  {
    id: "chrollo",
    name: "Chrollo Lucilfer",
    anime: "Hunter x Hunter",
    image: "/assets/img/undercover/chrollo.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_gris", "manteau_noir", "cicatrice_front", "adulte", "regard_froid", "regard_intense"],
    personality: ["calme", "charismatique", "manipulateur", "intelligent", "noble", "strategique", "cynique", "serieux"],
    powers: ["nen", "combat_rapproche", "super_vitesse", "chasseur", "illusion", "deduction"],
    themes: ["leader", "solitude", "origine_inconnue", "trahison", "chute", "orphelin", "rejet_enfance"]
  },
  {
    id: "meruem",
    name: "Meruem",
    anime: "Hunter x Hunter",
    image: "/assets/img/undercover/meruem.png",
    visual: ["cornes", "yeux_violets", "regard_froid", "regard_intense", "muscle", "cape", "adulte"],
    personality: ["arrogant", "intelligent", "noble", "determine", "serieux", "calme", "strategique", "froid", "orgueilleux"],
    powers: ["nen", "super_force", "super_vitesse", "combat_rapproche", "transformation", "regeneration"],
    themes: ["pouvoir_absolu", "tyran", "ascension", "redemption", "origine_inconnue", "leader", "dieu"]
  },

  // ─── JoJo's Bizarre Adventure ────────────────────────────────────────────
  {
    id: "jotaro",
    name: "Jotaro Kujo",
    anime: "JoJo's Bizarre Adventure",
    image: "/assets/img/undercover/jotaro.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_noirs", "uniforme_scolaire", "muscle", "regard_froid", "regard_intense", "adolescent", "cicatrices", "chapeau"],
    personality: ["froid", "silencieux", "loyal", "determine", "cynique", "serieux", "noble", "solitaire", "tenace"],
    powers: ["telekinesie", "super_force", "super_vitesse", "combat_rapproche", "heritage_pouvoir", "transformation"],
    themes: ["heritage", "famille", "rivalite", "protection_proches", "devoir", "rebelle"]
  },
  {
    id: "dio",
    name: "Dio Brando",
    anime: "JoJo's Bizarre Adventure",
    image: "/assets/img/undercover/dio.png",
    visual: ["cheveux_blonds", "cheveux_mi_longs", "yeux_jaunes", "yeux_rouges", "muscle", "cape", "regard_froid", "regard_intense", "adulte"],
    personality: ["arrogant", "sadique", "charismatique", "manipulateur", "psychopathe", "cynique", "colerique", "orgueilleux"],
    powers: ["telekinesie", "super_force", "super_vitesse", "regeneration", "demon", "transformation", "vampire"],
    themes: ["pouvoir_absolu", "tyran", "immortalite", "frere_ennemi", "dieu", "ascension", "rejet_enfance", "famille_difficile", "chute", "rivalite"]
  },
  {
    id: "giorno",
    name: "Giorno Giovanna",
    anime: "JoJo's Bizarre Adventure",
    image: "/assets/img/undercover/giorno.png",
    visual: ["cheveux_blonds", "cheveux_mi_longs", "cheveux_boucles", "yeux_bleus", "costume", "adolescent", "regard_intense", "regard_froid"],
    personality: ["calme", "determine", "intelligent", "noble", "charismatique", "strategique", "serieux", "loyal"],
    powers: ["telekinesie", "super_vitesse", "regeneration", "transformation", "super_force", "heritage_pouvoir"],
    themes: ["heritage", "rever_de_leader", "justice", "leader", "famille", "orphelin", "rejet_enfance", "ascension", "famille_difficile"]
  },

  // ─── Berserk ─────────────────────────────────────────────────────────────
  {
    id: "guts",
    name: "Guts",
    anime: "Berserk",
    image: "/assets/img/undercover/guts.png",
    visual: ["cheveux_noirs", "cheveux_courts", "cheveux_herisses", "yeux_noirs", "cicatrices", "cicatrice_oeil", "bras_prothese", "muscle", "armure", "manteau_noir", "adulte", "regard_froid", "regard_intense"],
    personality: ["froid", "colerique", "vengeur", "solitaire", "determine", "tenace", "cynique", "silencieux"],
    powers: ["epeiste", "super_force", "combat_rapproche", "armure", "transformation"],
    themes: ["vengeance", "perte_proches", "trahison", "solitude", "frere_ennemi", "demon_interieur", "survivant", "genocide_famille", "orphelin", "rejet_enfance"]
  },
  {
    id: "griffith",
    name: "Griffith",
    anime: "Berserk",
    image: "/assets/img/undercover/griffith.png",
    visual: ["cheveux_blancs", "cheveux_longs", "yeux_bleus", "armure", "cape", "adulte", "regard_intense", "regard_froid"],
    personality: ["charismatique", "calme", "manipulateur", "noble", "orgueilleux", "intelligent", "strategique", "serieux", "froid"],
    powers: ["epeiste", "combat_rapproche", "super_vitesse", "super_force", "transformation", "demon", "vol"],
    themes: ["ascension", "trahison", "leader", "rever_de_leader", "sacrifice", "pouvoir_absolu", "chute", "orphelin", "rejet_enfance", "dieu"]
  },

  // ─── Inuyasha ────────────────────────────────────────────────────────────
  {
    id: "inuyasha",
    name: "Inuyasha",
    anime: "Inuyasha",
    image: "/assets/img/undercover/inuyasha.png",
    visual: ["cheveux_blancs", "cheveux_longs", "yeux_dores", "kimono", "cornes", "adolescent", "muscle"],
    personality: ["impulsif", "colerique", "loyal", "rebelle", "chaleureux", "bruyant", "tenace", "determine"],
    powers: ["epeiste", "super_force", "super_vitesse", "demon", "combat_rapproche", "transformation", "heritage_pouvoir"],
    themes: ["famille", "amitie", "amour_impossible", "heritage", "demon_interieur", "frere_ennemi", "rejet_enfance", "orphelin", "perte_proches", "survivant", "solitude"]
  },
  {
    id: "sesshomaru",
    name: "Sesshomaru",
    anime: "Inuyasha",
    image: "/assets/img/undercover/sesshomaru.png",
    visual: ["cheveux_blancs", "cheveux_longs", "yeux_dores", "armure", "kimono", "regard_froid", "regard_intense", "adulte"],
    personality: ["froid", "arrogant", "noble", "serieux", "solitaire", "silencieux", "determine", "orgueilleux", "calme"],
    powers: ["epeiste", "super_force", "super_vitesse", "demon", "combat_rapproche", "transformation", "poison", "vol"],
    themes: ["noblesse", "heritage", "famille", "frere_ennemi", "devoir", "pouvoir_absolu", "perte_proches", "leader", "solitude"]
  },

  // ─── Rurouni Kenshin ─────────────────────────────────────────────────────
  {
    id: "kenshin",
    name: "Kenshin Himura",
    anime: "Rurouni Kenshin",
    image: "/assets/img/undercover/kenshin.png",
    visual: ["cheveux_rouges", "cheveux_longs", "queue_de_cheval", "yeux_violets", "cicatrice_joue", "kimono", "adulte", "petit", "regard_intense"],
    personality: ["calme", "noble", "humble", "chaleureux", "determine", "serieux", "loyal", "solitaire"],
    powers: ["epeiste", "super_vitesse", "combat_rapproche", "super_force"],
    themes: ["redemption", "double_identite", "perte_proches", "devoir", "survivant", "amour_impossible", "guerre", "orphelin", "solitude"]
  },

  // ─── Dr. Stone ───────────────────────────────────────────────────────────
  {
    id: "senku",
    name: "Senku Ishigami",
    anime: "Dr. Stone",
    image: "/assets/img/undercover/senku.png",
    visual: ["cheveux_blancs", "cheveux_verts", "cheveux_herisses", "yeux_rouges", "adolescent", "fin", "regard_intense"],
    personality: ["intelligent", "arrogant", "determine", "excentrique", "cynique", "strategique", "calme", "noble"],
    powers: ["deduction", "detective"],
    themes: ["rever_de_leader", "ascension", "heritage", "leader", "amitie", "survivant", "mentor", "genie", "famille"]
  },

  // ─── Evangelion ──────────────────────────────────────────────────────────
  {
    id: "rei",
    name: "Rei Ayanami",
    anime: "Neon Genesis Evangelion",
    image: "/assets/img/undercover/rei.png",
    visual: ["cheveux_bleus", "cheveux_courts", "yeux_rouges", "femme", "adolescent", "petit", "regard_froid", "regard_intense", "uniforme_scolaire"],
    personality: ["froid", "silencieux", "calme", "solitaire", "naif", "serieux", "determine"],
    powers: ["telekinesie", "transformation", "regeneration", "super_force"],
    themes: ["origine_inconnue", "solitude", "double_identite", "sacrifice", "destin", "amour_impossible", "orphelin", "immortalite", "heritage"]
  },

  // ─── Black Clover ────────────────────────────────────────────────────────
  {
    id: "asta",
    name: "Asta",
    anime: "Black Clover",
    image: "/assets/img/undercover/asta.png",
    visual: ["cheveux_blancs", "cheveux_courts", "cheveux_herisses", "yeux_verts", "cicatrices", "muscle", "adolescent"],
    personality: ["bruyant", "loyal", "tenace", "determine", "chaleureux"],
    powers: ["epeiste", "super_force", "super_vitesse", "combat_rapproche", "anti_magie", "heritage_pouvoir"],
    themes: ["orphelin", "rejet_enfance", "rever_de_leader", "amitie", "ascension", "rivalite", "inferieur_a_genie", "heritage"]
  },
  {
    id: "yuno",
    name: "Yuno",
    anime: "Black Clover",
    image: "/assets/img/undercover/yuno.png",
    visual: ["cheveux_noirs", "cheveux_courts", "cheveux_herisses", "yeux_dores", "manteau_noir", "adolescent", "regard_froid", "regard_intense"],
    personality: ["froid", "calme", "serieux", "determine", "noble", "intelligent", "solitaire", "silencieux"],
    powers: ["magie", "vent", "super_vitesse", "combat_rapproche", "heritage_pouvoir"],
    themes: ["orphelin", "rever_de_leader", "rivalite", "frere_ennemi", "ascension", "rejet_enfance", "heritage", "destin", "genie"]
  },

  // ─── Tokyo Ghoul ─────────────────────────────────────────────────────────
  {
    id: "kaneki",
    name: "Ken Kaneki",
    anime: "Tokyo Ghoul",
    image: "/assets/img/undercover/kaneki.png",
    visual: ["cheveux_blancs", "cheveux_noirs", "cheveux_courts", "yeux_rouges", "yeux_noirs", "masque_visage", "manteau_noir", "cicatrices", "adolescent", "regard_intense", "regard_froid"],
    personality: ["calme", "froid", "serieux", "solitaire", "protecteur", "intelligent", "determine", "noble"],
    powers: ["demon", "regeneration", "super_force", "super_vitesse", "combat_rapproche", "transformation"],
    themes: ["double_identite", "demon_interieur", "perte_proches", "solitude", "redemption", "survivant", "orphelin", "rejet_enfance"]
  },

  // ─── D.Gray-man ──────────────────────────────────────────────────────────
  {
    id: "allen",
    name: "Allen Walker",
    anime: "D.Gray-man",
    image: "/assets/img/undercover/allen.png",
    visual: ["cheveux_blancs", "cheveux_courts", "yeux_gris", "cicatrice_oeil", "cicatrices", "manteau_noir", "bras_prothese", "adolescent", "regard_intense"],
    personality: ["noble", "chaleureux", "determine", "loyal", "serieux", "calme", "humble", "protecteur"],
    powers: ["epeiste", "combat_rapproche", "transformation", "oeil_special", "super_force", "super_vitesse", "heritage_pouvoir"],
    themes: ["orphelin", "rejet_enfance", "demon_interieur", "sacrifice", "double_identite", "mentor", "eleve", "survivant", "perte_proches", "solitude"]
  },

  // ─── Bungo Stray Dogs ────────────────────────────────────────────────────
  {
    id: "dazai",
    name: "Osamu Dazai",
    anime: "Bungo Stray Dogs",
    image: "/assets/img/undercover/dazai.png",
    visual: ["cheveux_bruns", "cheveux_courts", "yeux_noirs", "manteau_noir", "adulte", "fin", "regard_intense", "cicatrices"],
    personality: ["intelligent", "manipulateur", "excentrique", "calme", "cynique", "noble", "charismatique", "humoristique", "strategique"],
    powers: ["deduction", "detective"],
    themes: ["double_identite", "solitude", "redemption", "chute", "secret_obscur", "mentor", "trahison", "orphelin"]
  },

  // ─── My Hero Academia (villains) ─────────────────────────────────────────
  {
    id: "shigaraki",
    name: "Tomura Shigaraki",
    anime: "My Hero Academia",
    image: "/assets/img/undercover/shigaraki.png",
    visual: ["cheveux_bleus", "cheveux_mi_longs", "yeux_rouges", "manteau_noir", "cicatrices", "adulte", "regard_intense", "regard_froid"],
    personality: ["colerique", "sadique", "rebelle", "manipulateur", "determine", "vengeur", "psychopathe", "cynique"],
    powers: ["quirk", "combat_rapproche", "super_force", "transformation", "heritage_pouvoir"],
    themes: ["radicalisation", "perte_proches", "tyran", "demon_interieur", "rejet_enfance", "heritage", "orphelin", "survivant", "genocide_famille", "famille_difficile", "chute"]
  },
  {
    id: "dabi",
    name: "Dabi",
    anime: "My Hero Academia",
    image: "/assets/img/undercover/dabi.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_bleus", "cicatrices", "manteau_noir", "adulte", "regard_froid", "regard_intense"],
    personality: ["froid", "cynique", "sadique", "vengeur", "manipulateur", "solitaire", "colerique", "psychopathe"],
    powers: ["feu", "quirk", "combat_rapproche", "heritage_pouvoir"],
    themes: ["famille_difficile", "vengeance", "radicalisation", "frere_ennemi", "double_identite", "perte_proches", "chute", "rejet_enfance", "pere_abusif"]
  },

  // ─── Attack on Titan (extensions) ────────────────────────────────────────
  {
    id: "erwin",
    name: "Erwin Smith",
    anime: "Attack on Titan",
    image: "/assets/img/undercover/erwin.png",
    visual: ["cheveux_blonds", "cheveux_courts", "yeux_bleus", "uniforme_militaire", "cape", "grand", "adulte", "regard_intense", "regard_froid"],
    personality: ["charismatique", "strategique", "noble", "serieux", "determine", "intelligent", "cynique", "calme"],
    powers: ["combat_rapproche", "super_vitesse"],
    themes: ["leader", "sacrifice", "devoir", "perte_proches", "symbole", "survivant", "heritage", "mentor", "orphelin"]
  },

  // ─── Spy x Family ────────────────────────────────────────────────────────
  {
    id: "loid",
    name: "Loid Forger (Twilight)",
    anime: "Spy x Family",
    image: "/assets/img/undercover/loid.png",
    visual: ["cheveux_blonds", "cheveux_courts", "yeux_bleus", "costume", "adulte", "regard_intense", "regard_froid"],
    personality: ["calme", "intelligent", "charismatique", "manipulateur", "noble", "serieux", "strategique", "solitaire"],
    powers: ["deduction", "detective", "combat_rapproche", "super_vitesse"],
    themes: ["double_identite", "devoir", "famille", "solitude", "secret_obscur", "orphelin", "survivant", "guerre", "perte_proches"]
  },

  // ─── Tokyo Revengers ─────────────────────────────────────────────────────
  {
    id: "mikey",
    name: "Manjiro Sano (Mikey)",
    anime: "Tokyo Revengers",
    image: "/assets/img/undercover/mikey.png",
    visual: ["cheveux_blonds", "cheveux_courts", "yeux_noirs", "tenue_noire", "petit", "adolescent", "regard_intense", "regard_froid"],
    personality: ["charismatique", "calme", "impulsif", "noble", "colerique", "determine", "loyal", "solitaire"],
    powers: ["super_force", "super_vitesse", "combat_rapproche", "heritage_pouvoir"],
    themes: ["leader", "perte_proches", "amitie", "chute", "famille", "demon_interieur", "orphelin", "survivant", "devenir_le_plus_fort"]
  },

  // ─── Death Note (extension) ──────────────────────────────────────────────
  // Densifie le cluster détectives génies (L, Near, Light, Lelouch, Senku, Dazai).
  {
    id: "mello",
    name: "Mello",
    anime: "Death Note",
    image: "/assets/img/undercover/mello.png",
    visual: ["cheveux_blonds", "cheveux_mi_longs", "yeux_bleus", "manteau_noir", "cicatrices", "adolescent", "regard_intense"],
    personality: ["intelligent", "colerique", "impulsif", "determine", "cynique", "rebelle", "orgueilleux", "manipulateur"],
    powers: ["deduction", "detective", "strategique"],
    themes: ["rivalite", "heritage", "justice", "solitude", "chute", "orphelin", "vengeance"]
  },

  // ─── Dragon Ball Z (extensions) ──────────────────────────────────────────
  // Densifie le cluster saiyans (Goku, Vegeta, Gohan, Broly) et tyrans (Frieza).
  {
    id: "trunks",
    name: "Trunks",
    anime: "Dragon Ball Z",
    image: "/assets/img/undercover/trunks.png",
    visual: ["cheveux_violets", "cheveux_mi_longs", "yeux_bleus", "muscle", "manteau_noir", "adolescent", "regard_intense"],
    personality: ["serieux", "noble", "loyal", "determine", "calme", "protecteur", "solitaire"],
    powers: ["ki", "super_force", "super_vitesse", "vol", "transformation", "saiyan", "epeiste", "combat_rapproche", "heritage_pouvoir"],
    themes: ["heritage", "famille", "sacrifice", "protection_proches", "devoir", "survivant", "perte_proches", "orphelin", "solitude"]
  },
  {
    id: "cell",
    name: "Cell",
    anime: "Dragon Ball Z",
    image: "/assets/img/undercover/cell.png",
    visual: ["yeux_roses", "yeux_verts", "armure", "muscle", "regard_froid", "regard_intense", "grand", "adulte"],
    personality: ["arrogant", "sadique", "manipulateur", "cynique", "charismatique", "psychopathe", "orgueilleux", "strategique"],
    powers: ["ki", "super_force", "super_vitesse", "vol", "transformation", "regeneration", "teleportation", "combat_rapproche"],
    themes: ["pouvoir_absolu", "tyran", "ascension", "origine_inconnue", "immortalite", "dieu", "devenir_le_plus_fort"]
  },

  // ─── Bleach (extensions) ─────────────────────────────────────────────────
  // Ulquiorra : stoïque hollow → cluster Byakuya/Giyu/Levi/Mikasa/Kirito.
  // Hitsugaya : capitaine cheveux blancs glace épéiste → cluster Gojo/Sesshomaru.
  {
    id: "ulquiorra",
    name: "Ulquiorra Cifer",
    anime: "Bleach",
    image: "/assets/img/undercover/ulquiorra.png",
    visual: ["cheveux_noirs", "cheveux_courts", "yeux_verts", "masque_visage", "manteau_blanc", "cicatrices", "regard_froid", "regard_intense", "adulte"],
    personality: ["froid", "calme", "silencieux", "serieux", "solitaire", "noble", "determine"],
    powers: ["reiatsu", "super_vitesse", "super_force", "combat_rapproche", "transformation", "vol", "regeneration", "demon"],
    themes: ["solitude", "origine_inconnue", "devoir", "amour_impossible", "sacrifice", "perte_proches", "destin"]
  },
  {
    id: "hitsugaya",
    name: "Toshiro Hitsugaya",
    anime: "Bleach",
    image: "/assets/img/undercover/hitsugaya.png",
    visual: ["cheveux_blancs", "cheveux_courts", "cheveux_herisses", "yeux_verts", "manteau_blanc", "kimono", "petit", "adolescent", "regard_froid", "regard_intense"],
    personality: ["froid", "serieux", "noble", "determine", "calme", "loyal", "solitaire", "silencieux"],
    powers: ["reiatsu", "epeiste", "zanpakuto", "glace", "shinigami", "super_vitesse", "combat_rapproche"],
    themes: ["noblesse", "devoir", "leader", "promesse", "perte_proches", "protection_proches", "genie"]
  }
];

export const CHARACTERS_BY_ID = Object.fromEntries(
  CHARACTERS.map(c => [c.id, c])
);
