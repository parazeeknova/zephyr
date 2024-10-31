import { redis } from "../src/redis";

export const POST_VIEWS_KEY_PREFIX = "post:views:";
export const POST_VIEWS_SET = "posts:with:views";

export const postViewsCache = {
  async incrementView(postId: string): Promise<number> {
    try {
      const pipeline = redis.pipeline();

      // Add post to set of posts with views
      pipeline.sadd(POST_VIEWS_SET, postId);
      // Increment view count
      pipeline.incr(`${POST_VIEWS_KEY_PREFIX}${postId}`);

      const results = await pipeline.exec();
      return Number(results[1]) || 0; // Return the result of INCR operation
    } catch (error) {
      console.error("Error incrementing post view:", error);
      return 0;
    }
  },

  async getViews(postId: string): Promise<number> {
    try {
      const views = await redis.get<number>(
        `${POST_VIEWS_KEY_PREFIX}${postId}`
      );
      return views || 0;
    } catch (error) {
      console.error("Error getting post views:", error);
      return 0;
    }
  },

  async getMultipleViews(postIds: string[]): Promise<Record<string, number>> {
    try {
      const pipeline = redis.pipeline();
      for (const id of postIds) {
        pipeline.get(`${POST_VIEWS_KEY_PREFIX}${id}`);
      }

      const results = await pipeline.exec();

      return postIds.reduce(
        (acc, id, index) => {
          acc[id] = Number(results[index]) || 0;
          return acc;
        },
        {} as Record<string, number>
      );
    } catch (error) {
      console.error("Error getting multiple post views:", error);
      return {};
    }
  },

  async isInViewSet(postId: string): Promise<boolean> {
    try {
      return (await redis.sismember(POST_VIEWS_SET, postId)) === 1;
    } catch (error) {
      console.error("Error checking post in view set:", error);
      return false;
    }
  }
};
