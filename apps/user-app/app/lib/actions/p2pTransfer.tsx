"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import db from "@repo/db"
import { error } from "console";
 
export async function p2pTransfer(to: string, amount: number) {
    const session = getServerSession(authOptions);
    const from = session?.user?.id;
    if(!from) {
        return {
            msg: "Error while sending txn"
        }
    }

    const toUser = await db.user.findFirst({
        where: {
            number: to
        }
    });
    if(!toUser) {
        return {
            msg: "user not found"
        }
    }
    await db.$transaction(async (txn) => {
        //locking
         await txn.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;

          const fromBalance = await txn.balance.findUnique({
            where: {
                userId: Number(from)
            }
          });
          if(!fromBalance || fromBalance.amount < amount) {
            throw new Error("Insufficent Balance");
          }
          await txn.balance.update({
            where: {userId: Number(from)},
            data: {amount: {decrement: amount}},
          });
     await txn.balance.update({
        where : {userId: toUser.id},
        data: {amount: {increment: amount}}
     })

    })

}