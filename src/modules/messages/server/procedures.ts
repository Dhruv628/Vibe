import { MessageRole, MessageType } from "@/generated/prisma/enums";
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
            value: z.string()
            .min(1, {message: "value is required"})
            .max(10000, {message: "value is too long"}),
            projectId: z.string().min(1, {message: "projectId is required"})
        })
    )
    .mutation( async ({ input }) => {
        const createdMessage = await prisma.message.create({
            data:{
                projectId: input.projectId,
                content: input.value,
                role: MessageRole.USER,
                type: MessageType.RESULT,
            }
        })

        await inngest.send({
          name: 'code-agent/run',
          data: {
            value: input.value,
            projectId: input.projectId,
          },
        })
        
        return createdMessage;
    })
})