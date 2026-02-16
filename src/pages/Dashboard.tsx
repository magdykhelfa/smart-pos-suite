import {
  DollarSign,
  TrendingUp,
  Receipt,
  ShoppingBag,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";
import KpiCard from "@/components/KpiCard";
import { salesData, topProducts, alerts } from "@/data/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground mt-1">مرحبًا بك، هذا ملخص أداء متجرك اليوم</p>
        </div>
        <div className="text-sm text-muted-foreground bg-card border border-border rounded-lg px-4 py-2">
          {new Date().toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="إجمالي المبيعات اليوم"
          value="12,450 ر.س"
          change="+12.5% عن أمس"
          changeType="positive"
          icon={DollarSign}
          delay={0}
        />
        <KpiCard
          title="صافي الربح"
          value="3,280 ر.س"
          change="+8.2% عن أمس"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-success/10 text-success"
          delay={100}
        />
        <KpiCard
          title="عدد الفواتير"
          value="47"
          change="-3 عن أمس"
          changeType="negative"
          icon={Receipt}
          iconColor="bg-info/10 text-info"
          delay={200}
        />
        <KpiCard
          title="متوسط الفاتورة"
          value="265 ر.س"
          change="+15% عن أمس"
          changeType="positive"
          icon={ShoppingBag}
          iconColor="bg-warning/10 text-warning"
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">اتجاه المبيعات الشهري</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 25%, 9%)",
                  border: "1px solid hsl(220, 20%, 16%)",
                  borderRadius: "8px",
                  color: "#fff",
                  direction: "rtl",
                  fontFamily: "Cairo",
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={2}
                fill="url(#salesGrad)"
                name="المبيعات"
              />
              <Area
                type="monotone"
                dataKey="lastYear"
                stroke="hsl(220, 10%, 46%)"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                fill="transparent"
                name="العام الماضي"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">التنبيهات</h3>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg animate-fade-in",
                  alert.type === "warning" && "bg-warning/5 border border-warning/20",
                  alert.type === "error" && "bg-destructive/5 border border-destructive/20",
                  alert.type === "info" && "bg-info/5 border border-info/20"
                )}
                style={{ animationDelay: `${i * 100 + 400}ms` }}
              >
                {alert.type === "warning" && <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />}
                {alert.type === "error" && <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />}
                {alert.type === "info" && <Info className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">أفضل 5 منتجات مبيعًا</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis
                dataKey="name"
                type="category"
                width={110}
                tick={{ fontSize: 11 }}
                stroke="hsl(220, 10%, 46%)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 25%, 9%)",
                  border: "1px solid hsl(220, 20%, 16%)",
                  borderRadius: "8px",
                  color: "#fff",
                  direction: "rtl",
                  fontFamily: "Cairo",
                }}
              />
              <Bar dataKey="sold" fill="hsl(160, 84%, 39%)" radius={[0, 4, 4, 0]} name="المبيعات" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent invoices */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">آخر الفواتير</h3>
          <div className="space-y-3">
            {[
              { id: "#1047", customer: "أحمد محمد", total: "1,250 ر.س", method: "كاش", time: "منذ 5 دقائق" },
              { id: "#1046", customer: "فاطمة علي", total: "450 ر.س", method: "بطاقة", time: "منذ 15 دقيقة" },
              { id: "#1045", customer: "عميل عابر", total: "85 ر.س", method: "كاش", time: "منذ 30 دقيقة" },
              { id: "#1044", customer: "خالد سعيد", total: "2,100 ر.س", method: "آجل", time: "منذ ساعة" },
              { id: "#1043", customer: "نورة أحمد", total: "320 ر.س", method: "تحويل", time: "منذ ساعتين" },
            ].map((inv, i) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-fade-in"
                style={{ animationDelay: `${i * 80 + 500}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">{inv.id}</span>
                  <span className="text-sm font-medium text-card-foreground">{inv.customer}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {inv.method}
                  </span>
                  <span className="text-sm font-semibold text-card-foreground">{inv.total}</span>
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
