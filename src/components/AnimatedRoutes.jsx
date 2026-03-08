import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';
import HomeTransition from './HomeTransition';

import Home from "./Home/Home";
import Support from "./Support/Support";
import Games from './Games/Games';
import Profile from "./Profile/Profile";
import UserProfile from './Profile/UserProfile';
import Admin from './Admin/Admin';
import NotFound from './404/404';
import Login from './Login/Login';
import SignUp from './Login/SignUp';
import PleaseVerifyEmail from './Email/PleaseVerifyEmail';
import { EmailVerificationLandingPage } from './Email/EmailVerificationLanding';
import ForgotPassword from './Login/ForgotPassword';
import { PrivateRoute } from './Auth/PrivateRoute';
import { RedirectRoute } from './Auth/redirectRoute';
import Board from './Games/Board';
import TicTacToe from './Games/TicTacToe';
import { AdminRoute } from './Auth/AdminRoute';
import PlayersList from './Admin/PlayersList/PlayersList';
import GameModelsList from './Admin/GamesList/GameModelsList';
import EventsList from './Admin/EventsList/EventsList';
import Events from './Community/Events/Events';
import Gamers from './Community/Gamers/Gamers';

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeTransition><Home/></HomeTransition>} />
        <Route path="/games" element={<PageTransition><Games/></PageTransition>} />
        <Route path="/tictactoe" element={<PageTransition><TicTacToe/></PageTransition>} />
        <Route path="/tictactoe/:id" element={<PageTransition><TicTacToe/></PageTransition>} />
        <Route path="/tictactoe/:reach/:numberplayers" element={<PageTransition><TicTacToe/></PageTransition>} />

        <Route path="/events" element={<PageTransition><Events/></PageTransition>} />
        <Route path="/events/:model" element={<PageTransition><Events/></PageTransition>} />

        <Route path="/players" element={<PageTransition><Gamers/></PageTransition>} />
        <Route path="/support" element={<PageTransition><Support/></PageTransition>} />

        <Route exact path='/login' element={<RedirectRoute/>}>
          <Route path="/login" element={<PageTransition><Login/></PageTransition>} />
        </Route>
        <Route exact path='/forgot-password' element={<RedirectRoute/>}>
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword/></PageTransition>} />
        </Route>
        <Route exact path='/signup' element={<RedirectRoute/>}>
          <Route path="/signup" element={<PageTransition><SignUp/></PageTransition>} />
        </Route>

        <Route path="/please-verify" element={<PageTransition><PleaseVerifyEmail/></PageTransition>} />
        <Route path="/verify-mail/:verificationString" element={<PageTransition><EmailVerificationLandingPage/></PageTransition>}/>

        <Route exact path='/myprofile' element={<PrivateRoute/>}>
          <Route exact path='/myprofile' element={<PageTransition><UserProfile/></PageTransition>}/>
        </Route>

        <Route exact path='/profile/:username' element={<PageTransition><Profile/></PageTransition>}/>

        <Route exact path='/admin' element={<AdminRoute/>}>
          <Route exact path='/admin' element={<PageTransition><Admin/></PageTransition>}>
            <Route path="/admin/players" element={<PlayersList/>} />
            <Route path="/admin/games" element={<GameModelsList/>} />
            <Route path="/admin/events" element={<EventsList/>} />
          </Route>
        </Route>

        <Route path="*" element={<PageTransition><NotFound/></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}
