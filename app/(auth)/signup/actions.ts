'use server'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Supabase signup error:', error)
    return {
      success: false,
      error: error.message || 'Signup failed',
    }
  }

  if (!authData?.user) {
    console.error('No user returned from Supabase signup')
    return {
      success: false,
      error: 'Account creation failed',
    }
  }

  console.log('Signup successful for:', authData.user.email)
  revalidatePath('/', 'layout')
  return { success: true, redirectTo: '/' }
}
