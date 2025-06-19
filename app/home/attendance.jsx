"use client"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Calendar,
  FileText,
  Clock,
  BarChart3,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Plus,
} from "lucide-react"
import { useTranslation } from "react-i18next"

export function Attendance({ emp = [] }) {
  const { t } = useTranslation("common")

  const attendanceStats = [
    {
      label: "Present",
      value: 92,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      progressColor: "bg-emerald-500",
    },
    { label: "Absent", value: 3, color: "text-red-600", bgColor: "bg-red-50", progressColor: "bg-red-500" },
    { label: "Late", value: 5, color: "text-amber-600", bgColor: "bg-amber-50", progressColor: "bg-amber-500" },
  ]

  const timeOffBalance = [
    { type: "Vacation Days", available: 12, total: 20, color: "text-blue-600", bgColor: "bg-blue-50" },
    { type: "Sick Leave", available: 5, total: 10, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { type: "Personal Days", available: 3, total: 5, color: "text-purple-600", bgColor: "bg-purple-50" },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {attendanceStats.map((stat, index) => (
          <Card key={index} className="shadow-lg border-0">
            <CardHeader className={`pb-3 ${stat.bgColor}`}>
              <CardTitle className={`text-lg font-semibold ${stat.color}`}>{t(stat.label)}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-bold text-slate-900">{stat.value}%</span>
                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                  {stat.label === "Present" && <CheckCircle className={`h-6 w-6 ${stat.color}`} />}
                  {stat.label === "Absent" && <XCircle className={`h-6 w-6 ${stat.color}`} />}
                  {stat.label === "Late" && <AlertCircle className={`h-6 w-6 ${stat.color}`} />}
                </div>
              </div>
              <Progress value={stat.value} className="h-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Attendance Records */}
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                {t("Recent Attendance")}
              </CardTitle>
              <CardDescription className="mt-2">{t("Your attendance records for the past month")}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-white">
                <Calendar className="mr-2 h-4 w-4" />
                {t("View Calendar")}
              </Button>
              <Button variant="outline" size="sm" className="bg-white">
                <Download className="mr-2 h-4 w-4" />
                {t("Export")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {emp[0]?.attendances && emp[0]?.attendances.length > 0 ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, index) => {
                    const mockAttendance = {
                      date: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
                      status: index % 5 === 0 ? "absent" : index % 7 === 0 ? "late" : "present",
                      timeIn: "09:00 AM",
                      timeOut: "05:30 PM",
                      workHours: "8.5",
                      notes: index % 3 === 0 ? "Left early for doctor's appointment" : "",
                    }

                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4 mb-3 sm:mb-0">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center ${
                              mockAttendance.status === "present"
                                ? "bg-emerald-50 text-emerald-600"
                                : mockAttendance.status === "late"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-red-50 text-red-600"
                            }`}
                          >
                            {mockAttendance.status === "present" && <CheckCircle className="h-6 w-6" />}
                            {mockAttendance.status === "late" && <AlertCircle className="h-6 w-6" />}
                            {mockAttendance.status === "absent" && <XCircle className="h-6 w-6" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {format(mockAttendance.date, "EEEE, MMMM d, yyyy")}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                              <span>
                                {mockAttendance.timeIn} - {mockAttendance.timeOut}
                              </span>
                              <span>•</span>
                              <span>
                                {mockAttendance.workHours} {t("hours")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {mockAttendance.notes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>{mockAttendance.notes}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Badge
                            variant={
                              mockAttendance.status === "present"
                                ? "default"
                                : mockAttendance.status === "late"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="px-3 py-1 capitalize"
                          >
                            {t(mockAttendance.status)}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <Calendar className="h-16 w-16 text-slate-400 mb-4" />
                  <p className="text-lg font-semibold text-slate-900 mb-2">{t("No attendance records available")}</p>
                  <p className="text-slate-600">{t("Your attendance history will appear here once recorded")}</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Time Off Balance */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                </div>
                {t("Time Off Balance")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeOffBalance.map((item, index) => (
                  <div key={index} className={`p-4 ${item.bgColor} rounded-xl`}>
                    <div className="flex justify-between items-center mb-2">
                      <p className={`text-sm font-medium ${item.color}`}>{t(item.type)}</p>
                      <span className={`text-lg font-bold ${item.color}`}>{item.available}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(item.available / item.total) * 100} className="h-2 flex-1" />
                      <span className="text-xs text-slate-600">/{item.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Request Time Off */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
                {t("Request Time Off")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Request Vacation")}
                </Button>
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Request Sick Leave")}
                </Button>
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Request Personal Day")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}





// "use client";

// import React from "react";
// import { format } from "date-fns";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//   Calendar,
//   FileText,
//   Clock,
//   BarChart3,
//   CalendarDays,
// } from "lucide-react";

// // Import useTranslation
// import { useTranslation } from "react-i18next";

// export function Attendance({ emp = [] }) {
//   // Initialize t function for common namespace
//   const { t } = useTranslation('common');

//   return (
//     <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
//       <Card className='lg:col-span-2 border-none shadow-md'>
//         <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
//           <div>
//             <CardTitle>{t('Recent Attendance')}</CardTitle>
//             <CardDescription>
//               {t('Your attendance records for the past month')}
//             </CardDescription>
//           </div>
//           <div className='flex items-center gap-2'>
//             <Button variant='outline' size='sm'>
//               <Calendar className='mr-2 h-4 w-4' />
//               {t('View Calendar')}
//             </Button>
//             <Button variant='outline' size='sm'>
//               <FileText className='mr-2 h-4 w-4' />
//               {t('Export')}
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <ScrollArea className='h-[400px] pr-4'>
//             {emp[0]?.attendances && emp[0]?.attendances.length > 0 ? (
//               <div className='space-y-4'>
//                 {[...Array(10)].map((_, index) => {
//                   const mockAttendance = {
//                     date: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
//                     status: index % 5 === 0 ? "absent" : "present",
//                     timeIn: "09:00 AM",
//                     timeOut: "05:30 PM",
//                     workHours: "8.5",
//                     notes:
//                       index % 3 === 0
//                         ? "Left early for doctor's appointment"
//                         : "",
//                   };

//                   return (
//                     <div
//                       key={index}
//                       className='flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors'>
//                       <div className='flex items-center gap-4 mb-2 sm:mb-0'>
//                         <div
//                           className={`h-10 w-10 rounded-full flex items-center justify-center ${
//                             mockAttendance.status === "present"
//                               ? "bg-emerald-100 text-emerald-600"
//                               : "bg-red-100 text-red-600"
//                           }`}>
//                           <Clock className='h-5 w-5' />
//                         </div>
//                         <div>
//                           <p className='font-medium'>
//                             {format(mockAttendance.date, "EEEE, MMMM d, yyyy")}
//                           </p>
//                           <div className='flex items-center gap-2 text-sm text-muted-foreground'>
//                             <span>
//                               {mockAttendance.timeIn} - {mockAttendance.timeOut}
//                             </span>
//                             <span>•</span>
//                             <span>{mockAttendance.workHours} {t('hours')}</span>
//                           </div>
//                         </div>
//                       </div>
//                       <div className='flex items-center gap-3'>
//                         {mockAttendance.notes && (
//                           <TooltipProvider>
//                             <Tooltip>
//                               <TooltipTrigger asChild>
//                                 <div className='h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600'>
//                                   <FileText className='h-4 w-4' />
//                                 </div>
//                               </TooltipTrigger>
//                               <TooltipContent>
//                                 {mockAttendance.notes}
//                               </TooltipContent>
//                             </Tooltip>
//                           </TooltipProvider>
//                         )}
//                         <Badge
//                           variant={
//                             mockAttendance.status === "present"
//                               ? "success"
//                               : "destructive"
//                           }
//                           className='capitalize'>
//                           {t(mockAttendance.status)}
//                         </Badge>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className='flex flex-col items-center justify-center h-[300px] text-center'>
//                 <Calendar className='h-12 w-12 text-muted-foreground mb-4' />
//                 <p className='text-md font-medium'>
//                   {t('No attendance records available')}
//                 </p>
//                 <p className='text-muted-foreground'>
//                   {t('Your attendance history will appear here once recorded')}
//                 </p>
//               </div>
//             )}
//           </ScrollArea>
//         </CardContent>
//       </Card>

//       <div className='space-y-6'>
//         <Card className='border-none shadow-md'>
//           <CardHeader>
//             <CardTitle className='flex items-center gap-2'>
//               <BarChart3 className='h-5 w-5 text-green-500' />
//               {t('Attendance Summary')}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className='space-y-4'>
//               <div className='space-y-2'>
//                 <div className='flex justify-between items-center'>
//                   <span className='text-sm font-medium'>{t('Present')}</span>
//                   <span className='text-sm font-semibold'>92%</span>
//                 </div>
//                 <Progress value={92} className='h-2 bg-muted' />
//               </div>

//               <div className='space-y-2'>
//                 <div className='flex justify-between items-center'>
//                   <span className='text-sm font-medium'>{t('Absent')}</span>
//                   <span className='text-sm font-semibold'>3%</span>
//                 </div>
//                 <Progress value={3} className='h-2 bg-muted' />
//               </div>

//               <div className='space-y-2'>
//                 <div className='flex justify-between items-center'>
//                   <span className='text-sm font-medium'>{t('Late')}</span>
//                   <span className='text-sm font-semibold'>5%</span>
//                 </div>
//                 <Progress value={5} className='h-2 bg-muted' />
//               </div>
//             </div>

//             <div className='mt-6 pt-6 border-t'>
//               <h4 className='text-sm font-semibold mb-4'>{t('Time Off Balance')}</h4>
//               <div className='grid grid-cols-2 gap-4'>
//                 <div className='p-3 bg-green-50 rounded-lg'>
//                   <p className='text-xs text-green-600 mb-1'>{t('Vacation Days')}</p>
//                   <p className='text-xl font-bold text-green-700'>
//                     12 <span className='text-sm font-normal'>{t('days')}</span>
//                   </p>
//                 </div>
//                 <div className='p-3 bg-emerald-50 rounded-lg'>
//                   <p className='text-xs text-emerald-600 mb-1'>{t('Sick Leave')}</p>
//                   <p className='text-xl font-bold text-emerald-700'>
//                     5 <span className='text-sm font-normal'>{t('days')}</span>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className='border-none shadow-md'>
//           <CardHeader>
//             <CardTitle className='flex items-center gap-2'>
//               <CalendarDays className='h-5 w-5 text-green-500' />
//               {t('Request Time Off')}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className='space-y-4'>
//               <Button className='w-full bg-green-600 hover:bg-green-700'>
//                 <Calendar className='mr-2 h-4 w-4' />
//                 {t('Request Vacation')}
//               </Button>
//               <Button variant='outline' className='w-full'>
//                 <Clock className='mr-2 h-4 w-4' />
//                 {t('Request Sick Leave')}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };



