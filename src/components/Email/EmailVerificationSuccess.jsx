import { useNavigate } from "react-router-dom";

export const EmailVerificationSuccess = () => {
    const navigate = useNavigate();

    return(
        <div className="conteneur">
            <h1>La verification est un succès !</h1>
            <p>
                Merci d'avoir verifier votre email, maintenant vous pouvez modifier accéder librement au site !
            </p>

            <button onClick={() => navigate("/myprofile")}>Aller sur ma page de profil</button>
        </div>
    )
}