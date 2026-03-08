import User from "../models/userModel.js";
import { isExistingUserMail, isExistingUserName, isNotEmpty } from "../functions.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { sendEmail } from "../util/sendEmail.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.json({ message: error.message });
    }
}

export const getUserById = async (req, res) => {
    try {
        const user = await User.findAll({
            where: {
                id: req.params.id
            }
        });
        res.json(user[0]);
    } catch (error) {
        res.json({ message: error.message });
    }
}

export const getUserByMail = async (req, res) => {
    try {
        const user = await User.findAll({
            where: {
                mail: req.params.mail
            }
        });
        res.json(user[0]);
    } catch (error) {
        res.json({ message: error.message });
    }
}

export const getUserByUsername = async (req, res) => {
    try {
        const user = await User.findAll({
            where: {
                username: req.params.username
            }
        });
        res.json(user[0]);
    } catch (error) {
        res.json({ message: error.message });
    }
}

// SignUp User
export const createUser = async (req, res) => {
    try {
        let bodyInfo = req.body;
        bodyInfo.role = "user";
        bodyInfo.status = "pending";

        if (await isExistingUserMail(bodyInfo.mail)){
            res.status(409).json({ "message": "Existing Mail"})
        }else if(await isExistingUserName(bodyInfo.username)){
            res.status(409).json({ "message": "Existing Username"})
        }else{
            const passwordHash = await bcrypt.hash(bodyInfo.password, 10)
            bodyInfo.password = passwordHash;

            const verificationString = uuid();
            bodyInfo.verificationString = verificationString;

            const newUser = await User.create(bodyInfo);
            try{
                await sendEmail({
                    to: newUser.dataValues.mail,
                    from: 'noctis.help@gmail.com',
                    subject: 'Veuillez vérifier votre email',
                    text: `Merci pour votre inscription ! Pour confirmer votre email, cliquez ici : ${process.env.CORS_ORIGIN}/verify-mail/${verificationString}`
                })
            }catch(err){
                console.log(err);
                res.sendStatus(500);
            }

            jwt.sign({
                id: newUser.dataValues.id,
                username: newUser.dataValues.username,
                mail: newUser.dataValues.mail,
                role: newUser.dataValues.role,
                status: newUser.dataValues.status,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '2d',
            },
            (err, token) => {
                if (err){
                    return res.status(500).send(err)
                }
                res.status(201).json({token});
            });

        }

    } catch (error) {
        res.json({ message: error.message });
    }
}

//LogIn User
export const identifyUser = async (req, res) => {
    try {
        let bodyInfo = req.body;
        const user = await User.findAll({
            where: {
                mail: bodyInfo.mail
            }
        });

        if (isNotEmpty(user)){
            const isCorrectPassword = await bcrypt.compare(req.body.password, user[0].dataValues.password);
            if (isCorrectPassword){
                jwt.sign({
                    id: user[0].dataValues.id,
                    username: user[0].dataValues.username,
                    mail: user[0].dataValues.mail,
                    role: user[0].dataValues.role,
                    status: user[0].dataValues.status,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '2d',
                },
                (err, token) => {
                    if (err){
                        return res.status(500).send(err)
                    }
                    res.status(200).json({token});
                });
            }else{
                res.status(401).json({ "message": "Wrong Informations"});
            }
        }else{
            res.status(401).json({ "message": "Wrong Informations"});
        }

    } catch (error) {
        res.json({ message: error.message });
    }
}

export const verifyUser = async (req, res) => {
    try {
        const user = await User.findAll({
            where: {
                verificationString : req.params.verificationString
            }
        });

        if (isNotEmpty(user)){
            if(user[0].dataValues.status == "pending"){
                await User.update(
                    { status : "verified"} ,
                    { where: {
                        id : user[0].dataValues.id
                    }}
                );

                jwt.sign({
                    id: user[0].dataValues.id,
                    username: user[0].dataValues.username,
                    mail: user[0].dataValues.mail,
                    role: user[0].dataValues.role,
                    status: "verified",
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '2d',
                },
                (err, token) => {
                    if (err){
                        return res.status(500).send(err)
                    }
                    res.status(200).json({token});
                });
            }else{
                res.json({ "message": "The user is already verified"});
            }
        }else{
            res.json({ "message": "The User doesn't exist"});
        }

    }catch(err){
        res.json({ message: err.message });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id, status, role } = req.user;

        if (id == req.params.id || role == "admin"){
            if (status == "verified" || role == "admin"){
                await User.update(req.body, {
                    where: {
                        id: req.params.id
                    }
                });

                const user = await User.findAll({
                    where: {
                        id: req.params.id
                    }
                });

                jwt.sign({
                    id: user[0].dataValues.id,
                    username: user[0].dataValues.username,
                    mail: user[0].dataValues.mail,
                    role: user[0].dataValues.role,
                    status: user[0].dataValues.status,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '2d',
                },
                (err, token) => {
                    if (err){
                        return res.status(500).send(err)
                    }
                    res.status(200).json({token});
                });
            }else{
                return res.status(403).json({ message : 'Account is not verified'});
            }
        }else{
            return res.status(403).json({ message : 'Not allowed to update that users data'});
        }

    } catch (error) {
        res.json({ message: error.message });
    }
}

export const deleteUser = async (req, res) => {
    try {
        await User.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({
            "message": "User Deleted"
        });
    } catch (error) {
        res.json({ message: error.message });
    }
}
