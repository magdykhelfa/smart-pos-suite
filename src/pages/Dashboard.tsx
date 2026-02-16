import {
  DollarSign, TrendingUp, Receipt, ShoppingBag, AlertTriangle, AlertCircle, Info,
} from "lucide-react";
import KpiCard from "@/components/KpiCard";
import { useStore } from "@/store/useStore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { products, transactions, invoices, customers } = useStore();

  const todaySales = transactions.filter(t => t.type === "sale" && t.date === "2026-02-16").reduce((s, t) => s + t.amount, 0);
  const todayExpenses = transactions.filter(t => (t.type === "expense" || t.type === "purchase") && t.date === "2026-02-16").reduce((s, t) => s + t.amount, 0);
  const todayInvoices = invoices.filter(inv => inv.date.includes("2026-02-16")).length;
  const avgInvoice = todayInvoices > 0 ? Math.round(todaySales / todayInvoices) : 0;

  const salesData = [
    { month: "يناير", sales: 42000, lastYear: 35000 },
    { month: "فبراير", sales: 38000, lastYear: 32000 },
    { month: "مارس", sales: 51000, lastYear: 41000 },
    { month: "أبريل", sales: 47000, lastYear: 44000 },
    { month: "مايو", sales: 53000, lastYear: 46000 },
    { month: "يونيو", sales: 49000, lastYear: 43000 },
    { month: "يوليو", sales: 61000, lastYear: 50000 },
  ];

  const topProducts = products.slice(0, 5).map(p => ({
    name: p.name, sold: Math.floor(Math.random() * 200 + 50),
  }));

  const alerts = [
    ...products.filter(p => p.status === "منخفض").map(p => ({ type: "warning" as const, message: `${p.name} - مخزون منخفض (${p.stock})`, time: "الآن" })),
    ...products.filter(p => p.status === "نفد").map(p => ({ type: "error" as const, message: `${p.name} - نفد المخزون`, time: "الآن" })),
    ...customers.filter(c => c.balance >= c.creditLimit).map(c => ({ type: "warning" as const, message: `${c.name} - تجاوز الحد الائتماني`, time: "الآن" })),
    ...invoices.filter(inv => inv.status === "معلقة").map(inv => ({ type: "info" as const, message: `فاتورة #${inv.id} معلقة - ${inv.customer}`, time: inv.date })),
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1><p className="text-sm text-muted-foreground mt-1">مرحبًا بك، هذا ملخص أداء متجرك اليوم</p></div>
        <div className="text-sm text-muted-foreground bg-card border border-border rounded-lg px-4 py-2">
          {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="إجمالي المبيعات اليوم" value={`${todaySales.toLocaleString()} ر.س`} change="+12.5% عن أمس" changeType="positive" icon={DollarSign} delay={0} />
        <KpiCard title="صافي الربح" value={`${(todaySales - todayExpenses).toLocaleString()} ر.س`} change="+8.2%" changeType="positive" icon={TrendingUp} iconColor="bg-success/10 text-success" delay={100} />
        <KpiCard title="عدد الفواتير" value={String(todayInvoices)} icon={Receipt} iconColor="bg-info/10 text-info" delay={200} />
        <KpiCard title="متوسط الفاتورة" value={`${avgInvoice.toLocaleString()} ر.س`} icon={ShoppingBag} iconColor="bg-warning/10 text-warning" delay={300} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">اتجاه المبيعات الشهري</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs><linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(160,84%,39%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(160,84%,39%)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(220,25%,9%)", border: "1px solid hsl(220,20%,16%)", borderRadius: "8px", color: "#fff", direction: "rtl", fontFamily: "Cairo" }} />
              <Area type="monotone" dataKey="sales" stroke="hsl(160,84%,39%)" strokeWidth={2} fill="url(#salesGrad)" name="المبيعات" />
              <Area type="monotone" dataKey="lastYear" stroke="hsl(220,10%,46%)" strokeWidth={1.5} strokeDasharray="5 5" fill="transparent" name="العام الماضي" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">التنبيهات ({alerts.length})</h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {alerts.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد تنبيهات</p> :
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
          <h3 className="text-base font-semibold text-card-foreground mb-4">أفضل المنتجات مبيعًا</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} stroke="hsl(220,10%,46%)" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(220,25%,9%)", border: "1px solid hsl(220,20%,16%)", borderRadius: "8px", color: "#fff", direction: "rtl", fontFamily: "Cairo" }} />
              <Bar dataKey="sold" fill="hsl(160,84%,39%)" radius={[0, 4, 4, 0]} name="المبيعات" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">آخر الفواتير</h3>
          <div className="space-y-2">
            {invoices.slice(0, 5).map((inv, i) => (
              <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 animate-fade-in" style={{ animationDelay: `${i * 80 + 500}ms` }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">#{inv.id}</span>
                  <span className="text-sm font-medium text-card-foreground">{inv.customer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    inv.status === "مكتملة" ? "bg-success/10 text-success" : inv.status === "معلقة" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                  )}>{inv.status}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{inv.paymentMethod}</span>
                  <span className="text-sm font-semibold text-card-foreground">{inv.total.toLocaleString()} ر.س</span>
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
