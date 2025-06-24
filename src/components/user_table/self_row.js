"use client";
import { useState } from "react";
import StyledLink from "../styled_components/link";
import { motion, AnimatePresence } from "motion/react";
import ToolTip from "../tooltip";

const formatDate = (d) =>
  `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} @ ${
    ((d.getHours() + 11) % 12) + 1
  }:${d.getMinutes().toString().padStart(2, "0")}${
    d.getHours() >= 12 ? "pm" : "am"
  }`;

function Edit({ children, value, onChange, ...props }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <>
      <ToolTip delay={550} tooltip={"click to edit"} disabled={focused}>
        <div
          onMouseEnter={() => {
            setTimeout(() => {
              setHovered(true);
            }, 150);
          }}
          onMouseLeave={() => {
            setHovered(false);
          }}
          className={`${
            (hovered && !focused) && "bg-[#4B6F44]/10"
          } rounded-[2px] flex items-center pl-3 pr-2`}
        >
          <AnimatePresence>
            {(hovered && !focused) && (
              <motion.div className="w-1 rounded-full h-full max-h-6 bg-[#4B6F44] absolute -translate-x-[12px]" />
            )}
          </AnimatePresence>
          <input
            onFocus={() => {
              setFocused(true);
            }}
            onBlur={() => {
              setFocused(false);
            }}
            type="text"
            className="border-0 bg-transparent p-0 text-inherit outline-none focus:ring-0 focus:shadow-[0_1px_0_currentColor] w-auto min-w-0"
            style={{ width: `${value?.length || 1}ch` }}
            value={value || ""}
            onChange={(e) => {
              onChange(e);
            }}
          />
        </div>
      </ToolTip>
    </>
  );
}

function NameChip({ name, linkedin_profile, onChange }) {
  // update styled links
  return (
    <div className="flex justify-center">
      <StyledLink href={linkedin_profile} className={"flex gap-1"}>
        <div className="w-6 h-6 bg-amber-700 rounded-full" />
        <span>{name && name}</span>
      </StyledLink>
    </div>
  );
}

export function SelfRow({}) {
  const [user, setUser] = useState({
    name: "John Tan-Aristy",
    role: "Student",
    email: "john.tanaristy@gmail.com",
    active: true,
    time_connected: new Date(),
  });

  const { name, role, email, active, time_connected } = user;

  return (
    <tr className="gap-4">
      <td>
        <div className="flex justify-center">
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="aspect-square w-3 rounded-xs border-gray border-2 peer-checked:bg-blue-600 peer-checked:border-blue-600">
              <svg
                className="w-3 h-3 text-white hidden peer-checked:block"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </label>
        </div>
      </td>
      <td>
        <div className="flex justify-center">
          <NameChip
            name={name}
            linkedin_profile={""}
            onChange={(e) => {
              console.log(e);
              setUser({ ...user, name: e.target.value });
            }}
          />
        </div>
      </td>
      <td>
        <div className="flex justify-center">
          <Edit
            value={role}
            onChange={(e) => setUser({ ...user, role: e.target.value })}
          />
        </div>
      </td>
      <td>
        <div className="flex justify-center">
          <span>{email && email}</span>
        </div>
      </td>
      <td>
        <div className="flex justify-center">
          <div className="flex gap-1 items-center">
            <div className="w-4 h-4 bg-success-green rounded-full" />
            <span>Active</span>
          </div>
        </div>
      </td>

      <td>
        <div className="flex justify-center">
          <span>{time_connected && formatDate(time_connected)}</span>
        </div>
      </td>
    </tr>
  );
}
