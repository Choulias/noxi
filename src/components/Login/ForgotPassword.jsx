import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'

const ForgotPassword = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const navigate = useNavigate();

  const onSubmitClicked = async () => {
    try{
      await api.put();
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000)
    }catch(err){
      setErrorMessage(err.message);
    }
  }

  return success ? (
    <div className='conteneur'>
      <h1>Success</h1>
      <p>Regardez votre mail pour recevoir un lien de récupération</p>
    </div>
  ) : (
    <div className='conteneur'>
      <h1>Forgot password</h1>
      <p>Enter your email and we'll send you a reset link</p>
      {errorMessage && <div className='fail'>{errorMessage}</div>}
      <input 
        value={emailValue}
        onChange={e => setEmailValue(e.target.value)}
        placeholder="votre@mail.com"
      />
      <button 
        disabled={!emailValue}
        onClick={onSubmitClicked}
      >Envoyer lien de récupération</button>
    </div>
  )
}

export default ForgotPassword
