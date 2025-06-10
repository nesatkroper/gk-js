"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Shield, Home, Mail, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl mx-auto text-center space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated 403 Text */}
        <motion.div className="space-y-4" variants={itemVariants}>
          <div className="text-8xl md:text-9xl font-bold text-red-200 dark:text-red-800 select-none">403</div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 blur-3xl opacity-20 rounded-full"></div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 relative">
              Access Denied
            </h1>
          </div>
        </motion.div>

        {/* Shield Icon with Pulse Animation */}
        <motion.div className="flex justify-center" variants={itemVariants}>
          <div className="relative">
            <motion.div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Shield className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </motion.div>
            <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur opacity-20 animate-pulse"></div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 md:p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Sorry, you don't have permission to access this page. If you believe this is an error, please contact our
              support team.
            </p>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={itemVariants}>
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
          >
            <Link href="/contact" className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Support
            </Link>
          </Button>
        </motion.div>

        {/* Back Link */}
        <motion.div className="pt-4" variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
