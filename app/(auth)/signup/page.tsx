'use client'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { catchError, firstValueFrom, from, of, tap, map } from 'rxjs'

import { signup } from './actions'
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

const formSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Define the response type for our server actions
type ActionResponse =
  | { success: true; redirectTo: string }
  | { success: false; error: string }

export default function SignupPage() {
  const router = useRouter()
  const [submitting, startSubmitting] = useTransition()
  const [signupError, setSignupError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Clear any previous errors
    setSignupError(null)

    startSubmitting(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)

      await firstValueFrom(
        from(signup(formData) as Promise<ActionResponse>).pipe(
          tap((result) => {
            if (result.success) {
              toast.success(
                'Sign up successful! Please check your email to verify your account.',
              )
            }
          }),
          map((result) => {
            if (result.success && result.redirectTo) {
              router.push(result.redirectTo)
            }
            return result
          }),
          catchError((err) => {
            console.error('Signup error:', err)
            setSignupError(String(err))
            return of({ success: false, error: String(err) } as ActionResponse)
          }),
          tap((result) => {
            if (!result.success) {
              // Display a more user-friendly error message
              let errorMessage = result.error

              if (errorMessage.includes('already registered')) {
                errorMessage =
                  'This email is already registered. Please log in instead.'
              }

              setSignupError(errorMessage)
              toast.error(errorMessage)
            }
          }),
        ),
      )
    })
  }

  return (
    <div className="w-[350px] max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign up</h1>

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
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

          {signupError && (
            <div className="text-sm text-red-600 font-medium">
              {signupError}
            </div>
          )}

          <div>
            <Button type="submit" className="w-full" loading={submitting}>
              Sign up
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
