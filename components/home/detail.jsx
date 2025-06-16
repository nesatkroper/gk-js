"use client"


import React, { useEffect } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  User,
  Briefcase,
  Phone,
  Mail,
  FileText,
  Layers,
  Shield,
  MapPin,
  Cake,
  BadgeCheck,
} from "lucide-react";

const Details = ({ empData = [] }) => {
  const user = getAuthData();
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

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
      <Card className='lg:col-span-2 border-none shadow-md'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5 text-green-500' />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Full Name</p>
                <p className='font-medium text-md'>
                  {empData[0]?.firstName} {empData[0]?.lastName}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Employee Code</p>
                <p className='font-medium text-md uppercase'>
                  {empData[0]?.employeeCode || "N/A"}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Gender</p>
                <p className='font-medium text-md capitalize'>
                  {empData[0]?.gender}
                </p>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Date of Birth</p>
                <div className='flex items-center gap-2'>
                  <Cake className='h-4 w-4 text-green-500' />
                  <p className='font-medium text-md'>
                    {formatDate(empData[0]?.dob)}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Phone</p>
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-green-500' />
                  <p className='font-medium text-md'>
                    {empData[0]?.phone || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Email</p>
                <div className='flex items-center gap-2'>
                  <Mail className='h-4 w-4 text-green-500' />
                  <p className='font-medium text-md'>
                    {empData[0]?.info?.email || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Address</p>
                <p className='font-medium text-md'>
                  {empData[0]?.info?.address || "123 Corporate Ave"}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Region</p>
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-green-500' />
                  <p className='font-medium text-md'>
                    {empData[0]?.info?.region || "Headquarters"}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Emergency Contact
                </p>
                <p className='font-medium text-md'>
                  {empData[0]?.info?.emergencyContact || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className='text-md font-semibold mb-4 flex items-center gap-2'>
              <Shield className='h-5 w-5 text-green-500' />
              Government ID Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>ID Number</p>
                <p className='font-medium text-md'>
                  {empData[0]?.info?.govId || "N/A"}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Expiration Date</p>
                <p className='font-medium text-md'>
                  {formatDate(empData[0]?.info?.govExpire)}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>ID Image</p>
                {empData[0]?.info?.govPicture ? (
                  <div className='mt-2 relative h-20 w-32 overflow-hidden rounded-md border'>
                    <img
                      src={
                        empData[0]?.info.govPicture ||
                        "/placeholder.svg?height=80&width=128"
                      }
                      alt='Government ID'
                      className='object-cover h-full w-full'
                    />
                  </div>
                ) : (
                  <p className='font-medium'>Not available</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='space-y-6'>
        <Card className='border-none shadow-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Briefcase className='h-5 w-5 text-green-500' />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Position</p>
              <div className='flex items-center gap-2 h-6'>
                <BadgeCheck className='h-4 w-4 text-green-500' />
                <p className='font-medium'>
                  {empData[0]?.position?.positionName}
                </p>
              </div>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Department</p>
              <p className='font-medium'>
                {empData[0]?.department?.departmentName}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Salary</p>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <p className='font-medium cursor-help'>
                    {formatCurrency(empData[0]?.salary)}
                  </p>
                </HoverCardTrigger>
                <HoverCardContent className='w-80'>
                  <div className='space-y-2'>
                    <h4 className='text-sm font-semibold'>Salary Breakdown</h4>
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      <div>Base Salary:</div>
                      <div className='text-right'>
                        {formatCurrency(empData[0]?.salary * 0.85)}
                      </div>
                      <div>Bonus:</div>
                      <div className='text-right'>
                        {formatCurrency(empData[0]?.salary * 0.1)}
                      </div>
                      <div>Allowances:</div>
                      <div className='text-right'>
                        {formatCurrency(empData[0]?.salary * 0.05)}
                      </div>
                      <Separator className='col-span-2 my-1' />
                      <div className='font-medium'>Total:</div>
                      <div className='text-right font-medium'>
                        {formatCurrency(empData[0]?.salary)}
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Hired Date</p>
              <p className='font-medium'>{formatDate(empData[0]?.hiredDate)}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Status</p>
              <Badge
                variant={
                  empData[0]?.status === "active" ? "success" : "destructive"
                }
                className='capitalize'>
                {empData[0]?.status}
              </Badge>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Region</p>
              <p className='font-medium'>{empData[0]?.info?.region || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {empData[0]?.info?.note && (
          <Card className='border-none shadow-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5 text-green-500' />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='bg-muted/50 p-4 rounded-lg italic'>
                {empData[0]?.info.note}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className='border-none shadow-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Layers className='h-5 w-5 text-green-500' />
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {[
                "Leadership",
                "Communication",
                "Project Management",
                "Strategic Planning",
                "Team Building",
                "Problem Solving",
              ].map((skill, index) => (
                <Badge
                  key={index}
                  variant='secondary'
                  className='bg-green-100 text-green-700 hover:bg-green-200'>
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Details;
