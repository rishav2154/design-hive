// useProducts.ts (NODE BACKEND VERSION)

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Product {
  image_url: string;
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isCustomizable: boolean;
  tags: string[];
  stock: number;
  colors?: string[];
  customizationOptions?: {
    allowText?: boolean;
    allowImage?: boolean;
    maxTextLength?: number;
  };
}

/* ---------------- MAP DB PRODUCT ---------------- */

const mapDbProductToProduct = (db: any): Product => {
  return {
  id: db.id,
  name: db.name,
  description: db.description || "",
  price: Number(db.price),
  originalPrice: db.original_price || undefined,
  category: db.category,
  images: db.image ? [db.image] : ["/placeholder.svg"],
  rating: 4.5,
  reviewCount: 0,
  isCustomizable: true,
  tags: db.tags || [],
  stock: db.stock || 0,
  customizationOptions: {
    allowText: true,
    allowImage: true,
    maxTextLength: 30,
  }};
};

/* ---------------- ALL PRODUCTS ---------------- */

export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      const data = await apiFetch("/api/products");

      const products = (data || []).map(mapDbProductToProduct);

      if (category) {
        return products.filter((p: Product) => p.category === category);
      }

      return products;
    },
  });
};

/* ---------------- FEATURED ---------------- */

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const data = await apiFetch("/api/products");

      return (data || [])
        .slice(0, 4)
        .map(mapDbProductToProduct);
    },
  });
};

/* ---------------- SINGLE PRODUCT ---------------- */

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const data = await apiFetch(`/api/products/${id}`);
      if (!data) return null;
      return mapDbProductToProduct(data);
    },
    enabled: !!id,
  });
};

/* ---------------- CATEGORIES ---------------- */

export const categories = [
  { id: "mugs", name: "Mugs", icon: "☕", description: "Custom printed mugs" },
  { id: "frames", name: "Photo Frames", icon: "🖼️", description: "Personalized frames" },
  { id: "keychains", name: "Keychains", icon: "🔑", description: "Custom keychains" },
  { id: "phone-covers", name: "Phone Covers", icon: "📱", description: "Customized phone cases" },
  { id: "lamps", name: "Lamps", icon: "💡", description: "LED night lamps" },
  { id: "tshirts", name: "T-Shirts", icon: "👕", description: "Custom printed tees" },
  { id: "posters", name: "Posters", icon: "🎨", description: "Wall art & posters" },
  { id: "combos", name: "Gift Combos", icon: "🎁", description: "Gift bundles" },
];
