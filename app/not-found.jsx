

"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Home, Search, ArrowLeft, Compass } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8">
        {/* Animated 404 Text */}
        <div className="space-y-4">
          <div className="text-8xl md:text-9xl font-bold text-slate-200 dark:text-slate-700 select-none animate-pulse">
            404
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-3xl opacity-20 rounded-full"></div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 relative">
              Oops! Page Not Found
            </h1>
          </div>
        </div>

        {/* Compass Icon with Rotation Animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Compass
                className="w-12 h-12 md:w-16 md:h-16 text-white animate-spin"
                style={{
                  animationDuration: "8s",
                  animationTimingFunction: "linear",
                }}
              />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-20 animate-pulse"></div>
          </div>
        </div>

        {/* Description */}
        <Card className="p-6 md:p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl">
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Looks like you're lost! We couldn't find the page you were looking for. It might have been moved, deleted,
            or the link might be broken.
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
            className="w-full sm:w-auto border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105"
          >
            <Link href="/search" className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Site
            </Link>
          </Button>
        </div>

        {/* Back Link */}
        <div className="pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Fun Easter Egg */}
        <div className="pt-8 text-xs text-slate-400 dark:text-slate-500">
          <p>
            Fun fact: HTTP 404 errors were named after room 404 at CERN where the original web server was located! 🌐
          </p>
        </div>
      </div>
    </div>
  )
}
