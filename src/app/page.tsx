'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Image, Moon, Sun, Zap, Download } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

const themes = {
  light: {
    background: 'bg-gray-100',
    text: 'text-gray-900',
    accent: 'from-indigo-500 to-purple-500',
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-gray-100',
    accent: 'from-purple-500 to-pink-500',
  },
}

export default function Page() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [animatedBg, setAnimatedBg] = useState(false)

  useEffect(() => {
    setMounted(true)
    setRecentSearches(['nature', 'architecture', 'food'])
  }, [])

  if (!mounted) return null

  const currentTheme = theme === 'system' ? 'light' : theme ?? 'light'
  const { background, text, accent } = themes[currentTheme as keyof typeof themes] || themes.light

  const buttons = [
    { text: 'Search Images', icon: Search, path: '/search' },
    { text: 'View Gallery', icon: Image, path: '/gallery' },
    { text: 'Download', icon: Download, path: '/download'}
  ]

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${background} ${text} transition-colors duration-300 overflow-hidden`}>
      {animatedBg && (
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              backgroundImage: [
                'radial-gradient(circle, #ff00ff 0%, transparent 20%)',
                'radial-gradient(circle, #00ffff 0%, transparent 20%)',
                'radial-gradient(circle, #ffff00 0%, transparent 20%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10"
      >
        <h1 className="text-6xl font-bold mb-6 tracking-tight">
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${accent}`}>
            Explore Visuals
          </span>
        </h1>
        <p className="text-xl mb-12 max-w-md mx-auto">
          Dive into a world of imagery. Search, discover, and be inspired.
        </p>
      </motion.div>

      <div className="flex flex-col gap-6 w-full max-w-md z-10">
        {buttons.map((button) => (
          <motion.button
            key={button.text}
            onClick={() => router.push(button.path)}
            className={`group relative overflow-hidden rounded-lg ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-4 text-left transition-all duration-300 ease-out hover:shadow-lg`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold">{button.text}</span>
              <button.icon className={`${currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'} group-hover:text-current transition-colors`} size={24} />
            </div>
            <div className={`absolute inset-0 bg-gradient-to-r ${accent} opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-out`} />
          </motion.button>
        ))}
      </div>

      {recentSearches.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center z-10"
        >
          <h2 className="text-xl font-semibold mb-2">Recent Searches</h2>
          <div className="flex gap-2 justify-center">
            {recentSearches.map((search) => (
              <button
                key={search}
                onClick={() => router.push(`/search?q=${search}`)}
                className={`px-3 py-1 rounded-full text-sm ${currentTheme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
              >
                {search}
              </button>
            ))}
          </div>
          <div className="mt-4 font-lg font-semibold">Made With 💖 by <Link className='text-blue-700 hover:scale-105 transition-all duration-300 text-xl' href={'https://leoncyriac.me'}>Harshit</Link></div>
        </motion.div>
      )}

      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <button
          onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentTheme === 'dark' ? 'dark' : 'light'}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {currentTheme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </motion.div>
          </AnimatePresence>
        </button>
        <button
          onClick={() => setAnimatedBg(!animatedBg)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle animated background"
        >
          <Zap size={24} className={animatedBg ? 'text-yellow-400' : 'text-gray-400'} />
        </button>
      </div>
    </div>
  )
}
