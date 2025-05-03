"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationsProvider } from "./notifications/notifications_provider";
import { UserTableProvider } from "./user_table/user_table_provider";
function AppProviders({ children }) {
  return (
    <SessionProvider>
      <NotificationsProvider>
        <UserTableProvider>{children}</UserTableProvider>
      </NotificationsProvider>
    </SessionProvider>
  );
}

export { AppProviders };
