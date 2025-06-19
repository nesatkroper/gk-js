"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState, useEffect } from "react"
import { AlertTriangle, Home, RefreshCw, Leaf, Copy, Check } from "lucide-react"
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function ErrorPage({ error, reset }) {
  const { t } = useTranslation('common'); // Initialize useTranslation
  const is404 = error?.statusCode === 404
  const [particles, setParticles] = useState([])
  const [copied, setCopied] = useState(false)

  const copyErrorDetails = async () => {
    const errorText = `Error: ${error?.message || error?.toString() || (is404 ? t("Page not found") : t("Unknown error"))}
 
Stack Trace:
${error?.stack || "No stack trace available"}

Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}`

    try {
      await navigator.clipboard.writeText(errorText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = errorText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    // Generate fewer, more subtle particles
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
    }))
    setParticles(newParticles)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.08),transparent_50%)]" />
      </div>

      {/* Minimal Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-green-200/30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [-10, -60],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-lg md:max-w-2xl lg:max-w-4xl w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 p-6 md:p-8 lg:p-12"
        >
          {/* Error Icon */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <div className="relative inline-block">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full shadow-lg">
                <AlertTriangle className="h-12 w-12 text-white" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 bg-amber-400 p-1 rounded-full"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Leaf className="h-4 w-4 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Error Code */}
          <motion.div variants={itemVariants} className="text-center mb-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-green-700 mb-2">
              {is404 ? "404" : t("Error")}
            </h1>
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-700">
              {is404 ? t("Page Not Found") : t("Something Went Wrong")}
            </h2>
          </motion.div>

          {/* Error Message Display */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm md:text-base font-medium text-red-800">{t("Error Details:")}</h3>
                <motion.button
                  onClick={copyErrorDetails}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{t("Copied!")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>{t("Copy")}</span>
                    </>
                  )}
                </motion.button>
              </div>
              <div className="text-sm md:text-base text-red-700 font-mono bg-red-100 p-3 md:p-4 rounded border select-all">
                {error?.message ||
                  error?.toString() ||
                  (is404
                    ? t("The requested page could not be found in the fertilizer management system.")
                    : t("An unexpected error occurred in the fertilizer management system."))}
              </div>
              {error?.stack && (
                <details className="mt-4">
                  <summary className="text-sm md:text-base font-medium text-red-800 cursor-pointer hover:text-red-900">
                    {t("Technical Details")}
                  </summary>
                  <pre className="text-xs md:text-sm text-red-600 mt-3 bg-red-100 p-3 md:p-4 rounded border overflow-auto max-h-40 md:max-h-60 select-all">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {is404
                ? t("The fertilizer data or page you're looking for doesn't exist in our system.")
                : t("Our fertilizer management system encountered an issue. Please try again or contact support if the problem persists.")}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link href="/">
              <motion.div
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 px-6 py-3 md:px-8 md:py-4 rounded-lg text-white font-medium shadow-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="h-4 w-4" />
                <span>{t("Back to Dashboard")}</span>
              </motion.div>
            </Link>

            {!is404 && (
              <motion.button
                onClick={reset}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg text-white font-medium shadow-md transition-colors duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="h-4 w-4" />
                <span>{t("Try Again")}</span>
              </motion.button>
            )}
          </motion.div>

          {/* Footer Info */}
          <motion.div variants={itemVariants} className="text-center mt-6 pt-4 border-t border-green-100">
            <p className="text-sm text-gray-500">{t("Fertilizer Management System • Need help? Contact support")}</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}







// "use client"

// import { motion } from "framer-motion"
// import Link from "next/link"
// import { useState, useEffect } from "react"
// import { AlertTriangle, Home, RefreshCw, Leaf, Copy, Check } from "lucide-react"

// export default function ErrorPage({ error, reset }) {
//   const is404 = error?.statusCode === 404
//   const [particles, setParticles] = useState([])
//   const [copied, setCopied] = useState(false)

//   const copyErrorDetails = async () => {
//     const errorText = `Error: ${error?.message || error?.toString() || (is404 ? "Page not found" : "Unknown error")}
  
// Stack Trace:
// ${error?.stack || "No stack trace available"}

// Timestamp: ${new Date().toISOString()}
// URL: ${window.location.href}`

//     try {
//       await navigator.clipboard.writeText(errorText)
//       setCopied(true)
//       setTimeout(() => setCopied(false), 2000)
//     } catch (err) {
//       // Fallback for older browsers
//       const textArea = document.createElement("textarea")
//       textArea.value = errorText
//       document.body.appendChild(textArea)
//       textArea.select()
//       document.execCommand("copy")
//       document.body.removeChild(textArea)
//       setCopied(true)
//       setTimeout(() => setCopied(false), 2000)
//     }
//   }

//   useEffect(() => {
//     // Generate fewer, more subtle particles
//     const newParticles = Array.from({ length: 8 }, (_, i) => ({
//       id: i,
//       x: Math.random() * 100,
//       y: Math.random() * 100,
//       size: Math.random() * 3 + 1,
//       duration: Math.random() * 4 + 3,
//       delay: Math.random() * 2,
//     }))
//     setParticles(newParticles)
//   }, [])

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.15,
//         delayChildren: 0.1,
//       },
//     },
//   }

//   const itemVariants = {
//     hidden: { y: 30, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         type: "spring",
//         stiffness: 200,
//         damping: 20,
//       },
//     },
//   }

//   return (
//     <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
//       {/* Subtle Background Pattern */}
//       <div className="absolute inset-0">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]" />
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.08),transparent_50%)]" />
//       </div>

