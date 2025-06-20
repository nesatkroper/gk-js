"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { User, Building2, FileText, MapPin, Bookmark, Settings, Bell, Calendar, TrendingUp, Clock } from "lucide-react"
import { Details } from "@/app/home/detail"
import { OverView } from "@/app/home/overview"
import { Attendance } from "@/app/home/attendance"
import { ClientCustomer } from "@/app/home/agent"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "@/stores"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function Home() {
  const { t } = useTranslation("common")
  const { items, fetch } = useAuthStore()

  const [activeTab, setActiveTab] = useState("overview")
  const [performanceValue, setPerformanceValue] = useState(0)

  const formatDate = (date) => {
    if (!date) return "N/A"
    return format(new Date(date), "MMM dd, yyyy")
  }

  useEffect(() => {
    if (!items) {
      fetch({ min: true })
    }
  }, [fetch, items])


  useEffect(() => {
    const timer = setTimeout(() => {
      setPerformanceValue(85)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  console.log(items)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()
  }

  const calculateServiceDuration = (hiredDate) => {
    if (!hiredDate) return "N/A"

    const hired = new Date(hiredDate)
    const now = new Date()
    const diffYears = now.getFullYear() - hired.getFullYear()
    const diffMonths = now.getMonth() - hired.getMonth()

    let duration = ""
    if (diffYears > 0) {
      duration += `${diffYears} ${t(diffYears > 1 ? "years" : "year")}`
    }
    if (diffMonths > 0) {
      if (duration) duration += ", "
      duration += `${diffMonths} ${t(diffMonths > 1 ? "months" : "month")}`
    }

    return duration || `0 ${t("months")}`
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-500"
      case "on leave":
        return "bg-amber-500"
      case "suspended":
        return "bg-red-500"
      default:
        return "bg-slate-500"
    }
  }

  return (
    <div className="min-h-screen ">
      <div className="mx-auto space-y-6">
        <div className="relative">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200')] opacity-5 bg-cover bg-center"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-3xl"></div>

            <CardContent className="relative p-4">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 blur-sm"></div>
                    <Avatar className="relative h-32 w-32 border-4 border-white/20 shadow-2xl">
                      <AvatarImage
                        src={items?.employee?.picture || "/images/profile.webp?height=128&width=128"}
                        alt={`${items?.employee?.firstName} ${items?.employee?.lastName}`}
                        loading="lazy"
                      />
                      <AvatarFallback className="text-2xl bg-slate-700 text-white">
                        {getInitials(items?.employee?.firstName, items?.employee?.lastName) || "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-2 right-2 h-6 w-6 rounded-full border-3 border-white ${getStatusColor(items?.status)} shadow-lg`}
                    ></div>
                  </div>

                  <div className="space-y-4 text-center sm:text-left">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">
                        {items?.employee?.firstName} {items?.employee?.lastName || "Admin"}
                      </h1>
                      <p className="text-xl text-white/80 font-medium">
                        {items?.employee?.Position?.positionName || "Administrator"}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                      <Badge className="bg-white/15 hover:bg-white/25 text-white border-white/20 px-3 py-1">
                        <User className="h-4 w-4 mr-2" />
                        {items?.employee?.employeeCode || "Owner"}
                      </Badge>
                      <Badge className="bg-white/15 hover:bg-white/25 text-white border-white/20 px-3 py-1">
                        <Building2 className="h-4 w-4 mr-2" />
                        {items?.employee?.Department?.departmentName || "Super Admin"}
                      </Badge>
                      <Badge className="bg-white/15 hover:bg-white/25 text-white border-white/20 px-3 py-1">
                        <MapPin className="h-4 w-4 mr-2" />
                        {items?.employee?.Branch?.branchName || "Headquarters"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="lg:ml-auto flex flex-wrap gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('Notifications')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('Settings')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button className="bg-white text-slate-900 hover:bg-white/90">
                    <FileText className="mr-2 h-4 w-4" />
                    {t("Documents")}
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-sm text-white/70">{t("Service Duration")}</div>
                      <div className="text-lg font-semibold">{calculateServiceDuration(items?.employee?.hiredDate)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                      <div className="text-sm text-white/70">{t("Salary")}</div>
                      <div className="text-lg font-semibold">{formatCurrency(items?.employee?.salary || 0)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-sm text-white/70">{t("Hired Date")}</div>
                      <div className="text-lg font-semibold">{formatDate(items?.employee?.hiredDate)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-300" />
                    </div>
                    <div>
                      <div className="text-sm text-white/70">{t("Performance")}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold">{performanceValue}%</div>
                        <Progress value={performanceValue} className="h-2 w-16 bg-white/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                {t("Overview")}
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                {t("Details")}
              </TabsTrigger>
              <TabsTrigger
                value="attendance"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
              >
                {t("Attendance")}
              </TabsTrigger>
              <TabsTrigger value="agent" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                {t("Customer")}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-white shadow-sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("Export Profile")}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-white shadow-sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("Save Profile")}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <OverView emp={items?.employee} />
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Details emp={items?.employee} />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Attendance emp={items} />
          </TabsContent>

          <TabsContent value="agent" className="space-y-6">
            <ClientCustomer customers={[]} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}



