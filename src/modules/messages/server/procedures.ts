import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/database";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const messageRouter = createTRPCRouter({
    getMany: baseProcedure.query( async() => {
        return prisma.message.findMany({
            orderBy: { createdAt: 'asc' },
            include: { fragment: false }
        })
    }),
    create: baseProcedure
    .input(
        z.object({
            value: z.string().min(1, {message: "message is required"}),
        })
    )
    .mutation( async ({ input }) => {
        const createdMessage = await prisma.message.create({
            data:{
                content: input.value,
                role: "USER",
                type: "RESULT",
            }
        })

        await inngest.send({
          name: 'code-agent/run',
          data: {
            value: input.value,
          },
        })
        
        return createdMessage;
    })
})