"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Leaf, Eye, EyeOff, Shield, AlertTriangle, Package, BarChart3, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"


export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const router = useRouter()
  const isMobile = useIsMobile()

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isLocked) {
      setError("Too many failed attempts. Please try again later.")
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    setError("")

    try {
      console.log("Submitting login form...")

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          timestamp: Date.now(),
        }),
      })

      const data = await response.json()
      console.log("Login response:", { status: response.status, data })

      if (!response.ok) {
        setAttempts((prev) => prev + 1)
        console.log("Login failed:", data.error)

        if (attempts >= 4) {
          setIsLocked(true)
          setTimeout(
            () => {
              setIsLocked(false)
              setAttempts(0)
            },
            15 * 60 * 1000,
          )
        }

        setError(data.error || "Login failed")
        return
      }

      console.log("Login successful, redirecting to dashboard...")
      setAttempts(0)

      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 100)
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  return (
    <>
      {isMobile ? (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                  <CardTitle className="text-2xl">FertilizerMS</CardTitle>
                </div>
                <CardDescription>Sign in to your account to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {isLocked && (
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@fertilizer.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={isLoading || isLocked}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        disabled={isLoading || isLocked}
                        autoComplete="current-password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || isLocked}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {attempts > 0 && (
                    <div className="text-sm text-amber-600">
                      Warning: {attempts}/5 failed attempts. Account will be locked after 5 attempts.
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading || isLocked}>
                    {isLoading ? "Signing in..." : "Sign In Securely"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 py-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">FertilizerMS</h1>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300">Complete Fertilizer Management System</p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6 items-start">
              {/* Features Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
                <div className="grid gap-4">
                  {[
                    {
                      icon: Package,
                      title: "Inventory Management",
                      description: "Track fertilizer stock levels, manage suppliers, and automate reordering",
                    },
                    {
                      icon: BarChart3,
                      title: "Sales Analytics",
                      description: "Monitor sales performance, generate reports, and track revenue",
                    },
                    {
                      icon: Users,
                      title: "Customer Management",
                      description: "Manage customer relationships, track orders, and payment history",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="flex items-start gap-4 p-6">
                          <feature.icon className="h-8 w-8 text-green-600 mt-1" />
                          <div>
                            <h3 className="font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Login Section */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Card className="w-full max-w-md mx-auto">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <CardTitle>Welcome Back</CardTitle>
                    </div>
                    <CardDescription>Sign in to your account to continue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {isLocked && (
                        <Alert>
                          <Shield className="h-4 w-4" />
                          <AlertDescription>
                            Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@fertilizer.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          disabled={isLoading || isLocked}
                          autoComplete="email"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            disabled={isLoading || isLocked}
                            autoComplete="current-password"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading || isLocked}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {attempts > 0 && (
                        <div className="text-sm text-amber-600">
                          Warning: {attempts}/5 failed attempts. Account will be locked after 5 attempts.
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={isLoading || isLocked}>
                        {isLoading ? "Signing in..." : "Sign In Securely"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

