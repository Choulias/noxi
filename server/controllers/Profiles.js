import Profile from "../models/profileModel.js";
 
export const getAllProfiles = async (req, res) => {
    try {
        const profiles = await Profile.findAll();
        res.json(profiles);
    } catch (error) {
        res.json({ message: error.message });
    }  
}

export const getProfileById = async (req, res) => {
    try {
        const profile = await Profile.findAll({
            where: {
                id: req.params.id
            }
        });
        res.json(profile[0]);
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const createProfile = async (req, res) => {
    try {
        await Profile.create(req.body);
        res.json({
            "message": "Profile Created"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const updateProfile = async (req, res) => {
    try {
        await Profile.update(req.body, {
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Profile Updated"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}
 
export const deleteProfile = async (req, res) => {
    try {
        await Profile.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "Profile Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }  
}