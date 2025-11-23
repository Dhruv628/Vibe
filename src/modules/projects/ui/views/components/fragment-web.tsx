import { Hint } from '@/components/hint'
import { Button } from '@/components/ui/button'
import { Fragment } from '@/generated/prisma/client'
import { ExternalLink, RefreshCcw } from 'lucide-react'
import React, { useState } from 'react'

type FragmentWebProps = {
    fragment: Fragment
}

const FragmentWeb = ( { fragment } : FragmentWebProps ) => {
  const [copied, setCopied] = useState(false)
  const [fragmentKey, setFragmentKey] = useState(0)

  const onRefresh = () => {
    setFragmentKey((prev) => prev + 1)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(fragment.sandboxUrl || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className='h-full w-full flex flex-col'>
        <div className='p-2 border-b bg-sidebar flex items-center gap-x-2'>
            <Hint text="Refresh Preview" side='bottom'>
                <Button size='sm' variant='outline' onClick={onRefresh}>
                    <RefreshCcw className='size-4 ' />
                </Button>
            </Hint>
            <Hint text="Copy URL" side='bottom'>
                <Button disabled={!fragment.sandboxUrl || copied} size='sm' variant='outline' onClick={handleCopy} className='flex-1 justify-start text-start font-normal'>
                    <span className='truncate'>
                        {fragment.sandboxUrl}
                    </span>
                </Button>
            </Hint>
            <Hint text="Open in new tab" side='bottom' align='start'>
                <Button  disabled={!fragment.sandboxUrl} size='sm' variant='outline' onClick={() => { if(fragment.sandboxUrl){window.open(fragment.sandboxUrl,"_blank")} }} className='flex-1 justify-start text-start font-normal'>
                    <ExternalLink />
                </Button>
            </Hint>
        </div>
        <iframe 
            key={fragmentKey}
            className='h-full w-full'
            sandbox='allow-forms allow-scripts allow-same-origin'
            src={fragment.sandboxUrl}
        />
    </div>
  )
}

export default FragmentWeb