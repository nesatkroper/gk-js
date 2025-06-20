// "use client"

// import Image from "next/image"
// import { useState } from "react"
// import { motion } from "framer-motion"
// import { login } from "@/app/actions/auth"
// import { useRouter } from "next/navigation"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"
// import { useIsMobile } from "@/hooks/use-mobile"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { storeAuthData } from '@/lib/auth-utils'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
// import { Leaf, Eye, EyeOff, Shield, AlertTriangle, Package, BarChart3, Users, ArrowRight } from "lucide-react"
// import { useTranslation } from "react-i18next"; // Import useTranslation

// const getDeviceInfo = () => {
//   return `${navigator.userAgent} | ${navigator.language} | ${window.screen.width}x${window.screen.height}`
// }

// export default function LoginPage() {
//   const [formData, setFormData] = useState({ email: "", password: "" })
//   const [isLoading, setIsLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState("")
//   const router = useRouter()
//   const isMobile = useIsMobile()
//   const { t } = useTranslation('common'); // Initialize useTranslation for 'common' namespace

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError("")

//     try {
//       const form = new FormData()
//       form.append("email", formData.email.toLowerCase().trim())
//       form.append("password", formData.password)
//       form.append("deviceInfo", getDeviceInfo())
//       form.append("ipAddress", "")

//       console.log("Submitting login form...", {
//         email: formData.email.toLowerCase().trim(),
//         deviceInfo: getDeviceInfo(),
//       })

//       const response = await login(form)

//       if (!response.success) {
//         setError(response.error || t('unknownErrorOccurred')) // Translated
//         return
//       }

//       storeAuthData(response?.user)

//       response?.user?.role === "admin" ? router.push("/dashboard") : router.push("/home")
      
//     } catch (error) {
//       console.error("Login error:", error)
//       setError(t('networkErrorTryAgain')) // Translated
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//     if (error) setError("")
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col">
//       {/* Header */}
//       <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto py-6">
//         <div className="flex items-center justify-center md:justify-start gap-2">
//           <div className="bg-emDEDerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
//             <Image src={"/images/logo.jpg"} width={100} height={100} alt="User avatar" className="rounded-md" />
//           </div>
//           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
//             <span className="text-emerald-600 dark:text-emerald-400">GK </span>
//             {t('gkNaturalAgriculture')} {/* Translated */}
//           </h1>
//         </div>
//       </motion.header>

