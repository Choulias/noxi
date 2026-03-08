import { useNavigate } from "react-router-dom";

export const EmailVerificationFail = () => {
    const navigate = useNavigate();

    return(
        <div className="conteneur">
            <h1>La verification est un echec</h1>
            <p>
                Quelque chose s'est mal mal passé lors de la verification de votre mail
            </p>

            <button onClick={() => navigate("/signup")}>Aller sur la page d'inscription</button>
        </div>
    )
}