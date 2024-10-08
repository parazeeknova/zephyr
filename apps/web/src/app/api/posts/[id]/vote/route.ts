import type { NextRequest } from "next/server";

import { validateRequest } from "@zephyr/auth/auth";
import prisma from "@zephyr/db/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = params.id;
    const { value } = await req.json();

    if (value !== 1 && value !== -1) {
      return Response.json({ error: "Invalid vote value" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const existingVote = await prisma.vote.findUnique({
      where: { userId_postId: { userId: user.id, postId } }
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove the vote if it's the same as the existing one
        await prisma.vote.delete({ where: { id: existingVote.id } });
        await prisma.post.update({
          where: { id: postId },
          data: { aura: { decrement: value } }
        });
      } else {
        // Update the vote if it's different
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value }
        });
        await prisma.post.update({
          where: { id: postId },
          data: { aura: { increment: value * 2 } } // Multiply by 2 to reverse the previous vote
        });
      }
    } else {
      // Create a new vote
      await prisma.vote.create({
        data: { userId: user.id, postId, value }
      });
      await prisma.post.update({
        where: { id: postId },
        data: { aura: { increment: value } }
      });
    }

    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, aura: true }
    });

    return Response.json(updatedPost);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
