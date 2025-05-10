"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";

const SocketContext = createContext({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }) {
  const [socketInstance, setSocketInstance] = useState(null); // Renamed to avoid confusion
  const [isConnected, setIsConnected] = useState(false);      // Renamed
  const { data: session, status } = useSession();

  useEffect(() => {
    let currentSocket = null; // To manage the socket instance within the effect

    const connectSocket = async () => {
      if (status === "authenticated" && session?.user) {
        try {
          console.log("Fetching dedicated socket token...");
          const response = await fetch('/api/socket-token'); // Call your new API endpoint

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch socket token (status: ${response.status})`);
          }

          const { socketToken } = await response.json();

          if (socketToken) {
            console.log("Attempting to connect WebSocket with dedicated socketToken...");

            // If an old socket instance exists from a previous session/token, disconnect it
            if (socketInstance) {
                socketInstance.disconnect();
            }

            currentSocket = io(process.env.NEXT_PUBLIC_WS_URL, {
              auth: { token: socketToken }, // Use the NEWLY fetched socketToken
              reconnectionAttempts: 3,
              // Important: force new connection if parameters change
              // forceNew: true, // Consider if needed, can cause multiple connections if not handled carefully
            });

            currentSocket.on("connect", () => {
              console.log("WebSocket connected:", currentSocket.id);
              setIsConnected(true);
            });

            currentSocket.on("disconnect", (reason) => {
              console.log("WebSocket disconnected:", reason);
              setIsConnected(false);
            });

            currentSocket.on("connect_error", (err) => {
              console.error("WebSocket connection error:", err.message, err.data || '');
              setIsConnected(false);
              // Potentially clear the socket or attempt a re-fetch of token if it's an auth error
              // For instance, if err.data indicates a token problem from the server.
            });

            setSocketInstance(currentSocket);

          } else {
            console.warn("Socket token received but was empty.");
          }
        } catch (error) {
          console.error("Error during socket connection setup:", error);
          setIsConnected(false);
          if (socketInstance) { // If there's an old instance, ensure it's cleaned up
            socketInstance.disconnect();
            setSocketInstance(null);
          }
        }
      } else if (status !== "loading" && socketInstance) {
        // If session is lost or user logs out, and a socket exists
        console.log("Session unauthenticated or lost, disconnecting existing socket.");
        socketInstance.disconnect();
        setSocketInstance(null);
        setIsConnected(false);
      }
    };

    connectSocket();

    // Cleanup function for when the component unmounts or dependencies change
    return () => {
      if (currentSocket) { // Use the closure's `currentSocket`
        console.log("Cleaning up socket connection in SocketProvider effect cleanup...");
        currentSocket.off("connect");
        currentSocket.off("disconnect");
        currentSocket.off("connect_error");
        currentSocket.disconnect();
      }
       // Also handle the state variable if it matches the one being cleaned up
      if (socketInstance && (!currentSocket || socketInstance.id === currentSocket?.id)) {
          setSocketInstance(null);
          setIsConnected(false);
      }
    };
  // Re-run when session status changes, or if session object itself changes (e.g., user logs in/out)
  }, [session, status]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, connected: isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (ctx === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return ctx;
}