// src/components/user_table/user_table_provider.js
"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { useSocket } from "./socket";

const UserTableContext = createContext();

const addUser = (userTableData, newUser) => {
  const { id, image, name, socketId } = newUser;
  if (!id || !name || !socketId) {
    // error
    return;
  }
  if (userTableData.some(user => user.id === id)) {
    // ensures new user
    return;
  }
  return [...userTableData, {...newUser, role: "", email: "", active: true, time_connected: new Date()}]
};

export function UserTableProvider({ children }) {
  const [userTableData, setUserTableData] = useState([
    {
      id: "aaaaaa",
      name: "John Pork",
      role: "Intern @ Raytheon",
      email: "johnny.pork@raytheon.com",
      active: true,
      time_connected: new Date(2025, 4, 9, 12, 0, 0),
    },
  ]);
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!connected) {
      return;
    }
    socket.on("message", (data) => {
      console.log("New message!");
      console.log(data);
    });
    socket.on("user-joined", (data) => {
      console.log("user joined room!");
      console.log(data);
      setUserTableData(addUser(userTableData, data.user))
    });
  }, [connected, socket]);

  const joinRoom = useCallback(
    (roomId) => {
      if (!connected) {
        console.warn("Socket not connected, cannot join room.");
        return;
      }

      socket.emit("join-room", { roomId });
    },
    [socket, connected]
  ); // Depends only on socketRef which is stable

  const sendMessage = useCallback(
    (roomId, message) => {
      if (!connected) {
        console.warn("Socket not connected, cannot send message.");
        return;
      }

      socket.emit("message", { roomId, message });
    },
    [socket, connected]
  );

  return (
    <UserTableContext.Provider
      // Pass down the stable ref value and connection status
      value={{ joinRoom, sendMessage, userTableData, connected }}
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
