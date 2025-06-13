"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { KeyRound, Home, LogIn, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

const keyVariants = {
  hidden: { rotate: -10, opacity: 0 },
  visible: {
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  hover: {
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.5 },
  },
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl mx-auto text-center space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated 401 Text */}
        <motion.div className="space-y-4" variants={itemVariants}>
          <div className="text-8xl md:text-9xl font-bold text-blue-200 dark:text-blue-800 select-none">401</div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 blur-3xl opacity-20 rounded-full"></div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 relative">
              Authentication Required
            </h1>
          </div>
        </motion.div>

        {/* Key Icon with Hover Animation */}
        <motion.div className="flex justify-center" variants={itemVariants}>
          <div className="relative">
            <motion.div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg cursor-pointer"
              variants={keyVariants}
              whileHover="hover"
            >
              <KeyRound className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </motion.div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-20 animate-pulse"></div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants}>
          <Card className="p-6 md:p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              You need to be logged in to view this page. Please sign in to your account to continue.
            </p>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/login" className="flex items-center gap-2">
                <LogIn className="w-5 h-5" />
                Sign In
              </Link>
            </Button>
          </motion.div>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Go to Homepage
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
