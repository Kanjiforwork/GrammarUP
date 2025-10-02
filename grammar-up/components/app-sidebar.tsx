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
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Lessons",
    url: "/lessons",
    icon: BookOpenCheck,
  },
  {
    title: "Exercise",
    url: "/exercise",
    icon: Dumbbell,
  },
  {
    title: "Account",
    url: "/account",
    icon: CircleUser,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mt-5 ml-3 text-3xl font-bold text-dolphin">Grammar Up</SidebarGroupLabel>
          <SidebarGroupContent className="mt-5">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      size="lg" 
                      className={`text-xl my-1 pl-5 gap-5 transition-colors ${
                        isActive 
                          ? 'bg-dolphin text-white hover:bg-dolphin  hover:text-white' 
                          : 'hover:bg-gray-100 hover:text-gray-800'
                      }`}
                    >
                      <a href={item.url}>
                        <item.icon style={{width: '30px', height: '30px'}}/>
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