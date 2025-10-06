'use client'
import Link from 'next/link'
import { CircleUser,Dumbbell, BookOpenCheck, Home, Settings } from "lucide-react"
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
    <Sidebar className="border-r border-gray-100 relative overflow-hidden">
      {/* Subtle gradient background - matching home page */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-teal-50/20 -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-4 w-24 h-24 bg-teal-100/30 rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-32 left-4 w-20 h-20 bg-teal-200/20 rounded-full blur-xl -z-10" />
      
      <SidebarContent className="pt-8">
        <SidebarGroup>
          {/* Logo with elegant typography - matching home */}
          <SidebarGroupLabel className="mb-12 ml-4 text-3xl font-bold text-gray-900 tracking-tight">
            Grammar<span className="text-teal-500">Up</span>
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="px-4">
            <SidebarMenu className="space-y-2">
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      size="lg" 
                      className={`text-base font-medium py-4 px-5 rounded-2xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-teal-500 text-white shadow-md hover:bg-teal-600 hover:text-white hover:shadow-lg' 
                          : 'text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                      }`}
                    >
                      <a href={item.url} className="flex items-center gap-4">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-teal-500'}`} />
                        <span className="font-semibold">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Bottom decoration */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-teal-500 to-teal-300 rounded-full opacity-50" />
      </SidebarContent>
    </Sidebar>
  )
}