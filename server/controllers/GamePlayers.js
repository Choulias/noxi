import GamePlayer from "../models/gamePlayerModel.js";
 
export const getAllGamePlayers = async (req, res) => {
    try {
        const gamePlayers = await GamePlayer.findAll();
        res.json(gamePlayers);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const getGamePlayerById = async (req, res) => {
    try {
        const gamePlayer = await GamePlayer.findByPk(req.params.id);
        if (!gamePlayer) return res.status(404).json({ message: "Not found" });
        res.json(gamePlayer);
    } catch (error) {
        res.json({ message: error.message });
    }
}

export const getGamesPlayerByUsername = async (req, res) => {
    try {
        const gamesPlayer = await GamePlayer.findAll({
            where: {
                clientName: req.params.username
            }
        });
        res.json(gamesPlayer);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const getGamePlayersByGameId = async (req, res) => {
    try {
        const gamePlayers = await GamePlayer.findAll({
            where: {
                gameId: req.params.gameid
            }
        });
        res.json(gamePlayers);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const createGamePlayer = async (req, res) => {
    try {
        await GamePlayer.create(req.body);
        res.json({
            "message": "GamePlayer Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const updateGamePlayer = async (req, res) => {
    try {
        await GamePlayer.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "GamePlayer Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const updateGamePlayerScore = async (req, res) => {
    try {
        await GamePlayer.update(req.body, {
            where: {
                gameId: req.params.gameId,
                clientId: req.params.clientId,
            }
        });
        res.json({
            "message": "GamePlayer Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const deleteGamePlayer = async (req, res) => {
    try {
        await GamePlayer.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "GamePlayer Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const deleteGameIdPlayer = async (req, res) => {
    try {
        await GamePlayer.destroy({
            where: {
                gameId: req.params.gameId
            }
        });
        res.json({
            "message": "GamePlayers Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}