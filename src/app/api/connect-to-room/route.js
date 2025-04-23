import { auth } from "@/app/auth"
import { NextResponse } from "next/server"
 
export const POST = auth(function POST(req) {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded.split(',')[0]
  console.log(forwarded)
  console.log(req.auth)
  if (req.auth) return NextResponse.json(req.auth)
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})

export const GET = auth(function GET(req) {
  const forwarded = req.headers
  console.log(forwarded)
  console.log(req.auth)
  if (req.auth) return NextResponse.json(req.auth)
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})

