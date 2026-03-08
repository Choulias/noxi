import GameModel from "../models/gameModelModel.js";
 
export const getAllGameModels = async (req, res) => {
    try {
        const gameModels = await GameModel.findAll();
        res.json(gameModels);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const getGameModelById = async (req, res) => {
    try {
        const gameModel = await GameModel.findAll({
            where: {
                id: req.params.id
            }
        });
        res.json(gameModel[0]);
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
        await GameModel.create(req.body);
        res.json({
            "message": "GameModel Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const updateGameModel = async (req, res) => {
    try {
        await GameModel.update(req.body, {
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
        await GameModel.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "GameModel Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}