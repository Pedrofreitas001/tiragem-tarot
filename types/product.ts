export type ProductCategory =
  | 'candles'
  | 'incense'
  | 'aromatherapy'
  | 'tarotDecks'
  | 'crystals'
  | 'kits';

export type ProductTag = 'bestseller' | 'new' | 'sale';

export interface ProductVariant {
  id: string;
  name: string;
  name_en: string;
  price: number;
  compareAtPrice?: number; // Original price if on sale
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  description_en: string;
  shortDescription: string;
  shortDescription_en: string;
  category: ProductCategory;
  tags: ProductTag[];
  price: number; // Base price (or min price if variants)
  compareAtPrice?: number;
  images: string[];
  variants?: ProductVariant[];
  variantType?: string; // e.g., "Aroma", "Size", "Color"
  variantType_en?: string;
  stock: number;
  rating: number;
  reviewCount: number;
  details: string[];
  details_en: string[];
  howToUse?: string;
  howToUse_en?: string;
  ingredients?: string;
  ingredients_en?: string;
  featured: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// Helper to get localized field
export const getLocalizedField = <T extends Product | ProductVariant>(
  item: T,
  field: 'name' | 'description' | 'shortDescription' | 'variantType' | 'howToUse' | 'ingredients' | 'details',
  isPortuguese: boolean
): string | string[] => {
  if (field === 'details') {
    return isPortuguese
      ? (item as Product).details
      : (item as Product).details_en || (item as Product).details;
  }

  const enField = `${field}_en` as keyof T;
  if (isPortuguese) {
    return item[field as keyof T] as string;
  }
  return (item[enField] as string) || (item[field as keyof T] as string);
};
