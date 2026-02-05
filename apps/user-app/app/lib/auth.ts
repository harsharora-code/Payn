import db from "@repo/db"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt";
import Email from "next-auth/providers/email";

export const authOptions = {
    providers: [
      CredentialsProvider({
          name: 'Credentials',
          credentials: {
            email : {label : "enter your email", type: "text", placeholder: "yourname@example.com"},
            username : {label: "username", type: "text", placeholder: "username"},
            phone: { label: "Phone Number", type: "text", placeholder: "9112345678", required: true },
            password: { label: "Password", type: "password", required: true }
          },
          // TODO: User credentials type from next-auth
          async authorize(credentials: any) {
            if(!credentials?.phone || !credentials?.password) return  null;
            // Do zod validation, OTP validation here
          

             try {
          const existingUser = await db.user.findFirst({
            where: {
              number: credentials.phone,
            },
          });

          if (existingUser) {
            const isValid = await bcrypt.compare(
              credentials.password,
              existingUser.password
            );

            if (!isValid) return null;

            return {
              id: String(existingUser.id),
              name: existingUser.name,
              email: existingUser.number,
            };
          }

          
          const hashedPassword = await bcrypt.hash(credentials.password, 10);

          const user = await db.user.create({
            data: {
              email: credentials.email ?? null,
              name: credentials.username ?? null,
              number: credentials.phone,
              password: hashedPassword,
            },
          });

          return {
            id: String(user.id),
            name: user.name,
            email: user.number,
          };
        } catch (error) {
          console.error("Auth DB error:", error);
          return null; // prevents redirect crash
        }

          },
        })
    ],
    secret: process.env.JWT_SECRET || "secret",
    callbacks: {
        // TODO: can u fix the type here? Using any is bad
        async session({ token, session }: any) {
            session.user.id = token.sub

            return session
        }
    }
  }