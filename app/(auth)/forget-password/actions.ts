'use server'

import { createClient } from '@/lib/supabase/server'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  // Get the email from the form
  const email = formData.get('email') as string

  // Determine the base URL for redirection
  const baseUrl = process.env.BASE_URL

  // Send a password reset email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
