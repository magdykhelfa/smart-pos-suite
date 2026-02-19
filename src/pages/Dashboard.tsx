import {
  DollarSign, TrendingUp, Receipt, ShoppingBag, AlertTriangle, AlertCircle, Info,
  ShoppingCart, Package, Users, Wallet, RotateCcw, Truck, BarChart3, Zap,
} from "lucide-react";
import KpiCard from "@/components/KpiCard";
import { useStore } from "@/store/useStore";
import { t } from "@/i18n/translations";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { products, transactions, invoices, customers, storeInfo } = useStore();
  const lang = storeInfo.language as "العربية" | "English";
  const cur = storeInfo.currency;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const todaySales = transactions.filter(tx => tx.type === "sale" && tx.date === today).reduce((s, tx) => s + tx.amount, 0);
  const yesterdaySales = transactions.filter(tx => tx.type === "sale" && tx.date === yesterday).reduce((s, tx) => s + tx.amount, 0);
  const todayExpenses = transactions.filter(tx => (tx.type === "expense" || tx.type === "purchase") && tx.date === today).reduce((s, tx) => s + tx.amount, 0);
  const todayInvoices = invoices.filter(inv => inv.date.includes(today.replace(/-/g, "/")) || inv.date.includes(today)).length;
  const avgInvoice = todayInvoices > 0 ? Math.round(todaySales / todayInvoices) : 0;
  const todayReturns = transactions.filter(tx => tx.type === "return" && tx.date === today).reduce((s, tx) => s + tx.amount, 0);

  const salesChange = yesterdaySales > 0 ? (((todaySales - yesterdaySales) / yesterdaySales) * 100).toFixed(1) : "0";

  // Monthly sales from real transactions
  const monthNames = [t(lang, "jan"), t(lang, "feb"), t(lang, "mar"), t(lang, "apr"), t(lang, "may"), t(lang, "jun"), t(lang, "jul"), t(lang, "aug"), t(lang, "sep"), t(lang, "oct"), t(lang, "nov"), t(lang, "dec")];
  const monthlySales: Record<string, number> = {};
  transactions.filter(tx => tx.type === "sale").forEach(tx => {
    const month = tx.date.substring(0, 7); // YYYY-MM
    monthlySales[month] = (monthlySales[month] || 0) + tx.amount;
  });
  const salesData = Object.entries(monthlySales).sort().slice(-7).map(([month, amount]) => ({
    month: monthNames[parseInt(month.split("-")[1]) - 1] || month,
    sales: amount,
  }));

  // Top products from actual invoice data
  const productSales: Record<string, number> = {};
  invoices.filter(inv => inv.status !== "ملغاة").forEach(inv => {
    inv.items.forEach(item => {
      productSales[item.name] = (productSales[item.name] || 0) + item.qty;
    });
  });
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, sold]) => ({ name, sold }));

  const alerts = [
    ...products.filter(p => p.status === "منخفض").map(p => ({ type: "warning" as const, message: `${p.name} - ${t(lang, "lowStock")} (${p.stock})`, time: t(lang, "now") })),
    ...products.filter(p => p.status === "نفد").map(p => ({ type: "error" as const, message: `${p.name} - ${t(lang, "outOfStock")}`, time: t(lang, "now") })),
    ...customers.filter(c => c.balance >= c.creditLimit && c.creditLimit > 0).map(c => ({ type: "warning" as const, message: `${c.name} - ${t(lang, "exceededCreditLimit")}`, time: t(lang, "now") })),
    ...invoices.filter(inv => inv.status === "معلقة").map(inv => ({ type: "info" as const, message: `${t(lang, "pendingInvoice")} #${inv.id} - ${inv.customer}`, time: inv.date })),
  ];

  const quickActions = [
    { label: t(lang, "newInvoice"), icon: ShoppingCart, path: "/pos", color: "bg-primary/10 text-primary" },
    { label: t(lang, "addProductAction"), icon: Package, path: "/products", color: "bg-success/10 text-success" },
    { label: t(lang, "addCustomerAction"), icon: Users, path: "/customers", color: "bg-info/10 text-info" },
    { label: t(lang, "recordExpenseAction"), icon: Wallet, path: "/accounting", color: "bg-warning/10 text-warning" },
    { label: t(lang, "returnsAction"), icon: RotateCcw, path: "/sales", color: "bg-destructive/10 text-destructive" },
    { label: t(lang, "suppliersAction"), icon: Truck, path: "/suppliers", color: "bg-accent text-accent-foreground" },
    { label: t(lang, "reportsAction"), icon: BarChart3, path: "/reports", color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="p-6 space-y-6" dir={lang === "English" ? "ltr" : "rtl"}>
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">{t(lang, "dashboard")}</h1><p className="text-sm text-muted-foreground mt-1">{t(lang, "welcomeMsg")}</p></div>
        <div className="text-sm text-muted-foreground bg-card border border-border rounded-lg px-4 py-2">
          {new Date().toLocaleDateString(lang === "English" ? "en-US" : "ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-warning" />{t(lang, "quickActions")}</h3>
        <div className="grid grid-cols-7 gap-2">
          {quickActions.map(action => (
            <Link key={action.path + action.label} to={action.path} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.color)}><action.icon className="w-5 h-5" /></div>
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title={t(lang, "totalSalesToday")} value={`${todaySales.toLocaleString()} ${cur}`} change={`${Number(salesChange) >= 0 ? "+" : ""}${salesChange}% ${t(lang, "vsYesterday")}`} changeType={Number(salesChange) >= 0 ? "positive" : "negative"} icon={DollarSign} delay={0} />
        <KpiCard title={t(lang, "netProfit")} value={`${(todaySales - todayExpenses).toLocaleString()} ${cur}`} changeType="positive" icon={TrendingUp} iconColor="bg-success/10 text-success" delay={100} />
        <KpiCard title={t(lang, "todaySalesCount")} value={String(todayInvoices)} icon={Receipt} iconColor="bg-info/10 text-info" delay={200} />
        <KpiCard title={t(lang, "avgInvoice")} value={`${avgInvoice.toLocaleString()} ${cur}`} icon={ShoppingBag} iconColor="bg-warning/10 text-warning" delay={300} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">{t(lang, "monthlySalesTrend")}</h3>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesData}>
                <defs><linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(160,84%,39%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(160,84%,39%)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220,25%,9%)", border: "1px solid hsl(220,20%,16%)", borderRadius: "8px", color: "#fff", direction: lang === "English" ? "ltr" : "rtl", fontFamily: "Cairo" }} />
                <Area type="monotone" dataKey="sales" stroke="hsl(160,84%,39%)" strokeWidth={2} fill="url(#salesGrad)" name={t(lang, "sales")} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">{t(lang, "noDataForPeriod")}</div>
          )}
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">{t(lang, "alerts")} ({alerts.length})</h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {alerts.length === 0 ? <p className="text-sm text-muted-foreground">{t(lang, "noAlerts")}</p> :
              alerts.slice(0, 8).map((alert, i) => (
                <div key={i} className={cn("flex items-start gap-2 p-2.5 rounded-lg animate-fade-in",
                  alert.type === "warning" && "bg-warning/5 border border-warning/20",
                  alert.type === "error" && "bg-destructive/5 border border-destructive/20",
                  alert.type === "info" && "bg-info/5 border border-info/20"
                )} style={{ animationDelay: `${i * 80 + 400}ms` }}>
                  {alert.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 flex-shrink-0" />}
                  {alert.type === "error" && <AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 flex-shrink-0" />}
                  {alert.type === "info" && <Info className="w-3.5 h-3.5 text-info mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0"><p className="text-xs text-card-foreground">{alert.message}</p><p className="text-[10px] text-muted-foreground mt-0.5">{alert.time}</p></div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">{t(lang, "topProducts")}</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(220,25%,9%)", border: "1px solid hsl(220,20%,16%)", borderRadius: "8px", color: "#fff", direction: lang === "English" ? "ltr" : "rtl", fontFamily: "Cairo" }} />
                <Bar dataKey="sold" fill="hsl(160,84%,39%)" radius={[0, 4, 4, 0]} name={t(lang, "soldQty")} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">{t(lang, "noDataForPeriod")}</div>
          )}
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">{t(lang, "latestInvoices")}</h3>
          <div className="space-y-2">
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t(lang, "noDataForPeriod")}</p>
            ) : invoices.slice(0, 5).map((inv, i) => (
              <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 animate-fade-in" style={{ animationDelay: `${i * 80 + 500}ms` }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">#{inv.id}</span>
                  <span className="text-sm font-medium text-card-foreground">{inv.customer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    inv.status === "مكتملة" ? "bg-success/10 text-success" : inv.status === "معلقة" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                  )}>{inv.status === "مكتملة" ? t(lang, "completed") : inv.status === "معلقة" ? t(lang, "pending") : t(lang, "returned")}</span>
                  <span className="text-sm font-semibold text-card-foreground">{inv.total.toLocaleString()} {cur}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
