// src/components/user_table/user_table_provider.js
"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback, 
  useRef // Add useRef
} from "react";
import { io } from 'socket.io-client';
import { useSession } from "next-auth/react";

const UserTableContext = createContext();

export function UserTableProvider({ children }) {
    
  const { data: session } = useSession();
  const socketRef = useRef(null); 
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState(null);

  
  // --- Socket Action Callbacks (use socketRef.current) ---
  const joinRoom = useCallback((roomId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join-room", { roomId });
    } else {
      console.warn("Socket not connected, cannot join room.");
    }
  }, []); // Depends only on socketRef which is stable

  const sendMessage = useCallback((roomId, message) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message", { roomId, message });
    } else {
      console.warn("Socket not connected, cannot send message.");
    }
  }, []);


  return (
    <UserTableContext.Provider
      // Pass down the stable ref value and connection status
      value={{ socket: socketRef.current, isConnected, joinRoom, sendMessage, room }}
    >
      {children}
    </UserTableContext.Provider>
  );
}

export function useUserTable() {
  const ctx = useContext(UserTableContext);
  if (!ctx)
    throw new Error("useUserTable must be used within a UserTableProvider");
  return ctx;
}
