import PlayerScore from "../models/playerScoreModel.js";
import { Op } from "sequelize";
 
export const getAllPlayerScores = async (req, res) => {
    try {
        const playerScores = await PlayerScore.findAll();
        res.json(playerScores);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const getPlayerScoreById = async (req, res) => {
    try {
        const playerScore = await PlayerScore.findAll({
            where: {
                id: req.params.id
            }
        });
        res.json(playerScore[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const getPlayerScoreBySlugNId = async (req, res) => {
    try {
        const playerScore = await PlayerScore.findAll({
            where: {
                gameSlug: req.params.slug,
                playerId: req.params.playerId
            }
        });
        res.json(playerScore[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 

export const getPlayersScoreBySlug = async (req, res) => {
    try {
        console.log(req.params);
        const playerScores = await PlayerScore.findAll({
            where: {
                gameSlug: req.params.slug
            }
        });
        res.json(playerScores);
    } catch (error) {
        res.json({ message: error.message });
    }  
}


export const getPlayersScoreBySlugNText = async (req, res) => {
    try {
        console.log(req.params);
        const playerScores = await PlayerScore.findAll({
            where: {
                gameSlug : req.params.slug,
                clientName: {
                    [Op.like]: '%' + req.params.text + '%'
                }
            }
        });
        res.json(playerScores);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const createPlayerScore = async (req, res) => {
    try {
        await PlayerScore.create(req.body);
        res.json({
            "message": "PlayerScore Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const updatePlayerScore = async (req, res) => {
    try {
        await PlayerScore.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "PlayerScore Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const updatePlayerScoreBySlugNId = async (req, res) => {
    try {
        await PlayerScore.update(req.body, {
            where: {
                gameSlug: req.params.slug,
                playerId: req.params.playerId
            }
        });
        res.json({
            "message": "PlayerScore Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const deletePlayerScore = async (req, res) => {
    try {
        await PlayerScore.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "PlayerScore Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}