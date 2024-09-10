'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Eye, Download, Heart } from 'lucide-react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ImageCardProps {
  image: {
    id: string
    url: string
    title: string
    description?: string
  },
  key: string
}

export default function ImageCard({ image, key }: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <TooltipProvider key={key}>
      <Card 
        className="overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0 relative aspect-square">
          <Image
            src={image.url}
            alt={image.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-110"
          />
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Like</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </motion.div>
        </CardContent>
        <CardFooter className="p-2">
          <div>
            <h3 className="text-sm font-semibold line-clamp-1">{image.title}</h3>
            {image.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{image.description}</p>
            )}
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}