import {} from 'react'
import './scss/input.scss'
import {BrowserRouter} from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material';
import { frFR } from '@mui/material/locale';

import Nav from './components/Nav/Nav';
import Footer from './components/Footer/Footer';
import GlobalInfo from './components/GlobalInfo';
import AnimatedRoutes from './components/AnimatedRoutes';
import { ToastProvider } from './components/UI/Toast';
import { ChatProvider, useChat } from './components/Chat/ChatContext';
import ChatBubble from './components/Chat/ChatBubble';
import ChatDrawer from './components/Chat/ChatDrawer';
import { useUser } from './components/Auth/useUser';

// Modification de Material UI -----------------
const muiTheme = createTheme({
  palette: {
    primary: { main: '#95FDFC'},
    secondary: { main: '#FEBEFD' },
    mode: 'dark',
  },
},
frFR, // Changement de langue en francais des textes MUI
);

function ChatBubbleWrapper() {
  const user = useUser();
  const {
    isOpen, toggleChat, closeChat,
    gameChatMessages, activeGameId, wsRef, clientId,
    unreadCount, setUnreadCount
  } = useChat();

  return (
    <>
      <ChatBubble
        isOpen={isOpen}
        onToggle={toggleChat}
        user={user}
        unreadCount={unreadCount}
        setUnreadCount={setUnreadCount}
      />
      <ChatDrawer
        isOpen={isOpen}
        onClose={closeChat}
        user={user}
        gameId={activeGameId}
        wsRef={wsRef}
        gameChatMessages={gameChatMessages}
        clientId={clientId}
      />
    </>
  );
}

function App() {

  return (
    // Thème modifié pour Matérial UI
    <ThemeProvider theme={muiTheme}>
      <BrowserRouter>
        <ChatProvider>
          <ToastProvider>
            <GlobalInfo>
              <Nav/>
              <AnimatedRoutes/>
              <Footer/>
            </GlobalInfo>
          </ToastProvider>
          <ChatBubbleWrapper />
        </ChatProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
