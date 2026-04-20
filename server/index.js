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
import messageRoutes from "./routes/messageRoutes.js"
import statsRoutes from "./routes/statsRoutes.js";
import { seedBadges } from "./controllers/Stats.js";
import errorHandler from "./middleware/errorHandler.js";
import { authMiddleware, adminMiddleware } from "./middleware/auth.js";

import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { createServer } from "http";
import { server as websocketServer } from "websocket";
import { getBoardGameInfo, getTicTacToeGameInfo, getMascaradeGameInfo, getUndercoverGameInfo } from "./games/games.js";
import { MascaradeGame } from "./games/mascarade/MascaradeGame.js";
import { SUPPORTED_PLAYER_COUNTS } from "./games/mascarade/mascaradeScenarios.js";
import { UndercoverGame } from "./games/undercover/UndercoverGame.js";
import { IMPOSTOR_TABLE as UNDERCOVER_IMPOSTOR_TABLE } from "./games/undercover/generator.js";

// ---------------------------------------------------------------
// SERVER BDD

db.sync().then(async () => {
    console.log('Database is Ready');
    await seedBadges();
});

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

// Servir les fichiers uploadés
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
app.use('/messages', messageRoutes);
app.use('/stats', statsRoutes);

app.use(errorHandler);

// --- Admin: purge des parties fantômes ---
import Game from "./models/gameModel.js";
import { Op } from "sequelize";

