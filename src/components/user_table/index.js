"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { useUserTable } from "./user_table_provider";
import { UserRow } from "./user_row";


export default function UserTable({}) {
  const { data: session, status } = useSession()

  const { socket, joinRoom, sendMessage, roomId } = useUserTable();

  useEffect(() => {
    if (!socket) return
    joinRoom("room123"); // or use dynamic room ID from params
  }, [socket, joinRoom]);

  return (
    <>
      <button
        onClick={() => {
          sendMessage("hi");
        }}
      >hi</button>
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
          <UserRow
            name={"John Pork"}
            role={"Student @ Raytheon"}
            email={"john.pork@gmail.com"}
            active={true}
            time_connected={new Date()}
          />
        </tbody>
      </table>
    </>
  );
}
