import express from "express";
import db from "@repo/db";

const app = express();
app.use(express.json());

app.post("/hdfcWebhook", async (req, res) => {
  const { token, user_identifier, amount } = req.body;

  if (!token || !user_identifier || !amount) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const userId = Number(user_identifier);
  const numericAmount = Number(amount);

  if (isNaN(userId) || isNaN(numericAmount)) {
    return res.status(400).json({ message: "Invalid data types" });
  }

  try {
    const txn = await db.onRampTransaction.findUnique({
      where: { token },
    });

    if (!txn) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    
    // if (txn.status === "Success") {
    //   return res.json({ message: "Already processed" });
    // }

    await db.$transaction([
  db.onRampTransaction.update({
    where: { token },
    data: { status: "Success" },
  }),

  db.balance.upsert({
    where: { userId },
    update: {
      amount: { increment: numericAmount },
    },
    create: {
      userId,
      amount: numericAmount,
      locked: 0,
    },
  }),
]);


    return res.json({ message: "Captured" });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ message: "Error while processing webhook" });
  }
});
