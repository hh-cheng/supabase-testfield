import { User } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'

export default function AppHeader() {
  return (
    <header className="h-16 border-b bg-background">
      <div className="flex h-full items-center justify-between px-6">
        <SidebarTrigger />

        <div className="flex items-center gap-4">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
            <User className="h-5 w-5" />
            <span className="sr-only">User menu</span>
          </button>
        </div>
      </div>
    </header>
  )
}
