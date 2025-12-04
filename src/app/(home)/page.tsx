"use client"
import { ProjectForm } from "@/modules/home/ui/components/project-form"
import { ProjectsList } from "@/modules/home/ui/components/project-list"
import Image  from "next/image"

const Page=()=>{
  return(
    <div className="flex flex-col max-w-5xl mx-auto w-full px-0.5 sm:px-6">
      <section className="space-y-6 h-screen flex flex-col justify-center items-center"> 
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="Vibe"
            width={50}
            height={50}
            className="hidden md:block"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center px-4">
          Build Something with Vibe
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground text-center px-4">
          Create apps and websites by chatting with AI
        </p>
        <div className="max-w-3xl mx-auto w-full">
          <ProjectForm />
        </div>
      </section>
      <ProjectsList />
    </div>
  )

}

export default Page