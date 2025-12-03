"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { MessagesContainer } from "./components/messages-container";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, CrownIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import ProjectHeader from "./components/project-header";
import { FragmentWeb } from "./components/fragment-web";
import UserControl from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";
import { QueryErrorBoundary } from "@/components/error-boundary";
import { ProjectHeaderLoader, MessagesLoader } from "@/components/loaders";

type Props = {
    projectId : string,
}

export const ProjectView = ( { projectId } : Props ) => {
   const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
   const [tabState, setTabState] = useState<"preview" | "code">("preview")

   const  { has } = useAuth();
   const hasProAccess = has?.({ plan: "pro" });

    return (
        <div className="h-screen">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={20} className="flex flex-col min-h-0">
                    <QueryErrorBoundary>
                        <Suspense fallback={<ProjectHeaderLoader />}>
                            <ProjectHeader projectId={projectId} />
                        </Suspense>
                    </QueryErrorBoundary>
                    <QueryErrorBoundary>
                        <Suspense fallback={<MessagesLoader/>}>
                            <MessagesContainer projectId={projectId} activeFragment={activeFragment} setActiveFragment={setActiveFragment} />
                        </Suspense>
                    </QueryErrorBoundary>
                </ResizablePanel>
                <ResizableHandle className="hover:bg-primary transition-colors"/>
                <ResizablePanel defaultSize={65} minSize={50}>
                    <Tabs
                      className="h-full gap-y-0"
                      defaultValue="preview"
                      value={tabState}
                      onValueChange={(value) => setTabState(value as "preview" | "code") }
                    >
                        <div className="w-full flex items-center  p-2 border-b gap-x-2">
                            <TabsList className="h-8 p-0 border rounded-md">
                                <TabsTrigger value="preview" className="rounded-md">
                                    <EyeIcon/> <span>Demo</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="rounded-md">
                                    <CodeIcon/> <span>Code</span>
                                </TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-x-2">
                                {!hasProAccess &&  
                                    <Button asChild size="sm" variant="tertiary">
                                        <Link href="/pricing">
                                            <CrownIcon/> Upgrade
                                        </Link>
                                    </Button>
                                } 
                                <UserControl />
                            </div>
                        </div>
                        <TabsContent value="code" className="min-h-0">
                            {!!activeFragment && <FileExplorer files={activeFragment.files as { [path: string]: string} } />}
                        </TabsContent>
                        <TabsContent value="preview">
                            {!!activeFragment && <FragmentWeb fragment={activeFragment} />}
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )

}