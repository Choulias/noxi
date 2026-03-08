import { useState, useEffect} from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import api from '../../api';
import { useToken } from '../Auth/useToken';
import { EmailVerificationSuccess } from './EmailVerificationSuccess';
import { EmailVerificationFail } from './EmailVerificationFail';

export const EmailVerificationLandingPage = () => {

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const { verificationString } = useParams();
    const [,setToken] = useToken();

    useEffect(() => {
        const loadVerification = async() =>{
            try{
                const res = await api.put(`/users/verify-mail/${verificationString}`,{
                    verificationString: verificationString
                });

                if(res.data.message){
                    // console.log(res);
                }else{
                    const { token } = res.data;
                    setToken(token);
                    setIsSuccess(true);
                    setIsLoading(false);
                }
            }catch(err){
                setIsSuccess(false);
                setIsLoading(false);
            }
        }
        loadVerification();
    }, [setToken, verificationString]);

    if(isLoading) return <p>Loading...</p>
    if(isSuccess) return <EmailVerificationSuccess/>
    return <EmailVerificationFail/>

}