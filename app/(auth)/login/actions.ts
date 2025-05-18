'use server'
import { catchError, concatMap, firstValueFrom, from, map, of } from 'rxjs'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  return await firstValueFrom(
    from(createClient()).pipe(
      concatMap((supabase) => {
        const data = {
          email: formData.get('email') as string,
          password: formData.get('password') as string,
        }
        return supabase.auth.signInWithPassword(data)
      }),
      map(({ data, error }) => {
        if (error) {
          console.log('Supabase auth error:', error)
          return {
            success: false,
            error: error.message || 'Authentication failed',
          }
        }

        if (!data?.user) {
          console.log('No user returned from Supabase')
          return {
            success: false,
            error: 'No user found',
          }
        }

        return { success: true, redirectTo: '/' }
      }),
      catchError((err) => {
        console.log('err in login', err)
        return of({ success: false, error: `${err}` })
      }),
    ),
  )
}
