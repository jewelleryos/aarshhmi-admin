"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HelpCircle, LogOut, Gem, ChevronsUpDown, ChevronRight } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/store"
import { logoutUser } from "@/redux/slices/authSlice"
import { sidebarConfig } from "@/configs"
import { filterNavigation } from "@/lib/permissions"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const dispatch = useAppDispatch()
  const { user, isLoading, permissions } = useAppSelector((state) => state.auth)

  // Filter navigation based on user permissions
  const filteredNav = useMemo(
    () => filterNavigation(sidebarConfig, permissions),
    [permissions]
  )

  // Get user initials for avatar
  const userInitials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : "??"

  const userFullName = user ? `${user.first_name} ${user.last_name}` : "User"

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/login")
  }

  return (
    <Sidebar collapsible="icon">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white">
                  <Gem className="size-4 text-[#14344A]" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Luminique</span>
                  <span className="text-xs text-white">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        {/* Ungrouped items */}
        {filteredNav.some((item) => item.type !== "group") && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {filteredNav.map((item) => {
                  if (item.type === "item") {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className="py-2.5">
                          <Link href={item.href}>
                            {Icon && <Icon className={isActive ? "text-primary" : ""} />}
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }
                  // TODO: Handle dropdown and master types when needed
                  return null
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Grouped items */}
        {filteredNav
          .filter((item) => item.type === "group")
          .map((group) => {
            if (group.type !== "group") return null
            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {group.children.map((child) => {
                      if (child.type === "item") {
                        const isActive = pathname === child.href
                        const Icon = child.icon
                        return (
                          <SidebarMenuItem key={child.id}>
                            <SidebarMenuButton asChild isActive={isActive} tooltip={child.label} className="py-2.5">
                              <Link href={child.href}>
                                {Icon && <Icon className={isActive ? "text-primary" : ""} />}
                                <span>{child.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      }

                      if (child.type === "dropdown") {
                        const Icon = child.icon
                        const isAnyChildActive = child.children.some((subItem) => pathname === subItem.href)
                        return (
                          <Collapsible key={child.id} asChild defaultOpen={isAnyChildActive} className="group/collapsible">
                            <SidebarMenuItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={child.label} className="py-2.5">
                                  {Icon && <Icon className={isAnyChildActive ? "text-primary" : ""} />}
                                  <span>{child.label}</span>
                                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  {child.children.map((subItem) => {
                                    const isActive = pathname === subItem.href
                                    const SubIcon = subItem.icon
                                    return (
                                      <SidebarMenuSubItem key={subItem.id}>
                                        <SidebarMenuSubButton asChild isActive={isActive}>
                                          <Link href={subItem.href}>
                                            {SubIcon && <SubIcon className={isActive ? "text-primary" : ""} />}
                                            <span>{subItem.label}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      </SidebarMenuSubItem>
                                    )
                                  })}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuItem>
                          </Collapsible>
                        )
                      }

                      return null
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
          })}
      </SidebarContent>

      {/* Footer with User Menu */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="" alt={userFullName} />
                    <AvatarFallback className="rounded-lg bg-white text-[#14344A]">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userFullName}</span>
                    <span className="truncate text-xs text-white">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isCollapsed ? "right" : "top"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoading ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Rail for collapse/expand on hover */}
      <SidebarRail />
    </Sidebar>
  )
}
