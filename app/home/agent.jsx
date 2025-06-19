"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  Filter,
  ListCollapse,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  User,
  UserCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import useTranslation
import { useTranslation } from "react-i18next";

// Assuming 'Link' is imported from a routing library like 'next/link' or 'react-router-dom'
// import Link from 'next/link'; // or whichever you use

export function ClientCustomer({ customers = [] }) {
  // Initialize t function for common namespace
  const { t } = useTranslation('common');

  const [searchTerm, setSearchTerm] = useState("");

  const customerInfos = customers
    .map((customer) => customer.info)
    .filter(Boolean);
  const addresses = customers
    .flatMap((customer) => customer.address)
    .filter(Boolean);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date) ? "N/A" : date.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  return (
    <Card>
      <CardContent>
        <div className='mt-4 mx-auto space-y-6'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
            <div>
              <h1 className='text-md font-bold tracking-tight'>
                {t('Customer Management')}
              </h1>
              <p className='text-muted-foreground text-sm'>
                {t('Customer Management Description')}
              </p>
            </div>
            <Button className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              {t('Add New Customer')}
            </Button>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
            <div className='relative w-full sm:w-72'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder={t('SearchPlaceholder')}
                className='pl-8 w-full'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant='outline'
              className='w-full sm:w-auto flex items-center gap-2'>
              <Filter className='h-4 w-4' />
              {t('Filter')}
              <ChevronDown className='h-4 w-4 ml-1' />
            </Button>
          </div>

          <Card>
            <CardContent className='p-0'>
              <Tabs defaultValue='customers' className='w-full'>
                <TabsList className='w-full grid grid-cols-3 rounded-b-none'>
                  <TabsTrigger
                    value='customers'
                    className='flex items-center gap-2'>
                    <User className='h-4 w-4' />
                    <span className='hidden sm:inline'>{t('Customers')}</span>
                    <Badge className='ml-1'>{customers.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value='info' className='flex items-center gap-2'>
                    <UserCircle className='h-4 w-4' />
                    <span className='hidden sm:inline'>{t('Customer Info')}</span>
                    <Badge className='ml-1'>{customerInfos.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value='addresses'
                    className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4' />
                    <span className='hidden sm:inline'>{t('Addresses')}</span>
                    <Badge className='ml-1'>{addresses.length}</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='customers' className='m-0'>
                  <div className='rounded-md border'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('Name')}</TableHead>
                          <TableHead className='hidden md:table-cell'>
                            {t('Gender')}
                          </TableHead>
                          <TableHead className='hidden sm:table-cell'>
                            {t('Phone')}
                          </TableHead>
                          <TableHead className='hidden lg:table-cell'>
                            {t('Created')}
                          </TableHead>
                          <TableHead>{t('Status')}</TableHead>
                          <TableHead className='text-right'>{t('Actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className='h-24 text-center'>
                              {t('No customers found.')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCustomers.map((customer) => (
                            <TableRow key={customer.customerId}>
                              <TableCell className='font-medium'>
                                {customer.firstName} {customer.lastName}
                              </TableCell>
                              <TableCell className='hidden md:table-cell capitalize'>
                                {customer.gender}
                              </TableCell>
                              <TableCell className='hidden sm:table-cell'>
                                {customer.phone || "N/A"}
                              </TableCell>
                              <TableCell className='hidden lg:table-cell'>
                                {formatDate(customer.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    customer.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }>
                                  {t(customer.status || 'inactive')}
                                </Badge>
                              </TableCell>
                              <TableCell className='text-right'>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      className='h-8 w-8 p-0'>
                                      <span className='sr-only'>{t('Open menu')}</span> {/* SR text */}
                                      <MoreHorizontal className='h-4 w-4' />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align='end'>
                                    <DropdownMenuLabel>
                                      {t('Actions')}
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                      {/* Make sure your Link component is correctly imported */}
                                      {/* Example with a generic Link: */}
                                      {/* <Link to={`/customer/${customer.customerId}`} className='flex w-full'> */}
                                      {/* Replace with your actual Link component and its props */}
                                      <a href={`/customer/${customer.customerId}`} className='flex w-full'>
                                        <ListCollapse
                                          size={16}
                                          className='me-2'
                                        />
                                        {t('View details')}
                                      </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      {t('Edit customer')}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className='text-destructive'>
                                      {t('Delete customer')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* Add TabsContent for info and addresses if needed */}
                <TabsContent value='info' className='m-0'>
                  {/* Customer Info content here */}
                </TabsContent>
                <TabsContent value='addresses' className='m-0'>
                  {/* Addresses content here */}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className='flex justify-between items-center'>
            <div className='text-sm text-muted-foreground'>
              {t('Showing {filteredCount} of {totalCount} customers', {
                filteredCount: filteredCustomers.length,
                totalCount: customers.length,
              })}
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' disabled>
                <ChevronDown className='h-4 w-4 mr-2' />
                {t('Previous')}
              </Button>
              <Button variant='outline' size='sm'>
                {t('Next')}
                <ChevronDown className='h-4 w-4 ml-2 rotate-180' />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};





