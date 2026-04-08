import { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [gameChatMessages, setGameChatMessages] = useState([]);
  const [activeGameId, setActiveGameId] = useState(null);
  const [wsRef, setWsRef] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);
  const closeChat = useCallback(() => setIsOpen(false), []);

  const addGameMessage = useCallback((message) => {
    setGameChatMessages(prev => [...prev, message]);
  }, []);

  const clearGameMessages = useCallback(() => {
    setGameChatMessages([]);
  }, []);

  const joinGame = useCallback((gameId, ws, cId) => {
    setActiveGameId(gameId);
    setWsRef(ws);
    setClientId(cId);
    setGameChatMessages([]);
  }, []);

  const leaveGame = useCallback(() => {
    setActiveGameId(null);
    setWsRef(null);
    setClientId(null);
    setGameChatMessages([]);
  }, []);

  return (
    <ChatContext.Provider value={{
      isOpen, toggleChat, closeChat,
      gameChatMessages, addGameMessage, clearGameMessages,
      activeGameId, wsRef, clientId,
      joinGame, leaveGame,
      unreadCount, setUnreadCount
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
