'use client'
import { z } from 'zod'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useTransition, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { catchError, firstValueFrom, from, of } from 'rxjs'

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

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(true)
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

      // await login(formData)
      await firstValueFrom(
        from(login(formData)).pipe(
          catchError((err) => {
            toast.error(`login: ${err}`)
            return of(null)
          }),
        ),
      )
    })
  }

  return (
    <div className="w-[350px] max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isLoggingIn ? 'Log In' : 'Sign Up'}
      </h1>

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

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={submitting}
              onClick={() => setIsLoggingIn(true)}
            >
              Log in
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
