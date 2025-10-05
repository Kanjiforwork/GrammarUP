'use client'
import Link from 'next/link'
import { CircleUser,Dumbbell, BookOpenCheck, Home, Inbox, Search, Settings } from "lucide-react"
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Trang chủ",
    url: "/",
    icon: Home,
  },
  {
    title: "Học",
    url: "/lessons",
    icon: BookOpenCheck,
  },
  {
    title: "Luyện tập",
    url: "/exercise",
    icon: Dumbbell,
  },
  {
    title: "Tài khoản",
    url: "/account",
    icon: CircleUser,
  },
  {
    title: "Cài đặt",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar className="border-r border-gray-100 bg-white">
      <SidebarContent>
        <SidebarGroup>
          {/* Logo with elegant typography */}
          <SidebarGroupLabel className="mt-8 mb-8 ml-4 text-2xl font-bold text-gray-800 tracking-tight">
            Grammar<span className="text-teal-500">Up</span>
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="px-3">
            <SidebarMenu className="space-y-1">
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      size="lg" 
                      className={`text-base font-medium py-3 px-4 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-teal-500 text-white shadow-sm hover:bg-teal-600 hover:text-white' 
                          : 'text-gray-700 hover:shadow-md hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}