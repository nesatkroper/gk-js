"use client"

import { motion } from 'framer-motion';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function ErrorPage({ error, reset }) {
  const is404 = error.statusCode === 404;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 dark:text-yellow-400" />
        </motion.div>
        <h1 className="mt-4 text-4xl font-bold text-gray-800 dark:text-white">
          {is404 ? '404' : 'Error'}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {is404
            ? "Oops! The page you're looking for couldn't be found."
            : "Something went wrong. We're working on fixing it."}
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/">
            <a className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
              <Home className="mr-2 h-4 w-4" />
              Go Back Home
            </a>
          </Link>
          {!is404 && (
            <button
              onClick={reset}
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}