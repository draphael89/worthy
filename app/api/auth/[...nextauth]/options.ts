import { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { FirebaseAuthService } from '@/services/FirebaseAuthService';
import { FirebaseError } from 'firebase/app';
import { getServerSession } from 'next-auth/next';

const log = (message: string, data?: any) => {
  console.log(`[NextAuth] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

interface ExtendedUser extends NextAuthUser {
  id: string;
  email: string | null | undefined;
  name?: string | null;
  image?: string | null;
  onboardingCompleted?: boolean;
}

interface ExtendedSession {
  user: ExtendedUser;
  expires: string;
}

interface ExtendedJWT extends JWT {
  id: string;
  onboardingCompleted?: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        log('Attempting to authorize user');
        if (!credentials?.email || !credentials?.password) {
          log('Authorization failed: Missing email or password');
          throw new Error('Email and password are required');
        }
        try {
          const userCredential = await FirebaseAuthService.signInWithEmailAndPassword(
            credentials.email,
            credentials.password
          );
          log('User authenticated with Firebase', { userId: userCredential.user.uid });

          const onboardingCompleted = await FirebaseAuthService.hasCompletedOnboarding(userCredential.user.uid);
          log('Onboarding status checked', { onboardingCompleted });

          return {
            id: userCredential.user.uid,
            email: userCredential.user.email,
            name: userCredential.user.displayName || null,
            image: userCredential.user.photoURL || null,
            onboardingCompleted,
          };
        } catch (error) {
          log('Authentication error', error);
          if (error instanceof FirebaseError) {
            throw new Error(error.message);
          }
          throw new Error('An unexpected error occurred during authentication');
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }): Promise<ExtendedJWT> {
      log('JWT callback', { tokenId: token.sub, userId: user?.id });
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.onboardingCompleted = (user as ExtendedUser).onboardingCompleted;
      }
      return token as ExtendedJWT;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      log('Session callback', { tokenId: token.sub });
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          onboardingCompleted: token.onboardingCompleted as boolean | undefined,
        } as ExtendedUser,
      };
    },
    async redirect({ url, baseUrl }) {
      log('Redirect callback', { url, baseUrl });
      if (url.startsWith(baseUrl)) return url;
      if (url === `${baseUrl}/dashboard`) {
        const session = await getServerSession(authOptions);
        if (session) {
          const user = session.user as ExtendedUser;
          if (user.onboardingCompleted === false) {
            log('Redirecting to onboarding', { userId: user.id });
            return `${baseUrl}/onboarding`;
          }
        }
      }
      if (url === `${baseUrl}/onboarding`) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, isNewUser }) {
      log('User signed in', { userId: user.id, isNewUser });
      if (isNewUser) {
        await FirebaseAuthService.createUserInDatabase(user.id, user.email as string);
        log('New user created in database', { userId: user.id });
      }
    },
    async signOut({ token }) {
      log('Attempting to sign out user', { userId: token.sub });
      try {
        await FirebaseAuthService.signOut();
        log('User signed out successfully');
      } catch (error) {
        log('Error during sign out', error);
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
};