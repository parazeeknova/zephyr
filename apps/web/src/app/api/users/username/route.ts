import { validateRequest } from '@zephyr/auth/auth';
import { prisma } from '@zephyr/db';
import { z } from 'zod';

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
});

export async function PATCH(request: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username } = usernameSchema.parse(body);

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser && existingUser.id !== user.id) {
      return Response.json(
        { error: 'Username is already taken' },
        { status: 400 }
      );
    }

    // Update username
    await prisma.user.update({
      where: { id: user.id },
      data: { username },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to update username:', error);
    return Response.json(
      { error: 'Failed to update username' },
      { status: 500 }
    );
  }
}
