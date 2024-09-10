'use client';

import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Grid, List, RefreshCw, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export default function DownloadPage() {
  const [query, setQuery] = useState<string>('');
  const [numImages, setNumImages] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [fetchedImages, setFetchedImages] = useState<number>(0);
  const [autoDownload, setAutoDownload] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setImageUrls([]);
    setFetchedImages(0);

    try {
      await axios.post('http://localhost:5000/api/download', { query: query, count: numImages });

      const intervalId = setInterval(async () => {
        if (fetchedImages >= numImages) {
          clearInterval(intervalId);
          setLoading(false);
          toast({
            title: "Success",
            description: `Downloaded ${numImages} images successfully.`,
          });
          if (autoDownload) {
            handleDownloadAll();
          }
          return; // Stop if we've fetched the required number of images
        }

        try {
          const res = await axios.get('http://localhost:5000/api/fetch_image', {
            params: { category: query },
            responseType: 'blob',
          });

          const url = URL.createObjectURL(new Blob([res.data]));
          setImageUrls((prevUrls) => [...prevUrls, url]);
          setFetchedImages((prev) => prev + 1);
        } catch (error) {
          console.error('Error fetching image:', error);
          toast({
            title: "Error",
            description: "Failed to fetch an image. Please try again.",
            variant: "destructive",
          });
        }
      }, 1000);
    } catch (error) {
      console.error('Error during download initiation:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to initiate download. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = useCallback(() => {
    setQuery('');
    setNumImages(10);
    setImageUrls([]);
    setFetchedImages(0);
    setLoading(false);
  }, []);

  const handleDownloadAll = useCallback(() => {
    imageUrls.forEach((url, index) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${query}-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    toast({
      title: "Success",
      description: `Started download of ${imageUrls.length} images.`,
    });
  }, [imageUrls, query]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setImageUrls(prevUrls => prevUrls.filter((_, index) => index !== indexToRemove));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex justify-between items-center mb-8">
        <Button variant="outline" onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
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
      <h1 className="text-4xl font-bold py-2 mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
        Image Downloader
      </h1>
      <form onSubmit={handleDownload} className="space-y-4 mb-8">
        <div className="flex flex-col md:flex-col gap-4">
          <div className="flex-1">
            <Label htmlFor="query">Search Query</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter search query..."
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>
          <div className="w-full">
            <Label htmlFor="numImages">Number of Images: {numImages}</Label>
            <Slider
              id="numImages"
              min={1}
              max={50}
              step={1}
              value={[numImages]}
              onValueChange={(value) => setNumImages(value[0])}
              disabled={loading}
              className="mt-2"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-download"
            checked={autoDownload}
            onCheckedChange={setAutoDownload}
          />
          <Label htmlFor="auto-download">Auto-download images when complete</Label>
        </div>
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Downloading...' : 'Download Images'}
          </Button>
        </div>
      </form>
      {loading && (
        <div className="mb-8">
          <Progress value={(fetchedImages / numImages) * 100} className="w-full" />
          <p className="text-center mt-2">
            Downloading: {fetchedImages} / {numImages} images
          </p>
        </div>
      )}
      {imageUrls.length > 0 && (
        <div className="mb-4 flex justify-end">
          <Button onClick={handleDownloadAll}>
            <Download className="mr-2 h-4 w-4" /> Download All Images
          </Button>
        </div>
      )}
      <AnimatePresence>
        <motion.div 
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
          }
        >
          {imageUrls.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Dialog>
                <DialogTrigger asChild>
                  <div className={`border rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 relative ${viewMode === 'list' ? 'flex items-center' : ''}`}>
                    <img src={url} alt={`Image ${index + 1}`} className={viewMode === 'list' ? "w-1/3 h-32 object-cover" : "w-full h-48 object-cover"} />
                    {viewMode === 'list' && (
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold">Image {index + 1}</h3>
                        <p className="text-sm text-gray-500">Click to view full size</p>
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Image {index + 1}</DialogTitle>
                    <DialogDescription>Click outside to close</DialogDescription>
                  </DialogHeader>
                  <img src={url} alt={`Image ${index + 1}`} className="w-full h-auto" />
                </DialogContent>
              </Dialog>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}