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

const UserTableContext = createContext(null);

export function UserTableProvider({ children }) {
    
  const { data: session, status } = useSession();
  // Use refs for socket instance to avoid triggering effects on change
  const socketRef = useRef(null); 
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); // Flag to prevent multiple attempts
  const [room, setRoom] = useState(null);

  // Store accessToken in a ref to stabilize dependencies if needed
  const accessTokenRef = useRef(session?.accessToken);
  useEffect(() => {
    accessTokenRef.current = session?.accessToken;
  }, [session?.accessToken]);


  // --- Define Connection Logic ---
  const connect = useCallback(() => {
    // Prevent connection if not authenticated, no token, already connected, or already connecting
    if (status !== 'authenticated' || !accessTokenRef.current || socketRef.current?.connected || isConnecting) {
      // console.log("Connect condition not met:", {status, token: !!accessTokenRef.current, connected: socketRef.current?.connected, isConnecting});
      return;
    }

    console.log("Attempting to connect WebSocket with token..."); // Log only once per attempt
    setIsConnecting(true); // Set connecting flag

    const token = accessTokenRef.current; // Get token from ref
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: { token },
      // Optional: Prevent auto-reconnection if auth fails often
      // reconnectionAttempts: 3, 
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully:', newSocket.id);
      socketRef.current = newSocket; // Store in ref
      setIsConnected(true);
      setIsConnecting(false); // Clear connecting flag
      // Emit join-room or other initial events here if needed
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      if (err.message.includes("Authentication error")) {
         console.error("WebSocket Authentication Failed.");
         // Maybe trigger signout if auth repeatedly fails? signOut();
      }
      setIsConnected(false);
      setIsConnecting(false); // Clear connecting flag
      newSocket.disconnect(); // Clean up the failed socket attempt
      socketRef.current = null; // Clear ref on error
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      // Only clear state if the disconnected socket is the current one
      if (socketRef.current === newSocket) { 
          socketRef.current = null;
          setIsConnected(false);
          setIsConnecting(false); 
      }
      // Optional: Attempt reconnect based on reason?
      // if (reason !== 'io client disconnect') {
      //   // Maybe try reconnecting after a delay
      // }
    });

    // Add other listeners ('message', 'user_joined', etc.)
    // ...
    
  }, [status, isConnecting]); // Dependencies: status, isConnecting (accessTokenRef is stable)


  // --- Define Disconnection Logic ---
  const disconnect = useCallback(() => {
      if (socketRef.current) {
          console.log("Disconnecting socket manually...");
          socketRef.current.disconnect();
          socketRef.current = null;
          setIsConnected(false);
          setIsConnecting(false);
      }
  }, []); // No dependencies needed


  // --- Effect to Manage Connection Based on Auth Status ---
  useEffect(() => {
    if (status === 'authenticated' && accessTokenRef.current && !socketRef.current && !isConnecting) {
      // If authenticated, have token, not connected, and not currently connecting: try connecting
      connect();
    } else if (status !== 'authenticated' && socketRef.current) {
      // If no longer authenticated and socket exists: disconnect
      disconnect();
    }

    // Cleanup function: disconnect when the provider unmounts
    return () => {
      disconnect();
    };
    // Dependencies: status, connect, disconnect. accessToken is handled via ref.
  }, [status, connect, disconnect]);
  
  
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
  }, []); // Depends only on socketRef which is stable
  // --- ---


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
