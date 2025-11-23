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
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronLeft, SunMoonIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
    projectId : string,
}


const ProjectHeader = ( {projectId} : Props ) => {
  const { theme, setTheme } = useTheme();
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
            <Image src="./logo.svg" alt="Vibe"  width={18} height={18}/>
            <span className='text-sm font-medium'>{project.name}</span>
            <ChevronDown />
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
    </div>
  )
}

export default ProjectHeader