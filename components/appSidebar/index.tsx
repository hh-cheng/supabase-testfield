import Link from 'next/link'
import { Home, Users } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

const menuItems = [
  {
    icon: Home,
    groupName: 'admin',
    items: [
      {
        icon: Home,
        label: 'admin',
        href: '/admin',
      },
    ],
  },
  {
    icon: Users,
    groupName: 'user',
    items: [
      {
        icon: Users,
        label: 'user',
        href: '/user',
      },
    ],
  },
]

export default function AppSidebar() {
  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <Link href="/">
          <SidebarHeader className="border-b px-6 py-4 h-16">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </SidebarHeader>
        </Link>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent>
            {menuItems.map((item) => (
              <SidebarGroup key={item.groupName}>
                <SidebarGroupLabel>{item.groupName}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild>
                          <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </div>
      </div>
    </Sidebar>
  )
}
