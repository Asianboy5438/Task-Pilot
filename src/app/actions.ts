"use server"
import { prisma } from "../lib/prisma"; // You'll need to create a simple prisma client file
import { revalidatePath } from "next/cache";

export async function addTask(formData: FormData) {
  const title = formData.get("title") as string;
  const status = formData.get("status") as string;

  await prisma.task.create({
    data: { title, status },
  });

  revalidatePath("/"); // This refreshes the page automatically
}