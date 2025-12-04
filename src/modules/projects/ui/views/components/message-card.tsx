import { Fragment, MessageRole, MessageType } from "@prisma/client"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import Image from "next/image"
import { ChevronRight, Code2Icon } from "lucide-react"

type UserMessageProps = {
    content: string,
}
const UserMessage = ({ content }: UserMessageProps) => {
    return (
        <div className="flex justify-end pb-4 pr-2 pl-4 sm:pl-10">
            <Card className="rounded-lg bg-muted p-2 sm:p-3 shadow-none border-none max-w-[90%] sm:max-w-[80%] wrap-break-word">
                {content}
            </Card>
        </div>
    )
}

type FragmentCardProps = {
    fragment: Fragment,
    isActiveFragment: boolean,
    onFragmentClick: (fragment: Fragment) => void,
}
const FragmentCard = ({ fragment, isActiveFragment, onFragmentClick }: FragmentCardProps) => {
    return (
        <button
            className={cn(
                "flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-2 sm:p-3 hover:bg-secondary transition-colors",
                isActiveFragment && "bg-primary text-primary-foreground border-primary hover:bg-primary"
            )}
            onClick={() => onFragmentClick(fragment)}
        >
            <Code2Icon className="size-3.5 sm:size-4 mt-0.5 shrink-0" />
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-medium line-clamp-1">
                    {fragment.title}
                </span>
                <span className="text-xs sm:text-sm">
                    Preview
                </span>
            </div>
            <div className="flex items-center mt-0.5">
                <ChevronRight className="size-3.5 sm:size-4 shrink-0"/>
            </div>
        </button>
    )
}

type AssistantMessageProps = {
    content: string,   
    fragment: Fragment | null,
    createdAt: Date,
    isActiveFragment: boolean,
    onFragmentClick: (fragment: Fragment) => void,
    type: MessageType
}
const AssistantMessage = ({ content, fragment, createdAt, isActiveFragment, onFragmentClick, type }: AssistantMessageProps) => {
    return (
        <div className={cn(
            "flex flex-col group px-2 pb-4",
            type == MessageType.ERROR && "text-red-700 dark:text-red-500",
        )}>
            <div className="flex items-center gap-2 pl-2 mb-2">
                <Image 
                    src="/logo.svg" 
                    alt="Vibe Logo" 
                    width={18} 
                    height={18} 
                    className="shrink-0 w-4 h-4 sm:w-[18px] sm:h-[18px]"
                />
                <span className="text-xs sm:text-sm font-medium">Vibe</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hidden sm:inline">
                    {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
                </span>
            </div>
            <div className="pl-6 sm:pl-8.5 flex flex-col gap-y-4">
                {content}
                {fragment && type==MessageType.RESULT && (
                    <FragmentCard fragment={fragment} isActiveFragment={isActiveFragment} onFragmentClick={onFragmentClick}/>
                )}
            </div>
        </div>
    )
}

type MessageCardProps = {
    content: string,
    role: MessageRole,
    fragment: Fragment | null,
    createdAt: Date,
    isActiveFragment: boolean,
    onFragmentClick: (fragment: Fragment) => void,
    type: MessageType
}
export const MessageCard = ({content, role, fragment, createdAt, isActiveFragment, onFragmentClick, type} : MessageCardProps) => {
    if(role == MessageRole.ASSISTANT) {
        return (
            <AssistantMessage
                content={content}
                fragment={fragment}
                createdAt={createdAt}
                onFragmentClick={onFragmentClick}
                isActiveFragment={isActiveFragment}
                type={type}
            />
        )
    }
    return (
        <UserMessage content={content} />
    )
}