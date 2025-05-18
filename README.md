# supabase login

## 路由鉴权

使用中间件进行路由保护，对于不需要权限验证的页面（比如注册登录页），可以通过以下两种方法避免鉴权

- 在中间件匹配路由处更改匹配正则
  ```ts
  export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       * - public folder
       * - auth routes (login, signup, etc.)
       */
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

## 退出登录

### 1. 组件式实现

创建一个专用的登出按钮组件，确保在任何地方都能一致地处理登出逻辑：

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return <button onClick={handleSignOut}>Logout</button>
}
```

### 2. 内联使用

在任何客户端组件内直接调用登出方法：

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div>
      {/* 其他内容 */}
      <button onClick={handleSignOut}>退出登录</button>
    </div>
  )
}
```

### 3. 混合服务端/客户端方案（推荐）

这种方法将登出逻辑放在服务端API路由中，客户端组件只负责调用API和处理导航：

1. 首先创建一个服务端API路由：

```tsx
// app/api/auth/logout/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
```

2. 然后创建一个精简的客户端组件来调用它：

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Logout failed')
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return <button onClick={handleSignOut}>Logout</button>
}
```

这种方法的优点：

- 将大部分认证逻辑移到服务端
- 客户端组件保持简洁，只处理UI交互和导航
- 更好的安全性，因为登出逻辑在服务端执行
- 遵循Next.js应用路由最佳实践

### 注意事项

- 登出按钮必须是客户端组件，因为它需要处理点击事件和客户端导航
- 登出操作后应该重定向到登录页面或首页
- 登出后，Supabase会自动清除会话Cookie

## 获取登录用户信息

> **客户端组件**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

function ClientPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) throw error
        setUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
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

### 注意

永远使用 `supabase.auth.getUser()` 来校验用户信息，而不是使用 `supabase.auth.getSession()`

因为 cookies 等用户信息可能会被篡改，而 `getUser()` 会向 supabase 服务器发送校验请求，确保当前请求的用户信息真实性

### 主要区别

1. **客户端组件**:

   - 可以处理实时状态更新
   - 适合需要交互的组件（如登出按钮）
   - 使用 createClient() 创建客户端实例

2. **服务端组件**:
   - 使用 await createClient() 创建服务端实例

### 使用建议

- 对于需要用户交互的组件（如登录表单、登出按钮），使用客户端组件
- 对于主要展示用户信息的页面，使用服务端组件
- 服务端组件可以自动处理重定向，无需额外的客户端逻辑
- 客户端组件提供更好的用户体验，但需要处理加载状态
