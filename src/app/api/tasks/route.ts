import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getUserId(req: NextRequest) {
  return req.cookies.get("session_user")?.value ?? null;
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assignments = await prisma.assignment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, notes, dueDate, priority, className, dueTime } = await req.json();
  const assignment = await prisma.assignment.create({
    data: {
      userId,
      title,
      notes: notes || "",
      className: className || "",
      dueTime: dueTime || "",
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      priority: priority || "MEDIUM",
    },
  });
  return NextResponse.json(assignment, { status: 201 });
}