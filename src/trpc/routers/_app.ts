import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({
  createAI: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  invoke: baseProcedure
    .input(
      z.object({
        value: z.string(),
      }),
    )
    .mutation(async ({input}) => {
      await inngest.send({
        name: 'code-agent/run',
        data: {
          value: input.value,
        },
      })
      return { success: true }
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;