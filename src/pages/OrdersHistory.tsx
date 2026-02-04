import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";
import { apiFetch } from "@/lib/api";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  price: number;
  customization: Record<string, unknown> | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  shipping: number | null;
  tax: number | null;
  discount: number | null;
  total: number;
  shipping_address: any;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderTracking {
  id: string;
  status: string;
  description: string | null;
  created_at: string;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-500" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "bg-blue-500" },
  processing: { label: "Processing", icon: Package, color: "bg-purple-500" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-indigo-500" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "bg-green-500" },
  cancelled: { label: "Cancelled", icon: Package, color: "bg-red-500" },
};

const OrdersHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderTracking, setOrderTracking] = useState<Record<string, OrderTracking[]>>({});
  const navigate = useNavigate();
  const { downloadInvoice, downloading } = useInvoiceDownload();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await apiFetch("/api/orders");
        setOrders(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const fetchOrderTracking = async (orderId: string) => {
    if (orderTracking[orderId]) return;

    try {
      const data = await apiFetch(`/api/orders/${orderId}/tracking`);
      setOrderTracking((prev) => ({ ...prev, [orderId]: data }));
    } catch {}
  };

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderTracking(orderId);
    }
  };

  const getStatusInfo = (status: string) =>
    statusConfig[status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-accent" />
              My Orders
            </h1>
          </motion.div>

          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <Button onClick={() => navigate("/shop")}>Browse Products</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <div key={order.id} className="glass-card rounded-2xl">
                    <button
                      onClick={() => toggleOrderExpand(order.id)}
                      className="w-full p-6 flex justify-between"
                    >
                      <div>
                        <p className="font-semibold">{order.order_number}</p>
                        <Badge className={`${statusInfo.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div>
                        ₹{order.total}
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-6 border-t border-border">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between mb-2">
                            <span>{item.product_name}</span>
                            <span>₹{item.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrdersHistory;
