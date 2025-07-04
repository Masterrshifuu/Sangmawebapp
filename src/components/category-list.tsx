'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Category } from "@/lib/types";
import { ChevronRight } from "lucide-react";

type CategoryListProps = {
  categories: Category[];
};

export default function CategoryList({ categories }: CategoryListProps) {
  return (
    <Accordion type="multiple" className="w-full">
      {categories.map((category) => (
        <AccordionItem value={category.id} key={category.id}>
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            {category.name}
          </AccordionTrigger>
          <AccordionContent>
            {category.subcategories && category.subcategories.length > 0 ? (
              <ul className="pl-4 space-y-2 pt-2">
                {category.subcategories.map((sub, index) => (
                  <li key={index} className="flex items-center text-muted-foreground hover:text-foreground cursor-pointer">
                     <ChevronRight className="h-4 w-4 mr-2" />
                    {sub}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pl-4 text-muted-foreground">No subcategories available.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
