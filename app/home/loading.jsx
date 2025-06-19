"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const loadingVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", damping: 10 }
  }
};

export default function Loading() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={loadingVariants}
      className="min-h-screen w-full bg-gradient-to-br from-[#f6f7f9] to-[#e9ebee] dark:from-[#1a1a1a] dark:to-[#2a2a2a]"
    >
      {/* Animated Background */}
      <motion.div
        variants={itemVariants}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute -inset-20 opacity-20 blur-xl bg-[conic-gradient(from_90deg_at_50%_50%,#ff8bff_0%,#5d5df5_50%,#00d4ff_100%)] dark:opacity-10 animate-[spin_8s_linear_infinite] [animation-delay:-2s]" />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        {/* Logo Placeholder */}
        <motion.div variants={itemVariants} className="flex justify-center mb-12">
          <Skeleton className="h-12 w-32 rounded-lg bg-white/80 dark:bg-neutral-700/50" />
        </motion.div>

        {/* Animated Grid */}
        <motion.div variants={loadingVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white/70 dark:bg-neutral-800/50 backdrop-blur-lg rounded-xl p-6 border border-white/20 dark:border-neutral-700/30 shadow-sm"
            >
              <Skeleton className="h-6 w-3/4 mb-4 bg-neutral-200/70 dark:bg-neutral-700" />
              <Skeleton className="h-4 w-full mb-2 bg-neutral-200/50 dark:bg-neutral-700/40" />
              <Skeleton className="h-4 w-5/6 mb-4 bg-neutral-200/50 dark:bg-neutral-700/40" />
              <Skeleton className="h-10 w-full rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30" />
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Loader */}
        <motion.div
          variants={itemVariants}
          className="mt-16 flex justify-center"
        >
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  delay: i * 0.2
                }}
                className="h-3 w-3 bg-blue-500 dark:bg-blue-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}