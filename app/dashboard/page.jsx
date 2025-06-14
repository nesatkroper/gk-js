"use client"

import { motion } from "framer-motion"
import { DashboardStats } from "@/components/dashboard-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Package, TrendingUp, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores"
import { useTranslation } from "react-i18next"
import MapComponent from "@/components/map"

export const dynamic = 'force-dynamic';
export default function DashboardPage() {
  const { me, fetch } = useAuthStore()
  const { t } = useTranslation('common')

  useEffect(() => {
    if (!me) {
      fetch()
    }
  }, [fetch, me])


  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">{t('Dashboard')}</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your fertilizer business.</p>
      </motion.div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { customer: "Green Farm Co.", amount: "$1,234", product: "NPK Fertilizer" },
                { customer: "Harvest Ltd.", amount: "$856", product: "Organic Compost" },
                { customer: "AgriTech Inc.", amount: "$2,100", product: "Liquid Fertilizer" },
              ].map((sale, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sale.customer}</p>
                    <p className="text-sm text-muted-foreground">{sale.product}</p>
                  </div>
                  <Badge variant="secondary">{sale.amount}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "NPK 20-20-20", stock: 15, min: 50 },
                { name: "Urea Fertilizer", stock: 8, min: 30 },
                { name: "Phosphate Rock", stock: 22, min: 40 },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.stock}/{item.min}
                    </span>
                  </div>
                  <Progress value={(item.stock / item.min) * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CalendarDays className="mr-2 h-4 w-4" />
                Record Sale
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
