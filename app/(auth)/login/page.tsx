'use client'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { firstValueFrom, from, tap } from 'rxjs'
import { zodResolver } from '@hookform/resolvers/zod'

import { login } from './actions'
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
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
})

// Define the response type for our server actions
type ActionResponse =
  | { success: true; redirectTo: string }
  | { success: false; error: string }

export default function LoginPage() {
  const router = useRouter()
  const [submitting, startSubmitting] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    startSubmitting(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)

      await firstValueFrom(
        from(login(formData) as Promise<ActionResponse>).pipe(
          tap((result) => {
            if (result.success) {
              toast.success('Login successful')
              router.push(result.redirectTo)
            } else {
              toast.error(result.error)
            }
          }),
        ),
      )
    })
  }

  return (
    <div className="w-[350px] max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Log in</h1>

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

          <div className="text-right">
            <Link
              href="/forget-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div>
            <Button type="submit" className="w-full" loading={submitting}>
              Log in
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
