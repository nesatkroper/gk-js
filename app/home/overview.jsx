"use client"

import React, { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
  Layers,
  Zap,
  UserCheck,
  Users,
  CheckCircle,
} from "lucide-react";

const OverView = ({ empData = [] }) => {
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "PPP");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const performanceMetrics = [
    { name: "Productivity", value: 92, icon: Zap },
    { name: "Attendance", value: 96, icon: UserCheck },
    { name: "Task Completion", value: 88, icon: CheckCircle },
    { name: "Team Collaboration", value: 90, icon: Users },
    { name: "Quality of Work", value: 85, icon: Award },
  ];

  const recentAchievements = [
    { title: "Employee of the Month", date: "April 2023", icon: Award },
    { title: "Perfect Attendance", date: "Q1 2023", icon: Calendar },
    { title: "Project Excellence Award", date: "March 2023", icon: Sparkles },
  ];

  const upcomingEvents = [
    { title: "Team Building Event", date: "May 15, 2023", type: "event" },
    { title: "Performance Review", date: "May 20, 2023", type: "meeting" },
    {
      title: "Training: Leadership Skills",
      date: "May 25, 2023",
      type: "training",
    },
  ];

  const calculateServiceDuration = (hiredDate) => {
    if (!hiredDate) return "N/A";

    const hired = new Date(hiredDate);
    const now = new Date();
    const diffYears = now.getFullYear() - hired.getFullYear();
    const diffMonths = now.getMonth() - hired.getMonth();

    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? "s" : ""}${
        diffMonths > 0
          ? `, ${diffMonths} month${diffMonths > 1 ? "s" : ""}`
          : ""
      }`;
    }

    return `${diffMonths} month${diffMonths > 1 ? "s" : ""}`;
  };

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        <div className='lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
          <Card className='overflow-hidden border-none shadow-md'>
            <CardHeader className='pb-2 bg-rose-100/50'>
              <CardTitle className='text-sm font-medium flex items-center gap-2 text-green-700'>
                <Briefcase className='h-5 w-5' />
                Position
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4'>
              <p className='text-md font-semibold'>
                {empData[0]?.position?.positionName}
              </p>
              <p className='text-sm text-muted-foreground mt-1'>
                Career Level: Senior
              </p>
            </CardContent>
          </Card>

          <Card className='overflow-hidden border-none shadow-md'>
            <CardHeader className='pb-2 bg-green-100/50'>
              <CardTitle className='text-sm font-medium flex items-center gap-2 text-green-700'>
                <Building2 className='h-5 w-5' />
                Department
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4'>
              <p className='text-md font-semibold'>
                {empData[0]?.department?.departmentName}
              </p>
              <p className='text-sm text-muted-foreground mt-1'>
                Reports to: Director
              </p>
            </CardContent>
          </Card>

          <Card className='overflow-hidden border-none shadow-md'>
            <CardHeader className='pb-2 bg-cyan-100/50'>
              <CardTitle className='text-sm font-medium flex items-center gap-2 text-cyan-700'>
                <DollarSign className='h-5 w-5' />
                Salary
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4'>
              <p className='text-md font-semibold'>
                {formatCurrency(empData[0]?.salary)}
              </p>
              <p className='text-sm text-muted-foreground mt-1'>
                Last review: 3 months ago
              </p>
            </CardContent>
          </Card>

          <Card className='overflow-hidden border-none shadow-md'>
            <CardHeader className='pb-2 bg-amber-100/50'>
              <CardTitle className='text-sm font-medium flex items-center gap-2 text-amber-700'>
                <Calendar className='h-5 w-5' />
                Hired Date
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4'>
              <p className='text-md font-semibold'>
                {formatDate(empData[0]?.hiredDate)}
              </p>
              <p className='text-sm text-muted-foreground mt-1'>
                Tenure: {calculateServiceDuration(empData[0]?.hiredDate)}
              </p>
            </CardContent>
          </Card>

          <Card className='overflow-hidden border-none shadow-md'>
            <CardHeader className='pb-2 bg-sky-100/50'>
              <CardTitle className='text-sm font-medium flex items-center gap-2 text-sky-700'>
                <Phone className='h-5 w-5' />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4'>
              <a className='text-md font-semibold'>
                {empData[0]?.phone || "N/A"}
              </a>
              <p className='text-sm text-muted-foreground mt-1'>
                Extension: +855
              </p>
            </CardContent>
          </Card>

          <Card className='overflow-hidden border-none shadow-md'>
            <CardHeader className='pb-2 bg-rose-100/50'>
              <CardTitle className='text-sm font-medium flex items-center gap-2 text-rose-700'>
                <Mail className='h-5 w-5' />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4'>
              <p className='text-md font-semibold truncate'>
                {empData[0]?.info?.email || "N/A"}
              </p>
              <p className='text-sm text-muted-foreground mt-1'>
                Corporate account
              </p>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card className='border-none shadow-md'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-5 w-5 text-green-500' />
                Performance Metrics
              </CardTitle>
              <CardDescription>Current performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {performanceMetrics
                  .slice(0, showAllMetrics ? performanceMetrics.length : 3)
                  .map((metric, index) => (
                    <div key={index} className='space-y-1'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                          <metric.icon className='h-4 w-4 text-green-500' />
                          <span className='text-sm font-medium'>
                            {metric.name}
                          </span>
                        </div>
                        <span className='text-sm font-semibold'>
                          {metric.value}%
                        </span>
                      </div>
                      <Progress value={metric.value} className='h-2' />
                    </div>
                  ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant='ghost'
                className='w-full text-green-600 hover:text-green-700 hover:bg-green-50'
                onClick={() => setShowAllMetrics(!showAllMetrics)}>
                {showAllMetrics ? "Show Less" : "Show All Metrics"}
              </Button>
            </CardFooter>
          </Card>

          <Card className='border-none shadow-md'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2'>
                <Award className='h-5 w-5 text-amber-500' />
                Recent Achievements
              </CardTitle>
              <CardDescription>Recognition and awards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {recentAchievements.map((achievement, index) => (
                  <div
                    key={index}
                    className='flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors'>
                    <div className='mt-1 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600'>
                      <achievement.icon className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='font-medium'>{achievement.title}</p>
                      <p className='text-sm text-muted-foreground'>
                        {achievement.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className='border-none shadow-md'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CalendarDays className='h-5 w-5 text-green-500' />
            Upcoming Events
          </CardTitle>
          <CardDescription>Your scheduled events and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className='flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors'>
                <div
                  className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center 
              ${
                event.type === "event"
                  ? "bg-green-100 text-green-600"
                  : event.type === "meeting"
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-amber-100 text-amber-600"
              }`}>
                  {event.type === "event" ? (
                    <Calendar className='h-5 w-5' />
                  ) : event.type === "meeting" ? (
                    <Users className='h-5 w-5' />
                  ) : (
                    <Layers className='h-5 w-5' />
                  )}
                </div>
                <div>
                  <p className='font-medium'>{event.title}</p>
                  <p className='text-sm text-muted-foreground'>{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default OverView;
