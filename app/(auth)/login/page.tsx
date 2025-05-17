'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { login, signup } from './actions'

type FormData = {
  email: string
  password: string
}

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(true)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    // Convert to FormData for server action
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    if (isLoggingIn) {
      await login(formData)
    } else {
      await signup(formData)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isLoggingIn ? 'Log In' : 'Sign Up'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            onClick={() => setIsLoggingIn(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Log in
          </button>
          <button
            type="submit"
            onClick={() => setIsLoggingIn(false)}
            className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  )
}
