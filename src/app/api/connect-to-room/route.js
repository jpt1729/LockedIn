import { auth } from "@/utils/auth";
import { NextResponse } from "next/server";

import { getClientIp } from "@/utils/getClientIp";

import { prisma } from "@/utils/prisma";

export const POST = auth(async function POST(req) {
  const ip = getClientIp(req);
  if (!req.auth)
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

  const user = req.auth.user;
  // Check that a room exists
  // if it doesn't exist make a new room
  const room = await prisma.room.upsert({
    where: { ip: ip },
    update: {}, // no update if it already exists
    create: {
      ip: ip,
    },
  });

  const client = await prisma.client.upsert({
    where: {
      clientId: {
        roomId: room.id,
        userId: user.id,
      },
    },
    update: { active: true }, // no update if it already exists
    create: {
      userId: user.id,
      roomId: room.id,

      name: user.name,
      image: user.image,
      //email: user.email,

      active: true,
    },
  });
  // make a new client to connect to that room
  // check if there already is a client connected to the room
  // if there isn't a client make a new client and connect it to the room
  return NextResponse.json({ client: client }, { status: 200 });
});
