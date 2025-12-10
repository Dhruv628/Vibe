import Navbar from "@/modules/home/ui/components/navbar";

type Props = {
    children : React.ReactNode
}

const Layout = ({children}:Props) =>{
    return(
        <main className="relative flex flex-col min-h-screen">
          <Navbar />  
          <div className="fixed inset-0 -z-10 h-full w-full">
            {/* Gradient bg  */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-[#1a1625] dark:via-[#2d1b3d] dark:to-[#1a1625]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent dark:from-purple-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-200/20 via-transparent to-transparent dark:from-pink-500/10" /> */}
            </div>
            <div className="flex-1 flex flex-col px-4 pb-4">
                {children}
            </div>
        </main> 
    )
}
export default Layout;