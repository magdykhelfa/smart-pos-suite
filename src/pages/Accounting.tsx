import { useState } from "react";
import { Plus, Wallet, TrendingUp, TrendingDown, ArrowUpDown, DollarSign, Building2 } from "lucide-react";
import { useStore, Transaction } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const expenseCategories = ["إيجار", "رواتب", "كهرباء", "مياه", "صيانة", "نقل", "إعلانات", "أخرى"];
const revenueCategories = ["مبيعات", "إيرادات أخرى", "عمولات"];
const treasuries = ["الخزنة الرئيسية", "الخزنة الفرعية", "الحساب البنكي"];
const paymentMethods = ["كاش", "تحويل", "بطاقة", "شيك"];

const emptyTransaction: Omit<Transaction, "id"> = {
  date: new Date().toISOString().split("T")[0], type: "expense", category: "أخرى",
  amount: 0, description: "", paymentMethod: "كاش", treasury: "الخزنة الرئيسية",
};

const COLORS = ["hsl(160,84%,39%)", "hsl(217,91%,60%)", "hsl(38,92%,50%)", "hsl(280,65%,60%)", "hsl(0,72%,51%)", "hsl(190,80%,50%)"];

const Accounting = () => {
  const { transactions, addTransaction } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyTransaction);
  const [activeTab, setActiveTab] = useState<"all" | "expense" | "revenue">("all");

  const totalRevenue = transactions.filter(t => t.type === "sale" || t.type === "revenue").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense" || t.type === "purchase" || t.type === "salary").reduce((s, t) => s + t.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  const treasuryBalances = treasuries.map(name => {
    const income = transactions.filter(t => t.treasury === name && (t.type === "sale" || t.type === "revenue")).reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.treasury === name && (t.type === "expense" || t.type === "purchase" || t.type === "salary")).reduce((s, t) => s + t.amount, 0);
    return { name, balance: income - expense };
  });

  const expenseByCategory = Object.entries(
    transactions.filter(t => t.type === "expense" || t.type === "salary").reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const filteredTransactions = activeTab === "all" ? transactions
    : activeTab === "revenue" ? transactions.filter(t => t.type === "sale" || t.type === "revenue")
    : transactions.filter(t => t.type === "expense" || t.type === "purchase" || t.type === "salary");

  const openAdd = (type: Transaction["type"]) => {
    setForm({ ...emptyTransaction, type, category: type === "expense" ? "أخرى" : type === "revenue" ? "إيرادات أخرى" : "مبيعات" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.amount || !form.description) { toast({ title: "خطأ", description: "المبلغ والوصف مطلوبان", variant: "destructive" }); return; }
    addTransaction(form);
    toast({ title: "تم تسجيل الحركة بنجاح" });
    setDialogOpen(false);
  };

  const typeLabel = (type: string) => {
    const map: Record<string, string> = { sale: "مبيعات", expense: "مصروف", revenue: "إيراد", purchase: "مشتريات", salary: "راتب" };
    return map[type] || type;
  };

  const typeColor = (type: string) => {
    if (type === "sale" || type === "revenue") return "bg-success/10 text-success border-success/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">الحسابات والمالية</h1><p className="text-sm text-muted-foreground mt-1">إدارة الخزائن والمصروفات والإيرادات</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openAdd("expense")}><TrendingDown className="w-4 h-4 ml-2" />مصروف</Button>
          <Button onClick={() => openAdd("revenue")}><TrendingUp className="w-4 h-4 ml-2" />إيراد</Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5 kpi-glow">
          <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-success" /></div>
          <div><p className="text-sm text-muted-foreground">إجمالي الإيرادات</p><p className="text-2xl font-bold text-card-foreground">{totalRevenue.toLocaleString()} ر.س</p></div></div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-destructive" /></div>
          <div><p className="text-sm text-muted-foreground">إجمالي المصروفات</p><p className="text-2xl font-bold text-card-foreground">{totalExpense.toLocaleString()} ر.س</p></div></div>
        </div>
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-primary" /></div>
          <div><p className="text-sm text-muted-foreground">صافي الربح</p><p className={cn("text-2xl font-bold", netProfit >= 0 ? "text-success" : "text-destructive")}>{netProfit.toLocaleString()} ر.س</p></div></div>
        </div>
      </div>

      {/* Treasuries & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-base font-semibold text-foreground">الخزائن</h3>
          {treasuryBalances.map((t, i) => (
            <div key={t.name} className="glass-card rounded-xl p-4 flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">{t.name.includes("بنكي") ? <Building2 className="w-5 h-5 text-primary" /> : <Wallet className="w-5 h-5 text-primary" />}</div>
              <div className="flex-1"><p className="text-sm font-medium text-card-foreground">{t.name}</p></div>
              <p className={cn("text-lg font-bold", t.balance >= 0 ? "text-success" : "text-destructive")}>{t.balance.toLocaleString()} ر.س</p>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="text-base font-semibold text-card-foreground mb-4">توزيع المصروفات</h3>
          {expenseByCategory.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={200} height={200}>
                <PieChart><Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                  {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie><Tooltip formatter={(v: number) => `${v.toLocaleString()} ر.س`} /></PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {expenseByCategory.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium text-card-foreground">{item.value.toLocaleString()} ر.س</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-muted-foreground text-sm">لا توجد مصروفات مسجلة</p>}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-base font-semibold text-foreground">سجل الحركات</h3>
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            {(["all", "revenue", "expense"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-colors", activeTab === tab ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {tab === "all" ? "الكل" : tab === "revenue" ? "الإيرادات" : "المصروفات"}
              </button>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">التاريخ</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">النوع</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">الفئة</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">الوصف</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">طريقة الدفع</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">الخزينة</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">المبلغ</th>
            </tr></thead>
            <tbody>
              {filteredTransactions.map((t, i) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="p-3 text-sm text-muted-foreground">{t.date}</td>
                  <td className="p-3"><span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", typeColor(t.type))}>{typeLabel(t.type)}</span></td>
                  <td className="p-3 text-sm text-muted-foreground">{t.category}</td>
                  <td className="p-3 text-sm text-card-foreground">{t.description}</td>
                  <td className="p-3 text-sm text-muted-foreground">{t.paymentMethod}</td>
                  <td className="p-3 text-sm text-muted-foreground">{t.treasury}</td>
                  <td className="p-3"><span className={cn("text-sm font-semibold", (t.type === "sale" || t.type === "revenue") ? "text-success" : "text-destructive")}>
                    {(t.type === "sale" || t.type === "revenue") ? "+" : "-"}{t.amount.toLocaleString()} ر.س
                  </span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.type === "expense" || form.type === "salary" ? "تسجيل مصروف" : "تسجيل إيراد"}</DialogTitle>
            <DialogDescription>أدخل تفاصيل الحركة المالية</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">التاريخ</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs text-muted-foreground">الفئة</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {(form.type === "expense" || form.type === "salary" ? expenseCategories : revenueCategories).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-muted-foreground">المبلغ *</label><input type="number" value={form.amount || ""} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs text-muted-foreground">الوصف *</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">طريقة الدفع</label>
                <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-muted-foreground">الخزينة</label>
                <select value={form.treasury} onChange={e => setForm({ ...form, treasury: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {treasuries.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounting;
