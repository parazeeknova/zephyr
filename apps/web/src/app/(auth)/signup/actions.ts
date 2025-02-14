'use server';

import { hash } from '@node-rs/argon2';
import { createStreamUser, lucia } from '@zephyr/auth/src';
import {
  isDevelopmentMode,
  isEmailServiceConfigured,
  sendVerificationEmail,
} from '@zephyr/auth/src/email/service';
import { EMAIL_ERRORS, isEmailValid } from '@zephyr/auth/src/email/validation';
import { resendVerificationEmail } from '@zephyr/auth/src/verification/resend';
import { type SignUpValues, signUpSchema } from '@zephyr/auth/validation';
import { getEnvironmentMode, isStreamConfigured } from '@zephyr/config/src/env';
import { prisma } from '@zephyr/db';
import jwt from 'jsonwebtoken';
import { generateIdFromEntropySize } from 'lucia';
import { cookies } from 'next/headers';

interface SignUpResponse {
  verificationUrl?: string;
  error?: string;
  success: boolean;
  skipVerification?: boolean;
  message?: string;
}

const USERNAME_ERRORS = {
  TAKEN: 'This username is already taken. Please choose another.',
  INVALID: 'Username can only contain letters, numbers, and underscores.',
  REQUIRED: 'Username is required',
  CREATION_FAILED: 'Failed to create user account',
};

const SYSTEM_ERRORS = {
  JWT_SECRET: 'System configuration error: JWT_SECRET is not configured',
  USER_ID: 'Failed to generate user ID',
  TOKEN: 'Failed to generate verification token',
  INVALID_PAYLOAD: 'Invalid token payload data',
  SESSION_CREATION: 'Failed to create user session',
};

// biome-ignore lint/correctness/noUnusedVariables: this is a shared utility
const { isDevelopment, isProduction } = getEnvironmentMode();

async function createDevUser(
  userId: string,
  username: string,
  email: string,
  passwordHash: string
): Promise<{ streamChatEnabled: boolean }> {
  try {
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        username,
        displayName: username,
        email,
        passwordHash,
        emailVerified: true,
      },
    });

    let streamChatEnabled = false;
    if (isStreamConfigured()) {
      try {
        await createStreamUser(
          newUser.id,
          newUser.username,
          newUser.displayName
        );
        streamChatEnabled = true;
      } catch (streamError) {
        console.error('[Stream Chat] User creation failed:', streamError);
      }
    }

    // @ts-expect-error
    const session = await lucia.createSession(userId, {});
    const cookieStore = await cookies();
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return { streamChatEnabled };
  } catch (error) {
    console.error('Development user creation error:', error);
    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError);
    }
    throw error;
  }
}

async function createProdUser(
  userId: string,
  username: string,
  email: string,
  passwordHash: string,
  verificationToken: string
): Promise<void> {
  if (!isStreamConfigured() && isProduction) {
    throw new Error('Stream Chat is required in production but not configured');
  }

  await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        id: userId,
        username,
        displayName: username,
        email,
        passwordHash,
        emailVerified: false,
      },
    });

    await tx.emailVerificationToken.create({
      data: {
        token: verificationToken,
        userId,
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    if (isStreamConfigured()) {
      try {
        await createStreamUser(
          newUser.id,
          newUser.username,
          newUser.displayName
        );
      } catch (streamError) {
        console.error('[Stream Chat] User creation failed:', streamError);
        throw streamError;
      }
    }
  });
}

export { resendVerificationEmail };

export async function signUp(
  credentials: SignUpValues
): Promise<SignUpResponse> {
  try {
    if (!credentials) {
      return { error: 'No credentials provided', success: false };
    }

    const validationResult = signUpSchema.safeParse(credentials);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        error: firstError?.message || 'Invalid credentials',
        success: false,
      };
    }

    const { username, email, password } = validationResult.data;

    if (!username || !email || !password) {
      return { error: 'All fields are required', success: false };
    }

    const emailValidation = await isEmailValid(email);
    if (!emailValidation.isValid) {
      return {
        error: emailValidation.error || EMAIL_ERRORS.VALIDATION_FAILED,
        success: false,
      };
    }

    const existingUsername = await prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
    });

    if (existingUsername) {
      return { error: USERNAME_ERRORS.TAKEN, success: false };
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (existingEmail) {
      return { error: EMAIL_ERRORS.ALREADY_EXISTS, success: false };
    }

    const passwordHash = await hash(password);
    const userId = generateIdFromEntropySize(10);

    if (!userId) {
      throw new Error(SYSTEM_ERRORS.USER_ID);
    }

    const skipEmailVerification =
      isDevelopmentMode() && !isEmailServiceConfigured();

    if (skipEmailVerification) {
      try {
        const { streamChatEnabled } = await createDevUser(
          userId,
          username,
          email,
          passwordHash
        );

        return {
          success: true,
          skipVerification: true,
          message: `Development mode: Email verification skipped. ${
            streamChatEnabled
              ? 'Stream Chat enabled successfully.'
              : 'Stream Chat is not configured - messaging features will be disabled.'
          }`,
        };
      } catch (error) {
        console.error('Development signup error:', error);
        return {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to create account in development mode',
          success: false,
        };
      }
    }

    if (!process.env.JWT_SECRET) {
      return {
        error: SYSTEM_ERRORS.JWT_SECRET,
        success: false,
      };
    }

    try {
      const tokenPayload = { userId, email, timestamp: Date.now() };
      const verificationToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      await createProdUser(
        userId,
        username,
        email,
        passwordHash,
        verificationToken
      );

      const emailResult = await sendVerificationEmail(email, verificationToken);
      if (!emailResult.success) {
        await prisma.user.delete({ where: { id: userId } });
        return {
          error: emailResult.error || 'Failed to send verification email',
          success: false,
        };
      }

      return {
        success: true,
        skipVerification: false,
        message: isStreamConfigured()
          ? undefined
          : 'Stream Chat is not configured - messaging features will be disabled.',
      };
    } catch (error) {
      console.error('Production signup error:', error);
      try {
        await prisma.user.delete({ where: { id: userId } });
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError);
      }
      return {
        error: 'Failed to create account',
        success: false,
      };
    }
  } catch (error) {
    console.error('Signup error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      success: false,
    };
  }
}
