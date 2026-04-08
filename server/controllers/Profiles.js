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
        const profile = await Profile.findByPk(req.params.id);
        if (!profile) return res.status(404).json({ message: "Not found" });
        res.json(profile);
    } catch (error) {
        res.json({ message: error.message });
    }
}

export const getProfileByUserId = async (req, res) => {
    try {
        const profile = await Profile.findOne({ where: { userId: req.params.userId } });
        if (!profile) return res.status(404).json({ message: "Not found" });
        res.json(profile);
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
        const profile = await Profile.findByPk(req.params.id);
        if (!profile) return res.status(404).json({ message: "Not found" });
        if (profile.userId !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }
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
        const profile = await Profile.findByPk(req.params.id);
        if (!profile) return res.status(404).json({ message: "Not found" });
        if (profile.userId !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not allowed" });
        }
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