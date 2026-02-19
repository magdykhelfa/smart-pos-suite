import { useState } from "react";
import { BarChart3, FileText, Package, TrendingUp, Users, Calendar, Download } from "lucide-react";
import { useStore } from "@/store/useStore";
import { t } from "@/i18n/translations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["hsl(160,84%,39%)", "hsl(217,91%,60%)", "hsl(38,92%,50%)", "hsl(280,65%,60%)", "hsl(0,72%,51%)", "hsl(190,80%,50%)"];

type ReportType = "sales" | "products" | "profit" | "inventory" | "customers" | "invoices";

const Reports = () => {
  const { products, customers, transactions, invoices, storeInfo } = useStore();
  const lang = storeInfo.language as "العربية" | "English";
  const cur = storeInfo.currency;
  const [activeReport, setActiveReport] = useState<ReportType>("sales");
  const today = new Date().toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState({ from: monthAgo, to: today });
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const reportTabs: { key: ReportType; label: string; icon: any }[] = [
    { key: "sales", label: t(lang, "sales"), icon: BarChart3 },
    { key: "products", label: t(lang, "products"), icon: Package },
    { key: "profit", label: t(lang, "profitLabel"), icon: TrendingUp },
    { key: "inventory", label: t(lang, "inventory"), icon: FileText },
    { key: "customers", label: t(lang, "customers"), icon: Users },
    { key: "invoices", label: t(lang, "invoicesLabel"), icon: FileText },
  ];

  // Real data from invoices
  const filteredInvoices = invoices.filter(inv => {
    const invDate = inv.date.includes("T") ? inv.date.split("T")[0] : inv.date.substring(0, 10);
    const matchDate = invDate >= dateRange.from && invDate <= dateRange.to;
    const matchEmployee = employeeFilter === "all" || inv.employee === employeeFilter;
    const matchPayment = paymentFilter === "all" || inv.paymentMethod === paymentFilter;
    return matchDate && matchEmployee && matchPayment;
  });

  const salesByDay = transactions
    .filter(tx => tx.type === "sale" && tx.date >= dateRange.from && tx.date <= dateRange.to)
    .reduce((acc, tx) => { acc[tx.date] = (acc[tx.date] || 0) + tx.amount; return acc; }, {} as Record<string, number>);
  const salesChartData = Object.entries(salesByDay).map(([date, amount]) => ({ date: date.slice(5), amount })).sort((a, b) => a.date.localeCompare(b.date));

  // Real product sales from invoices
  const productSalesMap: Record<string, { qty: number; revenue: number; cost: number }> = {};
  filteredInvoices.filter(inv => inv.status !== "ملغاة").forEach(inv => {
    inv.items.forEach(item => {
      if (!productSalesMap[item.productId]) productSalesMap[item.productId] = { qty: 0, revenue: 0, cost: 0 };
      productSalesMap[item.productId].qty += item.qty;
      productSalesMap[item.productId].revenue += item.qty * item.price;
      const product = products.find(p => p.id === item.productId);
      if (product) productSalesMap[item.productId].cost += item.qty * product.buyPrice;
    });
  });
  const productSalesData = Object.entries(productSalesMap)
    .map(([id, data]) => {
      const product = products.find(p => p.id === id);
      return { name: product?.name?.slice(0, 15) || id, ...data };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const profitByCategory = products.reduce((acc, p) => {
    const sold = productSalesMap[p.id]?.qty || 0;
    const profit = (p.sellPrice - p.buyPrice) * sold;
    if (profit > 0) acc[p.category] = (acc[p.category] || 0) + profit;
    return acc;
  }, {} as Record<string, number>);
  const profitPieData = Object.entries(profitByCategory).map(([name, value]) => ({ name, value }));

  const inventoryData = products.map(p => ({
    name: p.name.slice(0, 12), stock: p.stock, reorder: p.reorderLevel, value: p.stock * p.buyPrice,
  }));

  const customerRanking = [...customers].sort((a, b) => b.totalPurchases - a.totalPurchases);

  const employees = [...new Set(invoices.map(inv => inv.employee))];
  const paymentMethods = [...new Set(invoices.map(inv => inv.paymentMethod))];

  const totalSalesAmount = filteredInvoices.filter(inv => inv.status !== "ملغاة" && inv.status !== "مرتجعة").reduce((s, inv) => s + inv.total, 0);
  const totalCost = Object.values(productSalesMap).reduce((s, d) => s + d.cost, 0);
  const netProfit = totalSalesAmount - totalCost;

  const statusText = (s: string) => {
    if (s === "مكتملة") return t(lang, "completed");
    if (s === "معلقة") return t(lang, "pending");
    if (s === "مرتجعة") return t(lang, "returned");
    if (s === "مرتجع جزئي") return t(lang, "partialReturn");
    return t(lang, "cancelled");
  };

  const exportCSV = () => {
    const rows = filteredInvoices.map(inv => `${inv.id},${inv.date},${inv.customer},${inv.total},${inv.paymentMethod},${inv.status}`);
    const csv = `ID,Date,Customer,Total,Payment,Status\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `report-${today}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6" dir={lang === "English" ? "ltr" : "rtl"}>
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">{t(lang, "reportsAnalytics")}</h1><p className="text-sm text-muted-foreground mt-1">{t(lang, "reportsDesc")}</p></div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input type="date" value={dateRange.from} onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground" />
          <span className="text-muted-foreground text-xs">{t(lang, "to")}</span>
          <input type="date" value={dateRange.to} onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground" />
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-3 h-3 ml-1" />{t(lang, "exportExcel")}</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
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
        <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground">
          <option value="all">{t(lang, "allEmployees")}</option>
          {employees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
        </select>
        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground">
          <option value="all">{t(lang, "allPayments")}</option>
          {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
        </select>
      </div>

      {activeReport === "sales" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-4"><p className="text-xs text-muted-foreground">{t(lang, "totalSales")}</p><p className="text-2xl font-bold text-card-foreground mt-1">{totalSalesAmount.toLocaleString()} {cur}</p></div>
            <div className="glass-card rounded-xl p-4"><p className="text-xs text-muted-foreground">{t(lang, "invoiceCount")}</p><p className="text-2xl font-bold text-card-foreground mt-1">{filteredInvoices.length}</p></div>
            <div className="glass-card rounded-xl p-4"><p className="text-xs text-muted-foreground">{t(lang, "netProfitReport")}</p><p className={cn("text-2xl font-bold mt-1", netProfit >= 0 ? "text-success" : "text-destructive")}>{netProfit.toLocaleString()} {cur}</p></div>
          </div>
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-base font-semibold text-card-foreground mb-4">{t(lang, "dailySales")}</h3>
            {salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(220,25%,9%)", border: "1px solid hsl(220,20%,16%)", borderRadius: "8px", color: "#fff", fontFamily: "Cairo", direction: lang === "English" ? "ltr" : "rtl" }} />
                  <Bar dataKey="amount" fill="hsl(160,84%,39%)" radius={[4, 4, 0, 0]} name={t(lang, "sales")} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[300px] flex items-center justify-center text-muted-foreground">{t(lang, "noDataForPeriod")}</div>}
          </div>
        </div>
      )}

      {activeReport === "products" && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">{t(lang, "topSellingProducts")}</h3>
          {productSalesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={productSalesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220,25%,9%)", border: "1px solid hsl(220,20%,16%)", borderRadius: "8px", color: "#fff", fontFamily: "Cairo", direction: lang === "English" ? "ltr" : "rtl" }} />
                <Bar dataKey="revenue" fill="hsl(160,84%,39%)" radius={[0, 4, 4, 0]} name={t(lang, "revenueCol")} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[350px] flex items-center justify-center text-muted-foreground">{t(lang, "noDataForPeriod")}</div>}
        </div>
      )}

      {activeReport === "profit" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-base font-semibold text-card-foreground mb-4">{t(lang, "profitByCategory")}</h3>
            {profitPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart><Pie data={profitPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} label={({ name }) => name}>
                  {profitPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie><Tooltip formatter={(v: number) => `${v.toLocaleString()} ${cur}`} /></PieChart>
              </ResponsiveContainer>
            ) : <div className="h-[280px] flex items-center justify-center text-muted-foreground">{t(lang, "noDataForPeriod")}</div>}
          </div>
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-base font-semibold text-card-foreground mb-4">{t(lang, "profitMarginPerProduct")}</h3>
            <div className="space-y-3">
              {products.map(p => {
                const margin = p.buyPrice > 0 ? ((p.sellPrice - p.buyPrice) / p.buyPrice * 100) : 0;
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
          <h3 className="text-base font-semibold text-card-foreground p-5 pb-3">{t(lang, "inventoryReport")}</h3>
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "product")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "category")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "quantity")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "reorderLevel")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "totalInventoryValue")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "status")}</th>
            </tr></thead>
            <tbody>
              {inventoryData.map((p, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm font-medium text-card-foreground">{products[i].name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{products[i].category}</td>
                  <td className="p-3 text-sm font-medium text-card-foreground">{p.stock}</td>
                  <td className="p-3 text-sm text-muted-foreground">{p.reorder}</td>
                  <td className="p-3 text-sm text-card-foreground">{p.value.toLocaleString()} {cur}</td>
                  <td className="p-3"><span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", p.stock === 0 ? "bg-destructive/10 text-destructive border-destructive/20" : p.stock <= p.reorder ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20")}>{p.stock === 0 ? t(lang, "depleted") : p.stock <= p.reorder ? t(lang, "low") : t(lang, "available")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-muted/30 border-t border-border">
            <p className="text-sm text-muted-foreground">{t(lang, "totalInventoryValue")}: <span className="font-bold text-card-foreground">{inventoryData.reduce((s, p) => s + p.value, 0).toLocaleString()} {cur}</span></p>
          </div>
        </div>
      )}

      {activeReport === "customers" && (
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">{t(lang, "customerRanking")}</h3>
          <div className="space-y-3">
            {customerRanking.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold", i === 0 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground")}>{i + 1}</div>
                <div className="flex-1"><p className="text-sm font-medium text-card-foreground">{c.name}</p><p className="text-xs text-muted-foreground">{c.type} • {c.phone}</p></div>
                <div className="text-left"><p className="text-sm font-bold text-card-foreground">{c.totalPurchases.toLocaleString()} {cur}</p><p className="text-xs text-primary">{c.loyaltyPoints} {t(lang, "point")}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeReport === "invoices" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <h3 className="text-base font-semibold text-card-foreground p-5 pb-3">{t(lang, "invoiceLog")}</h3>
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "number")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "date")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "customer")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "items")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "total")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "payment")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "status")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "employee")}</th>
            </tr></thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">{t(lang, "noDataForPeriod")}</td></tr>
              ) : filteredInvoices.map((inv, i) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="p-3 text-sm font-mono text-muted-foreground">#{inv.id}</td>
                  <td className="p-3 text-sm text-muted-foreground">{inv.date}</td>
                  <td className="p-3 text-sm font-medium text-card-foreground">{inv.customer}</td>
                  <td className="p-3 text-sm text-muted-foreground">{inv.items.length} {t(lang, "item")}</td>
                  <td className="p-3 text-sm font-semibold text-card-foreground">{inv.total.toLocaleString()} {cur}</td>
                  <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{inv.paymentMethod}</span></td>
                  <td className="p-3"><span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", inv.status === "مكتملة" ? "bg-success/10 text-success border-success/20" : inv.status === "معلقة" ? "bg-warning/10 text-warning border-warning/20" : "bg-destructive/10 text-destructive border-destructive/20")}>{statusText(inv.status)}</span></td>
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
