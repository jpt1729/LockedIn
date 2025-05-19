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
import { useSocket } from "./socket"; // Assuming this is your custom socket hook

const UserTableContext = createContext();

export function UserTableProvider({ children }) {
  const [userTableData, setUserTableData] = useState([]);
  const { socket, connected } = useSocket();
  const { data: session, status } = useSession(); // Destructure data as session

  const addUser = useCallback((newUser) => {
    // Ensure newUser and its critical properties exist
    if (!newUser || !newUser.userId || !newUser.name) {
      console.error("addUser: Invalid newUser object", newUser);
      return;
    }

    const { userId, image, name } = newUser;

    setUserTableData((prevUserTableData) => {
      // Check if user already exists using the PREVIOUS state
      if (prevUserTableData.some((user) => user.id === userId)) {
        console.log(`User ${userId} already exists.`);
        return prevUserTableData; // Return previous state if user exists
      }
      console.log(`Adding new user: ${userId} - ${name}`);
      return [
        ...prevUserTableData,
        {
          // Spread newUser to include all its properties initially
          ...newUser,
          id: userId, // Ensure id is consistently userId
          role: newUser.role || "", // Use provided role or default
          email: newUser.email || "", // Use provided email or default
          active: true,
          time_connected: new Date(),
          // Make sure 'image' and 'name' are correctly picked up from newUser
          // If 'session' object has them under 'user', ensure it's mapped correctly before calling addUser
        },
      ];
    });
  }, []); // No need for userTableData in dependencies when using functional updates

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
        // It's good practice to ensure the structure of data.user matches what addUser expects
        // or transform it here. For example, if socket sends 'id' instead of 'userId'.
        addUser(data.user);
      } else {
        console.error("user-joined event missing user data", data);
      }
    };

    const handleJoinedRoomDetails = (data) => {
      console.log("Socket event: joined-room-details", data);
      if (data && data.room && Array.isArray(data.room.clients)) {
        data.room.clients.forEach((client) => {
          // Again, ensure 'client' object structure is what 'addUser' expects
          // e.g., if 'client' has 'id' but 'addUser' expects 'userId'
          addUser(client);
        });
      } else {
        console.error("joined-room-details event missing room or clients data", data);
      }
    };

    socket.on("message", handleMessage);
    socket.on("user-joined", handleUserJoined);
    socket.on("joined-room-details", handleJoinedRoomDetails);

    // Cleanup function to remove event listeners
    return () => {
      socket.off("message", handleMessage);
      socket.off("user-joined", handleUserJoined);
      socket.off("joined-room-details", handleJoinedRoomDetails);
    };
  }, [connected, socket, addUser]);

  useEffect(() => {
    if (status === "authenticated" && session && session.user) {
      console.log("Session authenticated, adding self:", session);
      // Adapt the session.user object to match the expected structure for addUser
      // Assuming session.user has 'id', 'name', 'image', 'email'

      const selfUser = {
        userId: session.userId, // Make sure this matches the ID used by socket events
        name: session.user.name,
        image: session.user.image,
        email: session.user.email, // If you want to store email from session
        // Add any other relevant properties from session.user
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

  return (
    <UserTableContext.Provider
      value={{ addUser, sendMessage, userTableData, connected }}
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