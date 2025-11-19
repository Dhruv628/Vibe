"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function Page() {
  const [value, setValue] = useState("")
  const trpc = useTRPC();
  
  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions())

  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess:()=>toast.success("Background job invoked successfully"),
  }))
  const invokeBackgroundJob = async () => {
    createMessage.mutate({value: value})
  }
  return (
    <div className="px-4 max-w-7xl mx-auto">
      <Input value={value} onChange={(e)=>setValue(e.target.value)} />
      <Button disabled={createMessage.isPending} onClick={invokeBackgroundJob}>
        Invoke Background Job
      </Button>
      {
        JSON.stringify(messages, null, 2)
      }
    </div>
  );
}

export default Page;