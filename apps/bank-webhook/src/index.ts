import express from "express";
import db from "@repo/db";
const app  = express();
app.post('/hdfcWebhook', async (req, res) => {
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.userId,
        amount: req.body.amount
    };
    await db.balance.update({
        where: {
            userId: paymentInformation.userId,
        },
        data: {
            amount: {
                increment: paymentInformation.amount
            }
        }
    });

    await db.OnRampTransaction ({
        where : {
            token: paymentInformation.token,
        },
        data: {
            status: "success"
        }
    })
    res.status(200).json({
        msg: "captured"
    })
});