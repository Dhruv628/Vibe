import { useState } from "react";
import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { Fragment } from "@prisma/client";

interface Props {
    fragment: Fragment;
}

export const FragmentWeb = ({ fragment }: Props) => {
    const [fragmentKey, setFragmentKey] = useState(0);
    const [copied, setCopied] = useState(false);

    const onRefresh = () => {
        setFragmentKey((prev) => prev + 1);
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(fragment.sandboxUrl);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <div className="flex flex-col w-full h-full">
            <div className="pb-2 px-2 md:p-2 border-b bg-sidebar flex items-center gap-x-1 sm:gap-x-2">
                <Hint text="Refresh" side="bottom" align="start">
                    <Button size="sm" variant="outline" onClick={onRefresh} className="h-8 min-h-0 px-2 sm:px-3">
                        <RefreshCcwIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
                    </Button>
                </Hint>
                <Hint text="Click to copy" side="bottom">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCopy}
                        disabled={!fragment.sandboxUrl || copied} 
                        className="flex-1 min-h-0 justify-start text-start font-normal h-8 min-w-0 px-2 sm:px-3"
                    >
                        <span className="truncate text-xs sm:text-sm">
                            {fragment.sandboxUrl}
                        </span>
                    </Button>
                </Hint>
                <Hint text="Open in new tab" side="bottom" align="start">
                    <Button
                        size="sm"
                        disabled={!fragment.sandboxUrl}
                        variant="outline"
                        className="h-8 min-h-0 px-2 sm:px-3"
                        onClick={() => {
                            if (!fragment.sandboxUrl) return;
                            window.open(fragment.sandboxUrl, "_blank");
                        }}
                    >
                        <ExternalLinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
                    </Button>
                </Hint>
            </div>
            <iframe 
                key={fragmentKey}
                className="w-full h-full"
                sandbox="allow-forms allow-scripts allow-same-origin"
                loading="lazy"
                src={fragment.sandboxUrl}
            />
        </div>
    )
};