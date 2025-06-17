"use client"

import React, { useEffect, useState } from "react";
import Details from "@/app/home/detail";
import OverView from "@/app/home/overview";
import Attendance from "@/app/home/attendance";
import CustomerTabs from "@/app/home/agent";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, FileText, MapPin, Bookmark } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Home = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [performanceValue, setPerformanceValue] = useState(0);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), "PPP");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPerformanceValue(85);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""
      }`.toUpperCase();
  };

  const calculateServiceDuration = (hiredDate) => {
    if (!hiredDate) return "N/A";

    const hired = new Date(hiredDate);
    const now = new Date();
    const diffYears = now.getFullYear() - hired.getFullYear();
    const diffMonths = now.getMonth() - hired.getMonth();

    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? "s" : ""}${diffMonths > 0
        ? `, ${diffMonths} month${diffMonths > 1 ? "s" : ""}`
        : ""
        }`;
    }

    return `${diffMonths} month${diffMonths > 1 ? "s" : ""}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-500";
      case "on leave":
        return "bg-amber-500";
      case "suspended":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
      <div className='flex flex-col gap-4 pb-10'>
        <div className='relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-cyan-600 p-4 text-white shadow-lg'>
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className='absolute bottom-0 right-0 -mb-8 -mr-8 h-64 w-64 rounded-full bg-green-500 opacity-20 blur-3xl'></div>

          <div className='relative flex flex-col md:flex-row items-center md:items-start gap-4'>
            <div className='relative'>
              <div className='absolute -inset-1 rounded-full bg-white/20 blur'></div>
              <Avatar className='h-28 w-28 border-4 border-white/20 shadow-xl'>
                <AvatarImage
                  src={
                    empData[0]?.info?.picture ||
                    "https://github.com/nesatkroper/img/blob/main/phanunlogo.png?raw=true"
                  }
                  alt={`${empData[0]?.firstName} ${empData[0]?.lastName}`}
                  loading='lazy'
                />
                <AvatarFallback className='text-3xl bg-green-700'>
                  {getInitials(empData[0]?.firstName, empData[0]?.lastName) ||
                    "Admin"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white ${getStatusColor(
                  empData[0]?.status
                )}`}></div>
            </div>

            <div className='space-y-2 text-center md:text-left'>
              <div>
                <h1 className='text-xl font-bold tracking-tight'>
                  {empData[0]?.firstName} {empData[0]?.lastName || "Admin"}
                </h1>
                <p className='text-md text-white/80'>
                  {empData[0]?.position?.positionName || "Administrator"}
                </p>
              </div>

              <div className='flex flex-wrap justify-center md:justify-start gap-2 h-6'>
                <Badge className='bg-white/20 hover:bg-white/30 text-white border-none flex items-center gap-1 uppercase'>
                  <User className='h-3 w-3' />
                  {empData[0]?.employeeCode || "Owner"}
                </Badge>
                <Badge className='bg-white/20 hover:bg-white/30 text-white border-none flex items-center gap-1 capitalize'>
                  <Building2 className='h-3 w-3' />
                  {empData[0]?.department?.departmentName || "Super Admin"}
                </Badge>
                <Badge className='bg-white/20 hover:bg-white/30 text-white border-none flex items-center gap-1'>
                  <MapPin className='h-3 w-3' />
                  {empData[0]?.info?.region || "Headquarters"}
                </Badge>
              </div>
            </div>

            <div className='md:ml-auto flex md:flex-row gap-3 md:mt-0'>
              <Button
                variant='secondary'
                className='bg-white/20 hover:bg-white/30 text-white border-none'>
                <FileText className='mr-2 h-4 w-4' />
                Documents
              </Button>
            </div>
          </div>

          <div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='rounded-lg bg-white/10 p-2 backdrop-blur-sm'>
              <div className='text-sm text-white/70'>Service Duration</div>
              <div className='text-md font-semibold'>
                {calculateServiceDuration(empData[0]?.hiredDate)}
              </div>
            </div>
            <div className='rounded-lg bg-white/10 p-2 backdrop-blur-sm'>
              <div className='text-sm text-white/70'>Salary</div>
              <div className='text-md font-semibold'>
                {formatCurrency(empData[0]?.salary)}
              </div>
            </div>
            <div className='rounded-lg bg-white/10 p-2 backdrop-blur-sm'>
              <div className='text-sm text-white/70'>Hired Date</div>
              <div className='text-md font-semibold'>
                {formatDate(empData[0]?.hiredDate)}
              </div>
            </div>
            <div className='rounded-lg bg-white/10 p-2 backdrop-blur-sm'>
              <div className='text-sm text-white/70'>Performance</div>
              <div className='flex items-center gap-2'>
                <div className='text-md font-semibold'>{performanceValue}%</div>
                <div className='flex-1'>
                  <Progress
                    value={performanceValue}
                    className='h-2 bg-white/20'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
            <TabsList className='grid grid-cols-4 sm:w-[400px] mb-4 sm:mb-0'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='details'>Details</TabsTrigger>
              <TabsTrigger value='attendance'>Attendance</TabsTrigger>
              <TabsTrigger value='agent'>Customer</TabsTrigger>
            </TabsList>

            <div className='flex items-center gap-2'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <FileText className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export Profile</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <Bookmark className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save Profile</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <TabsContent value='overview' className='space-y-4'>
            <OverView empData={empData} />
          </TabsContent>

          <TabsContent value='details' className='space-y-4'>
            <Details empData={empData} />
          </TabsContent>

          <TabsContent value='attendance' className='space-y-4'>
            <Attendance empData={empData} />
          </TabsContent>

          <TabsContent value='agent' className='space-y-4'>
            <CustomerTabs customers={clientCus} />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default Home;
