"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

const Client = () => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.createAI.queryOptions({ text: "from client-side tRPC" }));
  return (
    <div>{
        JSON.stringify(data)}
    </div>
  )
}

export default Client