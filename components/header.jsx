"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, Moon, Sun, User, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import LanguageSwitcher from "./lang-switch"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/stores"

export function EnhancedHeader() {
  const { t } = useTranslation('common')
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const lastSegment = pathname?.split('/').pop()?.split('?')[0]?.split('#')[0] ?? ''
  const { me, fetch } = useAuthStore()
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!me?.email) fetch()
  }, [me])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 flex h-14 items-center justify-between">
        <div className="mr-4 hidden md:flex">
          <SidebarTrigger className="me-4" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                {/* Translate "Dashboard" in Breadcrumb */}
                <BreadcrumbLink href="/dashboard">{t('Dashboard')}</BreadcrumbLink>
              </BreadcrumbItem>
              {lastSegment && lastSegment !== "dashboard" && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    {/* If lastSegment represents a specific route name that needs translation, 
                        you might map it to a translation key here.
                        For example, t(lastSegment) if your keys match your route segments.
                        Otherwise, capitalize it for display as it is. 
                        Let's assume for now your segments are translatable keys.
                    */}
                    <BreadcrumbPage className="capitalize">{t(lastSegment)}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}

            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex md:hidden">
          <SidebarTrigger className="-ml-1" />
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">{/* Search could go here */}</div>

          <nav className="flex items-center space-x-1">

            <Separator orientation="vertical" className="h-4 mx-2" />

            <LanguageSwitcher />

            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                {/* Translate "Toggle theme" for accessibility */}
                <span className="sr-only">{t('Toggle theme')}</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/profile.webp" alt={t("User profile image")} />
                    <AvatarFallback>
                      {mounted && me?.Employee
                        ? `${me.Employee.firstName?.[0] ?? ""}${me.Employee.lastName?.[0] ?? ""}`
                        : "AD"}
                    </AvatarFallback>

                    {/* <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {!mounted
                        ? t('AD') 
                        : me?.Employee
                          ? `${me.Employee.firstName[0]}${me.Employee.lastName[0]}`
                          : t('AD')} 
                    </AvatarFallback> */}

                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{me?.Employee ? `${me.Employee.firstName} ${me.Employee.lastName}` : t('Admin User')}</p> {/* Translate "Admin User" */}
                    <p className="text-xs leading-none text-muted-foreground">{me?.email || t('admin@fertilizer.com')} </p> {/* Translate default email if displayed */}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 capitalize">
                        {me?.Role?.name || t('Administrator')} {/* Translate "Administrator" */}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-muted-foreground">{t('Online')}</span> {/* Translate "Online" */}
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('Profile')}</span> {/* Translate "Profile" */}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('Settings')}</span> {/* Translate "Settings" */}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    try {
                      await fetch("/api/logout", { method: "POST" })
                      window.location.href = "/login"
                    } catch (err) {
                      console.error("Logout failed", err)
                    }
                  }}

                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('Log out')}</span> {/* Translate "Log out" */}
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )
}
