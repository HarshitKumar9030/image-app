'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Grid, List, Filter, Search, Eye, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  gallery_url: string;
  name: string;
  random_image_url: string;
}

export default function Gallery() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category => 
    (searchTerm === '' || category.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategories.length === 0 || selectedCategories.includes(category.name))
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortOrder === 'name') return a.name.localeCompare(b.name);
    if (sortOrder === 'oldest') return a.gallery_url.localeCompare(b.gallery_url);
    return b.gallery_url.localeCompare(a.gallery_url); // 'newest' is default
  });

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <nav className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/')} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-4xl font-extrabold tracking-tight text-center sm:text-left py-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-600">
          Gallery
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
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Categories</SheetTitle>
                <SheetDescription>
                  Apply filters to refine your gallery view.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Categories</h3>
                  <ScrollArea className="h-[200px]">
                    {categories.map(category => (
                      <div key={category.name} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          id={category.name}
                          checked={selectedCategories.includes(category.name)}
                          onChange={() => toggleCategory(category.name)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor={category.name} className="text-sm">{category.name}</label>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
              <SheetClose asChild>
                <Button className="mt-4 w-full" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest' | 'name') => setSortOrder(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Sort by Newest</SelectItem>
            <SelectItem value="oldest">Sort by Oldest</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map(category => (
            <Badge key={category} variant="secondary" className="px-2 py-1">
              {category}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 p-0 h-auto"
                onClick={() => toggleCategory(category)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button variant="outline" size="sm" onClick={() => setSelectedCategories([])}>
            Clear All
          </Button>
        </div>
      )}

      {loading ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col gap-4"
        }>
          {[...Array(6)].map((_, index) => (
            <Card key={index} className={viewMode === 'list' ? "flex overflow-hidden" : "overflow-hidden"}>
              <CardHeader className={viewMode === 'list' ? "p-0 w-1/3" : "p-0"}>
                <Skeleton className={viewMode === 'list' ? "h-full" : "aspect-video"} />
              </CardHeader>
              <div className={viewMode === 'list' ? "flex-1 flex flex-col" : ""}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end mt-auto">
                  <Skeleton className="h-8 w-24" />
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {sortedCategories.map((category) => (
              <motion.div
                key={category.name}
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
                        src={`http://localhost:5000/${category.random_image_url}`}
                        alt={category.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  </CardHeader>
                  <div className={viewMode === 'list' ? "flex-1 flex flex-col" : ""}>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg font-semibold line-clamp-1">{category.name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">{category.name}</Badge>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-end mt-auto">
                      <Button variant="outline" size="sm" onClick={() => router.push(category.gallery_url)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Gallery
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
      {sortedCategories.length === 0 && !loading && (
        <p className="text-center text-muted-foreground text-lg mt-8">
          No categories found matching your criteria.
        </p>
      )}
    </div>
  );
}