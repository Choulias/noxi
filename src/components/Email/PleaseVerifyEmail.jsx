import { React, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PleaseVerifyEmail() {
    const navigate = useNavigate();

    useEffect (() => {
        setTimeout(()=>{
            navigate("/myprofile");
        }, 3000)
    })
  return (
    
    <div className="conteneur">
        <h1>Merci pour votre inscription</h1>
        <p>
            Un mail de vérification a été envoyé au mail que vous avez mentionné.
            Veuillez verifier votre mail pour accéder librement au site.
        </p>
    
    </div>
  )
}
