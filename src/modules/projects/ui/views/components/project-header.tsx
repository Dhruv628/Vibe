import { Button } from '@/components/ui/button'
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuSubContent, 
    DropdownMenuItem, 
    DropdownMenuPortal, 
    DropdownMenuRadioGroup, 
    DropdownMenuRadioItem, 
    DropdownMenuSeparator, 
    DropdownMenuSub, 
    DropdownMenuSubTrigger, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import UserControl from '@/components/user-control'
import { useTRPC } from '@/trpc/client'
import { useAuth } from '@clerk/nextjs'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronLeft, CrownIcon, SunMoonIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
    projectId : string,
}


const ProjectHeader = ( {projectId} : Props ) => {
  const { theme, setTheme } = useTheme();
  const  { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro" });

  const trpc = useTRPC();
  

  const { data: project } = useSuspenseQuery(trpc.projects.getOne.queryOptions({
    id: projectId,
  }));

  
  return (
    <div className='p-2 flex justify-between items-center border-b'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost"
          size="sm"
          className="focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity pl-2"
          >
            <Image 
              src="/logo.svg" 
              alt="Vibe" 
              width={18} 
              height={18}
              className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
            />
            <span className='text-sm font-medium truncate max-w-[120px] sm:max-w-[200px] md:max-w-none'>{project.name}</span>
            <ChevronDown className="w-4 h-4 shrink-0"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='bottom' align='start'>
          <DropdownMenuItem asChild>
            <Link href="/">
                <ChevronLeft/> 
                <span>Go to dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='gap-2'>
              <SunMoonIcon className='size-4 text-muted-foreground' />
              <span>Appearance</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={theme || "light"} onValueChange={(value) => setTheme(value)}>
                  <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="md:hidden flex items-center gap-2">
          <UserControl />
          {hasProAccess &&  
            <Button asChild size="sm" variant="tertiary" className="text-xs sm:text-sm h-8.5">
                <Link href="/pricing">
                    <CrownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> <span className="hidden sm:inline">Upgrade</span>
                </Link>
            </Button>
          } 
      </div>
    </div>
  )
}

export default ProjectHeader