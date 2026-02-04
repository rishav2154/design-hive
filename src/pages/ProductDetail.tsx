// ProductDetail.tsx (FIXED FOR NODE BACKEND)

import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { Button } from "@/components/ui/button";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id || "");
  const { data: allProducts = [] } = useProducts();

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const { isInWishlist, toggleItem } = useWishlistStore();

  const [quantity, setQuantity] = useState(1);

  if (isLoading) return null;
  if (!product) return null;

  const inWishlist = isInWishlist(product.id);

  const isPhoneCover =
    product.name.toLowerCase().includes("phone cover");

const handleAddToCart = () => {
  const image =
    product.images?.[0] ||
    product.image_url ||
    "/placeholder.svg";

  addItem({
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    quantity,
    image,
  });

  openCart();
};



  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16 container mx-auto px-4">
        <Link to="/shop" className="flex items-center gap-2 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* IMAGE */}
          <div className="glass-card rounded-3xl overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* DETAILS */}
          <div>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-accent" />
              ))}
            </div>

            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-muted-foreground mb-6">
              {product.description}
            </p>

            <div className="text-4xl font-bold mb-8">
              ₹{product.price}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>
                <Plus />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              {isPhoneCover ? (
                <Button
                  onClick={() => navigate("/customize-phone-cover")}
                  className="flex-1"
                >
                  <Sparkles className="mr-2" />
                  Customize Phone Cover
                </Button>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  className="flex-1"
                >
                  <ShoppingBag className="mr-2" />
                  Add to Cart
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() =>
                  toggleItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image_url,
                    category: product.category,
                  })
                }
              >
                <Heart className={inWishlist ? "fill-current" : ""} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-10 text-center">
              <div>
                <Truck className="mx-auto" />
                Free Shipping
              </div>
              <div>
                <ShieldCheck className="mx-auto" />
                Secure Payment
              </div>
              <div>
                <RotateCcw className="mx-auto" />
                Easy Returns
              </div>
            </div>
          </div>
        </div>

        <ProductReviews productId={product.id} />

        {relatedProducts.length > 0 && (
          <section className="mt-24">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