app.delete('/admin/purge-games', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // 1. Vider toutes les parties en mémoire WebSocket
        const wsGameIds = Object.keys(games);
        for (const gId of wsGameIds) {
            // Déconnecter les clients de la partie
            const game = games[gId];
            if (game?.clients) {
                game.clients.forEach(c => {
                    const con = clients[c.clientId]?.connection;
                    if (con) {
                        con.send(JSON.stringify({ method: "error", message: "Partie purgée par l'administrateur" }));
                    }
                });
            }
            delete games[gId];
        }

        // 2. Supprimer les parties non-terminées en BDD
        const dbResult = await Game.destroy({
            where: {
                status: { [Op.or]: [{ [Op.not]: "ended" }, { [Op.is]: null }] }
            }
        });

        res.json({
            message: "Purge terminée",
            wsGamesRemoved: wsGameIds.length,
            dbGamesRemoved: dbResult
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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

const MASCARADE_COLORS = [
    "#FEBEFD", "#95FDFC", "#E9FD95", "#FFB347", "#FF6B6B",
    "#C9B1FF", "#6BCB77", "#4D96FF", "#FF6FB5", "#55D6C2",
    "#FFD93D", "#845EC2", "#FF9671"
];

function broadcastGameState(gameId) {
    const game = games[gameId];
    if (!game) return;

    const payLoad = {
        "method": "update",
        "game": game
    };

    game.clients.forEach(c => {
        if (clients[c.clientId] && clients[c.clientId].connection.connected) {
            clients[c.clientId].connection.send(JSON.stringify(payLoad));
        }
    });
}

function broadcastMascaradeState(gameId) {
    const game = games[gameId];
    if (!game || game.model !== "mascarade") return;

    const engine = game.engine;
    game.clients.forEach(c => {
        if (clients[c.clientId] && clients[c.clientId].connection.connected) {
            const payLoad = {
                "method": "update",
                "game": {
                    id: game.id,
                    model: game.model,
                    clients: game.clients.map(cl => ({ clientId: cl.clientId, clientName: cl.clientName, color: cl.color })),
                    playersLimit: game.playersLimit,
                    state: engine.getPublicState(),
                    privateState: engine.getPrivateState(c.clientId)
                }
            };
            clients[c.clientId].connection.send(JSON.stringify(payLoad));
        }
    });
}

function broadcastUndercoverState(gameId) {
    const game = games[gameId];
    if (!game || game.model !== "undercover") return;

    const engine = game.engine;
    game.clients.forEach(c => {
        if (clients[c.clientId] && clients[c.clientId].connection.connected) {
            const payLoad = {
                "method": "update",
                "game": {
                    id: game.id,
                    model: game.model,
                    clients: game.clients.map(cl => ({ clientId: cl.clientId, clientName: cl.clientName, color: cl.color })),
                    playersLimit: game.playersLimit,
                    state: engine.getPublicState(),
                    privateState: engine.getPrivateState(c.clientId)
                }
            };
            clients[c.clientId].connection.send(JSON.stringify(payLoad));
        }
    });
}

function sendPrivateMessage(clientId, data) {
    if (clients[clientId] && clients[clientId].connection.connected) {
        clients[clientId].connection.send(JSON.stringify({ method: "private", data }));
    }
}

wsServer.on("request", request => {
    // Connect
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened!"))
    connection.on("close", async () => {
        // Find which client disconnected
        const disconnectedClientId = Object.keys(clients).find(
            cId => clients[cId]?.connection === connection
        );
        if (!disconnectedClientId) return;

        // Find and clean up any game this client was in
        for (const gameId of Object.keys(games)) {
            const game = games[gameId];
            if (!game?.clients) continue;
            const wasInGame = game.clients.some(c => c.clientId === disconnectedClientId);
            if (!wasInGame) continue;

            // Remove from game clients
            const clientName = game.clients.find(c => c.clientId === disconnectedClientId)?.clientName;
            game.clients = game.clients.filter(c => c.clientId !== disconnectedClientId);

            // Remove from engine if mascarade or undercover
            if ((game.model === "mascarade" || game.model === "undercover") && game.engine) {
                try { game.engine.removePlayer?.(disconnectedClientId); } catch(e) {}
            }

            // Update DB
            try {
                if (game.clients.length === 0) {
                    await Game.update({ status: "ended", numberPlayers: 0 }, { where: { gameId } });
                    delete games[gameId];
                } else {
                    await Game.update({ numberPlayers: game.clients.length }, { where: { gameId } });
                    // Notify remaining players
                    const safeGame = (game.model === "mascarade" || game.model === "undercover")
                        ? { id: game.id, model: game.model, clients: game.clients.map(cl => ({ clientId: cl.clientId, clientName: cl.clientName, color: cl.color })), playersLimit: game.playersLimit }
                        : game;
                    game.clients.forEach(c => {
                        if (clients[c.clientId]) {
                            clients[c.clientId].connection.send(JSON.stringify({
                                method: "quit", game: safeGame, clientName, clientId: disconnectedClientId
                            }));
                        }
                    });
                }
            } catch(e) { console.error("Error cleaning up on disconnect:", e); }
            break;
        }

        delete clients[disconnectedClientId];
    })
    connection.on("message", async (message) => {
        // Reception du message du client
        let result;
        try {
            result = JSON.parse(message.utf8Data);
        } catch (e) {
            console.error("Invalid JSON received:", e.message);
            return;
        }

        // Rate limiting
        const rateLimitClientId = result.clientId;
        if (!clients[rateLimitClientId]) return;
        const now = Date.now();
        const rateLimitClient = clients[rateLimitClientId];
        if (!rateLimitClient.rateLimit) rateLimitClient.rateLimit = { count: 0, resetTime: now + 1000 };
        if (now > rateLimitClient.rateLimit.resetTime) {
            rateLimitClient.rateLimit.count = 0;
            rateLimitClient.rateLimit.resetTime = now + 1000;
        }
        if (rateLimitClient.rateLimit.count++ > 20) return;

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
            }else if(result.gameModel === "mascarade"){
                const limit = parseInt(result.playersLimit);
                const variant = result.scenario === "B" ? "B" : "A";
                if (!SUPPORTED_PLAYER_COUNTS.includes(limit)) {
                    const con = clients[clientId]?.connection;
                    if (con) con.send(JSON.stringify({ method: "error", message: `Nombre de joueurs non supporté: ${limit}. Valeurs possibles: ${SUPPORTED_PLAYER_COUNTS.join(", ")}` }));
                    return;
                }
                const hiddenMode = result.hiddenMode === true;
                const engine = new MascaradeGame(limit, variant, hiddenMode);
                games[gameId] = getMascaradeGameInfo(gameId, limit, engine);
            }else if(result.gameModel === "undercover"){
                const limit = parseInt(result.playersLimit);
                if (!UNDERCOVER_IMPOSTOR_TABLE[limit]) {
                    const con = clients[clientId]?.connection;
                    if (con) con.send(JSON.stringify({ method: "error", message: `Nombre de joueurs non supporté: ${limit}. Valeurs : 3-10` }));
                    return;
                }
                const difficulty = ["easy","medium","hard","hardcore"].includes(result.difficulty) ? result.difficulty : "medium";
                const engine = new UndercoverGame(limit, difficulty);
                games[gameId] = getUndercoverGameInfo(gameId, limit, engine);
            }

            const payLoad = {
                "method": "create",
                "game" : games[gameId]
            }
            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad));
        }

        // Demander les infos d'une partie avant de rejoindre
        if(result.method === "game_info"){
            const gameId = result.gameId;
            const game = games[gameId];
            const con = clients[result.clientId]?.connection;
            if (con) {
                con.send(JSON.stringify({
                    method: "game_info",
                    clients: game ? game.clients.map(cl => ({ clientName: cl.clientName })) : []
                }));
            }
        }

        // L'utilisateur veut rejoindre une partie
        if(result.method === "join"){
            const clientId = result.clientId;
            const clientName = result.clientName;
            const gameId = result.gameId;
            const game = games[gameId];
            let state = games[gameId].state;

            // Reject duplicate names (case-insensitive)
            const nameTaken = game.clients.some(c => c.clientName?.toLowerCase() === clientName?.toLowerCase());
            if (nameTaken) {
                const con = clients[clientId]?.connection;
                if (con) con.send(JSON.stringify({ method: "error", message: "Ce pseudo est déjà utilisé dans cette partie" }));
                return;
            }

            if (game.clients.length < game.playersLimit){
                // Re-check for duplicate clientId to prevent race conditions
                if (game.clients.some(c => c.clientId === clientId)) {
                    const con = clients[clientId]?.connection;
                    if (con) con.send(JSON.stringify({ method: "error", message: "Vous avez déjà rejoint cette partie" }));
                    return;
                }

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
                }else if(game.model === "mascarade"){
                    const mascaradeColor = MASCARADE_COLORS[game.clients.length] || "#FFFFFF";
                    game.clients.push({
                        "clientId": clientId,
                        "clientName": clientName,
                        "color": mascaradeColor
                    });
                    game.engine.addPlayer(clientId, clientName);

                    if(game.clients.length == game.playersLimit){
                        game.engine.startGame();
                        // Send per-player state for mascarade
                        broadcastMascaradeState(gameId);
                        return;
                    }
                }else if(game.model === "undercover"){
                    const undercoverColor = MASCARADE_COLORS[game.clients.length] || "#FFFFFF";
                    game.clients.push({
                        "clientId": clientId,
                        "clientName": clientName,
                        "color": undercoverColor
                    });
                    game.engine.addPlayer(clientId, clientName);
                    // Undercover ne démarre PAS automatiquement quand plein :
                    // l'hôte doit cliquer "start_game" (permet le re-roll avant démarrage).
                    broadcastUndercoverState(gameId);
                    return;
                }

                // Mettre à jour numberPlayers en BDD
                try {
                    await Game.update(
                        { numberPlayers: game.clients.length },
                        { where: { gameId: gameId } }
                    );
                } catch (e) {
                    console.error("Error updating numberPlayers:", e);
                }

                const payLoad = {
                    "method": "join",
                    "game": game.model === "mascarade" ? {
                        id: game.id,
                        model: game.model,
                        clients: game.clients.map(cl => ({ clientId: cl.clientId, clientName: cl.clientName, color: cl.color })),
                        playersLimit: game.playersLimit,
                        state: game.engine ? game.engine.getPublicState() : null
                    } : game
                }

                // Boucle a travers chaque client et leurs envoie un message
                game.clients.forEach( c=> {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad));
                })

                if(game.model !== "mascarade" && game.clients.length == game.playersLimit){
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

            // Mettre à jour numberPlayers en BDD + cleanup si vide
            try {
                if (game.clients.length === 0) {
                    await Game.update({ status: "ended", numberPlayers: 0 }, { where: { gameId: gameId } });
                    delete games[gameId];
                } else {
                    await Game.update(
                        { numberPlayers: game.clients.length },
                        { where: { gameId: gameId } }
                    );
                }
            } catch (e) {
                console.error("Error updating numberPlayers on quit:", e);
            }

            const safeGame = (game.model === "mascarade" || game.model === "undercover")
                ? { id: game.id, model: game.model, clients: game.clients.map(cl => ({ clientId: cl.clientId, clientName: cl.clientName, color: cl.color })), playersLimit: game.playersLimit }
                : game;

            const payLoad = {
                "method": "quit",
                "game": safeGame,
                "clientName" : clientName,
                "clientId" : clientId,
            }

            gameclients.forEach( c=> {
                if(clients[c.clientId]) clients[c.clientId].connection.send(JSON.stringify(payLoad));
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

        // Action dans une partie Mascarade
        if(result.method === "mascarade_action"){
            const gameId = result.gameId;
            const game = games[gameId];
            if (!game || game.model !== "mascarade") return;

            try {
                const actionResult = game.engine.handleAction(result.clientId, result.action);

                // Send private messages
                if (actionResult.privateMessages) {
                    actionResult.privateMessages.forEach(pm => {
                        sendPrivateMessage(pm.clientId, pm.data);
                    });
                }

                // Broadcast updated state to all players
                broadcastMascaradeState(gameId);
            } catch (e) {
                console.error("Mascarade action error:", e);
            }
        }

        // Action dans une partie Undercover
        if(result.method === "undercover_action"){
            const gameId = result.gameId;
            const game = games[gameId];
            if (!game || game.model !== "undercover") return;

            try {
                const actionResult = game.engine.handleAction(result.clientId, result.action);

                // Erreur renvoyée uniquement à l'émetteur
                if (actionResult && actionResult.error) {
                    const con = clients[result.clientId]?.connection;
                    if (con && con.connected) {
                        con.send(JSON.stringify({ method: "error", message: actionResult.error }));
                    }
                    return;
                }

                // Messages privés (notamment le card_reveal à l'issue du start_game)
                if (actionResult && actionResult.privateMessages) {
                    actionResult.privateMessages.forEach(pm => {
                        sendPrivateMessage(pm.clientId, pm.data);
                    });
                }

                // Broadcast état public + privé à chaque joueur
                broadcastUndercoverState(gameId);
            } catch (e) {
                console.error("Undercover action error:", e);
            }
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

        // Chat en jeu : diffuse un message à tous les joueurs de la partie
        if (result.method === "chat_game") {
            const gameId = result.gameId;
            const game = games[gameId];
            if (!game) return;

            const clientId = result.clientId;
            const clientInfo = game.clients.find(c => c.clientId === clientId);
            if (!clientInfo) return;

            const content = (result.content || "").trim();
            if (!content || content.length > 500) return;

            const chatPayload = {
                method: "chat_game",
                gameId,
                message: {
                    senderId: clientId,
                    senderName: clientInfo.clientName || "Anonyme",
                    senderColor: clientInfo.color || "#FFFFFF",
                    content,
                    timestamp: Date.now()
                }
            };

            game.clients.forEach(c => {
                if (clients[c.clientId]?.connection?.connected) {
                    clients[c.clientId].connection.send(JSON.stringify(chatPayload));
                }
            });
        }

        // Chat privé : envoie un message à un autre utilisateur connecté
        if (result.method === "chat_private") {
            const senderId = result.clientId;
            const receiverId = result.receiverId; // This is a clientId
            const content = (result.content || "").trim();
            if (!content || content.length > 500) return;

            const senderClient = clients[senderId];
            if (!senderClient) return;

            const chatPayload = {
                method: "chat_private",
                message: {
                    senderId,
                    senderName: result.senderName || "Anonyme",
                    content,
                    timestamp: Date.now()
                }
            };

            // Send to receiver if online
            if (clients[receiverId]?.connection?.connected) {
                clients[receiverId].connection.send(JSON.stringify(chatPayload));
            }

            // Echo back to sender for confirmation
            if (senderClient.connection?.connected) {
                senderClient.connection.send(JSON.stringify(chatPayload));
            }
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

// Periodic cleanup of dead connections every 30 seconds
setInterval(() => {
    for (const clientId of Object.keys(clients)) {
        if (!clients[clientId]?.connection?.connected) {
            delete clients[clientId];
        }
    }
}, 30000);
