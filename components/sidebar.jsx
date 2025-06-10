"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Building2,
  ChevronRight,
  ShieldAlert,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useCountStore } from "@/stores/count-store"

export function AppSidebar({ ...props }) {
  const pathname = usePathname()
  const { items, fetch } = useCountStore()

  React.useEffect(() => {
    fetch()
  }, [])


  const result = items.reduce((acc, item) => {
    acc[item.table_name] = item.count;
    return acc;
  }, {});

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Inventory",
      icon: Package,
      children: [
        { name: "Products", href: "/dashboard/products", badge: result.Product },
        { name: "Categories", href: "/dashboard/categories", badge: result.Category },
        { name: "Brand", href: "/dashboard/brands", badge: result.Brand },
        { name: "Stock", href: "/dashboard/inventory", badge: 12 },
      ],
    },
    {
      name: "Secure",
      icon: ShieldAlert,
      children: [
        { name: "Authentication", href: "/dashboard/auth", badge: result.Auth },
        { name: "Role", href: "/dashboard/roles", badge: result.Role },
      ],
    },
    {
      name: "People",
      icon: Users,
      children: [
        { name: "Employees", href: "/dashboard/employees", badge: result.Employee },
        // { name: "Customers", href: "/dashboard/customers", badge: result.Customer },
        { name: "Suppliers", href: "/dashboard/suppliers", badge: result.Supplier },

      ],
    },
    {
      name: "Organization",
      icon: Building2,
      children: [
        { name: "Branch", href: "/dashboard/branches", badge: result.Branch },
        { name: "Departments", href: "/dashboard/departments", badge: result.Department },
        { name: "Positions", href: "/dashboard/positions", badge: result.Position },
        // { name: "Addresses", href: "/dashboard/addresses", badge: result.Address },
        { name: "Event", href: "/dashboard/events", badge: result.Event },
        { name: "Attendance", href: "/dashboard/attendance", badge: result.Attendance },
      ],
    },
    {
      name: "Operations",
      icon: ShoppingCart,
      children: [
        { name: "Sales", href: "/dashboard/sales", badge: result.Sale },
        { name: "Payments", href: "/dashboard/payments", badge: result.Payment },
      ],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="font-bold text-sm">FS</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Fertilizer System</span>
                  <span className="truncate text-xs text-muted-foreground">v1.1.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                if (item.children) {
                  return (
                    <Collapsible
                      key={item.name}
                      asChild
                      defaultOpen={item.name === "Inventory"}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.name}>
                            {item.icon && <item.icon />}
                            <span>{item.name}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.name}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                  <Link href={subItem.href}>
                                    <span>{subItem.name}</span>
                                    {subItem.badge && (
                                      <Badge
                                        variant={subItem.badge === "new" ? "default" : "secondary"}
                                        className="ml-auto text-xs h-5 px-1.5"
                                      >
                                        {subItem.badge}
                                      </Badge>
                                    )}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name}>
                      <Link href={item.href}>
                        {item.icon && <item.icon />}
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
