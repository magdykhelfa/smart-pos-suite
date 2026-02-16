import { useState } from "react";
import { BarChart3, FileText, Package, TrendingUp, Users, Calendar } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["hsl(160,84%,39%)", "hsl(217,91%,60%)", "hsl(38,92%,50%)", "hsl(280,65%,60%)", "hsl(0,72%,51%)", "hsl(190,80%,50%)"];

type ReportType = "sales" | "products" | "profit" | "inventory" | "customers" | "invoices";

const reportTabs: { key: ReportType; label: string; icon: any }[] = [
  { key: "sales", label: "المبيعات", icon: BarChart3 },
  { key: "products", label: "المنتجات", icon: Package },
  { key: "profit", label: "الأرباح", icon: TrendingUp },
  { key: "inventory", label: "الجرد", icon: FileText },
  { key: "customers", label: "العملاء", icon: Users },
  { key: "invoices", label: "الفواتير", icon: FileText },
];

const Reports = () => {
  const { products, customers, transactions, invoices } = useStore();
  const [activeReport, setActiveReport] = useState<ReportType>("sales");
  const [dateRange, setDateRange] = useState({ from: "2026-02-01", to: "2026-02-16" });

  // Sales by day
  const salesByDay = transactions
    .filter(t => t.type === "sale" && t.date >= dateRange.from && t.date <= dateRange.to)
    .reduce((acc, t) => { acc[t.date] = (acc[t.date] || 0) + t.amount; return acc; }, {} as Record<string, number>);
  const salesChartData = Object.entries(salesByDay).map(([date, amount]) => ({ date: date.slice(5), amount })).sort((a, b) => a.date.localeCompare(b.date));

  // Product sales
  const productSalesData = products.slice(0, 6).map(p => ({
    name: p.name.slice(0, 15),
    sold: Math.floor(Math.random() * 50 + 10),
    revenue: Math.floor(Math.random() * 50000 + 5000),
  }));

  // Profit by category
  const profitByCategory = products.reduce((acc, p) => {
    const profit = (p.sellPrice - p.buyPrice) * p.stock;
    acc[p.category] = (acc[p.category] || 0) + profit;
    return acc;
  }, {} as Record<string, number>);
  const profitPieData = Object.entries(profitByCategory).map(([name, value]) => ({ name, value }));

  // Inventory
  const inventoryData = products.map(p => ({
    name: p.name.slice(0, 12),
    stock: p.stock,
    reorder: p.reorderLevel,
    value: p.stock * p.buyPrice,
  }));

  // Customer ranking
  const customerRanking = [...customers].sort((a, b) => b.totalPurchases - a.totalPurchases);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">التقارير والتحليلات</h1><p className="text-sm text-muted-foreground mt-1">تحليل شامل لأداء المتجر</p></div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input type="date" value={dateRange.from} onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground" />
          <span className="text-muted-foreground text-xs">إلى</span>
          <input type="date" value={dateRange.to} onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {reportTabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveReport(tab.key)}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              activeReport === tab.key ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
            )}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {activeReport === "sales" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-4"><p className="text-xs text-muted-foreground">إجمالي المبيعات</p><p className="text-2xl font-bold text-card-foreground mt-1">{transactions.filter(t => t.type === "sale").reduce((s, t) => s + t.amount, 0).toLocaleString()} ر.س</p></div>
            <div className="glass-card rounded-xl p-4"><p className="text-xs text-muted-foreground">عدد الفواتير</p><p className="text-2xl font-bold text-card-foreground mt-1">{invoices.length}</p></div>
            <div className="glass-card rounded-xl p-4"><p className="text-xs text-muted-foreground">متوسط الفاتورة</p><p className="text-2xl font-bold text-card-foreground mt-1">{invoices.length ? Math.round(invoices.reduce((s, inv) => s + inv.total, 0) / invoices.length).toLocaleString() : 0} ر.س</p></div>
          </div>
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-base font-semibold text-card-foreground mb-4">المبيعات اليومية</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220,25%,9%)", border: "1px solid hsl(220,20%,16%)", borderRadius: "8px", color: "#fff", fontFamily: "Cairo", direction: "rtl" }} />
                <Bar dataKey="amount" fill="hsl(160,84%,39%)" radius={[4, 4, 0, 0]} name="المبيعات" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeReport === "products" && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">أداء المنتجات</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productSalesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(220,25%,9%)", border: "1px solid hsl(220,20%,16%)", borderRadius: "8px", color: "#fff", fontFamily: "Cairo", direction: "rtl" }} />
              <Bar dataKey="revenue" fill="hsl(160,84%,39%)" radius={[0, 4, 4, 0]} name="الإيراد" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeReport === "profit" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-base font-semibold text-card-foreground mb-4">الأرباح حسب الفئة</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart><Pie data={profitPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} label={({ name }) => name}>
                {profitPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip formatter={(v: number) => `${v.toLocaleString()} ر.س`} /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-base font-semibold text-card-foreground mb-4">هامش الربح لكل منتج</h3>
            <div className="space-y-3">
              {products.map(p => {
                const margin = ((p.sellPrice - p.buyPrice) / p.buyPrice * 100);
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 truncate">{p.name}</span>
                    <div className="flex-1 bg-muted rounded-full h-2"><div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${Math.min(margin, 100)}%` }} /></div>
                    <span className="text-xs font-semibold text-primary w-12 text-left">{margin.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeReport === "inventory" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <h3 className="text-base font-semibold text-card-foreground p-5 pb-3">تقرير الجرد</h3>
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">المنتج</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">الفئة</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">الكمية</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">حد إعادة الطلب</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">قيمة المخزون</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">الحالة</th>
            </tr></thead>
            <tbody>
              {inventoryData.map((p, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm font-medium text-card-foreground">{products[i].name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{products[i].category}</td>
                  <td className="p-3 text-sm font-medium text-card-foreground">{p.stock}</td>
                  <td className="p-3 text-sm text-muted-foreground">{p.reorder}</td>
                  <td className="p-3 text-sm text-card-foreground">{p.value.toLocaleString()} ر.س</td>
                  <td className="p-3"><span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", p.stock === 0 ? "bg-destructive/10 text-destructive border-destructive/20" : p.stock <= p.reorder ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20")}>{p.stock === 0 ? "نفد" : p.stock <= p.reorder ? "منخفض" : "متوفر"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-muted/30 border-t border-border">
            <p className="text-sm text-muted-foreground">إجمالي قيمة المخزون: <span className="font-bold text-card-foreground">{inventoryData.reduce((s, p) => s + p.value, 0).toLocaleString()} ر.س</span></p>
          </div>
        </div>
      )}

      {activeReport === "customers" && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">ترتيب العملاء حسب المشتريات</h3>
          <div className="space-y-3">
            {customerRanking.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", i === 0 ? "bg-warning/20 text-warning" : i === 1 ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground")}>{i + 1}</div>
                <div className="flex-1"><p className="text-sm font-medium text-card-foreground">{c.name}</p><p className="text-xs text-muted-foreground">{c.type} • {c.phone}</p></div>
                <div className="text-left"><p className="text-sm font-bold text-card-foreground">{c.totalPurchases.toLocaleString()} ر.س</p><p className="text-xs text-primary">{c.loyaltyPoints} نقطة</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeReport === "invoices" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <h3 className="text-base font-semibold text-card-foreground p-5 pb-3">سجل الفواتير</h3>
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">رقم</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">التاريخ</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">العميل</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">الأصناف</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">الإجمالي</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">الدفع</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">الحالة</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">الموظف</th>
            </tr></thead>
            <tbody>
              {invoices.map((inv, i) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="p-3 text-sm font-mono text-muted-foreground">#{inv.id}</td>
                  <td className="p-3 text-sm text-muted-foreground">{inv.date}</td>
                  <td className="p-3 text-sm font-medium text-card-foreground">{inv.customer}</td>
                  <td className="p-3 text-sm text-muted-foreground">{inv.items.length} صنف</td>
                  <td className="p-3 text-sm font-semibold text-card-foreground">{inv.total.toLocaleString()} ر.س</td>
                  <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{inv.paymentMethod}</span></td>
                  <td className="p-3"><span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", inv.status === "مكتملة" ? "bg-success/10 text-success border-success/20" : inv.status === "معلقة" ? "bg-warning/10 text-warning border-warning/20" : "bg-destructive/10 text-destructive border-destructive/20")}>{inv.status}</span></td>
                  <td className="p-3 text-sm text-muted-foreground">{inv.employee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
