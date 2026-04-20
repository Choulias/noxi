import db from "../config/database.js";
import Profile from "../models/profileModel.js";
import Badge from "../models/badgeModel.js";
import UserBadge from "../models/userBadgeModel.js";

// XP required to reach a given level: level^2 * 50
// Level 1=0, 2=200, 3=450, 4=800, 5=1250, 10=5000, 20=20000, 50=125000
export function xpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(level * level * 50);
}

export function calculateLevel(xp) {
    let level = 1;
    while (xpForLevel(level + 1) <= xp) {
        level++;
    }
    return level;
}

export function xpForNextLevel(level) {
    return xpForLevel(level + 1);
}

export const grantXP = async (userId, amount) => {
    try {
        const profile = await Profile.findOne({ where: { userId } });
        if (!profile) return;

        const newXP = (profile.xp || 0) + amount;
        const newLevel = calculateLevel(newXP);

        await Profile.update(
            { xp: newXP, level: newLevel },
            { where: { userId } }
        );

        return { xp: newXP, level: newLevel };
    } catch (e) {
        console.error("grantXP error:", e);
    }
};

export const checkAndGrantBadges = async (userId) => {
    try {
        const allBadges = await Badge.findAll();
        const existingUserBadges = await UserBadge.findAll({ where: { userId } });
        const earnedIds = existingUserBadges.map(ub => ub.badgeId);

        // Get stats
        const [games] = await db.query(`
            SELECT gp.score, g.gameModel,
                   (SELECT MAX(gp2.score) FROM ncs_gameplayers gp2
                    WHERE gp2.gameId = gp.gameId AND gp2.id != gp.id) as opponentBestScore
            FROM ncs_gameplayers gp
            LEFT JOIN ncs_games g ON g.gameId = gp.gameId
            WHERE gp.playerId = :userId
        `, { replacements: { userId } });

        let totalGames = games.length;
        let totalWins = 0;
        const winsByGame = {};
        const gamesByType = {};

        games.forEach(g => {
            const isWin = g.opponentBestScore !== null && g.score > g.opponentBestScore;
            if (isWin) totalWins++;
            if (g.gameModel) {
                gamesByType[g.gameModel] = (gamesByType[g.gameModel] || 0) + 1;
                if (isWin) winsByGame[g.gameModel] = (winsByGame[g.gameModel] || 0) + 1;
            }
        });

        const newBadges = [];

        for (const badge of allBadges) {
            if (earnedIds.includes(badge.id)) continue;

            let earned = false;

            switch (badge.condition_type) {
                case 'total_games':
                    earned = totalGames >= badge.condition_value;
                    break;
                case 'total_wins':
                    earned = totalWins >= badge.condition_value;
                    break;
                case 'game_wins':
                    earned = (winsByGame[badge.condition_game] || 0) >= badge.condition_value;
                    break;
                case 'game_played':
                    earned = (gamesByType[badge.condition_game] || 0) >= badge.condition_value;
                    break;
            }

            if (earned) {
                await UserBadge.create({ userId, badgeId: badge.id });
                newBadges.push(badge);
            }
        }

        return newBadges;
    } catch (e) {
        console.error("checkAndGrantBadges error:", e);
        return [];
    }
};

