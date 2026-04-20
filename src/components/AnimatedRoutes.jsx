import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import PageTransition from './PageTransition';
import HomeTransition from './HomeTransition';

// Keep light imports direct
import Home from "./Home/Home";
import Login from './Login/Login';
import SignUp from './Login/SignUp';
import NotFound from './404/404';
import PleaseVerifyEmail from './Email/PleaseVerifyEmail';
import { EmailVerificationLandingPage } from './Email/EmailVerificationLanding';
import ForgotPassword from './Login/ForgotPassword';
import { PrivateRoute } from './Auth/PrivateRoute';
import { RedirectRoute } from './Auth/RedirectRoute';
import { AdminRoute } from './Auth/AdminRoute';

// Lazy load heavy components
const Games = lazy(() => import('./Games/Games'));
const TicTacToe = lazy(() => import('./Games/TicTacToe'));
const Mascarade = lazy(() => import('./Games/Mascarade/Mascarade'));
const Undercover = lazy(() => import('./Games/Undercover/Undercover'));
const Board = lazy(() => import('./Games/Board'));
const Events = lazy(() => import('./Community/Events/Events'));
const Gamers = lazy(() => import('./Community/Gamers/Gamers'));
const Profile = lazy(() => import('./Profile/Profile'));
const UserProfile = lazy(() => import('./Profile/UserProfile'));
const Admin = lazy(() => import('./Admin/Admin'));
const Support = lazy(() => import('./Support/Support'));

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><div className="noxi-spinner"><div className="spinner-ring"><div className="ring"></div></div></div></div>}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeTransition><Home/></HomeTransition>} />
        <Route path="/games" element={<PageTransition><Games/></PageTransition>} />
        <Route path="/tictactoe" element={<PageTransition><TicTacToe/></PageTransition>} />
        <Route path="/tictactoe/:id" element={<PageTransition><TicTacToe/></PageTransition>} />
        <Route path="/tictactoe/:reach/:numberplayers" element={<PageTransition><TicTacToe/></PageTransition>} />

        <Route path="/mascarade" element={<PageTransition><Mascarade/></PageTransition>} />
        <Route path="/mascarade/:id" element={<PageTransition><Mascarade/></PageTransition>} />
        <Route path="/mascarade/:reach/:numberplayers" element={<PageTransition><Mascarade/></PageTransition>} />
        <Route path="/mascarade/:reach/:numberplayers/:mode" element={<PageTransition><Mascarade/></PageTransition>} />

        <Route path="/undercover" element={<PageTransition><Undercover/></PageTransition>} />
        <Route path="/undercover/:id" element={<PageTransition><Undercover/></PageTransition>} />
        <Route path="/undercover/:reach/:numberplayers" element={<PageTransition><Undercover/></PageTransition>} />
        <Route path="/undercover/:reach/:numberplayers/:difficulty" element={<PageTransition><Undercover/></PageTransition>} />

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
          <Route exact path='/admin' element={<PageTransition><Admin/></PageTransition>} />
        </Route>
        <Route path='/admin/*' element={<AdminRoute/>}>
          <Route path='*' element={<PageTransition><Admin/></PageTransition>} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound/></PageTransition>} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
