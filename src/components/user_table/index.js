"use client";
import { useUserTable } from "./user_table_provider";
import { useSession } from "next-auth/react";
import { UserRow } from "./user_row";
import { SelfRow } from "./self_row";

export default function UserTable({}) {
  const { userTableData, updateUser } = useUserTable();
  const { data: session, status } = useSession();
  return (
    <>
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
          <SelfRow/>
          {userTableData &&
            userTableData.map((data) => {
              return <UserRow key={data.id} {...data} />;
            })}
        </tbody>
      </table>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateUser({ role: e.target.elements.role.value });
          console.log(e.target.elements.role.value);
        }}
      >
        <input name="role" type="text" />
        <input type="submit" />
      </form>
    </>
  );
}
