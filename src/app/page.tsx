"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function Page() {
  const [value, setValue] = useState<string>("")
  const trpc = useTRPC();
  const router = useRouter();

  const createProject = useMutation(trpc.projects.create.mutationOptions({
    onError : (error) => toast.error(error.message),
    onSuccess : (data) => router.push(`/projects/${data.id}`),
  }))

  const invokeBackgroundJob = async () => {
    createProject.mutate({ value : value})
  }
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="max-w-7xl flex flex-col items-center justify-center gap-y-4">
        <Input value={value} onChange={(e)=>setValue(e.target.value)} />
        <Button disabled={createProject.isPending} onClick={invokeBackgroundJob}>
          Submit
        </Button>
      </div>
    </div>
  );
}

export default Page;