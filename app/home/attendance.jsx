"use client";

import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  FileText,
  Clock,
  BarChart3,
  CalendarDays,
} from "lucide-react";

// Import useTranslation
import { useTranslation } from "react-i18next";

export function Attendance({ emp = [] }) {
  // Initialize t function for common namespace
  const { t } = useTranslation('common');

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
      <Card className='lg:col-span-2 border-none shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div>
            <CardTitle>{t('Recent Attendance')}</CardTitle>
            <CardDescription>
              {t('Your attendance records for the past month')}
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm'>
              <Calendar className='mr-2 h-4 w-4' />
              {t('View Calendar')}
            </Button>
            <Button variant='outline' size='sm'>
              <FileText className='mr-2 h-4 w-4' />
              {t('Export')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className='h-[400px] pr-4'>
            {emp[0]?.attendances && emp[0]?.attendances.length > 0 ? (
              <div className='space-y-4'>
                {[...Array(10)].map((_, index) => {
                  const mockAttendance = {
                    date: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
                    status: index % 5 === 0 ? "absent" : "present",
                    timeIn: "09:00 AM",
                    timeOut: "05:30 PM",
                    workHours: "8.5",
                    notes:
                      index % 3 === 0
                        ? "Left early for doctor's appointment"
                        : "",
                  };

                  return (
                    <div
                      key={index}
                      className='flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors'>
                      <div className='flex items-center gap-4 mb-2 sm:mb-0'>
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            mockAttendance.status === "present"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-red-100 text-red-600"
                          }`}>
                          <Clock className='h-5 w-5' />
                        </div>
                        <div>
                          <p className='font-medium'>
                            {format(mockAttendance.date, "EEEE, MMMM d, yyyy")}
                          </p>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <span>
                              {mockAttendance.timeIn} - {mockAttendance.timeOut}
                            </span>
                            <span>•</span>
                            <span>{mockAttendance.workHours} {t('hours')}</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        {mockAttendance.notes && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className='h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600'>
                                  <FileText className='h-4 w-4' />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {mockAttendance.notes}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Badge
                          variant={
                            mockAttendance.status === "present"
                              ? "success"
                              : "destructive"
                          }
                          className='capitalize'>
                          {t(mockAttendance.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-[300px] text-center'>
                <Calendar className='h-12 w-12 text-muted-foreground mb-4' />
                <p className='text-md font-medium'>
                  {t('No attendance records available')}
                </p>
                <p className='text-muted-foreground'>
                  {t('Your attendance history will appear here once recorded')}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <div className='space-y-6'>
        <Card className='border-none shadow-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5 text-green-500' />
              {t('Attendance Summary')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm font-medium'>{t('Present')}</span>
                  <span className='text-sm font-semibold'>92%</span>
                </div>
                <Progress value={92} className='h-2 bg-muted' />
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm font-medium'>{t('Absent')}</span>
                  <span className='text-sm font-semibold'>3%</span>
                </div>
                <Progress value={3} className='h-2 bg-muted' />
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm font-medium'>{t('Late')}</span>
                  <span className='text-sm font-semibold'>5%</span>
                </div>
                <Progress value={5} className='h-2 bg-muted' />
              </div>
            </div>

            <div className='mt-6 pt-6 border-t'>
              <h4 className='text-sm font-semibold mb-4'>{t('Time Off Balance')}</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div className='p-3 bg-green-50 rounded-lg'>
                  <p className='text-xs text-green-600 mb-1'>{t('Vacation Days')}</p>
                  <p className='text-xl font-bold text-green-700'>
                    12 <span className='text-sm font-normal'>{t('days')}</span>
                  </p>
                </div>
                <div className='p-3 bg-emerald-50 rounded-lg'>
                  <p className='text-xs text-emerald-600 mb-1'>{t('Sick Leave')}</p>
                  <p className='text-xl font-bold text-emerald-700'>
                    5 <span className='text-sm font-normal'>{t('days')}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-none shadow-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CalendarDays className='h-5 w-5 text-green-500' />
              {t('Request Time Off')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <Button className='w-full bg-green-600 hover:bg-green-700'>
                <Calendar className='mr-2 h-4 w-4' />
                {t('Request Vacation')}
              </Button>
              <Button variant='outline' className='w-full'>
                <Clock className='mr-2 h-4 w-4' />
                {t('Request Sick Leave')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};



