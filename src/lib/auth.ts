import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "用户名或邮箱" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier as string
        const password = credentials?.password as string
        if (!identifier || !password) return null

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ username: identifier }, { email: identifier }],
          },
        })
        if (!user) return null
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          image: user.avatar || null,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id    = user.id
        token.name  = user.name
        token.image = user.image
      }
      // 用户更新头像后手动刺新 session
      if (trigger === "update" && session?.image) {
        token.image = session.image
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id    = token.id as string
        session.user.name  = token.name
        session.user.image = token.image as string | null
      }
      return session
    },
  },
})
