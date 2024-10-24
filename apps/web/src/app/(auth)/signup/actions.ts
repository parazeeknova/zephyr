"use server";

import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import streamServerClient from "@/lib/stream";
import { lucia } from "@zephyr/auth/auth";
import { type SignUpValues, signUpSchema } from "@zephyr/auth/validation";
import { prisma } from "@zephyr/db";

export async function signUp(
  credentials: SignUpValues
): Promise<{ error: string }> {
  try {
    const { username, email, password } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1
    });

    const userId = generateIdFromEntropySize(10);

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive"
        }
      }
    });

    if (existingUsername) {
      return {
        error: "Username already taken"
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive"
        }
      }
    });

    if (existingEmail) {
      return {
        error: "Email already taken"
      };
    }

    // Create user and upsert user in Stream Chat as it does not exist in Postgres database after the prisma transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash
        }
      });

      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username
      });
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Something went wrong. Please try again."
    };
  }
}
