"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Award,
  Sparkles,
  BarChart3,
  CalendarDays,
  Zap,
  UserCheck,
  Users,
  CheckCircle,
  Target,
} from "lucide-react"
import { useTranslation } from "react-i18next"; // Import useTranslation

export function OverView({ emp = [] }) {
  const { t } = useTranslation('common'); // Initialize useTranslation
  const [showAllMetrics, setShowAllMetrics] = useState(false)

  const formatDate = (date) => {
    if (!date) return "N/A"
    return format(new Date(date), "MMM dd, yyyy")
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const performanceMetrics = [
    { name: t("Productivity"), value: 92, icon: Zap, color: "text-blue-600", bgColor: "bg-blue-50" },
    { name: t("Attendance"), value: 96, icon: UserCheck, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { name: t("Task Completion"), value: 88, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
    { name: t("Team Collaboration"), value: 90, icon: Users, color: "text-purple-600", bgColor: "bg-purple-50" },
    { name: t("Quality of Work"), value: 85, icon: Award, color: "text-amber-600", bgColor: "bg-amber-50" },
  ]

  const recentAchievements = [
    {
      title: t("Employee of the Month"),
      date: "April 2023",
      icon: Award,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: t("Perfect Attendance"),
      date: "Q1 2023",
      icon: Calendar,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: t("Project Excellence Award"),
      date: "March 2023",
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const upcomingEvents = [
    {
      title: t("Team Building Event"),
      date: "May 15, 2023",
      type: "event",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: t("Performance Review"),
      date: "May 20, 2023",
      type: "meeting",
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: t("Training: Leadership Skills"),
      date: "May 25, 2023",
      type: "training",
      icon: Target,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ]

  const calculateServiceDuration = (hiredDate) => {
    if (!hiredDate) return "N/A"

    const hired = new Date(hiredDate)
    const now = new Date()
    const diffYears = now.getFullYear() - hired.getFullYear()
    const diffMonths = now.getMonth() - hired.getMonth()

    if (diffYears > 0) {
      return `${diffYears} ${t(diffYears > 1 ? "years" : "year")}${diffMonths > 0 ? `, ${diffMonths} ${t(diffMonths > 1 ? "months" : "month")}` : ""
        }`
    }

    return `${diffMonths} ${t(diffMonths > 1 ? "months" : "month")}`
  }

  const formatTel = (phoneNumber) => `+855 ${phoneNumber.substring(1, 3)} ${phoneNumber.substring(3, 6)} ${phoneNumber.substring(6)}`



  const infoCards = [
    {
      title: t("Position"),
      value: emp?.Position?.positionName || "N/A",
      subtitle: t("Career Level: Senior"),
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: t("Department"),
      value: emp?.Department?.departmentName || "N/A",
      subtitle: t("Reports to: Director"),
      icon: Building2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
    {
      title: t("Salary"),
      value: formatCurrency(emp?.salary || 0),
      subtitle: t("Last review: 3 months ago"),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: t("Hired Date"),
      value: formatDate(emp?.hiredDate),
      subtitle: `${t("Tenure")}: ${calculateServiceDuration(emp?.hiredDate)}`,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: t("Contact"),
      value: formatTel(emp?.phone) || "N/A",
      subtitle: t("Extension: +855"),
      icon: Phone,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    },
    {
      title: t("Email"),
      value: emp?.email || "N/A",
      subtitle: t("Corporate account"),
      icon: Mail,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {infoCards.map((card, index) => (
          <Card key={index} className={`border-2 rounded-lg ${card.borderColor} shadow-sm hover:shadow-md transition-shadow p-0`}>
            <CardHeader className={`py-3 rounded-t-lg ${card.bgColor}`}>
              <CardTitle className={`text-sm font-medium flex items-center gap-2 ${card.color}`}>
                <card.icon className="h-5 w-5" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-lg font-semibold text-slate-900 truncate">{card.value}</p>
              <p className="text-sm text-slate-600 mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Metrics */}
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              {t("Performance Metrics")}
            </CardTitle>
            <CardDescription>{t("Current performance indicators and achievements")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {performanceMetrics.slice(0, showAllMetrics ? performanceMetrics.length : 3).map((metric, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${metric.bgColor} rounded-lg`}>
                        <metric.icon className={`h-5 w-5 ${metric.color}`} />
                      </div>
                      <span className="font-medium text-slate-900">{metric.name}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => setShowAllMetrics(!showAllMetrics)}
            >
              {showAllMetrics ? t("Show Less") : t("Show All Metrics")}
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Achievements */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              {t("Recent Achievements")}
            </CardTitle>
            <CardDescription>{t("Recognition and awards")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAchievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className={`p-3 ${achievement.bgColor} rounded-lg`}>
                    <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{achievement.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CalendarDays className="h-6 w-6 text-emerald-600" />
            </div>
            {t("Upcoming Events")}
          </CardTitle>
          <CardDescription>{t("Your scheduled events and important deadlines")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:shadow-md transition-all"
              >
                <div className={`p-3 ${event.bgColor} rounded-lg`}>
                  <event.icon className={`h-6 w-6 ${event.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 mb-1">{event.title}</p>
                  <p className="text-sm text-slate-600">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



// "use client"

// import { useState } from "react"
// import { format } from "date-fns"
// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import {
//   Briefcase,
//   Building2,
//   Calendar,
//   DollarSign,
//   Phone,
//   Mail,
//   Award,
//   Sparkles,
//   BarChart3,
//   CalendarDays,
//   Zap,
//   UserCheck,
//   Users,
//   CheckCircle,
//   Target,
// } from "lucide-react"

// export function OverView({ emp = [] }) {
//   const [showAllMetrics, setShowAllMetrics] = useState(false)

//   const formatDate = (date) => {
//     if (!date) return "N/A"
//     return format(new Date(date), "MMM dd, yyyy")
//   }

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(amount)
//   }

//   const performanceMetrics = [
//     { name: "Productivity", value: 92, icon: Zap, color: "text-blue-600", bgColor: "bg-blue-50" },
//     { name: "Attendance", value: 96, icon: UserCheck, color: "text-emerald-600", bgColor: "bg-emerald-50" },
//     { name: "Task Completion", value: 88, icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-50" },
//     { name: "Team Collaboration", value: 90, icon: Users, color: "text-purple-600", bgColor: "bg-purple-50" },
//     { name: "Quality of Work", value: 85, icon: Award, color: "text-amber-600", bgColor: "bg-amber-50" },
//   ]

//   const recentAchievements = [
//     {
//       title: "Employee of the Month",
//       date: "April 2023",
//       icon: Award,
//       color: "text-amber-600",
//       bgColor: "bg-amber-50",
//     },
//     {
//       title: "Perfect Attendance",
//       date: "Q1 2023",
//       icon: Calendar,
//       color: "text-emerald-600",
//       bgColor: "bg-emerald-50",
//     },
//     {
//       title: "Project Excellence Award",
//       date: "March 2023",
//       icon: Sparkles,
//       color: "text-purple-600",
//       bgColor: "bg-purple-50",
//     },
//   ]

//   const upcomingEvents = [
//     {
//       title: "Team Building Event",
//       date: "May 15, 2023",
//       type: "event",
//       icon: Calendar,
//       color: "text-blue-600",
//       bgColor: "bg-blue-50",
//     },
//     {
//       title: "Performance Review",
//       date: "May 20, 2023",
//       type: "meeting",
//       icon: Users,
//       color: "text-emerald-600",
//       bgColor: "bg-emerald-50",
//     },
//     {
//       title: "Training: Leadership Skills",
//       date: "May 25, 2023",
//       type: "training",
//       icon: Target,
//       color: "text-amber-600",
//       bgColor: "bg-amber-50",
//     },
//   ]

//   const calculateServiceDuration = (hiredDate) => {
//     if (!hiredDate) return "N/A"

//     const hired = new Date(hiredDate)
//     const now = new Date()
//     const diffYears = now.getFullYear() - hired.getFullYear()
//     const diffMonths = now.getMonth() - hired.getMonth()

//     if (diffYears > 0) {
//       return `${diffYears} year${diffYears > 1 ? "s" : ""}${
//         diffMonths > 0 ? `, ${diffMonths} month${diffMonths > 1 ? "s" : ""}` : ""
//       }`
//     }

//     return `${diffMonths} month${diffMonths > 1 ? "s" : ""}`
//   }

//   const infoCards = [
//     {
//       title: "Position",
//       value: emp?.position?.positionName || "N/A",
//       subtitle: "Career Level: Senior",
//       icon: Briefcase,
//       color: "text-blue-600",
//       bgColor: "bg-blue-50",
//       borderColor: "border-blue-200",
//     },
//     {
//       title: "Department",
//       value: emp?.department?.departmentName || "N/A",
//       subtitle: "Reports to: Director",
//       icon: Building2,
//       color: "text-emerald-600",
//       bgColor: "bg-emerald-50",
//       borderColor: "border-emerald-200",
//     },
//     {
//       title: "Salary",
//       value: formatCurrency(emp?.salary || 0),
//       subtitle: "Last review: 3 months ago",
//       icon: DollarSign,
//       color: "text-green-600",
//       bgColor: "bg-green-50",
//       borderColor: "border-green-200",
//     },
//     {
//       title: "Hired Date",
//       value: formatDate(emp?.hiredDate),
//       subtitle: `Tenure: ${calculateServiceDuration(emp?.hiredDate)}`,
//       icon: Calendar,
//       color: "text-purple-600",
//       bgColor: "bg-purple-50",
//       borderColor: "border-purple-200",
//     },
//     {
//       title: "Contact",
//       value: emp?.phone || "N/A",
//       subtitle: "Extension: +855",
//       icon: Phone,
//       color: "text-amber-600",
//       bgColor: "bg-amber-50",
//       borderColor: "border-amber-200",
//     },
//     {
//       title: "Email",
//       value: emp?.info?.email || "N/A",
//       subtitle: "Corporate account",
//       icon: Mail,
//       color: "text-rose-600",
//       bgColor: "bg-rose-50",
//       borderColor: "border-rose-200",
//     },
//   ]

//   return (
//     <div className="space-y-8">
//       {/* Employee Information Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {infoCards.map((card, index) => (
//           <Card key={index} className={`border-2 ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}>
//             <CardHeader className={`pb-3 ${card.bgColor}`}>
//               <CardTitle className={`text-sm font-medium flex items-center gap-2 ${card.color}`}>
//                 <card.icon className="h-5 w-5" />
//                 {card.title}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="pt-4">
//               <p className="text-lg font-semibold text-slate-900 truncate">{card.value}</p>
//               <p className="text-sm text-slate-600 mt-1">{card.subtitle}</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Performance Metrics */}
//         <Card className="lg:col-span-2 shadow-lg border-0">
//           <CardHeader className="pb-4">
//             <CardTitle className="flex items-center gap-3">
//               <div className="p-2 bg-blue-50 rounded-lg">
//                 <BarChart3 className="h-6 w-6 text-blue-600" />
//               </div>
//               Performance Metrics
//             </CardTitle>
//             <CardDescription>Current performance indicators and achievements</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-6">
//               {performanceMetrics.slice(0, showAllMetrics ? performanceMetrics.length : 3).map((metric, index) => (
//                 <div key={index} className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                       <div className={`p-2 ${metric.bgColor} rounded-lg`}>
//                         <metric.icon className={`h-5 w-5 ${metric.color}`} />
//                       </div>
//                       <span className="font-medium text-slate-900">{metric.name}</span>
//                     </div>
//                     <span className="text-lg font-bold text-slate-900">{metric.value}%</span>
//                   </div>
//                   <Progress value={metric.value} className="h-3" />
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//           <CardFooter>
//             <Button
//               variant="ghost"
//               className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
//               onClick={() => setShowAllMetrics(!showAllMetrics)}
//             >
//               {showAllMetrics ? "Show Less" : "Show All Metrics"}
//             </Button>
//           </CardFooter>
//         </Card>

//         {/* Recent Achievements */}
//         <Card className="shadow-lg border-0">
//           <CardHeader className="pb-4">
//             <CardTitle className="flex items-center gap-3">
//               <div className="p-2 bg-amber-50 rounded-lg">
//                 <Award className="h-6 w-6 text-amber-600" />
//               </div>
//               Recent Achievements
//             </CardTitle>
//             <CardDescription>Recognition and awards</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {recentAchievements.map((achievement, index) => (
//                 <div
//                   key={index}
//                   className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
//                 >
//                   <div className={`p-3 ${achievement.bgColor} rounded-lg`}>
//                     <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
//                   </div>
//                   <div className="flex-1">
//                     <p className="font-semibold text-slate-900">{achievement.title}</p>
//                     <p className="text-sm text-slate-600 mt-1">{achievement.date}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Upcoming Events */}
//       <Card className="shadow-lg border-0">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-3">
//             <div className="p-2 bg-emerald-50 rounded-lg">
//               <CalendarDays className="h-6 w-6 text-emerald-600" />
//             </div>
//             Upcoming Events
//           </CardTitle>
//           <CardDescription>Your scheduled events and important deadlines</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {upcomingEvents.map((event, index) => (
//               <div
//                 key={index}
//                 className="flex items-start gap-4 p-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:shadow-md transition-all"
//               >
//                 <div className={`p-3 ${event.bgColor} rounded-lg`}>
//                   <event.icon className={`h-6 w-6 ${event.color}`} />
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-semibold text-slate-900 mb-1">{event.title}</p>
//                   <p className="text-sm text-slate-600">{event.date}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


