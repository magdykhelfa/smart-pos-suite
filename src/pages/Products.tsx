import { useState } from "react";
import { Search, Plus, Filter, Package, AlertTriangle } from "lucide-react";
import { inventoryProducts } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Products = () => {
  const [search, setSearch] = useState("");

  const filtered = inventoryProducts.filter(
    (p) => p.name.includes(search) || p.sku.includes(search) || p.barcode.includes(search)
  );

  const statusVariant = (status: string) => {
    if (status === "متوفر") return "bg-success/10 text-success border-success/20";
    if (status === "منخفض") return "bg-warning/10 text-warning border-warning/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة المنتجات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {inventoryProducts.length} منتج • {inventoryProducts.filter((p) => p.status === "منخفض").length} منخفض المخزون
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-bold text-card-foreground">{inventoryProducts.length}</p>
            <p className="text-xs text-muted-foreground">إجمالي المنتجات</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-xl font-bold text-card-foreground">
              {inventoryProducts.filter((p) => p.status === "منخفض").length}
            </p>
            <p className="text-xs text-muted-foreground">مخزون منخفض</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-xl font-bold text-card-foreground">
              {inventoryProducts.filter((p) => p.status === "نفد").length}
            </p>
            <p className="text-xs text-muted-foreground">نفد المخزون</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث بالاسم أو SKU أو الباركود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right text-xs font-semibold text-muted-foreground p-3">المنتج</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-3">SKU</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-3">الفئة</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-3">سعر الشراء</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-3">سعر البيع</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-3">الربح %</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-3">المخزون</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => {
                const margin = (((product.sellPrice - product.buyPrice) / product.buyPrice) * 100).toFixed(0);
                return (
                  <tr
                    key={product.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm">📦</div>
                        <span className="text-sm font-medium text-card-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm font-mono text-muted-foreground">{product.sku}</td>
                    <td className="p-3 text-sm text-muted-foreground">{product.category}</td>
                    <td className="p-3 text-sm text-muted-foreground">{product.buyPrice} ر.س</td>
                    <td className="p-3 text-sm font-medium text-card-foreground">{product.sellPrice} ر.س</td>
                    <td className="p-3">
                      <span className="text-sm font-medium text-success">{margin}%</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          product.stock <= product.reorderLevel ? "text-warning" : "text-card-foreground"
                        )}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "text-[11px] px-2 py-0.5 rounded-full border font-medium",
                          statusVariant(product.status)
                        )}
                      >
                        {product.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
