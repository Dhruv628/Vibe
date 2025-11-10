"use client"

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function Page() {
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess:()=>toast.success("Background job invoked successfully"),
  }))
  const invokeBackgroundJob = async () => {
    invoke.mutate({text:"John doe"})
  }
  return (
    <div className="px-4 max-w-7xl mx-auto">
      <Button disabled={invoke.isPending} onClick={invokeBackgroundJob}>
        Invoke Background Job
      </Button>
    </div>
  );
}

export default Page;