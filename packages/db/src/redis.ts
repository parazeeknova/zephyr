import IORedis, { type RedisOptions } from "ioredis";

const createRedisConfig = (): RedisOptions => {
  const config: RedisOptions = {
    host: process.env.REDIS_HOST,
    port: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    db: 0,
    maxRetriesPerRequest: 2,
    connectTimeout: 5000, // 5 seconds
    commandTimeout: 3000, // 3 seconds
    retryStrategy(times: number) {
      const delay = Math.min(times * 50, 1000);
      return delay;
    },
    enableReadyCheck: true,
    showFriendlyErrorStack: true,
    keepAlive: 10000, // 10 seconds
    autoResendUnfulfilledCommands: true,
    reconnectOnError: (err) => {
      const targetError = "READONLY";
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    }
  };

  console.log("Redis Config (sanitized):", {
    host: config.host,
    port: config.port,
    hasPassword: !!config.password,
    db: config.db
  });

  return config;
};

let redis: IORedis;

try {
  redis = new IORedis(createRedisConfig());

  const debugRedis = {
    async testConnection() {
      try {
        await redis.ping();
        console.log("Redis connection test: SUCCESS");
        return true;
      } catch (error) {
        console.error("Redis connection test: FAILED", error);
        return false;
      }
    },

    async testCache() {
      try {
        const testKey = "test:connection";
        await redis.set(testKey, "working");
        const value = await redis.get(testKey);
        await redis.del(testKey);
        console.log(
          "Redis cache test:",
          value === "working" ? "SUCCESS" : "FAILED"
        );
        return value === "working";
      } catch (error) {
        console.error("Redis cache test: FAILED", error);
        return false;
      }
    }
  };

  redis.on("error", (error) => {
    console.error("Redis connection error:", error);
    console.error("Redis connection details:", {
      host: redis.options.host,
      port: redis.options.port,
      hasPassword: !!redis.options.password,
      db: redis.options.db
    });
  });

  redis.on("connect", () => {
    console.log("Connected to Redis successfully");
    debugRedis
      .testConnection()
      .then(() => debugRedis.testCache())
      .catch(console.error);
  });

  redis.on("ready", () => {
    console.log("Redis client ready");
  });

  redis.on("reconnecting", () => {
    console.log("Redis client reconnecting");
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
