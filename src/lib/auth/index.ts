/**
 * Auth.js (NextAuth v5) 配置
 * MVP：邮箱 Magic Link（无密码登录）。
 * 预留多用户扩展，后续可加 GitHub/Google OAuth 或凭据登录。
 */

import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    // Magic link 登录（需配置 Resend API key）
    // 开发阶段可临时改用 Credentials provider
    Resend({
      from: "noreply@tju.app",
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
