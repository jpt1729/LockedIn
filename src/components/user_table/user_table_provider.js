// src/components/user_table/user_table_provider.js
"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "./socket";

const UserTableContext = createContext();

export function UserTableProvider({ children }) {
  const [userTableData, setUserTableData] = useState([]);
  const { socket, connected } = useSocket();
  const { data: session, status } = useSession();

  const addUser = useCallback((newUser) => {
    const { id, image, name } = newUser;
    if (!newUser || !id || !name) {
      console.error("addUser: Invalid newUser object", newUser);
      return;
    }
    
    setUserTableData((prevUserTableData) => {
      const duplicate = prevUserTableData.findIndex((user) => user.id === id);
      if (duplicate !== -1) {
        console.log(`Updating User ${id}`, newUser);
        prevUserTableData[duplicate] = {
          ...newUser,
          id: id,
          role: newUser.role || "",
          email: newUser.email || "",
          active: newUser.active || true,
          time_connected: new Date(),
        };
        return prevUserTableData;
      }

      console.log(`Adding new user: ${id} - ${name}`);
      return [
        ...prevUserTableData,
        {
          ...newUser,
          id: id,
          role: newUser.role || "",
          email: newUser.email || "",
          active: newUser.active || true,
          time_connected: new Date(),
        },
      ];
    });
  }, []);

  useEffect(() => {
    if (!connected || !socket) {
      return;
    }

    const handleMessage = (data) => {
      console.log("New message!", data);
    };

    const handleUserJoined = (data) => {
      console.log("Socket event: user-joined", data);
      if (data && data.user) {
        addUser(data.user);
      } else {
        console.error("user-joined event missing user data", data);
      }
    };

    const handleJoinedRoomDetails = (room) => {
      console.log("Socket event: joined-room-details", room);
      if (room && Array.isArray(room.clients)) {
        room.clients.forEach((client) => {
          addUser(client);
        });
      } else {
        console.error(
          "joined-room-details event missing room or clients data",
          room
        );
      }
    };

    const handleUpdateUser = (data) => {
      console.log("Socket event: update-user", data);
      addUser(data.update)
    };

    socket.on("message", handleMessage);
    socket.on("user-joined", handleUserJoined);
    socket.on("joined-room-details", handleJoinedRoomDetails);
    socket.on("update-user", handleUpdateUser);

    return () => {
      socket.off("message", handleMessage);
      socket.off("user-joined", handleUserJoined);
      socket.off("joined-room-details", handleJoinedRoomDetails);
      socket.off("update-user", handleUpdateUser);
    };
  }, [connected, socket, addUser]);

  useEffect(() => {
    if (status === "authenticated" && session && session.user) {
      console.log("Session authenticated, adding self:", session);

      const selfUser = {
        id: session.userId, // Make sure this matches the ID used by socket events
        name: session.user.name,
        image: session.user.image,
        email: session.user.email, // If you want to store email from session
        active: true,
      };
      addUser(selfUser);
    }
  }, [status, session, addUser]);

  const sendMessage = useCallback(
    (roomId, message) => {
      if (!connected || !socket) {
        console.warn("Socket not connected, cannot send message.");
        return;
      }
      socket.emit("message", { roomId, message });
    },
    [socket, connected]
  );
  const updateUser = useCallback(
    (update) => {
      if (!connected || !socket) {
        console.warn("Socket not connected, cannot send message.");
        return;
      }
      socket.emit("update-user", { update });
    },
    [socket, connected]
  );
  return (
    <UserTableContext.Provider
      value={{ addUser, updateUser, sendMessage, updateUser, userTableData, connected }}
    >
      {children}
    </UserTableContext.Provider>
  );
}

export function useUserTable() {
  const ctx = useContext(UserTableContext);
  if (!ctx) {
    throw new Error("useUserTable must be used within a UserTableProvider");
  }
  return ctx;
}
