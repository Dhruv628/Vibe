import { generateSlug } from "random-word-slugs"
import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/database";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { MessageRole, MessageType } from "@/generated/prisma/browser";
import { TRPCError } from "@trpc/server";

export const projectRouter = createTRPCRouter({
    getOne: baseProcedure
    .input(
        z.object({
            id: z.string().min(1, {message: "Id is required"})
        })
    ).query( async( { input } ) => {
        const existingProject = await prisma.project.findUnique({
            where : {
                id: input.id
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
    getMany: baseProcedure.query( async() => {
        return prisma.project.findMany({
            orderBy: { createdAt: 'asc' }
        })
    }),
    create: baseProcedure
    .input(
        z.object({
            value: z.string()
            .min(1, {message: "value is required"})
            .max(10000, {message: "value is too long"})
        })
    )
    .mutation( async ({ input }) => {

        const createdProject = await prisma.project.create({
            data:{
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