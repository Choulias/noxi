import User from "./models/userModel.js";

export const isExistingUserName =  async(username) => {

    const user = await User.findAll({
        where: {
            username: username
        }
    });

    // Si "user" n'est pas vide -> L'Username existe
    return isNotEmpty(user)
}

export const isExistingUserMail =  async(mail) => {

    const user = await User.findAll({
        where: {
            mail: mail
        }
    });

    // Si "user" n'est pas vide -> L'Usermail existe
    return isNotEmpty(user)
}

export const isNotEmpty = (list) => {
    let bool;

    if(list.length > 0){
        bool = true;
    }else{
        bool = false;
    } 

    return bool
}

const isEmpty = (user) => {
    return !isNotEmpty(user)
}
