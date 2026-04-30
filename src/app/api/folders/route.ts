import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getUserId(req: NextRequest) {
  return req.cookies.get("session_user")?.value ?? null;
}

// GET all folders
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folders = await prisma.noteFolder.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(folders);
}

// POST create a folder
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  const folder = await prisma.noteFolder.create({
    data: { userId, name },
  });
  return NextResponse.json(folder, { status: 201 });
}