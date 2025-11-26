import Prism from "prismjs"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-python"
import "prismjs/components/prism-tsx"

import "./code-theme.css"
import { useEffect } from "react"

type CodeViewProps = {
    code: string,
    lang: string,
}

export const CodeView = ({ code, lang } : CodeViewProps) => {

    useEffect(() => {
      Prism.highlightAll()
    }, [code])
    
  return (
    <pre className="p-2 bg-transparent border-none m-none rounded-none text-xs">
        <code className={`language-${lang}`}>
            {code}
        </code>
    </pre>
  )
};