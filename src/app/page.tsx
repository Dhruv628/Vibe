"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function Page() {
  const [value, setValue] = useState("")
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess:()=>toast.success("Background job invoked successfully"),
  }))
  const invokeBackgroundJob = async () => {
    invoke.mutate({value: value})
  }
  return (
    <div className="px-4 max-w-7xl mx-auto">
      <Input value={value} onChange={(e)=>setValue(e.target.value)} />
      <Button disabled={invoke.isPending} onClick={invokeBackgroundJob}>
        Invoke Background Job
      </Button>
    </div>
  );
}

export default Page;