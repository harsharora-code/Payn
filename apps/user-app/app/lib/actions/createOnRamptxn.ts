"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db";
import { error } from "console";

export async function createOnRampTransaction(amount: number, provider: string) {
  const session = await getServerSession(authOptions);
  const userId = session.user.id;

  const token = Math.random().toString();

  await prisma.onRampTransaction.create({
    data: {
      userId: Number(userId),
      amount,
      status: "Processing",
      startTime: new Date(),
      provider,
      token,
    },
  });

  try {
  const res =  await fetch("http://localhost:3003/hdfcWebhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      user_identifier: userId,
      amount,
    }),
  });
  if(!res.ok) {
    throw new Error("webhook server failed")
  }
} catch(e) {
console.log(e)
}

  return { message: "On ramp transaction added" };
}
