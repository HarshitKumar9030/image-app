'use client';

import React from 'react';
import { Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1 }}
    className="flex justify-center items-center h-full"
  >
    <Circle className="text-blue-500 w-12 h-12" />
  </motion.div>
);

export default Loader;