//       {/* Minimal Floating Elements */}
//       <div className="absolute inset-0 pointer-events-none">
//         {particles.map((particle) => (
//           <motion.div
//             key={particle.id}
//             className="absolute rounded-full bg-green-200/30"
//             style={{
//               left: `${particle.x}%`,
//               top: `${particle.y}%`,
//               width: particle.size,
//               height: particle.size,
//             }}
//             animate={{
//               y: [-10, -60],
//               opacity: [0, 0.6, 0],
//             }}
//             transition={{
//               duration: particle.duration,
//               delay: particle.delay,
//               repeat: Number.POSITIVE_INFINITY,
//               ease: "easeOut",
//             }}
//           />
//         ))}
//       </div>

//       {/* Main Content */}
//       <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           className="max-w-lg md:max-w-2xl lg:max-w-4xl w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 p-6 md:p-8 lg:p-12"
//         >
//           {/* Error Icon */}
//           <motion.div variants={itemVariants} className="text-center mb-6">
//             <div className="relative inline-block">
//               <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full shadow-lg">
//                 <AlertTriangle className="h-12 w-12 text-white" />
//               </div>
//               <motion.div
//                 className="absolute -top-1 -right-1 bg-amber-400 p-1 rounded-full"
//                 animate={{ rotate: [0, 10, -10, 0] }}
//                 transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
//               >
//                 <Leaf className="h-4 w-4 text-white" />
//               </motion.div>
//             </div>
//           </motion.div>

//           {/* Error Code */}
//           <motion.div variants={itemVariants} className="text-center mb-4">
//             <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-green-700 mb-2">
//               {is404 ? "404" : "Error"}
//             </h1>
//             <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-700">
//               {is404 ? "Page Not Found" : "Something Went Wrong"}
//             </h2>
//           </motion.div>

//           {/* Error Message Display */}
//           <motion.div variants={itemVariants} className="mb-6">
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6">
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-sm md:text-base font-medium text-red-800">Error Details:</h3>
//                 <motion.button
//                   onClick={copyErrorDetails}
//                   className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md transition-colors duration-200"
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   {copied ? (
//                     <>
//                       <Check className="h-4 w-4" />
//                       <span>Copied!</span>
//                     </>
//                   ) : (
//                     <>
//                       <Copy className="h-4 w-4" />
//                       <span>Copy</span>
//                     </>
//                   )}
//                 </motion.button>
//               </div>
//               <div className="text-sm md:text-base text-red-700 font-mono bg-red-100 p-3 md:p-4 rounded border select-all">
//                 {error?.message ||
//                   error?.toString() ||
//                   (is404
//                     ? "The requested page could not be found in the fertilizer management system."
//                     : "An unexpected error occurred in the fertilizer management system.")}
//               </div>
//               {error?.stack && (
//                 <details className="mt-4">
//                   <summary className="text-sm md:text-base font-medium text-red-800 cursor-pointer hover:text-red-900">
//                     Technical Details
//                   </summary>
//                   <pre className="text-xs md:text-sm text-red-600 mt-3 bg-red-100 p-3 md:p-4 rounded border overflow-auto max-h-40 md:max-h-60 select-all">
//                     {error.stack}
//                   </pre>
//                 </details>
//               )}
//             </div>
//           </motion.div>

//           {/* Description */}
//           <motion.div variants={itemVariants} className="text-center mb-8">
//             <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
//               {is404
//                 ? "The fertilizer data or page you're looking for doesn't exist in our system."
//                 : "Our fertilizer management system encountered an issue. Please try again or contact support if the problem persists."}
//             </p>
//           </motion.div>

//           {/* Action Buttons */}
//           <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
//             <Link href="/">
//               <motion.div
//                 className="w-full sm:w-auto bg-green-600 hover:bg-green-700 px-6 py-3 md:px-8 md:py-4 rounded-lg text-white font-medium shadow-md transition-colors duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <Home className="h-4 w-4" />
//                 <span>Back to Dashboard</span>
//               </motion.div>
//             </Link>

//             {!is404 && (
//               <motion.button
//                 onClick={reset}
//                 className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg text-white font-medium shadow-md transition-colors duration-200 flex items-center justify-center gap-2"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <RefreshCw className="h-4 w-4" />
//                 <span>Try Again</span>
//               </motion.button>
//             )}
//           </motion.div>

//           {/* Footer Info */}
//           <motion.div variants={itemVariants} className="text-center mt-6 pt-4 border-t border-green-100">
//             <p className="text-sm text-gray-500">Fertilizer Management System • Need help? Contact support</p>
//           </motion.div>
//         </motion.div>
//       </div>
//     </div>
//   )
// }
