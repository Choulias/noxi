import { React, useState, useEffect, Fragment, useCallback, useRef } from "react";
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import TicTacToeGame from "../../class/tictactoe.js";
import FormControl from '@mui/material/FormControl';
import { useUser } from "../Auth/useUser.jsx";
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import api from "../../api";

export default function TicTacToe() {

  const user = useUser();
  const {id} = useParams();
  const {reach, numberplayers} = useParams();
  const cancelJoinButtonRef = useRef(null)

  const navigate = useNavigate();
  const [joinOpen, setJoinOpen] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(numberplayers);
  const [clientName, setClientName] = useState(user ? user.username : "Utilisateur");
  
  let clientId = null; // L'id généré par le serveur pour reconnaitre un joueur
  let playerId = user ? user.id : null; // L'id du joueur connecté, sinon null
  let gameId = id ? id : null; //Si ID de jeu dans les parametres de l'url, on le garde

  let playerColor = null;
  let playerMark = null;
  let playerScore = 0;
  let previousMark = "o";
  let gameState = "pending";
  var tictactoe = null;

  const [gameUrl, setGameUrl] = useState();
  const [gameUrlId, setUrlId] = useState("");
  const [gameIdValue, setGameIdValue] = useState("");

  // ***********************************************************************************
  // USE EFFECT ************************************************************************
  // ***********************************************************************************

  
  let ws = useRef(null);

  useEffect(() => {
    
    ws = new WebSocket("ws://localhost:9090");

    let placeholder = document.getElementById("placeholder");
    let divPlayers = document.getElementById("divPlayers");
    let oxoBoard = document.getElementById("oxoBoard");
    
    ws.onmessage = (message) => {
      const response = JSON.parse(message.data);

      // ------------------------------------------------------------------------------
      // Reception du message du serveur ----------------------------------------------
      // ------------------------------------------------------------------------------
  
      // CONNECT --------------------------------------------------------------------
      if (response.method === "connect") {
        clientId = response.clientId;
        if (!gameId){
          createGame();
        }else{
          setJoinOpen(true);
          joinGame();
        }
      }
  
      // CREATE ---------------------------------------------------------------------
      if (response.method === "create") {
        gameId = response.game.id;
        saveGame();
        joinGame();
        setUrlId(response.game.id);
      }
  
      // JOIN -----------------------------------------------------------------------
      if (response.method === "join") {
        const game = response.game;
        
        setGameUrl((window.location.href.slice(0, window.location.href.lastIndexOf('tictactoe/'))) + "tictactoe/" + response.game.id);
        
        //On save seulement le client qui vient de se connecter (qui est en fin de l'array clients)
        if(game.clients[[game.clients.length - 1]].clientId == clientId){
          savePlayer();
        }

        if (game.clients.length == game.playersLimit){
          gameState = "in progress";
          let placeholderBoard = oxoBoard.querySelector("#placeholder");
          let waitholderBoard = oxoBoard.querySelector("#waitholder");
          let boardholderBoard = oxoBoard.querySelector(".boardholder");
          let alertBoard = oxoBoard.querySelector(".alert");

          placeholderBoard.style.visibility = "visible";
          alertBoard.style.visibility = "visible";
          waitholderBoard.style.display = "none";
          boardholderBoard.style.justifyContent = "center";

          setTimeout(() => {
            // Je change le message au bout de 2 sec
            game.clients.forEach(client => {
              if(client.mark == game.state.turn){
                // Je reconnais la marque du tour actuelle et j'affiche le nom et la couleur du joueur a qui ca correspond
                if(client.clientName == clientName){
                  document.querySelector("#turnAlert").innerHTML = "C'est à <span style='color:"+client.color+";font-weight: 600;'>vous</span>"+" de jouer !";
                }else{
                  document.querySelector("#turnAlert").innerHTML = "C'est au tour de <span style='color:"+client.color+";font-weight: 600;'>"+client.clientName+"</span>"+" de jouer !";
                }
    
              }
            });
          }, 2000);
        }
        
        updateGame(game.clients.length, game.playersLimit);

        tictactoe = new TicTacToeGame(placeholder, 3, onResult);
  
        while (divPlayers.firstChild)
          divPlayers.removeChild(divPlayers.firstChild);
  
        // Permet montrer les différents joueurs
        showPlayers(game.clients);
      }

      // QUIT ---------------------------------------------------------------------
      if (response.method === "quit") {
        const game = response.game;
        const clients = response.game.clients;

        updateGame(clients.length, response.game.playersLimit);
        
        // S'il y a plus de joueurs dans le salon, on considère que la partie est terminée
        if(clients.length === 0){
          endGame();
        }else{
          updateGame(clients.length, response.game.playersLimit);
        }

        // Actualise de nouveau l'affichage des joueurs
        showPlayers(game.clients);

        if(response.clientId == clientId){
          ws.close();
          if(oxoBoard.querySelector(".quit-btn").classList.contains('quit-clicked')){
            navigate("/games");
          }
        }
      }

      // UPDATE ---------------------------------------------------------------------
      if (response.method === "update") {
        //{1: "red", 1}
        if (!response.game.state) return;
        const game = response.game;
        const turn = response.game.state.turn;
        const board = response.game.state.board;
        let columns = placeholder.getElementsByTagName("td");

        if (previousMark !== turn) {
          // Marque la colonne au click "<td>"
          if(Object.keys(board).length > 0){ // Après le premier joueur ait joué 
            const lastKey = Object.keys(board)[Object.keys(board).length - 1]; // La dernière case cochée
            tictactoe.mark(document.getElementById(lastKey), board[lastKey]);
          }
          
          previousMark = turn;

          if (turn === playerMark) {
            // Passe a travers les colonnes et ajoute un Evenement click
          
            for (let i = 0; i < columns.length; i++) {
              columns[i].addEventListener("click", sendPlayInfo);
            }
          }else{
            for (let i = 0; i < columns.length; i++) { // On va peut être déplacé ca dans la fonction pour qu'instantanément on ne puisse plus cliquer
              columns[i].removeEventListener("click", sendPlayInfo);
            }
          }

          game.clients.forEach(client => {
            if(client.mark == game.state.turn){
              // Je reconnais la marque du tour actuelle et j'affiche le nom et la couleur du joueur a qui ca correspond
               if(client.clientName == clientName){
                document.querySelector("#turnAlert").innerHTML = "C'est à <span style='color:"+client.color+";font-weight: 600;'>vous</span>"+" de jouer !";
              }else{
                document.querySelector("#turnAlert").innerHTML = "C'est au tour de <span style='color:"+client.color+";font-weight: 600;'>"+client.clientName+"</span>"+" de jouer !";
              }
              // document.querySelector("#turnAlert").innerHTML = "C'est au tour de <span style='color:"+client.color+";font-weight: 600;'>"+client.clientName+"</span>"+" de jouer !";
            }
          });
        }

        for (const b of Object.keys(response.game.state.board)) {
          const board = response.game.state.board[b];
        }
      }
      
      function onResult(result, scores) {
    
        if (result == "draw") {
          document.querySelector("#winnerAlert").innerHTML = "C'est une égalité !";
        } else {
          document.querySelector("#winnerAlert").innerHTML = "Les <span style='color:"+(result == "X" ? "#FEBEFD" : "#95FDFC")+";'>" + result + "</span> ont gagné le point!";
          updateScores(scores.X, scores.O);
        }

        setTimeout(() => {
          // Je change le message au bout de 2 sec
          document.querySelector("#winnerAlert").innerHTML = "<wbr>";
        }, 2000);
        
        tictactoe.empty();
    
        const payLoad = {
          method: "reset",
          gameId: gameId
        };

        playerScore = (playerMark == "X" ? scores.X : scores.O)
        saveScore(playerScore); // Met a jour dans le BDD le score
        
        if(playerId ){
          // On veut gérer le meilleur score du joueur connecté
          managePlayerBestScore("tictactoe", playerScore);
        }
        
        ws.send(JSON.stringify(payLoad));
      }

      function updateScores(X, O) {
        document.querySelector(".playermark-X").innerHTML = ("Score : " + X);
        document.querySelector(".playermark-O").innerHTML = ("Score : " + O);
      }

      function restart(grid_size) {
        tictactoe.reset();
        updateScores(0, 0);
        if (grid_size) {
          tictactoe.paint(grid_size);
        }
      }

      function showPlayers(clients){
        divPlayers.innerHTML = "";

        clients.forEach((c, i) => {
          if(i%2 == 0){
            divPlayers.innerHTML += 
            "<div style='background:#061A4A; width:220px; display:flex; align-items:center; justify-content: space-between; padding: 10px 20px; border-radius: 50px; margin-bottom: 8px' class='playerstyle'>" + 
              "<div class='player-line' style='display:flex; align-items:center'>"+

                "<div style='width:40px; height:40px; margin-right:12px'>" +
                  "<img " +
                    "style='border-radius:50px; width:100%; height:100%'"+
                    "class='w-full h-full rounded-full'" +
                    "src='" + ((c.clientName !== "Utilisateur") ? ('https://robohash.org/'+ c.clientName) : 'https://robohash.org/player') + "'"+
                    "alt=''"+
                  "/>" +
                "</div>" +

                "<div>" +
                  "<h5 style='font-size:1.2rem;'>" + c.clientName + "</h5>" +
                  "<span class='playermark-"+c.mark+"' style='font-size:0.75rem; color:"+c.color+" '>Score : 0</span>"+
                "</div>"+
              "</div>" +

               "<div style='width: 14px; height: 14px; background:"+c.color+"; border-radius:50px'></div>"+
            "</div>";
          }else{
            divPlayers.innerHTML += 
            "<div style='background:transparent; width:220px; display:flex; align-items:center; justify-content: space-between; padding: 8px 20px; border-radius: 50px; margin-bottom: 8px' class='playerstyle'>" + 
              "<div class='player-line' style='display:flex; align-items:center'>"+

                "<div style='width:40px; height:40px; margin-right:16px'>" +
                  "<img " +
                    "style='border-radius:50px; width:100%; height:100%'"+
                    "class='w-full h-full rounded-full'" +
                    "src='" + ((c.clientName !== "Utilisateur") ? ('https://robohash.org/'+ c.clientName) : 'https://robohash.org/player') + "'"+
                    "alt=''"+
                  "/>" +
                "</div>" +

                "<div>" +
                  "<h5 style='font-size:1.2rem;'>" + c.clientName + "</h5>" +
                  "<span class='playermark-"+c.mark+"' style='font-size:0.75rem; color:"+c.color+" '>Score : 0</span>"+
                "</div>"+
              "</div>" +

               "<div style='width: 14px; height: 14px; background:"+c.color+"; border-radius:50px'></div>"+
            "</div>";
          }
          
          
          if (c.clientId === clientId) {
            playerColor = c.color;
            playerMark = c.mark;
          }
        });
      }
    
    };

    // Pour initier les fonctions qui permettent de quitter la partie 
    // Lors du clic du bouton quitter
    oxoBoard.querySelector(".quit-btn").addEventListener("click", () => {   
      oxoBoard.querySelector(".quit-btn").classList.add("quit-clicked"); 
      quitGame();
    });
      
    // Lorsqu'on quitte la page autrement
    const handleBeforeUnload = () => {
      if(!(oxoBoard.querySelector(".quit-btn").classList.contains('quit-clicked'))){
        quitGame();
      }
      
    };
  
    // handles when page is unloaded
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.querySelector(".game-nav a").classList.add("active");
    // cleanup function handles when component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
      document.querySelector(".game-nav a").classList.remove("active");
    };


  }, []);

  // ------------------------------------------------------------
  // Envoi des Evenements/Informations au serveur Websocket ws
  // ------------------------------------------------------------

  // Les informations de plateau quand on joue

  // const sendPlayInfo = useCallback((e) => {
  const sendPlayInfo = async (e) => {
    const payLoad = {
      method: "play",
      clientId: clientId,
      playerId: playerId,
      gameId: gameId,
      squareId: e.target.id,
      color: playerColor,
      mark: playerMark,
    };
    
    ws.send(JSON.stringify(payLoad));
  };


  // Les informations lors de la création de partie
  const createGame = async () => {

    const payLoad = {
      method: "create",
      clientId: clientId,
      playerId: playerId,
      gameModel: "tictactoe",
      squares: 9,
      playersLimit: maxPlayers,
    };

    ws.send(JSON.stringify(payLoad));
  };

  // Les informations lors du join de la partie
  const joinGame = async () => {
    const payLoad = {
      method: "join",
      playerId: playerId,
      clientId: clientId,
      clientName: clientName,
      gameId: gameId,
    };
    ws.send(JSON.stringify(payLoad));
  };

  const quitGame = async () => {

    const payLoad = {
      method: "quit",
      playerId: playerId,
      clientId: clientId,
      clientName: clientName,
      gameId: gameId,
    };

    ws.send(JSON.stringify(payLoad));
  };

  // ------------------------------------------------------------
  // Fonctions qui vont changer les informations dans la BDD
  // ------------------------------------------------------------

  const saveGame = async () => {
    const res = await api.post('/games',{
        gameId: gameId,
        ownerId: playerId,
        maxPlayers: maxPlayers,
        status: parseInt(maxPlayers) == maxPlayers ? "in progress" : "pending",
        gameModel: "tictactoe",
        reach: reach,
    });
  }

  const savePlayer = async () => {
    const res = await api.post('/gameplayers',{
        gameId: gameId,
        playerId: playerId,
        clientId: clientId,
        clientName: clientName,
        score: 0,
    });
  }

  const updateGame = async (players, maxPlayers) => {
    try{
      const response = await api.patch(`/games/${gameId}`,{
        numberPlayers: players,
        status: players == maxPlayers ? "in progress" : "pending",
      });
    }catch(error){
      console.log("CATCH ERREUR " + error);
    }
  }

  const endGame = async () => {
    if(gameState === "pending"){
      // Si le jeu est en attente et qu'il n'y a plus de joueurs, on supprime la partie de la BDD
      try{
        await api.delete(`/games/gameid/${gameId}`);
      }catch(error){
        console.log("CATCH ERREUR " + error);
      }

      try{
        await api.delete(`/gameplayers/gameid/${gameId}`);
      }catch(error){
        console.log("CATCH ERREUR " + error);
      }

    }else{
      // Si le jeu était en cours, on sauvegarde les informations actuelles
      try{
        const response = await api.patch(`/games/${gameId}`,{
          status: "ended",
        });
        
      }catch(error){
        console.log("CATCH ERREUR " + error);
      }
    }
  }

  const saveScore = async (score) => {
    try{
      const response = await api.patch(`/gameplayers/score/${gameId}/${clientId}`,{
        score: score,
      });
    }catch(error){
      console.log("CATCH ERREUR " + error);
    }
  }

  const managePlayerBestScore = async (slug, playerScore) => {
    const response = await api.get(`/playerscores/slugnid/${slug}/${playerId}`);
    
    // Si le score actuel est supérieur au meilleur score je met à jour la BDD
    if (playerScore > response.data.bestScore){
      saveBestScore(playerScore, "tictactoe"); // Met a jour dans le BDD le score
    }
  }

  const saveBestScore = async (score, slug) => {
    try{
      const response = await api.patch(`/playerscores/slugnid/${slug}/${playerId}`,{
        bestScore: score,
      });
    }catch(error){
      console.log("CATCH ERREUR " + error);
    }
  }

  return (
    <div className="board conteneur ">
      <div  id="oxoBoard">

        <div className="boardinfo">

          <div className="players">
            <h4>Joueurs</h4>
            <div id="divPlayers"></div>
          </div>

          {/* <button>Reset</button> */}

          <div className="boardbuttons">
            <button
              type="button"
              className="copy-btn"
              onClick={() => {
                // setGameUrl((window.location.href.slice(0, window.location.href.lastIndexOf('tictactoe/'))) + "tictactoe/" + gameUrlId)
                navigator.clipboard.writeText(gameUrl);
              }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="20.125" height="20.125" viewBox="0 0 20.125 20.125">
                  <defs>
                    <clipPath id="clip-path">
                      <rect id="Rectangle_123" data-name="Rectangle 123" width="20.125" height="20.125" fill="none"/>
                    </clipPath>
                  </defs>
                  <g id="Groupe_111" data-name="Groupe 111" transform="translate(0 0)">
                    <g id="Groupe_110" data-name="Groupe 110" transform="translate(0 0.001)" clipPath="url(#clip-path)">
                      <path id="Tracé_75" data-name="Tracé 75" d="M18.208,11.5a.958.958,0,0,0-.959.958v5.75a.959.959,0,0,1-.958.958H2.875a.959.959,0,0,1-.959-.958V4.792a.959.959,0,0,1,.959-.958h5.75a.958.958,0,1,0,0-1.916H2.875A2.878,2.878,0,0,0,0,4.792V18.208a2.878,2.878,0,0,0,2.875,2.875H16.292a2.879,2.879,0,0,0,2.875-2.875v-5.75a.958.958,0,0,0-.958-.958" transform="translate(0 -0.959)"/>
                      <path id="Tracé_76" data-name="Tracé 76" d="M28.75,0H23.958a.958.958,0,1,0,0,1.916h2.478L19.448,8.906A.958.958,0,1,0,20.8,10.261l6.989-6.989V5.75a.958.958,0,1,0,1.917,0V.959A.958.958,0,0,0,28.75,0" transform="translate(-9.583 0)"/>
                    </g>
                  </g>
                </svg>

                <span>Copier le lien</span>
            </button>

            <button
              type="button"
              className="quit-btn btn"
              >Quitter la partie
            </button>
          </div>
         
        </div>
            

        <div className="boardholder">
          <div id="waitholder">
            <span>EN ATTENTE DES JOUEURS ...</span>

            <svg width="130" height="300" viewBox="0 0 260 500" fill="none" overflow="hidden" xmlns="http://www.w3.org/2000/svg">
              <use href="#cube" x="0" y="210" strokeWidth="2"  opacity="0.3">
                <animate attributeName="stroke" dur="6s" repeatCount="indefinite"
                    values="#95FDFC;#A7F3FC;#B8E8FC;#CADEFD;#DBD3FD;#EDC9FD;#FEBEFD;#EDC9FD;#DBD3FD;#CADEFD;#B8E8FC;#A7F3FC"/>
              </use>

              {/* <rect width="300" height="300" y="384" fill="url(#fade)"/> */}
              <use href="#cube" x="0" y="20" strokeWidth="2">
                <animate attributeName="stroke" dur="6s" repeatCount="indefinite"
                    values="#95FDFC;#A7F3FC;#B8E8FC;#CADEFD;#DBD3FD;#EDC9FD;#FEBEFD;#EDC9FD;#DBD3FD;#CADEFD;#B8E8FC;#A7F3FC"/>
              </use>

              <defs>

                <g id="cube">
                  <use href="#cube_outline" strokeLinejoin="round" strokeWidth="16" fill="url(#stars)"/>
                  <use href="#cube_base" strokeWidth=".5"/>
                  <use href="#cube_outline" strokeLinejoin="round" strokeWidth="6" stroke="#141417"/>
                </g>	

                <g id="cube_outline">
                  <path>
                    <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                    keyTimes="0;0.5;0.5;1"
                    keySplines="0.8 0.2 0.6 0.9; 
                          0.8 0.2 0.6 0.9; 
                          0.8 0.2 0.6 0.9"
                    values="M10 64 L128 0 L246 64 L246 192 L128 256 L10 192Z;
                        M40 20 L216 20 L216 108 L216 236 L40 236 L40 172Z;
                        M216 20 L40 20 L40 108 L40 236 L216 236 L216 172Z;
                        M246 64 L128 0 L10 64 L10 192 L128 256 L246 192Z"/>
                  </path>
                </g>

                <g id="cube_base">
                  <path fill="#fff1">
                  <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                    keyTimes="0;0.5;1"
                    keySplines="0.8 0.2 0.6 0.9; 
                          0.8 0.2 0.6 0.9"
                    values="M10 64 L128 0 L246 64 L128 128Z;
                        M40 20 L216 20 L216 108 L40 108Z;
                        M128 0 L246 64 L128 128 L10 64Z"/>
                  </path>
                  <path> 

                  <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                    keyTimes="0;0.5;0.5;1"
                    keySplines="0.8 0.2 0.6 0.9; 
                          0.8 0.2 0.6 0.9; 
                          0.8 0.2 0.6 0.9"
                    values="M10 64 L128 128 L128 256 L10 192Z;
                        M40 20 L40 108 L40 236 L40 172Z;
                        M216 20 L216 108 L216 236 L216 172Z;
                        M246 64 L128 128 L128 256 L246 192Z"/>
                  <animate attributeName="fill" dur="1.5s" repeatCount="indefinite" keyTimes="0;0.5;0.5;1"
                    values="#fff0;#fff0;#fff2;#fff2"/>
                  </path>
                  <path fill="#407080">

                  <animate attributeName="d" dur="1.5s" repeatCount="indefinite" calcMode="spline"
                    keyTimes="0;0.5;1"
                    keySplines="0.8 0.2 0.6 0.9; 
                          0.8 0.2 0.6 0.9"
                    values="M246 64 L128 128 L128 256 L246 192Z;
                        M216 108 L40 108 L40 236 L216 236Z;
                        M128 128 L10 64 L10 192 L128 256Z"/>
                    <animate attributeName="fill" dur="1.5s" repeatCount="indefinite" keyTimes="0;0.5;1"
                      values="#fff2;#fff1;#fff0"/>
                  </path>
                </g>

                <linearGradient id="fade" gradientTransform="rotate(90)">
                  <stop offset="0" stopColor="#06122F00"/>
                  <stop offset="0.25" stopColor="#06122Fff"/>
                </linearGradient>
                <linearGradient id="sky" gradientTransform="rotate(90)">
                  <stop offset="0.5" stopColor="#06122F"/>
                  <stop offset="1" stopColor="#06397B"/>
                  {/* <stop offset="0.5" stopColor="#06397B"/>
                  <stop offset="1" stopColor="#06122F"/> */}
                </linearGradient>
                
                <pattern id="stars" x="0" y="0" width="50%" height="50%" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                  <rect width="256" height="256" fill="url(#sky)"/>
                  <use href="#star01" x="24" y="32"  fill="white"/>
                  <use href="#star01" x="64" y="96"  fill="#ad9dcb" transform="rotate(90 80 112)"/>
                  <use href="#star01" x="224" y="102"  fill="#ad9dcb"/>
                  <use href="#star01" x="192" y="112"  fill="#E0E8EA" transform="rotate(90 80 112)"/>
                  <use href="#star02" x="16" y="64"  fill="#ad9dcb"/>
                  <use href="#star03" x="96" y="16"  fill="#E0E8EA"/>
                  <use href="#star04" x="64" y="64"  fill="white"/>
                  <use href="#star04" x="8" y="16"  fill="#ad9dcb"/>
                  <use href="#star04" x="110" y="96"  fill="#E0E8EA"/>
                  <use href="#star02" x="160" y="24"  fill="#ad9dcb"/>
                  <use href="#star03" x="196" y="60"  fill="#E0E8EA"/>
                  <use href="#star04" x="64" y="212"  fill="white"/>
                  <use href="#star04" x="218" y="216"  fill="#ad9dcb"/>
                  <use href="#star03" x="228" y="220"  fill="#E0E8EA"/>
                  <use href="#star02" x="140" y="128"  fill="#ad9dcb"/>
                  <use href="#star03" x="24" y="140"  fill="#E0E8EA"/>
                  <use href="#star04" x="95" y="160"  fill="white"/>
                  <use href="#star04" x="180" y="128"  fill="#ad9dcb"/>
                  <use href="#star03" x="200" y="136"  fill="#E0E8EA"/>
                  <use href="#star10" x="120" y="120"  stroke="#E0E8EA"/>
                  <use href="#star11" x="48" y="64"  stroke="#ad9dcb"/>
                </pattern>
                <path id="star01" transform="scale(0.5)">
                  <animate attributeName="d" dur="3s" repeatCount="indefinite" calcMode="spline"
                    keyTimes="0;0.5;1" keySplines="0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9"
                    values="M16 0 Q16 16 24 16 Q16 16 16 32 Q16 16 8 16 Q16 16 16 0Z;
                        M16 8 Q16 16 32 16 Q16 16 16 24 Q16 16 0 16 Q16 16 16 8Z;
                        M16 0 Q16 16 24 16 Q16 16 16 32 Q16 16 8 16 Q16 16 16 0Z"/>
                </path>
                <circle id="star02">
                  <animate attributeName="r" dur="3s" repeatCount="indefinite" calcMode="spline"
                    keyTimes="0;0.5;1" keySplines="0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9"
                    values="0;2;0"/>
                </circle>
                <circle id="star03">
                  <animate attributeName="r" dur="6s" repeatCount="indefinite" calcMode="spline"
                    keyTimes="0;0.5;1" keySplines="0.8 0.2 0.6 0.9; 0.8 0.2 0.6 0.9"
                    values="3;1;3"/>
                </circle>
                <circle id="star04" r="1"/>

                <path id="star10" strokeWidth="2">
                  <animate attributeName="d" dur="5s" repeatCount="indefinite" 
                    keyTimes="0;0.90;0.97;1"
                    keySplines="0 0.4 1 0.2; 0 0.4 1 0.2; 0 0.4 1 0.2"
                    values="M64 0 L64 0Z; M64 0 L64 0Z; M48 12 L0 48Z; M0 48 L0 48Z"/>
                  <animate attributeName="opacity" dur="5s" repeatCount="indefinite"
                    keyTimes="0;0.90;0.97;1"
                    values="1; 1; 0.6; 0"/>
                </path>
                <path id="star11" strokeWidth="3">
                  <animate attributeName="d" dur="6s" repeatCount="indefinite" delay="3s"
                    keyTimes="0;0.90;0.95;1"
                    keySplines="0 0.4 1 0.2; 0 0.4 1 0.2; 0 0.4 1 0.2"
                    values="M64 0 L64 0Z; M64 0 L64 0Z; M48 12 L0 48Z; M0 48 L0 48Z"/>
                  <animate attributeName="opacity" dur="6s" repeatCount="indefinite" delay="3s"
                    keyTimes="0;0.90;0.95;1"
                    values="1; 1; 0.6; 0"/>
                </path>
              </defs>
            </svg>
          </div>

          <div id="placeholder"></div>
          <div className="alert">
            <div id="turnAlert"> Bonne chance a tout les 2 !</div>
            <div id="winnerAlert"><wbr/></div>
          </div>
          
        </div>

          

        {/* Fenêtre Pop-up : ADD ---------------------------------------------------------------------*/}
      
        <Transition.Root className='pop-up' show={joinOpen} as={Fragment}>
          <Dialog as="div" initialFocus={cancelJoinButtonRef} onClose={setJoinOpen}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="pop-up-background" />
            </Transition.Child>

            <div className="pop-up-content">
              <div className="pop-up-window">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="pop-up-panel">

                    <div className="content-container">
                      <div className="content">
                        <div className="title-icon">
                          <ExclamationTriangleIcon aria-hidden="true" />
                        </div>

                        <div className="content-text">
                          <Dialog.Title as="h3">
                            Oh vous n'avez pas encore de compte chez nous ...
                          </Dialog.Title>

                          <form className="text-bloc">
                            <div className="field">
                                <label className="label">Choisissez un pseudonyme</label>
                                <input 
                                    className="input"
                                    type="text"
                                    placeholder="Name"
                                    onChange={ (e) => setClientName(e.target.value) }
                                />
                            </div>

                          </form>
                        </div>
                      </div>
                    </div>

                    <div className="btn-container">
                      <button
                        type="button"
                        className="btn-continue"
                        onClick={() => {
                          setJoinOpen(false)
                        }}
                      >
                        Ajouter
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setJoinOpen(false)}
                        ref={cancelJoinButtonRef}
                      >
                        Annuler
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        
      </div>
    </div>
  );
}
