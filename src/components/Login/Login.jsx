import { React, useState, useContext, useEffect } from "react";
import { Link, useNavigate, Navigate, NavLink } from "react-router-dom";
import Logo from "../../assets/img/logo.png";
import { useToken } from "../Auth/useToken";
import { useUser } from '../Auth/useUser';
import { Context } from '../GlobalInfo';
import api from "../../api";

export default function Login() {

  const user = useUser();
  const [state, setState] = useContext(Context);
  
  useEffect(() => {
    document.body.classList.add('auth-page');

    if(!user && state.userInfo.connected !== 0){
      setState({ userInfo: {
        connected : 0,
        id: '',
        username: '',
        mail: '',
        role: '',
        image: <img src={'https://robohash.org/player'} alt="" />
      }});
    }

    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);
  
  const navigate = useNavigate();
  const[token, setToken] = useToken();
  const[errorMessage, setErrorMessage] = useState('');
  const[mailValue, setEmailValue] = useState('');
  const[passwordValue, setPasswordValue] = useState('');

  const onLogInClicked = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const res = await api.post('/users/login',{
        mail: mailValue,
        password: passwordValue
      });

      if(res.data.message){
        setErrorMessage("Email ou mot de passe incorrect");
      }else{
        const { token } = res.data;
        setToken(token);
        window.location.reload();
        navigate('/myprofile');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMessage("Email ou mot de passe incorrect");
      } else {
        setErrorMessage("Erreur de connexion au serveur");
      }
    }
  }

  return (
    <div className="Auth-global">
    <div className="Auth-form-container">
      <NavLink className="logo-link" to="/">
        <img
          src={Logo}
          alt="Noxi Logo"
        />
      </NavLink>
      
      <form className="Auth-form ">
       

        <div className="Auth-form-content">

          <div className="intro-msg">
            <h2>Salut toi !</h2>
            <span>Bienvenue chez Noxi. Tableau de bord de la communauté.</span>
          </div>

          {errorMessage && <div className="fail">{errorMessage}</div>}
          <div className="form-group">
            <input
              type="email"
              value={mailValue}
              onChange={e => setEmailValue(e.target.value)}
              className="form-control"
              placeholder="Votre email"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={passwordValue}
              onChange={e => setPasswordValue(e.target.value)}
              className="form-control"
              placeholder="Votre mot de passe"
            />
          </div>

          <div className="password-forget">
            <Link to="/forgot-password">Mot de passe oublié ?</Link>
          </div>

          <div className="button-container ">
            <button
              type="submit"
              onClick={onLogInClicked}
              disabled={!mailValue || !passwordValue}
              className="btn"
              >
              Se connecter
            </button>
          </div>

          <div className="no-login">
            <p className="no-account">
              Pas encore de compte ? 
              <Link to="/signup">Inscrivez-vous</Link>
            </p>
          </div>
        </div>
      </form>
    </div>

    <div className="Auth-image">

    <button
        type="button"
        className=""
        onClick={() => {
          navigate(-1);
        }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="28" height="28" viewBox="0 0 28 28">
            <defs>
              <clipPath id="clipPath">
                <rect id="Rectangle_124" data-name="Rectangle 124" width="28" height="28" transform="translate(0 0)" fill="none"/>
              </clipPath>
            </defs>
            <g id="Groupe_113" data-name="Groupe 113" transform="translate(0 0)">
              <g id="Groupe_112" data-name="Groupe 112" transform="translate(0 0)" clipPath="url(#clipPath)">
                <path id="Tracé_79" data-name="Tracé 79" d="M26.25,28a1.745,1.745,0,0,1-1.237-.513L14,16.475,2.987,27.487A1.75,1.75,0,0,1,.513,25.013L11.526,14,.513,2.987A1.75,1.75,0,0,1,2.987.513L14,11.526,25.013.513a1.75,1.75,0,0,1,2.474,2.475L16.475,14,27.487,25.013A1.75,1.75,0,0,1,26.25,28" transform="translate(0 0)" />
              </g>
            </g>
          </svg>
      </button>
      
    </div>
  </div>
  );
}
