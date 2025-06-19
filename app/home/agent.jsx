"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Users,
  Building,
  Phone,
  Mail,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTranslation } from "react-i18next"

export function ClientCustomer({ customers = [] }) {
  const { t } = useTranslation("common")
  const [searchTerm, setSearchTerm] = useState("")

  const customerInfos = customers.map((customer) => customer.info).filter(Boolean)
  const addresses = customers.flatMap((customer) => customer.address).filter(Boolean)

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return isNaN(date) ? "N/A" : date.toLocaleDateString()
    } catch {
      return "N/A"
    }
  }

  // Mock data for demonstration
  const mockCustomers = [
    {
      customerId: 1,
      firstName: "John",
      lastName: "Doe",
      gender: "male",
      phone: "+1 (555) 123-4567",
      email: "john.doe@email.com",
      status: "active",
      createdAt: "2023-01-15",
      address: "123 Main St, New York, NY",
    },
    {
      customerId: 2,
      firstName: "Jane",
      lastName: "Smith",
      gender: "female",
      phone: "+1 (555) 987-6543",
      email: "jane.smith@email.com",
      status: "active",
      createdAt: "2023-02-20",
      address: "456 Oak Ave, Los Angeles, CA",
    },
    {
      customerId: 3,
      firstName: "Mike",
      lastName: "Johnson",
      gender: "male",
      phone: "+1 (555) 456-7890",
      email: "mike.johnson@email.com",
      status: "inactive",
      createdAt: "2023-03-10",
      address: "789 Pine St, Chicago, IL",
    },
  ]

  const displayCustomers = customers.length > 0 ? filteredCustomers : mockCustomers

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                {t("Customer Management")}
              </CardTitle>
              <p className="text-slate-600 mt-2">Manage and track all customer relationships and interactions</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {t("Add New Customer")}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filter */}
      <Card className="shadow-lg border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search customers by name, phone, or email..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              {t("Filter")}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer Data */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <Tabs defaultValue="customers" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-b-none bg-slate-50">
              <TabsTrigger value="customers" className="flex items-center gap-2 data-[state=active]:bg-white">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Customers")}</span>
                <Badge className="ml-1 bg-blue-100 text-blue-700">{displayCustomers.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2 data-[state=active]:bg-white">
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Customer Info")}</span>
                <Badge className="ml-1 bg-emerald-100 text-emerald-700">{customerInfos.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2 data-[state=active]:bg-white">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">{t("Addresses")}</span>
                <Badge className="ml-1 bg-purple-100 text-purple-700">{addresses.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customers" className="m-0">
              <div className="rounded-md border-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold">{t("Customer")}</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold">{t("Contact")}</TableHead>
                      <TableHead className="hidden sm:table-cell font-semibold">{t("Address")}</TableHead>
                      <TableHead className="hidden lg:table-cell font-semibold">{t("Created")}</TableHead>
                      <TableHead className="font-semibold">{t("Status")}</TableHead>
                      <TableHead className="text-right font-semibold">{t("Actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-12 w-12 text-slate-400" />
                            <p className="text-slate-600">{t("No customers found.")}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayCustomers.map((customer) => (
                        <TableRow key={customer.customerId} className="hover:bg-slate-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">
                                  {customer.firstName} {customer.lastName}
                                </p>
                                <p className="text-sm text-slate-600 capitalize">{customer.gender}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-slate-400" />
                                {customer.phone || "N/A"}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-slate-400" />
                                {customer.email || "N/A"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-slate-400" />
                              {customer.address || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {formatDate(customer.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={customer.status === "active" ? "default" : "secondary"}
                              className={
                                customer.status === "active"
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              }
                            >
                              {t(customer.status || "inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">{t("Open menu")}</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <ListCollapse className="h-4 w-4 mr-2" />
                                  {t("View details")}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <User className="h-4 w-4 mr-2" />
                                  {t("Edit customer")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">{t("Delete customer")}</DropdownMenuItem>
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

            <TabsContent value="info" className="m-0 p-8">
              <div className="text-center py-12">
                <UserCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900 mb-2">Customer Information</p>
                <p className="text-slate-600">Detailed customer information will be displayed here</p>
              </div>
            </TabsContent>

            <TabsContent value="addresses" className="m-0 p-8">
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900 mb-2">Customer Addresses</p>
                <p className="text-slate-600">Customer address information will be displayed here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card className="shadow-lg border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-600">
              Showing {displayCustomers.length} of {displayCustomers.length} customers
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





// "use client";

// import React, { useState } from "react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   ChevronDown,
//   Filter,
//   ListCollapse,
//   MapPin,
//   MoreHorizontal,
//   Plus,
//   Search,
//   User,
//   UserCircle,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// // Import useTranslation
// import { useTranslation } from "react-i18next";

// // Assuming 'Link' is imported from a routing library like 'next/link' or 'react-router-dom'
// // import Link from 'next/link'; // or whichever you use

// export function ClientCustomer({ customers = [] }) {
//   // Initialize t function for common namespace
//   const { t } = useTranslation('common');

//   const [searchTerm, setSearchTerm] = useState("");

//   const customerInfos = customers
//     .map((customer) => customer.info)
//     .filter(Boolean);
//   const addresses = customers
//     .flatMap((customer) => customer.address)
//     .filter(Boolean);

//   const filteredCustomers = customers.filter(
//     (customer) =>
//       customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const formatDate = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       return isNaN(date) ? "N/A" : date.toLocaleDateString();
//     } catch {
//       return "N/A";
//     }
//   };

//   return (
//     <Card>
//       <CardContent>
//         <div className='mt-4 mx-auto space-y-6'>
//           <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
//             <div>
//               <h1 className='text-md font-bold tracking-tight'>
//                 {t('Customer Management')}
//               </h1>
//               <p className='text-muted-foreground text-sm'>
//                 {t('Customer Management Description')}
//               </p>
//             </div>
//             <Button className='flex items-center gap-2'>
//               <Plus className='h-4 w-4' />
//               {t('Add New Customer')}
//             </Button>
//           </div>

//           <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
//             <div className='relative w-full sm:w-72'>
//               <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
//               <Input
//                 type='search'
//                 placeholder={t('SearchPlaceholder')}
//                 className='pl-8 w-full'
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <Button
//               variant='outline'
//               className='w-full sm:w-auto flex items-center gap-2'>
//               <Filter className='h-4 w-4' />
//               {t('Filter')}
//               <ChevronDown className='h-4 w-4 ml-1' />
//             </Button>
//           </div>

//           <Card>
//             <CardContent className='p-0'>
//               <Tabs defaultValue='customers' className='w-full'>
//                 <TabsList className='w-full grid grid-cols-3 rounded-b-none'>
//                   <TabsTrigger
//                     value='customers'
//                     className='flex items-center gap-2'>
//                     <User className='h-4 w-4' />
//                     <span className='hidden sm:inline'>{t('Customers')}</span>
//                     <Badge className='ml-1'>{customers.length}</Badge>
//                   </TabsTrigger>
//                   <TabsTrigger value='info' className='flex items-center gap-2'>
//                     <UserCircle className='h-4 w-4' />
//                     <span className='hidden sm:inline'>{t('Customer Info')}</span>
//                     <Badge className='ml-1'>{customerInfos.length}</Badge>
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value='addresses'
//                     className='flex items-center gap-2'>
//                     <MapPin className='h-4 w-4' />
//                     <span className='hidden sm:inline'>{t('Addresses')}</span>
//                     <Badge className='ml-1'>{addresses.length}</Badge>
//                   </TabsTrigger>
//                 </TabsList>

//                 <TabsContent value='customers' className='m-0'>
//                   <div className='rounded-md border'>
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>{t('Name')}</TableHead>
//                           <TableHead className='hidden md:table-cell'>
//                             {t('Gender')}
//                           </TableHead>
//                           <TableHead className='hidden sm:table-cell'>
//                             {t('Phone')}
//                           </TableHead>
//                           <TableHead className='hidden lg:table-cell'>
//                             {t('Created')}
//                           </TableHead>
//                           <TableHead>{t('Status')}</TableHead>
//                           <TableHead className='text-right'>{t('Actions')}</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {filteredCustomers.length === 0 ? (
//                           <TableRow>
//                             <TableCell colSpan={6} className='h-24 text-center'>
//                               {t('No customers found.')}
//                             </TableCell>
//                           </TableRow>
//                         ) : (
//                           filteredCustomers.map((customer) => (
//                             <TableRow key={customer.customerId}>
//                               <TableCell className='font-medium'>
//                                 {customer.firstName} {customer.lastName}
//                               </TableCell>
//                               <TableCell className='hidden md:table-cell capitalize'>
//                                 {customer.gender}
//                               </TableCell>
//                               <TableCell className='hidden sm:table-cell'>
//                                 {customer.phone || "N/A"}
//                               </TableCell>
//                               <TableCell className='hidden lg:table-cell'>
//                                 {formatDate(customer.createdAt)}
//                               </TableCell>
//                               <TableCell>
//                                 <Badge
//                                   variant={
//                                     customer.status === "active"
//                                       ? "default"
//                                       : "secondary"
//                                   }>
//                                   {t(customer.status || 'inactive')}
//                                 </Badge>
//                               </TableCell>
//                               <TableCell className='text-right'>
//                                 <DropdownMenu>
//                                   <DropdownMenuTrigger asChild>
//                                     <Button
//                                       variant='ghost'
//                                       className='h-8 w-8 p-0'>
//                                       <span className='sr-only'>{t('Open menu')}</span> {/* SR text */}
//                                       <MoreHorizontal className='h-4 w-4' />
//                                     </Button>
//                                   </DropdownMenuTrigger>
//                                   <DropdownMenuContent align='end'>
//                                     <DropdownMenuLabel>
//                                       {t('Actions')}
//                                     </DropdownMenuLabel>
//                                     <DropdownMenuItem asChild>
//                                       {/* Make sure your Link component is correctly imported */}
//                                       {/* Example with a generic Link: */}
//                                       {/* <Link to={`/customer/${customer.customerId}`} className='flex w-full'> */}
//                                       {/* Replace with your actual Link component and its props */}
//                                       <a href={`/customer/${customer.customerId}`} className='flex w-full'>
//                                         <ListCollapse
//                                           size={16}
//                                           className='me-2'
//                                         />
//                                         {t('View details')}
//                                       </a>
//                                     </DropdownMenuItem>
//                                     <DropdownMenuItem>
//                                       {t('Edit customer')}
//                                     </DropdownMenuItem>
//                                     <DropdownMenuSeparator />
//                                     <DropdownMenuItem className='text-destructive'>
//                                       {t('Delete customer')}
//                                     </DropdownMenuItem>
//                                   </DropdownMenuContent>
//                                 </DropdownMenu>
//                               </TableCell>
//                             </TableRow>
//                           ))
//                         )}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 </TabsContent>

//                 {/* Add TabsContent for info and addresses if needed */}
//                 <TabsContent value='info' className='m-0'>
//                   {/* Customer Info content here */}
//                 </TabsContent>
//                 <TabsContent value='addresses' className='m-0'>
//                   {/* Addresses content here */}
//                 </TabsContent>
//               </Tabs>
//             </CardContent>
//           </Card>

//           <div className='flex justify-between items-center'>
//             <div className='text-sm text-muted-foreground'>
//               {t('Showing {filteredCount} of {totalCount} customers', {
//                 filteredCount: filteredCustomers.length,
//                 totalCount: customers.length,
//               })}
//             </div>
//             <div className='flex items-center gap-2'>
//               <Button variant='outline' size='sm' disabled>
//                 <ChevronDown className='h-4 w-4 mr-2' />
//                 {t('Previous')}
//               </Button>
//               <Button variant='outline' size='sm'>
//                 {t('Next')}
//                 <ChevronDown className='h-4 w-4 ml-2 rotate-180' />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };





