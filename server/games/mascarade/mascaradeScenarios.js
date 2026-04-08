// Scenarios for Mascarade game — which masks to use per player count
// Each player count has two variants (A and B)
// At 4 players: 6 cards total, 4 dealt to players, 2 go to center
// At 7+ players: exactly N cards for N players, 0 in center

export const SCENARIOS = {
  4: {
    A: {
      masks: ["juge", "imperatrice", "escroc", "voleur", "tricheur", "roi"],
      centerCards: 2
    },
    B: {
      masks: ["juge", "imperatrice", "fou", "veuve", "sorciere", "mendiant"],
      centerCards: 2
    }
  },
  5: {
    A: {
      masks: ["juge", "imperatrice", "escroc", "voleur", "tricheur", "roi"],
      centerCards: 1
    },
    B: {
      masks: ["juge", "imperatrice", "fou", "veuve", "sorciere", "mendiant"],
      centerCards: 1
    }
  },
  6: {
    A: {
      masks: ["escroc", "princesse", "juge", "sorciere", "mecene", "tricheur"],
      centerCards: 0
    },
    B: {
      masks: ["mendiant", "juge", "imperatrice", "voleur", "veuve", "roi"],
      centerCards: 0
    }
  },
  7: {
    A: {
      masks: ["juge", "imperatrice", "fou", "escroc", "voleur", "sorciere", "mecene"],
      centerCards: 0
    },
    B: {
      masks: ["escroc", "roi", "tricheur", "veuve", "juge", "mendiant", "princesse"],
      centerCards: 0
    }
  },
  8: {
    A: {
      masks: ["princesse", "juge", "espionne", "escroc", "voleur", "tricheur", "sorciere", "roi"],
      centerCards: 0
    },
    B: {
      masks: ["escroc", "paysan", "paysan", "princesse", "veuve", "juge", "marionnettiste", "mendiant"],
      centerCards: 0
    }
  },
  9: {
    A: {
      masks: ["escroc", "espionne", "princesse", "sorciere", "imperatrice", "juge", "tricheur", "voleur", "mecene"],
      centerCards: 0
    },
    B: {
      masks: ["mecene", "marionnettiste", "juge", "gourou", "veuve", "princesse", "paysan", "paysan", "mendiant"],
      centerCards: 0
    }
  },
  10: {
    A: {
      masks: ["escroc", "espionne", "princesse", "sorciere", "imperatrice", "juge", "tricheur", "veuve", "voleur", "mecene"],
      centerCards: 0
    },
    B: {
      masks: ["mendiant", "veuve", "mecene", "sorciere", "juge", "princesse", "gourou", "paysan", "paysan", "escroc"],
      centerCards: 0
    }
  },
  11: {
    A: {
      masks: ["escroc", "mecene", "fou", "paysan", "paysan", "imperatrice", "princesse", "juge", "sorciere", "marionnettiste", "voleur"],
      centerCards: 0
    },
    B: {
      masks: ["marionnettiste", "tricheur", "sorciere", "juge", "princesse", "gourou", "paysan", "paysan", "espionne", "mecene", "escroc"],
      centerCards: 0
    }
  },
  12: {
    A: {
      masks: ["escroc", "fou", "paysan", "paysan", "gourou", "princesse", "juge", "sorciere", "mecene", "tricheur", "mendiant", "veuve"],
      centerCards: 0
    },
    B: {
      masks: ["escroc", "espionne", "mecene", "gourou", "paysan", "paysan", "imperatrice", "princesse", "juge", "sorciere", "marionnettiste", "tricheur"],
      centerCards: 0
    }
  }
};

// Supported player counts
export const SUPPORTED_PLAYER_COUNTS = [4, 5, 6, 7, 8, 9, 10, 11, 12];

// All mask names (for display purposes)
export const MASK_NAMES = {
  escroc: "Escroc",
  espionne: "Espionne",
  fou: "Fou",
  gourou: "Gourou",
  imperatrice: "Impératrice",
  juge: "Juge",
  marionnettiste: "Marionnettiste",
  mecene: "Mécène",
  mendiant: "Mendiant",
  paysan: "Paysan",
  princesse: "Princesse",
  roi: "Roi",
  sorciere: "Sorcière",
  tricheur: "Tricheur",
  veuve: "Veuve",
  voleur: "Voleur"
};
