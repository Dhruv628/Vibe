import { generateSlug } from "random-word-slugs"
import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/database";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { MessageRole, MessageType } from "@/generated/prisma/browser";
import { TRPCError } from "@trpc/server";

export const projectRouter = createTRPCRouter({
    getOne: protectedProcedure
    .input(
        z.object({
            id: z.string().min(1, {message: "Id is required"})
        })
    ).query( async( { input, ctx } ) => {
        const existingProject = await prisma.project.findUnique({
            where : {
                id: input.id,
                userId: ctx.auth.userId
            }
        });

        if(!existingProject){
            throw new TRPCError({
                message: "Project not found",
                code: "NOT_FOUND"
            })
        }

        return existingProject
    }),
    getMany: protectedProcedure.query( async ({ ctx }) => {
        return prisma.project.findMany({
            where: {
                userId: ctx.auth.userId
            },
            orderBy: { createdAt: 'asc' }
        })
    }),
    create: protectedProcedure
    .input(
        z.object({
            value: z.string()
            .min(1, {message: "value is required"})
            .max(10000, {message: "value is too long"})
        })
    )
    .mutation( async ({ input, ctx }) => {

        const createdProject = await prisma.project.create({
            data:{
                userId: ctx.auth.userId,
                name: generateSlug(2, {format : "kebab"}),
                messages : {
                    create :{
                        content: input.value,
                        role: MessageRole.USER,
                        type: MessageType.RESULT,          
                    }
                }
            }
        })

        await inngest.send({
          name: 'code-agent/run',
          data: {
            value: input.value,
            projectId: createdProject.id,
          },
        })
        
        return createdProject;
    })
})