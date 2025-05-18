# supabase login

## 路由鉴权

使用中间件进行路由保护，对于不需要权限验证的页面（比如注册登录页），可以通过以下两种方法避免鉴权

- 在中间件匹配路由处更改匹配正则
  ```ts
  export const config = {
    matcher: [
      '/((?!_next/static|_next/image|favicon.ico|public|login).*)',
    ],
  }
  ```
- 在 supabase 相关中间件中设置不需鉴权的路由

  ```ts
  const publicRoutes = ['/login']
  export async function updateSession(request: NextRequest) {
    // ...
    const {
      data: { user },
    } = await supabase.auth.getUser()
  
    if (!user && !publicRoutes.includes(request.nextUrl.pathname)) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    //...
  }
  ```

## 获取登录用户信息

> **客户端组件**

```tsx
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useTransition, useState } from 'react'
import { firstValueFrom, concatMap, map, catchError } from 'rxjs'

import { createClient } from '@/lib/supabase/client'

function ClientPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, startTransition] = useTransition()

  useEffect(() => {
    const getUser = () => {
      startTransition(async () => {
        await firstValueFrom(of(createClient).pipe(
          concatMap(supabase => supabase.auth.getUser()),
          map(({ data: { user }, error }) => {
            if (error) throw new Error(error)
            setUser(user)
          }),
          catchError(err => {
            console.error(err)
            toast.error(err)
          }),
        ))
      })
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  )
}
```

> **服务端组件**

```tsx
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

async function ServerPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <p>User ID: {user.id}</p>
      <p>
        Last Sign In:{' '}
        {user.last_sign_in_at
          ? new Date(user.last_sign_in_at).toLocaleString()
          : 'Never'}
      </p>
    </div>
  )
}
```

**注意**

永远使用 `supabase.auth.getUser()` 来校验用户信息，而不是使用 `supabase.auth.getSession()`

因为 cookies 等用户信息可能会被篡改，而 `getUser()` 会向 supabase 服务器发送校验请求，确保当前请求的用户信息真实性

