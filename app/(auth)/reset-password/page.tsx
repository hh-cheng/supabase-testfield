'use client'
import { z } from 'zod'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { firstValueFrom, of, tap, concatMap } from 'rxjs'
import { useTransition, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createClient } from '@/lib/supabase/client'

const formSchema = z
  .object({
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters',
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [submitting, startSubmitting] = useTransition()
  const [resetCode, setResetCode] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)

  useEffect(() => {
    // Extract code from URL search params
    const code = searchParams.get('code')
    if (code) {
      setResetCode(code)
    } else {
      setTokenError(
        'Missing reset token. Please use the reset link from your email.',
      )
    }
  }, [searchParams])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (!resetCode) {
      toast.error(
        'Missing reset token. Please use the reset link from your email.',
      )
      return
    }

    startSubmitting(async () => {
      await firstValueFrom(
        of(createClient()).pipe(
          concatMap((supabase) =>
            supabase.auth.updateUser({ password: data.password }),
          ),
          tap(({ error }) => {
            if (error) {
              toast.error(`Password update failed: ${error}`)
            } else {
              toast.success('Password updated successfully')
              router.push('/login')
            }
          }),
        ),
      )
    })
  }

  return (
    <div className="w-[350px] max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Set New Password</h1>

      {tokenError ? (
        <div className="text-center text-red-600 mb-4">{tokenError}</div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Button
                type="submit"
                loading={submitting}
                className="w-full cursor-pointer"
              >
                Update Password
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
