import NextAuth, { NextAuthOptions, User as NextAuthUser, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { FirebaseAuthService } from 'app/services/FirebaseAuthService';
import { FirebaseError } from 'firebase/app';
import { JWT } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';

// Custom logger for enhanced debugging
const log = (message: string, data?: any) => {
  console.log(`[NextAuth] ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Extend the default User type to include custom fields
interface User extends NextAuthUser {
  id: string;
  email: string | null | undefined;
  name?: string | null;
  image?: string | null;
  onboardingCompleted?: boolean;
}

// Extend the default Session type to include our custom User
interface ExtendedSession extends Session {
  user: User;
}

// Extend the default JWT type to include custom fields
interface ExtendedJWT extends JWT {
  id: string;
  onboardingCompleted?: boolean;
}

// Define the NextAuth options
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
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
    async jwt({ token, user, account }): Promise<ExtendedJWT> {
      log('JWT callback', { tokenId: token.sub, userId: user?.id });
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.onboardingCompleted = (user as User).onboardingCompleted;
      }
      if (account?.provider === "credentials" && typeof token.id === 'string') {
        log('Verifying token for existing user');
        const isValid = await FirebaseAuthService.verifyToken(token.id);
        if (!isValid) {
          log('Token verification failed');
          throw new Error('Token is no longer valid');
        }
        log('Token verified successfully');
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
        } as User,
      };
    },
    async redirect({ url, baseUrl }) {
      log('Redirect callback', { url, baseUrl });
      // If the user is not authenticated, allow the default redirect
      if (url.startsWith(baseUrl)) return url;
      // If the user is authenticated, check their onboarding status
      if (url === `${baseUrl}/dashboard`) {
        const session = await getServerSession(authOptions);
        if (session) {
          const user = session.user as User;
          if (user.onboardingCompleted === false) {
            log('Redirecting to onboarding', { userId: user.id });
            return `${baseUrl}/onboarding`;
          }
        }
      }
      // Allow direct access to onboarding page
      if (url === `${baseUrl}/onboarding`) {
        return url;
      }
      return url;
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };