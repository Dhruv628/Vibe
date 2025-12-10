"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { MessagesContainer } from "./components/messages-container";
import { Suspense, useState, useEffect } from "react";
import { Fragment } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeIcon, CrownIcon, EyeIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileExplorer } from "@/components/file-explorer";
import ProjectHeader from "./components/project-header";
import { FragmentWeb } from "./components/fragment-web";
import UserControl from "@/components/user-control";
import { useAuth } from "@clerk/nextjs";
import { QueryErrorBoundary } from "@/components/error-boundary";
import { ProjectHeaderLoader, MessagesLoader } from "@/components/loaders";
import { useIsMobile } from "@/hooks/use-media-query";
import { MessageForm } from "./components/message-form";
import { CustomButton } from "@/components/ui/custom-button";

type Props = {
    projectId : string,
}

export const ProjectView = ( { projectId } : Props ) => {
   const [activeFragment, setActiveFragment] = useState<Fragment | null>(null)
   const [tabState, setTabState] = useState<"preview" | "code">("preview")
   const [isFormMinimized, setIsFormMinimized] = useState(false);
   const isMobile = useIsMobile();
   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
     setIsMounted(true);
   }, []);

   const  { has } = useAuth();
   const hasProAccess = has?.({ plan: "pro" });

    if (!isMounted) return null;

    return (
        <div className="h-screen relative">
            {/* Gradient bg */}
            {/* <div className="fixed inset-0 -z-10 h-full w-full">
                <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-linear-to-br dark:from-[#1a1625] dark:via-[#2d1b3d] dark:to-[#1a1625]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent dark:from-purple-500/10" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-purple-200/20 via-transparent to-transparent dark:from-pink-500/10" />
            </div> */}
            <ResizablePanelGroup className="flex flex-col md:flex-row" direction={isMobile ? "vertical" : "horizontal"}>
                {isMobile ? (
                    <>
                        {/* Preview Panel - First on mobile */}
                        <ResizablePanel 
                            defaultSize={65} 
                            minSize={1}
                            maxSize={95}
                            className="min-h-0"
                        >
                            <QueryErrorBoundary variant="minimal">
                                <Suspense fallback={<ProjectHeaderLoader />}>
                                    <ProjectHeader projectId={projectId} />
                                </Suspense>
                            </QueryErrorBoundary>
                            <Tabs
                              className="h-full flex flex-col bg-sidebar"
                              defaultValue="preview"
                              value={tabState}
                              onValueChange={(value) => setTabState(value as "preview" | "code") }
                            >
                                <div className="w-full flex items-center px-2 pt-2 border-t gap-x-2 flex-wrap sm:flex-nowrap mt-auto">
                                    <TabsList className="h-8 p-0 border rounded-md">
                                        <TabsTrigger value="preview" className="rounded-md min-h-0 text-xs sm:text-sm">
                                            <EyeIcon className="size-4"/> <span className="hidden sm:inline">Demo</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="code" className="rounded-md min-h-0 text-xs sm:text-sm">
                                            <CodeIcon className="size-4"/> <span className="hidden sm:inline">Code</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="code" className="flex-1 min-h-0 mt-0">
                                    {!!activeFragment && <FileExplorer files={activeFragment.files as { [path: string]: string} } />}
                                </TabsContent>
                                <TabsContent value="preview" className="flex-1 min-h-0 mt-0">
                                    {!!activeFragment && <FragmentWeb fragment={activeFragment} />}
                                </TabsContent>
                            </Tabs>
                        </ResizablePanel>
                        <ResizableHandle withHandle className="hover:bg-primary transition-colors"/>
                        {/* Messages Panel - Second on mobile */}
                        <ResizablePanel 
                            defaultSize={35} 
                            minSize={1}
                            maxSize={95}
                            className="flex flex-col min-h-0"
                        >
                            <QueryErrorBoundary>
                                <Suspense fallback={<MessagesLoader/>}>
                                    <MessagesContainer 
                                        projectId={projectId} 
                                        activeFragment={activeFragment} 
                                        setActiveFragment={setActiveFragment}
                                        showMessageForm={false}
                                    />
                                </Suspense>
                            </QueryErrorBoundary>
                        </ResizablePanel>
                    </>
                ) : (
                    <>
                        {/* Messages Panel - First on desktop */}
                        <ResizablePanel 
                            defaultSize={35} 
                            minSize={20}
                            className="flex flex-col min-h-0"
                        >
                            <QueryErrorBoundary variant="minimal">
                                <Suspense fallback={<ProjectHeaderLoader />}>
                                    <ProjectHeader projectId={projectId} />
                                </Suspense>
                            </QueryErrorBoundary>
                            <QueryErrorBoundary>
                                <Suspense fallback={<MessagesLoader/>}>
                                    <MessagesContainer 
                                        projectId={projectId} 
                                        activeFragment={activeFragment} 
                                        setActiveFragment={setActiveFragment}
                                        showMessageForm={true}
                                    />
                                </Suspense>
                            </QueryErrorBoundary>
                        </ResizablePanel>
                        <ResizableHandle withHandle={false} className="hover:bg-primary transition-colors"/>
                        {/* Preview Panel - Second on desktop */}
                        <ResizablePanel 
                            defaultSize={65} 
                            minSize={50}
                        >
                            <Tabs
                              className="h-full gap-y-0"
                              defaultValue="preview"
                              value={tabState}
                              onValueChange={(value) => setTabState(value as "preview" | "code") }
                            >
                                <div className="w-full flex items-center p-2 border-b gap-x-2 flex-wrap sm:flex-nowrap">
                                    <TabsList className="h-8 p-0 border rounded-md">
                                        <TabsTrigger value="preview" className="rounded-md min-h-0 text-xs sm:text-sm">
                                            <EyeIcon className="size-4"/> <span className="hidden sm:inline">Demo</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="code" className="rounded-md min-h-0 text-xs sm:text-sm">
                                            <CodeIcon className="size-4"/> <span className="hidden sm:inline">Code</span>
                                        </TabsTrigger>
                                    </TabsList>
                                    <div className="ml-auto flex items-center gap-x-2">
                                        {!hasProAccess &&  
                                            <Button asChild size="sm" variant="tertiary" className="text-xs hidden md:block sm:text-sm h-8">
                                                <Link href="/pricing">
                                                    <CrownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> <span className="hidden sm:inline">Upgrade</span>
                                                </Link>
                                            </Button>
                                        } 
                                        <div className="hidden md:block">
                                           <UserControl />
                                        </div>
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
                    </>
                )}
            </ResizablePanelGroup>
            {/* Fixed message form for mobile */}
            {isMobile && (
                <>
                    {/* Minimize/Maximize Button - Always visible */}
                    <CustomButton
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsFormMinimized(!isFormMinimized);
                        }}
                        className="fixed right-4 bottom-5 z-9999 shadow-lg"
                        size="icon"
                    >
                        {isFormMinimized ? (
                            <PlusIcon className="size-4" />
                        ) : (
                            <MinusIcon className="size-4" />
                        )}
                    </CustomButton>
                    {/* Message Form Container */}
                    <div className={`fixed w-full left-0 z-40 bg-background border-t safe-bottom transition-all duration-300 ease-in-out ${
                        isFormMinimized ? '-bottom-full' : 'bottom-0'
                    }`}>
                        <div className="p-2 sm:p-3 md:pr-16">
                            <MessageForm projectId={projectId} />
                        </div>
                    </div>
                </>
            )}
        </div>
    )

}