export const getPlayerStats = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);

        // Get game history with results
        const [games] = await db.query(`
            SELECT gp.gameId, gp.score, gp.clientName, g.gameModel,
                   (SELECT MAX(gp2.score) FROM ncs_gameplayers gp2
                    WHERE gp2.gameId = gp.gameId AND gp2.id != gp.id) as opponentBestScore
            FROM ncs_gameplayers gp
            LEFT JOIN ncs_games g ON g.gameId = gp.gameId
            WHERE gp.playerId = :userId
        `, { replacements: { userId } });

        let totalGames = games.length;
        let wins = 0, losses = 0, draws = 0;
        const gameTypeCounts = {};

        games.forEach(g => {
            if (g.opponentBestScore === null) return; // solo/incomplete
            if (g.score > g.opponentBestScore) wins++;
            else if (g.score < g.opponentBestScore) losses++;
            else draws++;

            if (g.gameModel) {
                gameTypeCounts[g.gameModel] = (gameTypeCounts[g.gameModel] || 0) + 1;
            }
        });

        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

        // Most played game
        let mostPlayed = null;
        let maxCount = 0;
        Object.entries(gameTypeCounts).forEach(([game, count]) => {
            if (count > maxCount) { mostPlayed = game; maxCount = count; }
        });

        // Get profile for XP/level
        const profile = await Profile.findOne({ where: { userId } });

        // Get user badges
        const userBadges = await UserBadge.findAll({ where: { userId } });
        const badgeIds = userBadges.map(ub => ub.badgeId);
        let badges = [];
        if (badgeIds.length > 0) {
            badges = await Badge.findAll({ where: { id: badgeIds } });
        }

        res.json({
            totalGames,
            wins,
            losses,
            draws,
            winRate,
            xp: profile?.xp || 0,
            level: profile?.level || 1,
            favoriteGame: profile?.favoriteGame || mostPlayed,
            mostPlayed,
            gameTypeCounts,
            badges
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const setFavoriteGame = async (req, res) => {
    try {
        const userId = req.user.id;
        const { gameSlug } = req.body;

        await Profile.update(
            { favoriteGame: gameSlug },
            { where: { userId } }
        );

        res.json({ message: "Jeu favori mis a jour" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const recordGameResult = async (req, res) => {
    try {
        const userId = req.user.id;
        const { result } = req.body; // 'win', 'loss', 'draw'

        const xpAmounts = { win: 30, draw: 15, loss: 5 };
        const amount = xpAmounts[result] || 5;

        const xpResult = await grantXP(userId, amount);
        const newBadges = await checkAndGrantBadges(userId);

        res.json({
            xpGained: amount,
            ...xpResult,
            newBadges
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const seedBadges = async () => {
    const count = await Badge.count();
    if (count > 0) return;

    const badges = [
        { slug: 'first_game', name: 'Premier Pas', description: 'Jouer sa premiere partie', icon: '🎮', condition_type: 'total_games', condition_value: 1, condition_game: null },
        { slug: 'first_win', name: 'Premiere Victoire', description: 'Gagner sa premiere partie', icon: '🏆', condition_type: 'total_wins', condition_value: 1, condition_game: null },
        { slug: '10_games', name: 'Habitue', description: 'Jouer 10 parties', icon: '🎲', condition_type: 'total_games', condition_value: 10, condition_game: null },
        { slug: '50_games', name: 'Veteran', description: 'Jouer 50 parties', icon: '⭐', condition_type: 'total_games', condition_value: 50, condition_game: null },
        { slug: '10_wins', name: 'Champion', description: 'Gagner 10 parties', icon: '👑', condition_type: 'total_wins', condition_value: 10, condition_game: null },
        { slug: '50_wins', name: 'Legendaire', description: 'Gagner 50 parties', icon: '🔥', condition_type: 'total_wins', condition_value: 50, condition_game: null },
        { slug: 'mascarade_5wins', name: 'Maitre du Bluff', description: 'Gagner 5 parties de Mascarade', icon: '🎭', condition_type: 'game_wins', condition_value: 5, condition_game: 'mascarade' },
        { slug: 'mascarade_20wins', name: 'Roi des Masques', description: 'Gagner 20 parties de Mascarade', icon: '👹', condition_type: 'game_wins', condition_value: 20, condition_game: 'mascarade' },
        { slug: 'tictactoe_5wins', name: 'Stratege', description: 'Gagner 5 parties de Tic Tac Toe', icon: '❌', condition_type: 'game_wins', condition_value: 5, condition_game: 'tictactoe' },
        { slug: 'tictactoe_20wins', name: 'Imbattable', description: 'Gagner 20 parties de Tic Tac Toe', icon: '⭕', condition_type: 'game_wins', condition_value: 20, condition_game: 'tictactoe' },
        { slug: 'mascarade_10games', name: 'Mascarade Addict', description: 'Jouer 10 parties de Mascarade', icon: '🃏', condition_type: 'game_played', condition_value: 10, condition_game: 'mascarade' },
        { slug: 'tictactoe_10games', name: 'OXO Fan', description: 'Jouer 10 parties de Tic Tac Toe', icon: '✨', condition_type: 'game_played', condition_value: 10, condition_game: 'tictactoe' },
        { slug: 'undercover_5wins', name: 'Detective Aguerri', description: 'Gagner 5 parties de Undercover', icon: '🔍', condition_type: 'game_wins', condition_value: 5, condition_game: 'undercover' },
        { slug: 'undercover_20wins', name: 'Espion Confirme', description: 'Gagner 20 parties de Undercover', icon: '🕵️', condition_type: 'game_wins', condition_value: 20, condition_game: 'undercover' },
        { slug: 'undercover_10games', name: 'Undercover Addict', description: 'Jouer 10 parties de Undercover', icon: '🎭', condition_type: 'game_played', condition_value: 10, condition_game: 'undercover' },
    ];

    await Badge.bulkCreate(badges);
    console.log('Badges seeded successfully');
};
