"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, ImageIcon, ArrowLeft, Grid, List } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import axios from 'axios'
import { useInView } from 'react-intersection-observer'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageData {
  id: string;
  url: string;
  title: string;
}

const ITEMS_PER_PAGE = 12;

const searchImages = async (query: string, page: number): Promise<Array<ImageData>> => {
  try {
    const response = await axios.post('http://localhost:5000/api/search_local', { query, page, limit: ITEMS_PER_PAGE });
    const imageData = response.data.images;

    if (!Array.isArray(imageData)) {
      throw new Error('Invalid response format');
    }

    return imageData.map((img: ImageData) => ({
      id: img.id,
      url: img.url,
      title: img.title
    }));
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

export default function SearchPage() {
  const router = useRouter();
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [images, setImages] = useState<Array<ImageData>>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortOrder, setSortOrder] = useState<'relevance' | 'title'>('relevance')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const handleSearch = useCallback(async (resetImages: boolean = true) => {
    setLoading(true)
    try {
      const results = await searchImages(query, resetImages ? 1 : page)
      if (resetImages) {
        setImages(results)
        setPage(1)
      } else {
        setImages(prev => [...prev, ...results])
        setPage(prev => prev + 1)
      }
      setHasMore(results.length === ITEMS_PER_PAGE)
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
  }, [query, page, toast])

  useEffect(() => {
    if (inView && !loading && hasMore) {
      handleSearch(false)
    }
  }, [inView, loading, hasMore, handleSearch])

  const sortedImages = [...images].sort((a, b) => {
    if (sortOrder === 'title') {
      return a.title.localeCompare(b.title)
    }
    return 0;
  })

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
        <CardFooter className="p-4 pt-0 flex justify-end mt-auto">
          <Skeleton className="h-8 w-24" />
        </CardFooter>
      </div>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <Button variant="outline" onClick={() => router.replace('/')} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold text-center sm:text-left bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
          Search
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
        </div>
      </nav>

      <form onSubmit={(e) => { e.preventDefault(); handleSearch(true); }} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search query..."
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Search
        </Button>
      </form>

      {images.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Select value={sortOrder} onValueChange={(value: 'relevance' | 'title') => setSortOrder(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Sort by Relevance</SelectItem>
              <SelectItem value="title">Sort by Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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
          {loading && images.length === 0
            ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
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
                          src={`http://localhost:5000${img.url}`}
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
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-end mt-auto">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedImage(img)}>
                              <ImageIcon className="mr-2 h-4 w-4" />
                              View Full Size
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{selectedImage?.title}</DialogTitle>
                              <DialogDescription>Click outside to close</DialogDescription>
                            </DialogHeader>
                            <div className="relative aspect-video">
                              <Image
                                src={`http://localhost:5000${selectedImage?.url}`}
                                alt={selectedImage?.title || ''}
                                layout="fill"
                                objectFit="contain"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </div>
                  </Card>
                </motion.div>
              ))}
        </motion.div>
      </AnimatePresence>

      {loading && images.length > 0 && (
        <div className="flex justify-center items-center h-24 mt-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}

      {!loading && images.length === 0 && (
        <p className="text-center text-muted-foreground text-lg mt-8">
          No images found. Try a different search query.
        </p>
      )}

      {hasMore && (
        <div ref={ref} className="h-10" />
      )}
    </div>
  )
}