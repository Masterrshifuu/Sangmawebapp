
'use client';

import CategoryList from "@/components/category-list";
import { useSearchParams } from 'next/navigation';
import { useData } from '@/context/data-context';
import Footer from "../footer";
import Logo from "../logo";
import { useRef } from "react";

interface CategoriesTabProps {
}

export default function CategoriesTabContent({ }: CategoriesTabProps) {
  const searchParams = useSearchParams();
  const { categories, products, loading } = useData();
  const openCategoryId = searchParams.get('open');
  const scrollRef = useRef<HTMLDivElement>(null);


  const content = loading ? (
    <div className="flex-1 flex justify-center items-center">
        <Logo className="animate-logo-pulse" />
    </div>
  ) : (
    <>
      <h1 className="text-3xl font-bold font-headline mb-8">All Categories</h1>
      <CategoryList categories={categories} products={products} openCategoryId={openCategoryId || undefined} />
    </>
  );

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-1">
        {content}
      </main>
      <Footer />
    </div>
  );
}
