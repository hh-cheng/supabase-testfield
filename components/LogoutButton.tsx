'use client'

import { from } from 'rxjs'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = () => {
    from(supabase.auth.signOut()).subscribe({
      next() {
        router.push('/login')
      },
      error(error) {
        console.error('Error signing out:', error)
      },
    })
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-red-500 hover:bg-accent cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  )
}
