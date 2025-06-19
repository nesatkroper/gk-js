"use client";

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
import { useTranslation } from "react-i18next";

export function Details({ emp = [] }) {
  const { t } = useTranslation('common');
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
            {t('Personal Information')}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>{t('Full Name')}</p>
                <p className='font-medium text-md'>
                  {emp[0]?.firstName} {emp[0]?.lastName}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>{t('Employee Code')}</p>
                <p className='font-medium text-md uppercase'>
                  {emp[0]?.employeeCode || "N/A"}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>{t('Gender')}</p>
                <p className='font-medium text-md capitalize'>
                  {emp[0]?.gender}
                </p>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>{t('Date of Birth')}</p>
                <div className='flex items-center gap-2'>
                  <Cake className='h-4 w-4 text-green-500' />
                  <p className='font-medium text-md'>
                    {formatDate(emp[0]?.dob)}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>{t('Phone')}</p>
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-green-500' />
                  <p className='font-medium text-md'>
                    {emp[0]?.phone || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>{t('Email')}</p>
                <div className='flex items-center gap-2'>
                  <Mail className='h-4 w-4 text-green-500' />
                  <p className='font-medium text-md'>
                    {emp[0]?.info?.email || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <p className='text-sm text-muted-foreground'>{t('Address')}</p>
                <p className='font-medium text-md'>
                  {emp[0]?.info?.address || t('Default Address')}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>{t('Region')}</p>
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-green-500' />
                  <p className='font-medium text-md'>
                    {emp[0]?.info?.region || t('Default Region')}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  {t('Emergency Contact')}
                </p>
                <p className='font-medium text-md'>
                  {emp[0]?.info?.emergencyContact || t('Not provided')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className='text-md font-semibold mb-4 flex items-center gap-2'>
              <Shield className='h-5 w-5 text-green-500' />
              {t('Government ID Information')}
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>{t('ID Number')}</p>
                <p className='font-medium text-md'>
                  {emp[0]?.info?.govId || "N/A"}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>{t('Expiration Date')}</p>
                <p className='font-medium text-md'>
                  {formatDate(emp[0]?.info?.govExpire)}
                </p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>{t('ID Image')}</p>
                {emp[0]?.info?.govPicture ? (
                  <div className='mt-2 relative h-20 w-32 overflow-hidden rounded-md border'>
                    <img
                      src={
                        emp[0]?.info.govPicture ||
                        "/placeholder.svg?height=80&width=128"
                      }
                      alt={t('ID Image')}
                      className='object-cover h-full w-full'
                    />
                  </div>
                ) : (
                  <p className='font-medium'>{t('Not available')}</p>
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
              {t('Employment Details')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-sm text-muted-foreground'>{t('Position')}</p>
              <div className='flex items-center gap-2 h-6'>
                <BadgeCheck className='h-4 w-4 text-green-500' />
                <p className='font-medium'>
                  {emp[0]?.position?.positionName}
                </p>
              </div>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>{t('Department')}</p>
              <p className='font-medium'>
                {emp[0]?.department?.departmentName}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>{t('Salary')}</p>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <p className='font-medium cursor-help'>
                    {formatCurrency(emp[0]?.salary)}
                  </p>
                </HoverCardTrigger>
                <HoverCardContent className='w-80'>
                  <div className='space-y-2'>
                    <h4 className='text-sm font-semibold'>{t('Salary Breakdown')}</h4>
                    <div className='grid grid-cols-2 gap-2 text-sm'>
                      <div>{t('Base Salary')}:</div>
                      <div className='text-right'>
                        {formatCurrency(emp[0]?.salary * 0.85)}
                      </div>
                      <div>{t('Bonus')}:</div>
                      <div className='text-right'>
                        {formatCurrency(emp[0]?.salary * 0.1)}
                      </div>
                      <div>{t('Allowances')}:</div>
                      <div className='text-right'>
                        {formatCurrency(emp[0]?.salary * 0.05)}
                      </div>
                      <Separator className='col-span-2 my-1' />
                      <div className='font-medium'>{t('Total')}:</div>
                      <div className='text-right font-medium'>
                        {formatCurrency(emp[0]?.salary)}
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>{t('Hired Date')}</p>
              <p className='font-medium'>{formatDate(emp[0]?.hiredDate)}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>{t('Status')}</p>
              <Badge
                variant={
                  emp[0]?.status === "active" ? "success" : "destructive"
                }
                className='capitalize'>
                {t(emp[0]?.status || 'inactive')} {/* Translate 'active' or 'inactive' */}
              </Badge>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>{t('Region')}</p>
              <p className='font-medium'>{emp[0]?.info?.region || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {emp[0]?.info?.note && (
          <Card className='border-none shadow-md'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5 text-green-500' />
                {t('Notes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='bg-muted/50 p-4 rounded-lg italic'>
                {emp[0]?.info.note}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className='border-none shadow-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Layers className='h-5 w-5 text-green-500' />
              {t('Skills & Expertise')}
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
                  {t(skill)} {/* Translate each skill */}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};




