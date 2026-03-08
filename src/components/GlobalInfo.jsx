import {React, useState, createContext} from 'react';
import { useUser } from './Auth/useUser';


function getUserInfo() {
    const user = useUser();

    const initialState={ 
        userInfo : {
            connected: (user ? 1 : 0),
            id: (user ? user.id : ''),
            username: (user ? user.username : ''),
            mail: (user ? user.mail : ''),
            role: (user ? user.role : ''),
            // imageUrl: (user ? ('https://robohash.org/' + user.username + '?set=set2') : 'https://robohash.org/player?set=set2'),
            image: (user ? (<img src={'https://robohash.org/'+ user.username} alt="" />) : (<img className="not-connected" src={'../../profile.png'} alt="" />)),
        },
    };

    return initialState;
}


export const Context = createContext();

const GlobalInfo = ({ children }) => {
    const[state, setState] = useState(getUserInfo());

    return(
        <Context.Provider value={[state, setState]}>{children}</Context.Provider>
    );
};

export default GlobalInfo;