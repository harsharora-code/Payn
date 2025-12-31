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
    await db.$transaction([
      // 1️⃣ Mark transaction as successful
      db.onRampTransaction.update({
        where: { token },
        data: { status: "Success" },
      }),

      // 2️⃣ Ensure balance exists and increment
      db.balance.upsert({
        where: { userId },
        update: {
          amount: {
            increment: numericAmount,
          },
        },
        create: {
          userId,
          amount: numericAmount,
        },
      }),
    ]);

    return res.json({ message: "Captured" });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ message: "Error while processing webhook" });
  }
});

app.listen(3003, () => {
  console.log("Bank webhook running on port 3003");
});
