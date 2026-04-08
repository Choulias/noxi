import { Sequelize } from "sequelize";
import GameModel from "../models/gameModelModel.js";
import GameMode from "../models/gameModeModel.js";
import Game from "../models/gameModel.js";
import GamePlayer from "../models/gamePlayerModel.js";
import PlayerScore from "../models/playerScoreModel.js";
import Event from "../models/eventModel.js";
import EventAttendee from "../models/eventAttendeeModel.js";
import EventLiker from "../models/eventLikerModel.js";

const { Op } = Sequelize;

export const getAllGameModels = async (req, res) => {
    try {
        const gameModels = await GameModel.findAll();
        const gameModes = await GameMode.findAll();

        // Attach modes to their respective game model
        const result = gameModels.map(gm => {
            const data = gm.toJSON();
            data.modes = gameModes
                .filter(m => m.gameSlug === data.slug)
                .map(m => ({ value: m.value, label: m.label, description: m.description }));
            return data;
        });

        res.json(result);
    } catch (error) {
        res.json({ message: error.message });
    }
}
 
export const getGameModelById = async (req, res) => {
    try {
        const gameModel = await GameModel.findByPk(req.params.id);
        if (!gameModel) return res.status(404).json({ message: "Not found" });
        res.json(gameModel);
    } catch (error) {
        res.json({ message: error.message });
    }
}

export const getGameModelBySlug = async (req, res) => {
    try {
        const gameModel = await GameModel.findAll({
            where: {
                slug: req.params.slug
            }
        });
        res.json(gameModel[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
 
export const createGameModel = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = "/uploads/games/" + req.file.filename;
        }
        await GameModel.create(data);
        res.json({
            "message": "GameModel Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }
}
 
export const updateGameModel = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.image = "/uploads/games/" + req.file.filename;
        }
        await GameModel.update(data, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "GameModel Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }
}
 
export const deleteGameModel = async (req, res) => {
    try {
        const gameModel = await GameModel.findByPk(req.params.id);
        if (!gameModel) {
            return res.status(404).json({ message: "GameModel not found" });
        }
        const slug = gameModel.slug;

        // Suppression en cascade : parties et joueurs
        const games = await Game.findAll({ where: { gameModel: slug } });
        const gameIds = games.map(g => g.gameId);
        if (gameIds.length > 0) {
            await GamePlayer.destroy({ where: { gameId: { [Op.in]: gameIds } } });
        }
        await Game.destroy({ where: { gameModel: slug } });

        // Modes de jeu
        await GameMode.destroy({ where: { gameSlug: slug } });

        // Scores
        await PlayerScore.destroy({ where: { gameSlug: slug } });

        // Événements et participants/likers
        const events = await Event.findAll({ where: { theme: slug } });
        const eventIds = events.map(e => e.id);
        if (eventIds.length > 0) {
            await EventAttendee.destroy({ where: { eventId: { [Op.in]: eventIds } } });
            await EventLiker.destroy({ where: { eventId: { [Op.in]: eventIds } } });
        }
        await Event.destroy({ where: { theme: slug } });

        // Le modèle de jeu
        await gameModel.destroy();

        res.json({ message: "GameModel and all related data deleted" });
    } catch (error) {
        console.error("Cascade delete error:", error);
        res.status(500).json({ message: error.message });
    }
}