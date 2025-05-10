"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { useSocket } from "./socket";
import { useUserTable } from "./user_table_provider";
import { UserRow } from "./user_row";

export default function UserTable({}) {
  const { data: session } = useSession();

  const { connected, joinRoom, sendMessage, userTableData } = useUserTable();

  useEffect(() => {
    if (connected) {
      joinRoom("room123"); // or use dynamic room ID from params
    }
  }, [joinRoom, connected]);

  return (
    <>
      <button
        onClick={() => {
          sendMessage("room123", "Hi hi!");
        }}
        className="cursor-pointer p-4 bg-amber-300"
      >
        hi
      </button>
      <table className="w-full">
        <thead>
          <tr>
            <th></th>
            <th className="font-normal border-gray border-b-2">Name</th>
            <th className="font-normal border-gray border-b-2">Role</th>
            <th className="font-normal border-gray border-b-2">Email</th>
            <th className="font-normal border-gray border-b-2">Status</th>
            <th className="font-normal border-gray border-b-2">
              Time Connected
            </th>
          </tr>
        </thead>
        <tbody>
          {userTableData &&
            userTableData.map((data) => {
              return (
                <UserRow
                  key={data.id}
                  {...data}
                />
              );
            })}
        </tbody>
      </table>
    </>
  );
}
