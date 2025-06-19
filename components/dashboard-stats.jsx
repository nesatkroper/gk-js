"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { useTranslation } from "react-i18next" // Import useTranslation

export function DashboardStats() {
  const { t } = useTranslation('common'); // Initialize useTranslation

  const stats = [
    {
      title: t("Total Revenue"),
      value: "$45,231.89",
      change: t("+20.1% from last month"),
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: t("Products"),
      value: "2,350",
      change: t("+180 new products"),
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: t("Sales"),
      value: "12,234",
      change: t("+19% from last month"),
      icon: ShoppingCart,
      color: "text-purple-600",
    },
    {
      title: t("Customers"),
      value: "573",
      change: t("+201 since last month"),
      icon: Users,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}


// "use client"

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { motion } from "framer-motion"
// import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"

// const stats = [
//   {
//     title: "Total Revenue",
//     value: "$45,231.89",
//     change: "+20.1% from last month",
//     icon: DollarSign,
//     color: "text-green-600",
//   },
//   {
//     title: "Products",
//     value: "2,350",
//     change: "+180 new products",
//     icon: Package,
//     color: "text-blue-600",
//   },
//   {
//     title: "Sales",
//     value: "12,234",
//     change: "+19% from last month",
//     icon: ShoppingCart,
//     color: "text-purple-600",
//   },
//   {
//     title: "Customers",
//     value: "573",
//     change: "+201 since last month",
//     icon: Users,
//     color: "text-orange-600",
//   },
// ]

// export function DashboardStats() {
//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//       {stats.map((stat, index) => (
//         <motion.div
//           key={stat.title}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: index * 0.1 }}
//         >
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
//               <stat.icon className={`h-4 w-4 ${stat.color}`} />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stat.value}</div>
//               <p className="text-xs text-muted-foreground">{stat.change}</p>
//             </CardContent>
//           </Card>
//         </motion.div>
//       ))}
//     </div>
//   )
// }
