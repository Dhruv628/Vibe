import { ChevronLeft, ChevronRight, CopyCheckIcon, CopyIcon } from "lucide-react";
import { useState, useMemo, Fragment, useCallback, useRef } from "react";
import { Hint } from "@/components/hint";
import { Button }  from "@/components/ui/button";
import { CodeView } from "@/components/code-view";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, ImperativePanelHandle } from "@/components/ui/resizable"
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { convertFilesToTreeItems } from "@/lib/utils";
import { TreeView } from "./tree-view";
import { useIsMobile } from "@/hooks/use-media-query";


type FileBreadCrumbProps = {
    filePath: string,
}

const FileBreadCrumb = ({ filePath } : FileBreadCrumbProps) => {
    const pathSegments = filePath.split('/');
    const maxSegmentsToShow = 3;

    const renderBreadCrumbs = () => {
        if (pathSegments.length <= maxSegmentsToShow) {
            return pathSegments.map((segment, index) => {
                const isLast = index === pathSegments.length - 1;
                return (
                    <Fragment key={index} >
                        <BreadcrumbItem>
                            {isLast ? (
                                <BreadcrumbPage>{segment}</BreadcrumbPage>
                            ) : (
                                <span className="text-muted-foreground">{segment}</span>
                            )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                )
            })
        } else {
            const firstSegment = pathSegments[0];
            const lastSegment = pathSegments[pathSegments.length - 1];
            return (
                <>
                    <BreadcrumbItem>
                        <span className="text-muted-foreground">{firstSegment}</span>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbEllipsis />
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-medium">{lastSegment}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbItem>
                </>
            )

        }
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {renderBreadCrumbs()}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

type FileCollection = {
    [path: string]: string,
}

function getLanguageFromExtension(fileName: string) : string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension || 'text';
}

type FileExplorerProps = {
    files: FileCollection,
}

export const FileExplorer = ({ files }: FileExplorerProps) => {
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(() => {
      const fileKeys = Object.keys(files);
      return fileKeys.length > 0 ? fileKeys[0] : null;
  });
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const panelRef = useRef<ImperativePanelHandle>(null);

  const isMobile = useIsMobile();

  const togglePanel = () => {
    if (panelRef.current) {
      if (isPanelCollapsed) {
        panelRef.current.expand();
      } else {
        panelRef.current.collapse();
      }
      setIsPanelCollapsed(!isPanelCollapsed);
    }
  };

  const handleCopy = async () => {
    if(selectedFile && files[selectedFile]){
        navigator.clipboard.writeText(files[selectedFile] || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  }

  const treeData = useMemo(() => {
    return convertFilesToTreeItems(files);
  }, [files])

  const handleFileSelect = useCallback((filePath: string) => {
    if(files[filePath]){
        setSelectedFile(filePath);
    }
  }, [files])
  return (
    <ResizablePanelGroup direction="horizontal">
        <ResizablePanel ref={panelRef} collapsible={isMobile} defaultSize={ isMobile ? 50 : 30 } minSize={ isMobile ? 30 : 30 } maxSize={isMobile ? 50 : undefined} className="bg-sidebar">
            <TreeView data={treeData} value={selectedFile} onSelect={handleFileSelect} />
        </ResizablePanel>
        <ResizableHandle withHandle={isMobile} className="hover:bg-primary transition-colors relative">
            {isMobile && (
                <Hint text={isPanelCollapsed ? "Show files" : "Hide files"} side="right">
                    <div 
                        onClick={togglePanel}
                        className="absolute bg-primary/75 text-primary-foreground flex items-center justify-center left-0  -translate-y-6 z-50 shadow-xl h-6.5 w-7 rounded-r-full"
                    >
                        {isPanelCollapsed ? <ChevronRight className="size-4.5" /> : <ChevronLeft className="size-4.5" />}
                    </div>
                </Hint>
            )}
        </ResizableHandle>
        <ResizablePanel defaultSize={70} minSize={50}>
            {selectedFile && files[selectedFile] ? (
                <div className="h-full w-full flex flex-col">
                    <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
                        <FileBreadCrumb filePath={selectedFile} />
                        <Hint text="Copy to clipboard" side="bottom">
                            <Button variant="outline" size="icon" className="ml-auto min-h-0" onClick={handleCopy} disabled={copied}>
                                {
                                    copied ? <CopyCheckIcon className="size-4" /> : <CopyIcon className="size-4" />
                                }
                            </Button>
                        </Hint>
                    </div>
                    <div className="mx-1 overflow-auto">
                        <CodeView code={files[selectedFile]} lang={getLanguageFromExtension(selectedFile)} />
                    </div>
                </div>
            ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                    Select a file to view it&apos;s contents
                </div>
            )}
        </ResizablePanel>
    </ResizablePanelGroup>
  )
}