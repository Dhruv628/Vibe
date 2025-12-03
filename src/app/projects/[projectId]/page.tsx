import { ProjectView } from "@/modules/projects/ui/views/project-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ProjectErrorBoundary } from "@/components/error-boundary";
import { PageLoader } from "@/components/loaders";

type Props = {
    params: Promise<{
        projectId: string 
    }>
}

export default async function Page({ params } : Props) {
    const { projectId } = await params;
    const queryClient = getQueryClient();
    
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
        projectId
    }))
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
        id: projectId
    }))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProjectErrorBoundary projectId={projectId}>
                <Suspense fallback={<PageLoader />}>
                    <ProjectView projectId={projectId} />
                </Suspense>
            </ProjectErrorBoundary>
        </HydrationBoundary>
    )
}