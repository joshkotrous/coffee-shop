import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logout successful" });

  response.cookies.set("token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    secure: true,
    sameSite: "Lax",
  });

  return response;
}
