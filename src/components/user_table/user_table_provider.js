"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";

import { useSession } from "next-auth/react";

const UserTableContext = createContext(null);

export function UserTableProvider({ children }) {
  const { data: session } = useSession();
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    let socket = null; // Use a local variable for the socket instance within this effect run
  
    // Connect only when the user session exists
    if (session) {
      console.log("Session exists, initializing socket connection...");
      // Optionally pass auth tokens if your server needs them
      // const socketOptions = { auth: { token: session.accessToken } }; // Example
      socket = io(process.env.NEXT_PUBLIC_WS_URL /*, socketOptions */ ); 
      socketRef.current = socket; // Store the instance in the ref
  
      socket.on("connect", () => {
        console.log("✅ Connected:", socket.id);
        // Maybe auto-join room if roomId is already known?
        // if(roomId) {
        //    socket.emit("join-room", { roomId: roomId, user: session });
        // }
      });
  
      socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected:", reason);
        // Optionally clear roomId state on disconnect
        // setRoomId(null);
      });
  
      socket.on("connect_error", (err) => {
        console.error("🔌 Connection Error:", err.message);
      });
  
      socket.on("message", (data) => {
        console.log("📨 Received message:", data);
      });
  
      socket.on("user-joined", ({roomId, user}) => {
        console.log("👤 User joined room:", user);
      });
  
    } else {
      // If there's no session, ensure the ref is null
      socketRef.current = null; 
      console.log("No session, socket connection not initiated/needed.");
    }
  
    // Cleanup function: runs when session changes OR component unmounts
    return () => {
      // Disconnect the socket instance created in *this specific effect run*
      if (socket) { 
        console.log("Disconnecting socket due to session change or unmount...");
        socket.disconnect();
      }
      // Ensure the ref is cleared if it holds the socket we just disconnected
      if (socketRef.current === socket) {
          socketRef.current = null;
      }
    };
  }, [session]); // Re-run effect when session changes

  const joinRoom = useCallback(
    (id) => {
      setRoomId(id);
      socketRef.current?.emit("join-room", { roomId: id, user: session });
    },
    [socketRef, session]
  );

  const sendMessage = useCallback(
    (msg) => {
      // Consider wrapping in useCallback
      // Check if we have a room ID AND the socket exists AND is connected
      if (roomId && socketRef.current?.connected) {
        console.log(`Sending message to room ${roomId}: ${msg}`); // Add log
        socketRef.current.emit("message", {
          roomId: roomId, // <-- Use the dynamic roomId state here
          message: msg,
        });
      } else if (!roomId) {
        console.log("Cannot send message: No room joined.");
      } else {
        console.log("Cannot send message: Socket not connected.");
      }
    },
    [roomId]
  ); // Dependency array includes roomId

  return (
    <UserTableContext.Provider
      value={{ socket: socketRef.current, joinRoom, sendMessage, roomId }}
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
