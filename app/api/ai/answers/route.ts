import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log(await req.json());
  return NextResponse.json({ success: true, data: "Test" }, { status: 200 });
}
