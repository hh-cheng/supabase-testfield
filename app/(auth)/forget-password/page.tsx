'use client'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { catchError, firstValueFrom, from, of, tap } from 'rxjs'

import { resetPassword } from './actions'
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

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
})

// Define the response type for our server actions
type ActionResponse = { success: true } | { success: false; error: string }

export default function ForgetPassword() {
  const [submitting, startSubmitting] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    startSubmitting(async () => {
      const formData = new FormData()
      formData.append('email', data.email)

      await firstValueFrom(
        from(resetPassword(formData) as Promise<ActionResponse>).pipe(
          tap((result) => {
            if (result.success) {
              toast.success('Password reset email sent. Check your inbox.')
              form.reset()
            }
          }),
          catchError((err) => {
            toast.error(`Password reset failed: ${err}`)
            return of({ success: false, error: String(err) } as ActionResponse)
          }),
          tap((result) => {
            if (!result.success) {
              toast.error(`Password reset failed: ${result.error}`)
            }
          }),
        ),
      )
    })
  }

  return (
    <div className="w-[350px] max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button
              type="submit"
              loading={submitting}
              className="w-full mb-4 cursor-pointer"
            >
              Send Reset Link
            </Button>

            <div className="text-center text-sm">
              <Link href="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
