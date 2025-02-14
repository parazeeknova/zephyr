import { prisma } from '@zephyr/db';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../email/service';
import { EMAIL_ERRORS } from '../email/validation';

const SYSTEM_ERRORS = {
  JWT_SECRET: 'System configuration error: JWT_SECRET is not configured',
  INVALID_PAYLOAD: 'Invalid token payload data',
};

export async function resendVerificationEmail(email: string) {
  if (!email) {
    return {
      error: EMAIL_ERRORS.REQUIRED,
      success: false,
    };
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!existingUser) {
      return {
        error: 'User not found',
        success: false,
      };
    }

    if (existingUser.emailVerified) {
      return {
        error: 'Email already verified',
        success: false,
      };
    }

    const existingToken = await prisma.emailVerificationToken.findFirst({
      where: { userId: existingUser.id },
    });

    if (!existingToken) {
      return {
        error: 'Verification token not found',
        success: false,
      };
    }

    const sentAt = existingToken.createdAt;
    const timeDiff = Date.now() - sentAt.getTime();
    const isOneMinutePassed = timeDiff > 60000;

    if (!isOneMinutePassed) {
      const remainingSeconds = Math.ceil((60000 - timeDiff) / 1000);
      return {
        error: `Please wait ${remainingSeconds} seconds before requesting another email`,
        success: false,
      };
    }

    const tokenPayload = {
      userId: existingUser.id,
      email,
      timestamp: Date.now(),
    };

    if (!tokenPayload.userId || !tokenPayload.email) {
      throw new Error(SYSTEM_ERRORS.INVALID_PAYLOAD);
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(SYSTEM_ERRORS.JWT_SECRET);
    }

    const newToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    await prisma.emailVerificationToken.update({
      where: { id: existingToken.id },
      data: {
        token: newToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    await sendVerificationEmail(email, newToken);

    return {
      success: true,
      message: 'Verification email has been resent',
    };
  } catch (error) {
    console.error('Resend verification email error:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to resend verification email',
      success: false,
    };
  }
}
