import { useState } from "react";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, X } from "lucide-react";
import { posProducts, categories } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [discount, setDiscount] = useState(0);

  const filteredProducts = posProducts.filter((p) => {
    const matchesSearch = p.name.includes(searchQuery) || p.barcode.includes(searchQuery);
    const matchesCategory = activeCategory === "الكل" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: (typeof posProducts)[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = (subtotal * discount) / 100;
  const tax = (subtotal - discountAmount) * 0.15;
  const total = subtotal - discountAmount + tax;

  return (
    <div className="flex h-screen">
      {/* Products Side */}
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الباركود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted border-0 rounded-lg pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {/* Categories */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="pos-grid-item text-right"
              >
                <div className="w-full aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-sm font-medium text-card-foreground line-clamp-1">{product.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                <p className="text-sm font-bold text-primary mt-1">{product.price} ر.س</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Side */}
      <div className="w-[380px] bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-card-foreground">الفاتورة الحالية</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{cart.length} صنف</p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <span className="text-4xl mb-3">🛒</span>
              <p className="text-sm">اضغط على منتج لإضافته</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.price} ر.س</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-7 h-7 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-card-foreground">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-7 h-7 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-semibold text-card-foreground w-20 text-left">
                  {(item.price * item.qty).toLocaleString()} ر.س
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Totals & Payment */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Discount */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">خصم %</span>
            <input
              type="number"
              min={0}
              max={100}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-16 bg-muted border-0 rounded-md px-2 py-1 text-sm text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>المجموع الفرعي</span>
              <span>{subtotal.toLocaleString()} ر.س</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>الخصم ({discount}%)</span>
                <span>- {discountAmount.toLocaleString()} ر.س</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>الضريبة (15%)</span>
              <span>{tax.toFixed(0)} ر.س</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-card-foreground pt-2 border-t border-border">
              <span>الإجمالي</span>
              <span>{total.toFixed(0)} ر.س</span>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="default" className="flex-col h-14 gap-1">
              <Banknote className="w-5 h-5" />
              <span className="text-[10px]">كاش</span>
            </Button>
            <Button variant="secondary" className="flex-col h-14 gap-1">
              <CreditCard className="w-5 h-5" />
              <span className="text-[10px]">بطاقة</span>
            </Button>
            <Button variant="secondary" className="flex-col h-14 gap-1">
              <Smartphone className="w-5 h-5" />
              <span className="text-[10px]">محفظة</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="text-xs">
              تعليق الفاتورة
            </Button>
            <Button
              variant="destructive"
              className="text-xs"
              onClick={() => { setCart([]); setDiscount(0); }}
            >
              <X className="w-3.5 h-3.5 ml-1" />
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
