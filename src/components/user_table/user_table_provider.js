"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { socket } from "./socket";
import { useSession } from "next-auth/react";

const UserTableContext = createContext(null);

export function UserTableProvider({ children }) {
    
  const { data: session } = useSession();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    socket.on('message', (data) => {
      console.log('message recived!')
      console.log(data)
    })
  }, [])

  const joinRoom = useCallback(() => {
    if (!(socket.connected && session)){
      return;
    }
    socket.emit("join-room", {roomId: "r00m123", user: session.user})
  }, [session])

  const sendMessage = useCallback(() => {
    if (!(socket.connected && session)){
      return;
    }
    console.log("Sending message!")
    socket.emit("message", {roomId: "r00m123", message: 'hi hi!'})
  }, [session])
  return (
    <UserTableContext.Provider
      value={{ socket: socket, joinRoom: joinRoom, sendMessage: sendMessage, room: '' }}
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
