import { React, useState } from "react";

export default function Board() {

  // ! Créer des UseState pour ces valeurs 
  let clientId = null;
  let gameId = null;
  let playerColor = null;

  let ws = new WebSocket(import.meta.env.VITE_WS_URL || "ws://localhost:9090");

  const[gameIdValue, setGameIdValue] = useState('');

  const divPlayers = document.getElementById("divPlayers");
  const divBoard = document.getElementById("divBoard");

  // Evenements
  const onBtnJoinClicked = async (e) => {
    e.preventDefault();

    if (gameId == null) gameId = gameIdValue;

    const payLoad = {
      method: "join",
      clientId: clientId,
      gameId: gameId,
    };

    ws.send(JSON.stringify(payLoad));
  };

  const onBtnCreateClicked = async (e) => {
    const payLoad = {
      method: "create",
      clientId: clientId,
      gameModel: "board",
      playersLimit: 3
    };

    ws.send(JSON.stringify(payLoad));
  };

  // Reception du message du serveur
  ws.onmessage = (message) => {
    // Message.data
    const response = JSON.parse(message.data);

    // Connect
    if (response.method === "connect") {
      clientId = response.clientId;
    }

    // Create
    if (response.method === "create") {
      gameId = response.game.id;
    }

    // Update
    if (response.method === "update") {
      //{1: "red", 1}
      if (!response.game.state) return;
      for (const b of Object.keys(response.game.state)) {
        const color = response.game.state[b];
        const ballObject = document.getElementById("ball" + b);
        ballObject.style.backgroundColor = color;
      }
    }

    // Join
    if (response.method === "join") {
      const game = response.game;

      while (divPlayers.firstChild)
        divPlayers.removeChild(divPlayers.firstChild);

      game.clients.forEach((c) => {
        const d = document.createElement("div");
        d.style.width = "200px";
        d.style.background = c.color;
        d.textContent = c.clientId;
        divPlayers.appendChild(d);

        if (c.clientId === clientId) playerColor = c.color;
      });

      while (divBoard.firstChild) divBoard.removeChild(divBoard.firstChild);

      for (let i = 0; i < game.balls; i++) {
        const b = document.createElement("button");
        b.id = "ball" + (i + 1);
        b.tag = i + 1;
        b.textContent = i + 1;
        b.style.width = "150px";
        b.style.height = "150px";
        b.addEventListener("click", (e) => {
          b.style.background = playerColor;

          const payLoad = {
            method: "play",
            clientId: clientId,
            gameId: gameId,
            ballId: b.tag,
            color: playerColor,
          };
          ws.send(JSON.stringify(payLoad));
        });
        divBoard.appendChild(b);
      }
    }
  };
  return (
    <div className="conteneur">
      <h1>Ball Game</h1>
      <button
      className="btnCreate"
      onClick={onBtnCreateClicked}>
        New Game</button>
      <button
      className="btnJoin"
      onClick={onBtnJoinClicked}>
        Join Game
      </button>

      <input
        type="text"
        id="txtGameId"
        value={gameIdValue}
        onChange={e => setGameIdValue(e.target.value)}
        className="form-control"
        placeholder="Entrez l'id du salon que vous voulez rejoindre"
      />

      <div id="divPlayers"></div>
      <div id="divBoard"></div>
    </div>
  );
}
