"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationsProvider } from "./notifications/notifications_provider";
import { UserTableProvider } from "./user_table/user_table_provider";
import { SocketProvider } from "./user_table/socket";

function AppProviders({ children }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <NotificationsProvider>
          <UserTableProvider>{children}</UserTableProvider>
        </NotificationsProvider>
      </SocketProvider>
    </SessionProvider>
  );
}

export { AppProviders };