//       <div className="flex-1 container mx-auto pt-0 py-8 flex items-start justify-center">
//         {isMobile ? (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="w-full max-w-md"
//           >
//             <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
//               <CardHeader className="pb-4">
//                 <div className="flex items-center justify-center gap-2 mb-2">
//                   <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
//                     <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
//                   </div>
//                   <CardTitle className="text-2xl">{t('fertilizerMS')}</CardTitle> {/* Translated */}
//                 </div>
//                 <CardDescription className="text-center">{t('accessManagementDashboard')}</CardDescription> {/* Translated */}
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   {error && (
//                     <Alert
//                       variant="destructive"
//                       className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
//                     >
//                       <AlertTriangle className="h-4 w-4" />
//                       <AlertDescription>{error}</AlertDescription>
//                     </Alert>
//                   )}

//                   <div className="space-y-2">
//                     <Label htmlFor="email" className="text-sm font-medium">
//                       {t('emailAddress')} {/* Translated */}
//                     </Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       placeholder="admin@fertilizer.com" // Placeholder generally not translated via i18n due to input behavior
//                       value={formData.email}
//                       onChange={(e) => handleInputChange("email", e.target.value)}
//                       disabled={isLoading}
//                       autoComplete="email"
//                       className="border-slate-200 dark:border-slate-700"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="password" className="text-sm font-medium">
//                       {t('password')} {/* Translated */}
//                     </Label>
//                     <div className="relative">
//                       <Input
//                         id="password"
//                         type={showPassword ? "text" : "password"}
//                         placeholder="••••••••"
//                         value={formData.password}
//                         onChange={(e) => handleInputChange("password", e.target.value)}
//                         disabled={isLoading}
//                         autoComplete="current-password"
//                         className="border-slate-200 dark:border-slate-700"
//                         required
//                       />
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                         onClick={() => setShowPassword(!showPassword)}
//                         disabled={isLoading}
//                       >
//                         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                       </Button>
//                     </div>
//                   </div>

//                   <Button
//                     type="submit"
//                     className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
//                     disabled={isLoading}
//                   >
//                     {isLoading ? (
//                       <span className="flex items-center gap-2">
//                         {t('signingIn')}{" "} {/* Translated */}
//                         <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                           <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                           <path d="M4 12a8 8 0 018-8" fill="currentColor" />
//                         </svg>
//                       </span>
//                     ) : (
//                       <>
//                         {t('signInSecurely')} <ArrowRight className="h-4 w-4" /> {/* Translated */}
//                       </>
//                     )}
//                   </Button>
//                 </form>
//               </CardContent>
//             </Card>
//           </motion.div>
//         ) : (
//           <div className="w-full max-w-6xl grid lg:grid-cols-5 gap-8 items-end">
//             {/* Features Section */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.2 }}
//               className="lg:col-span-3 space-y-8"
//             >
//               <div>
//                 <h2 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">
//                   {t('completeFertilizerManagementSystem')} {/* Translated */}
//                 </h2>
//                 <p className="text-slate-600 dark:text-slate-300 text-lg">
//                   {t('streamlineOperations')} {/* Translated */}
//                 </p>
//               </div>

//               <div className="grid md:grid-cols-2 gap-4">
//                 {[
//                   {
//                     icon: Package,
//                     title: t('inventoryManagement'), // Translated
//                     description: t('inventoryDescription'), // Translated
//                   },
//                   {
//                     icon: BarChart3,
//                     title: t('salesAnalytics'), // Translated
//                     description: t('salesDescription'), // Translated
//                   },
//                   {
//                     icon: Users,
//                     title: t('customerManagement'), // Translated
//                     description: t('customerDescription'), // Translated
//                   },
//                   {
//                     icon: Shield,
//                     title: t('secureAccess'), // Translated
//                     description: t('secureAccessDescription'), // Translated
//                   },
//                 ].map((feature, index) => (
//                   <motion.div
//                     key={feature.title}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.3 + index * 0.1 }}
//                   >
//                     <Card className="h-full border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
//                       <CardContent className="flex items-start gap-4 p-6">
//                         <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg mt-1">
//                           <feature.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold mb-2 text-slate-800 dark:text-white">{feature.title}</h3>
//                           <p className="text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </motion.div>
//                 ))}
//               </div>
//             </motion.div>

//             {/* Login Section */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.4 }}
//               className="lg:col-span-2"
//             >
//               <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
//                 <CardHeader>
//                   <div className="flex items-center gap-2 mb-2">
//                     <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
//                       <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
//                     </div>
//                     <CardTitle>{t('welcomeBack')}</CardTitle> {/* Translated */}
//                   </div>
//                   <CardDescription>{t('signInToDashboard')}</CardDescription> {/* Translated */}
//                 </CardHeader>
//                 <CardContent>
//                   <form onSubmit={handleSubmit} className="space-y-4">
//                     {error && (
//                       <Alert
//                         variant="destructive"
//                         className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
//                       >
//                         <AlertTriangle className="h-4 w-4" />
//                         <AlertDescription>{error}</AlertDescription>
//                       </Alert>
//                     )}

//                     <div className="space-y-2">
//                       <Label htmlFor="desktop-email" className="text-sm font-medium">
//                         {t('emailAddress')} {/* Translated */}
//                       </Label>
//                       <Input
//                         id="desktop-email"
//                         type="email"
//                         placeholder="admin@fertilizer.com" // Placeholder generally not translated via i18n
//                         value={formData.email}
//                         onChange={(e) => handleInputChange("email", e.target.value)}
//                         disabled={isLoading}
//                         autoComplete="email"
//                         className="border-slate-200 dark:border-slate-700"
//                         required
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="desktop-password" className="text-sm font-medium">
//                         {t('password')} {/* Translated */}
//                       </Label>
//                       <div className="relative">
//                         <Input
//                           id="desktop-password"
//                           type={showPassword ? "text" : "password"}
//                           placeholder="••••••••"
//                           value={formData.password}
//                           onChange={(e) => handleInputChange("password", e.target.value)}
//                           disabled={isLoading}
//                           autoComplete="current-password"
//                           className="border-slate-200 dark:border-slate-700"
//                           required
//                         />
//                         <Button
//                           type="button"
//                           variant="ghost"
//                           size="sm"
//                           className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                           onClick={() => setShowPassword(!showPassword)}
//                           disabled={isLoading}
//                         >
//                           {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                         </Button>
//                       </div>
//                     </div>

//                     <Button
//                       type="submit"
//                       className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
//                       disabled={isLoading}
//                     >
//                       {isLoading ? (
//                         <span className="flex items-center gap-2">
//                           {t('signingIn')}{" "} {/* Translated */}
//                           <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                             <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                             <path d="M4 12a8 8 0 018-8" fill="currentColor" />
//                           </svg>
//                         </span>
//                       ) : (
//                         <>
//                           {t('signInSecurely')} <ArrowRight className="h-4 w-4" /> {/* Translated */}
//                         </>
//                       )}
//                     </Button>
//                   </form>
//                 </CardContent>
//                 <CardFooter className="text-center text-sm text-slate-500 dark:text-slate-400">
//                   {t('protectedBySecurity')} {/* Translated */}
//                 </CardFooter>
//               </Card>
//             </motion.div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }



"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { login } from "@/app/actions/auth"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { storeAuthData } from '@/lib/auth-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Leaf, Eye, EyeOff, Shield, AlertTriangle, Package, BarChart3, Users, ArrowRight } from "lucide-react"

const getDeviceInfo = () => {
  return `${navigator.userAgent} | ${navigator.language} | ${window.screen.width}x${window.screen.height}`
}

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const isMobile = useIsMobile()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const form = new FormData()
      form.append("email", formData.email.toLowerCase().trim())
      form.append("password", formData.password)
      form.append("deviceInfo", getDeviceInfo())
      form.append("ipAddress", "")

      console.log("Submitting login form...", {
        email: formData.email.toLowerCase().trim(),
        deviceInfo: getDeviceInfo(),
      })

      const response = await login(form)

      if (!response.success) {
        setError(response.error || "An unknown error occurred")
        return
      }

      storeAuthData(response?.user)

      response?.user?.role === "admin" ? router.push("/dashboard") : router.push("/home")
      
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto py-6">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <div className="bg-emDEDerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
            <Image src={"/images/logo.jpg"} width={100} height={100} alt="User avatar" className="rounded-md" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            <span className="text-emerald-600 dark:text-emerald-400">GK </span>
            Natural Agriculture
          </h1>
        </div>
      </motion.header>

      <div className="flex-1 container mx-auto pt-0 py-8 flex items-start justify-center">
        {isMobile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                    <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-2xl">FertilizerMS</CardTitle>
                </div>
                <CardDescription className="text-center">Access your management dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert
                      variant="destructive"
                      className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@fertilizer.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={isLoading}
                      autoComplete="email"
                      className="border-slate-200 dark:border-slate-700"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        disabled={isLoading}
                        autoComplete="current-password"
                        className="border-slate-200 dark:border-slate-700"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        Signing in...{" "}
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path d="M4 12a8 8 0 018-8" fill="currentColor" />
                        </svg>
                      </span>
                    ) : (
                      <>
                        Sign In Securely <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="w-full max-w-6xl grid lg:grid-cols-5 gap-8 items-end">
            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">
                  Complete Fertilizer Management System
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Streamline your operations with our comprehensive solution
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                  {
                    icon: Shield,
                    title: "Secure Access",
                    description: "Role-based permissions and secure authentication for your team",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="h-full border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                      <CardContent className="flex items-start gap-4 p-6">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg mt-1">
                          <feature.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2 text-slate-800 dark:text-white">{feature.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Login Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle>Welcome Back</CardTitle>
                  </div>
                  <CardDescription>Sign in to access your dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <Alert
                        variant="destructive"
                        className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="desktop-email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="desktop-email"
                        type="email"
                        placeholder="admin@fertilizer.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        disabled={isLoading}
                        autoComplete="email"
                        className="border-slate-200 dark:border-slate-700"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="desktop-password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="desktop-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          disabled={isLoading}
                          autoComplete="current-password"
                          className="border-slate-200 dark:border-slate-700"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          Signing in...{" "}
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path d="M4 12a8 8 0 018-8" fill="currentColor" />
                          </svg>
                        </span>
                      ) : (
                        <>
                          Sign In Securely <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="text-center text-sm text-slate-500 dark:text-slate-400">
                  Protected by enterprise-grade security
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

