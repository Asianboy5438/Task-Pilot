import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getUserId(req: NextRequest) {
  return req.cookies.get("session_user")?.value ?? null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  // Convert isComplete boolean if present
  if (data.isComplete !== undefined) {
    await prisma.assignment.updateMany({
      where: { id, userId },
      data: { isComplete: data.isComplete },
    });
  } else {
    await prisma.assignment.updateMany({
      where: { id, userId },
      data: {
        title: data.title,
        notes: data.notes,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.assignment.deleteMany({ where: { id, userId } });
  return NextResponse.json({ success: true });
}