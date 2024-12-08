import IORedis, { type RedisOptions } from "ioredis";

const redisUrl = process.env.REDIS_URL;

const parseRedisUrl = (url: string): RedisOptions => {
  try {
    const parsedUrl = new URL(url);
    return {
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port) || 6379,
      username: parsedUrl.username || undefined,
      password: parsedUrl.password || undefined,
      db: parsedUrl.pathname ? Number(parsedUrl.pathname.split("/")[1]) : 0
    };
  } catch (error) {
    console.error("Error parsing Redis URL:", error);
    return defaultRedisConfig;
  }
};

const defaultRedisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || "zephyrredis",
  db: 0
};

const commonConfig: RedisOptions = {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableReadyCheck: true,
  showFriendlyErrorStack: true,
  reconnectOnError: (err: Error) => {
    console.error("Redis reconnect on error:", err);
    return true;
  },
  lazyConnect: true
};

let redis: IORedis;

try {
  const config = redisUrl
    ? { ...commonConfig, ...parseRedisUrl(redisUrl) }
    : { ...commonConfig, ...defaultRedisConfig };

  redis = new IORedis(config);

  redis.on("error", (error) => {
    console.error("Redis connection error:", error);
    console.error("Redis connection details:", {
      connection: redisUrl || "Using individual config",
      config: {
        host: redis.options.host,
        port: redis.options.port,
        db: redis.options.db,
        username: redis.options.username ? "***" : undefined,
        hasPassword: !!redis.options.password
      }
    });
  });

  redis.on("connect", () => {
    console.log("Connected to Redis successfully");
  });

  redis.on("ready", () => {
    console.log("Redis client ready");
  });

  redis.on("reconnecting", () => {
    console.log("Redis client reconnecting");
  });

  redis.connect().catch((error) => {
    console.error("Failed to connect to Redis:", error);
  });
} catch (error) {
  console.error("Failed to initialize Redis client:", error);
  throw error;
}

export { redis };

export interface TrendingTopic {
  hashtag: string;
  count: number;
}

const TRENDING_TOPICS_KEY = "trending:topics";
const TRENDING_TOPICS_BACKUP_KEY = "trending:topics:backup";
const CACHE_TTL = 3600; // 1 hour in seconds
const BACKUP_TTL = 86400; // 24 hours in seconds

export const trendingTopicsCache = {
  async get(): Promise<TrendingTopic[]> {
    try {
      const topics = await redis.get(TRENDING_TOPICS_KEY);
      return topics ? JSON.parse(topics) : [];
    } catch (error) {
      console.error("Error getting trending topics from cache:", error);
      return this.getBackup();
    }
  },

  async getBackup(): Promise<TrendingTopic[]> {
    try {
      const backupTopics = await redis.get(TRENDING_TOPICS_BACKUP_KEY);
      return backupTopics ? JSON.parse(backupTopics) : [];
    } catch (error) {
      console.error("Error getting trending topics from backup cache:", error);
      return [];
    }
  },

  async set(topics: TrendingTopic[]): Promise<void> {
    try {
      const pipeline = redis.pipeline();

      pipeline.set(
        TRENDING_TOPICS_KEY,
        JSON.stringify(topics),
        "EX",
        CACHE_TTL
      );

      pipeline.set(
        TRENDING_TOPICS_BACKUP_KEY,
        JSON.stringify(topics),
        "EX",
        BACKUP_TTL
      );

      pipeline.set(
        `${TRENDING_TOPICS_KEY}:last_updated`,
        Date.now(),
        "EX",
        CACHE_TTL
      );

      await pipeline.exec();
    } catch (error) {
      console.error("Error setting trending topics cache:", error);
    }
  },

  async invalidate(): Promise<void> {
    try {
      const pipeline = redis.pipeline();
      pipeline.del(TRENDING_TOPICS_KEY);
      pipeline.del(`${TRENDING_TOPICS_KEY}:last_updated`);
      await pipeline.exec();
      console.log("Invalidated trending topics cache");
    } catch (error) {
      console.error("Error invalidating trending topics cache:", error);
    }
  },

  async shouldRefresh(): Promise<boolean> {
    try {
      const lastUpdated = await redis.get(
        `${TRENDING_TOPICS_KEY}:last_updated`
      );
      if (!lastUpdated) return true;
      const timeSinceUpdate = Date.now() - Number.parseInt(lastUpdated);
      return timeSinceUpdate > (CACHE_TTL * 1000) / 2;
    } catch {
      return true;
    }
  },

  async warmCache(): Promise<void> {
    try {
      const shouldWarm = await this.shouldRefresh();
      if (!shouldWarm) return;
      await this.refreshCache();
    } catch (error) {
      console.error("Error warming trending topics cache:", error);
    }
  },

  refreshCache: null as unknown as () => Promise<TrendingTopic[]>
};

export const POST_VIEWS_KEY_PREFIX = "post:views:";
export const POST_VIEWS_SET = "posts:with:views";

export const postViewsCache = {
  async incrementView(postId: string): Promise<number> {
    try {
      const pipeline = redis.pipeline();
      pipeline.sadd(POST_VIEWS_SET, postId);
      pipeline.incr(`${POST_VIEWS_KEY_PREFIX}${postId}`);
      const results = await pipeline.exec();
      return (results?.[1]?.[1] as number) || 0;
    } catch (error) {
      console.error("Error incrementing post view:", error);
      return 0;
    }
  },

  async getViews(postId: string): Promise<number> {
    try {
      const views = await redis.get(`${POST_VIEWS_KEY_PREFIX}${postId}`);
      return Number.parseInt(views || "0");
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
          acc[id] = Number.parseInt((results?.[index]?.[1] as string) || "0");
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
