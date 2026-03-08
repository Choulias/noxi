import Game from "../models/gameModel.js";
import { Op } from "sequelize";
 
export const getAllGames = async (req, res) => {
    try {
        const games = await Game.findAll();
        res.json(games);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const getPublicGames = async (req, res) => {
    try {
        const games = await Game.findAll({
            where: {
                reach: "public",
                status: { [Op.not]: "ended"}
                // Il faut ajouter : And not ended 
            }
        });
        res.json(games);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const getGameById = async (req, res) => {
    try {
        const game = await Game.findAll({
            where: {
                id: req.params.id,

            }
        });
        res.json(game[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const getGameByGameId = async (req, res) => {
    try {
        const game = await Game.findAll({
            where: {
                gameId: req.params.gameid,
            }
        });
        res.json(game[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const createGame = async (req, res) => {
    try {
        await Game.create(req.body);
        res.json({
            "message": "Game Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const updateGame = async (req, res) => {
    try {
        await Game.update(req.body, {
            where: {
                gameId: req.params.id
            }
        });
        res.json({
            "message": "Game Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const deleteGame = async (req, res) => {
    try {
        await Game.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Game Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const deleteGameId = async (req, res) => {
    try {
        await Game.destroy({
            where: {
                gameId: req.params.gameId
            }
        });
        res.json({
            "message": "Game Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}