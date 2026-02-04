// Checkout.tsx (FIXED FOR NODE BACKEND)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    items,
    getTotalPrice,
    clearCart,
    appliedCoupon,
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  // ✅ auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/auth");
    else setCheckingAuth(false);
  }, [navigate]);

  // ✅ prevent empty cart
  useEffect(() => {
    if (!checkingAuth && items.length === 0) {
      navigate("/cart");
    }
  }, [items, checkingAuth, navigate]);

  const subtotal = getTotalPrice();

  const validateForm = () => {
    if (
      !address.fullName ||
      !address.phone ||
      !address.addressLine1 ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // ✅ MAIN FIX HERE
const handlePlaceOrder = async () => {
  if (!validateForm()) return;

  setLoading(true);
  try {
    const res = await apiFetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({
        items, // ✅ THIS WAS MISSING
        shipping_address: {
          full_name: address.fullName,
          phone: address.phone,
          address_line1: address.addressLine1,
          address_line2: address.addressLine2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        coupon: appliedCoupon?.code || null,
      }),
    });

    clearCart();
    navigate(`/order-success/${res.order_id}`);
  } catch (error: any) {
    toast({
      title: "Order Failed",
      description: error.message,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16 container mx-auto px-4">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft /> Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

            {Object.keys(address).map((key) => (
              <div key={key} className="mb-3">
                <Label>{key}</Label>
                <Input
                  value={(address as any)[key]}
                  onChange={(e) =>
                    setAddress({ ...address, [key]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">Payment</h3>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
            >
              <RadioGroupItem value="cod" /> COD
              <RadioGroupItem value="online" /> Online
            </RadioGroup>

            <Button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Place Order"}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
