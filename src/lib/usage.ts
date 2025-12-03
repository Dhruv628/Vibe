import { prisma } from "./database";
import { auth } from "@clerk/nextjs/server";

/**
 * Number of free credits/points available to users.
 */
const FREE_POINTS = 2;

/**
 * Number of pro credits/points available to users.
 */
const PRO_POINTS = 3;

/**
 * Duration for rate limiting in seconds (30 days).
 */
const DURATION = 30 * 24 * 60 * 60; // 30 days

/**
 * Cost in credits for each generation request.
 */
const GENERATION_COST = 1;

/**
 * Lazily loads RateLimiterPrisma on the server only.
 *
 * @remarks
 * This avoids bundling `rate-limiter-flexible` types into Next.js client/RSC builds,
 * which can cause `.d.ts` parse errors in some setups. [web:5][web:23]
 */
function getRateLimiterPrisma() {
  if (typeof window !== "undefined") {
    throw new Error("RateLimiterPrisma must only be used on the server");
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { RateLimiterPrisma } = require("rate-limiter-flexible") as typeof import("rate-limiter-flexible");

  return RateLimiterPrisma;
}

/**
 * Creates and returns a rate limiter instance for tracking user usage.
 *
 * @remarks
 * Uses Prisma as the storage backend with a 30-day duration window.
 *
 * @returns A configured rate limiter instance
 *
 * @throws When the user is not authenticated
 */
export async function getUsageTracker() {
  const { has } = await auth();

  if (!has) {
    throw new Error("User not authenticated");
  }

  const hasProAccess = has({ plan: "pro" });
  const RateLimiterPrisma = getRateLimiterPrisma();

  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: "Usage",
    points: hasProAccess ? PRO_POINTS : FREE_POINTS,
    duration: DURATION,
  });

  return usageTracker;
}

/**
 * Consumes credits for the authenticated user when they perform a generation.
 *
 * @remarks
 * Deducts the generation cost from the user's available credits.
 *
 * @returns Result object containing remaining points and reset time
 *
 * @throws When the user is not authenticated
 * @throws When the user has exceeded their rate limit
 */
export async function consumeCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.consume(userId, GENERATION_COST);

  return result;
}

/**
 * Retrieves the current usage status for the authenticated user.
 *
 * @remarks
 * Returns information about remaining credits and when they reset.
 *
 * @returns Usage status object with remaining points and reset time, or null if no usage record exists
 *
 * @throws When the user is not authenticated
 */
export async function getUsageStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.get(userId);

  return result;
}