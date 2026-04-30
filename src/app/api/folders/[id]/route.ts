import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getUserId(req: NextRequest) {
  return req.cookies.get("session_user")?.value ?? null;
}

// DELETE a folder
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Move notes in this folder to unfiled
  await prisma.note.updateMany({
    where: { folderId: id, userId },
    data: { folderId: null },
  });
  await prisma.noteFolder.deleteMany({ where: { id, userId } });
  return NextResponse.json({ success: true });
}