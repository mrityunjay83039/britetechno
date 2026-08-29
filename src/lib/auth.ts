import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).lean();

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordMatch) {
          throw new Error('Incorrect password');
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email address before logging in.');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'bhavatsyam-luxury-secret-key-32-chars-long-secure-token',
  },
  secret: process.env.NEXTAUTH_SECRET || 'bhavatsyam-luxury-secret-key-32-chars-long-secure-token',
  logger: {
    error(code, metadata) {
      if (code === 'JWT_SESSION_ERROR') {
        // Stale browser session cookie from previous secret/session; safe to ignore
        return;
      }
      console.error(`[next-auth][error][${code}]`, metadata);
    },
  },
};
