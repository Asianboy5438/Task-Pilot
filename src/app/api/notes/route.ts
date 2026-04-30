import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getUserId(req: NextRequest) {
  return req.cookies.get("session_user")?.value ?? null;
}

// GET all notes for the logged-in user
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
}

// POST create a new note
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, folderId } = await req.json();
  const note = await prisma.note.create({
    data: { userId, title, folderId: folderId || null, content: "" },
  });
  return NextResponse.json(note, { status: 201 });
}