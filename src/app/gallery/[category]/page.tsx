'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Grid, List, Filter, Search, Download, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

interface Image {
  id: string
  url: string
  title: string
  category: string
}

export default function GalleryPage({ params }: { params: { category: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const category = params.category
  const parsedCategory = category.replaceAll('%20', ' ')
  
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'title'>('newest')
  const [filterCategories, setFilterCategories] = useState<string[]>([category])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)

  const fetchImages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/gallery?category=${filterCategories.join(',')}`)
      const data = await response.json()
      setImages(data.images)
    } catch (error) {
      console.error('Error fetching images:', error)
      toast({
        title: "Error",
        description: "Failed to fetch images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [filterCategories, toast])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const filteredImages = images.filter(img => 
    img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortOrder === 'title') return a.title.localeCompare(b.title)
    if (sortOrder === 'oldest') return a.id.localeCompare(b.id)
    return b.id.localeCompare(a.id) // 'newest' is default
  })

  const handleDownload = useCallback((img: Image) => {
    const link = document.createElement('a')
    link.href = `http://localhost:5000/images${img.url}`
    link.download = `${img.title}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({
      title: "Download Started",
      description: `Downloading ${img.title}`,
    })
  }, [toast])

  const toggleCategory = (category: string) => {
    setFilterCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const allCategories = Array.from(new Set(images.map(img => img.category)))

  const SkeletonCard = ({ viewMode }: { viewMode: 'grid' | 'list' }) => (
    <Card className={viewMode === 'list' ? "flex overflow-hidden" : "overflow-hidden"}>
      <CardHeader className={viewMode === 'list' ? "p-0 w-1/3" : "p-0"}>
        <Skeleton className={viewMode === 'list' ? "h-full" : "aspect-video w-full"} />
      </CardHeader>
      <div className={viewMode === 'list' ? "flex-1 flex flex-col" : ""}>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-end mt-auto gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-24" />
        </CardFooter>
      </div>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <Button variant="outline" onClick={() => router.push('/')} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-center sm:text-left bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
          Gallery: {parsedCategory}
        </h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Images</SheetTitle>
                <SheetDescription>
                  Apply filters to refine your gallery view.
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[400px] mt-4">
                <div className="space-y-4">
                  {allCategories.map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox
                        id={cat}
                        checked={filterCategories.includes(cat)}
                        onCheckedChange={() => toggleCategory(cat)}
                      />
                      <label
                        htmlFor={cat}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <SheetClose asChild>
                <Button className="mt-4 w-full" onClick={fetchImages}>Apply Filters</Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest' | 'title') => setSortOrder(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Sort by Newest</SelectItem>
            <SelectItem value="oldest">Sort by Oldest</SelectItem>
            <SelectItem value="title">Sort by Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence>
        <motion.div 
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SkeletonCard viewMode={viewMode} />
                </motion.div>
              ))
            : sortedImages.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={viewMode === 'list' ? "flex overflow-hidden" : "overflow-hidden"}>
                    <CardHeader className={viewMode === 'list' ? "p-0 w-1/3" : "p-0"}>
                      <div className={viewMode === 'list' ? "relative h-full" : "relative aspect-video"}>
                        <Image
                          src={`http://localhost:5000/images${img.url}`}
                          alt={img.title}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    </CardHeader>
                    <div className={viewMode === 'list' ? "flex-1 flex flex-col" : ""}>
                      <CardContent className="p-4">
                        <CardTitle className="text-lg line-clamp-1">{img.title}</CardTitle>
                        <Badge variant="secondary" className="mt-2">{img.category}</Badge>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-end mt-auto gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedImage(img)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{selectedImage?.title}</DialogTitle>
                              <DialogDescription>{selectedImage?.category}</DialogDescription>
                            </DialogHeader>
                            <Image
                              src={`http://localhost:5000/images${selectedImage?.url}`}
                              alt={selectedImage?.title || ''}
                              width={800}
                              height={600}
                              layout="responsive"
                              objectFit="contain"
                            />
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => handleDownload(img)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </CardFooter>
                    </div>
                  </Card>
                </motion.div>
              ))}
        </motion.div>
      </AnimatePresence>
      {sortedImages.length === 0 && !loading && (
        <p className="text-center text-muted-foreground text-lg mt-8">
          No images found matching your criteria.
        </p>
      )}
    </div>
  )
}