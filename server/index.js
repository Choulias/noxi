import express from "express";
import db from "./config/database.js";
import { v4 as uuid } from "uuid";

import profileRoutes from "./routes/profileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import gameRoutes from "./routes/gameRoutes.js"
import gamePlayerRoutes from "./routes/gamePlayerRoutes.js"
import gameModelRoutes from "./routes/gameModelRoutes.js"
import friendshipRoutes from "./routes/friendshipRoutes.js"
import friendRequestRoutes from "./routes/friendRequestRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
import eventLikerRoutes from "./routes/eventLikerRoutes.js"
import eventAttendeeRoutes from "./routes/eventAttendeeRoutes.js"
import playerScoreRoutes from "./routes/playerScoreRoutes.js"
import errorHandler from "./middleware/errorHandler.js";

import cors from "cors";
import { createServer } from "http";
import { server as websocketServer } from "websocket";
import { getBoardGameInfo, getTicTacToeGameInfo } from "./games/games.js";

// ---------------------------------------------------------------
// SERVER BDD

db.sync().then(()=> console.log('Database is Ready'));

const app = express();

try {
    await db.authenticate();
    console.log('Database connected...');
} catch (error) {
    console.error('Connection error:', error);
}

// Creation des chemins pour accéder aux routes niveau serveur

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3006',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/profiles', profileRoutes);
app.use('/users', userRoutes);
app.use('/games', gameRoutes);
app.use('/gameplayers', gamePlayerRoutes);
app.use('/playerscores', playerScoreRoutes);
app.use('/gamemodels', gameModelRoutes);
app.use('/friendships', friendshipRoutes);
app.use('/friendrequests', friendRequestRoutes);
app.use('/events', eventRoutes);
app.use('/eventlikers', eventLikerRoutes);
app.use('/eventattendees', eventAttendeeRoutes);

app.use(errorHandler);

app.listen(5000, () => console.log('Server running at port 5000'));

// ---------------------------------------------------------------
// WEBSOCKET SERVER

const httpServer = createServer();
httpServer.listen(9090, () => console.log("Listening.. on 9090"))

// Hashmap clients
const clients = {};
const games = {};

const wsServer = new websocketServer({
    "httpServer": httpServer
})

function broadcastGameState(gameId) {
    const game = games[gameId];
    if (!game) return;

    const payLoad = {
        "method": "update",
        "game": game
    };

    game.clients.forEach(c => {
        if (clients[c.clientId]) {
            clients[c.clientId].connection.send(JSON.stringify(payLoad));
        }
    });
}

wsServer.on("request", request => {
    // Connect
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened!"))
    connection.on("close", () => console.log("closed!"))
    connection.on("message", message => {
        // Reception du message du client
        const result = JSON.parse(message.utf8Data)

        // L'utilisateur veut créer un nouveau jeu
        if (result.method === "create") {
            const gameId = uuid();
            const clientId = result.clientId;

            if( result.gameModel === "board"){
                games[gameId] = getBoardGameInfo(gameId, result.playersLimit);
            }else if(result.gameModel === "tictactoe"){
                let turn = {turn: 'X'}
                let board = {board : {}}
                let state = Object.assign({}, turn, board)
                games[gameId] = getTicTacToeGameInfo(gameId, result.playersLimit, result.squares, state);
            }

            const payLoad = {
                "method": "create",
                "game" : games[gameId]
            }
            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad));
        }

        // L'utilisateur veut rejoindre une partie
        if(result.method === "join"){
            const clientId = result.clientId;
            const clientName = result.clientName;
            const gameId = result.gameId;
            const game = games[gameId];
            let state = games[gameId].state;

            if (game.clients.length < game.playersLimit){

                const color = {"0":"#FEBEFD", "1":"#95FDFC", "2":"#E9FD95"}[game.clients.length];

                if( game.model === "board"){
                    game.clients.push({
                        "clientId": clientId,
                        "color": color
                    });

                    // RESET LE PLATEAU
                    let boardKeys = Object.keys(state.board);
                    for (var i = 0; i < boardKeys.length; i++) {
                        delete state.board[boardKeys[i]];
                    }
                    game.state = state;

                }else if(game.model === "tictactoe"){
                    const mark = {"0":"X", "1":"O"}[game.clients.length];

                    game.clients.push({
                        "clientId": clientId,
                        "clientName": clientName,
                        "color": color,
                        "mark": mark
                    });
                }

                const payLoad = {
                    "method": "join",
                    "game": game
                }

                // Boucle a travers chaque client et leurs envoie un message
                game.clients.forEach( c=> {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad));
                })

                if(game.clients.length == game.playersLimit){
                    broadcastGameState(gameId);
                }

            }
            else{
                return;
            }

        }

        // Un joueur qui quitte une partie
        if(result.method === "quit"){
            const clientName = result.clientName;
            const clientId = result.clientId;
            const gameId = result.gameId;
            const game = games[gameId];

            let gameclients = game.clients;

            game.clients = game.clients.filter(function(el) { return el.clientId != clientId; });

            const payLoad = {
                "method": "quit",
                "game": game,
                "clientName" : clientName,
                "clientId" : clientId,
            }

            gameclients.forEach( c=> {
                clients[c.clientId].connection.send(JSON.stringify(payLoad));
            })

            delete clients[clientId];
        }

        // Un joueur joue
        if(result.method === "play"){
            const gameId = result.gameId;
            const game = games[gameId];
            let state = games[gameId].state;

            if (game.model === "board"){
                if (!state){
                    state = {};
                }

                const ballId = result.ballId;
                const color = result.color;
                state[ballId] = color;

            }else if(game.model === "tictactoe"){
                const squareId = result.squareId;
                const mark = result.mark;
                if(mark == 'X'){
                    state.turn = 'O';
                }else{
                    state.turn = 'X';
                }
                state.board[squareId] = mark;
            }

            games[gameId].state = state;
            broadcastGameState(gameId);
        }

        // On réinitialise le state pour redémarrer une partie
        if(result.method === "reset"){
            const gameId = result.gameId;
            const game = games[gameId];
            let state = games[gameId].state;

            let boardKeys = Object.keys(state.board);
            for (var i = 0; i < boardKeys.length; i++) {
                delete state.board[boardKeys[i]];
            }
            game.state = state;
            broadcastGameState(gameId);
        }

    })

    // Génération d'un nouvel ID Client
    const clientId = uuid();
    clients[clientId] = {
        "connection":  connection
    }

    const payLoad = {
        "method": "connect",
        "clientId": clientId
    }

    connection.send(JSON.stringify(payLoad))
})
