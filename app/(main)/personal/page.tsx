import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export default async function Personal() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Personal Profile</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 text-gray-900">{user.email}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <div className="mt-1 text-gray-900">{user.id}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Sign In
            </label>
            <div className="mt-1 text-gray-900">
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString()
                : 'Never'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
