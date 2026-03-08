import { React, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToken } from "../Auth/useToken";
import { useUser } from "../Auth/useUser";
import api from "../../api";

export default function SignUp() {

  useEffect(() => {
    getGameModels();
  }, []);

  const navigate = useNavigate();

  const[token, setToken] = useToken();
  const[errorMessage, setErrorMessage] = useState('');
  const[mailValue, setEmailValue] = useState('');
  const[passwordValue, setPasswordValue] = useState('');
  const[usernameValue, setUsernameValue] = useState('');
  const[confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const user = useUser();

  const [games, setGames] = useState([]);
  const getGameModels = async () => {
    const response = await api.get('/gamemodels');
    setGames(response.data);
  }

  const savePlayerProfile = async (user) => {
    // Pour initialiser les profils des nouveaux utilisateurs
    const res = await api.post('/profiles',{
      userId: user.id,
      nickname: user.username,
    })
  }

  const savePlayerScores = async (user) => {
    // Pour initialiser les scores des nouveaux joueurs à 0 pour chaque jeux
    for (const game of games) {
      const res = await api.post('/playerscores',{
        gameSlug: game.slug,
        playerId: user.id,
        clientName: user.username,
        bestScore:  0,
      })
    }
  }

  const onSignUpClicked = async (e) => {
    e.preventDefault();
    const res = await api.post('/users',{
        username: usernameValue,
        password: passwordValue,
        mail: mailValue,
        role: "", 
        status: "",
        // verificationString: ""
    });

    if(res.data.message){
      // console.log(res.data);
    }else{
      const { token } = res.data;
      setToken(token);
      const encodedPayload = token.split('.')[1];
      const user = JSON.parse(atob(encodedPayload));
      savePlayerProfile(user);
      savePlayerScores(user);
      navigate("/please-verify");
    }
  }

  return (
    <div className="Auth-form-container conteneur">
      <form className="Auth-form">
        <div className="Auth-form-content">
          <h3 className="Auth-form-title">S'inscrire</h3>
          <div className="form-group">
            <label>Nom d'utilisateur : </label>
            <input
              type="text"
              value={usernameValue}
              onChange={e => setUsernameValue(e.target.value)}
              className="form-control"
              placeholder="Votre nom d'utilisateur"
            />
          </div>
          <div className="form-group">
            <label>Adresse mail : </label>
            <input
              type="email"
              value={mailValue}
              onChange={e => setEmailValue(e.target.value)}
              className="form-control"
              placeholder="Votre mail"
            />
          </div>
          <div className="form-group">
            <label>Mot de passe : </label>
            <input
              type="password"
              value={passwordValue}
              onChange={e => setPasswordValue(e.target.value)}
              className="form-control"
              placeholder="Votre mot de passe"
            />
          </div>
          <div className="form-group">
            <label>Répeter mot de passe : </label>
            <input
              type="password"
              value={confirmPasswordValue}
              onChange={e => setConfirmPasswordValue(e.target.value)}
              className="form-control"
              placeholder="Répétez votre mot de passe"
            />
          </div>
          <hr/>
          <div className="button-container ">
            <button
              disabled={
                !mailValue || !passwordValue || !usernameValue ||
                passwordValue !== confirmPasswordValue
              }
              type="submit"
              className="btn btn-primary"
              onClick={onSignUpClicked}>
              S'inscrire
            </button>
          </div>

          <div className="no-login">
            <p className="no-account">
              Vous avez déjà un compte ? 
              <Link to="/login">Connectez vous ici</Link>
            </p>
          </div>
          
        </div>
      </form>
    </div>
  )
}
