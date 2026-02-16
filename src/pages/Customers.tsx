import { useState } from "react";
import { Search, Plus, Edit, Trash2, Users, Star, Crown, ShoppingBag } from "lucide-react";
import { useStore, Customer } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const emptyCustomer: Omit<Customer, "id"> = {
  name: "", phone: "", address: "", notes: "", type: "عادي",
  loyaltyPoints: 0, creditLimit: 2000, balance: 0, totalPurchases: 0,
};

const Customers = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCustomer);

  const filtered = customers.filter(c => c.name.includes(search) || c.phone.includes(search));

  const openAdd = () => { setEditing(null); setForm(emptyCustomer); setDialogOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm(c); setDialogOpen(true); };
  const confirmDelete = (id: string) => { setDeletingId(id); setDeleteDialogOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.phone) { toast({ title: "خطأ", description: "الاسم والهاتف مطلوبان", variant: "destructive" }); return; }
    if (editing) { updateCustomer({ ...form, id: editing.id } as Customer); toast({ title: "تم التحديث بنجاح" }); }
    else { addCustomer(form); toast({ title: "تم إضافة العميل بنجاح" }); }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) { deleteCustomer(deletingId); toast({ title: "تم حذف العميل" }); }
    setDeleteDialogOpen(false);
  };

  const typeIcon = (type: string) => {
    if (type === "VIP") return <Crown className="w-3.5 h-3.5 text-warning" />;
    if (type === "جملة") return <ShoppingBag className="w-3.5 h-3.5 text-info" />;
    return <Star className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const typeColor = (type: string) => {
    if (type === "VIP") return "bg-warning/10 text-warning border-warning/20";
    if (type === "جملة") return "bg-info/10 text-info border-info/20";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة العملاء</h1>
          <p className="text-sm text-muted-foreground mt-1">{customers.length} عميل</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 ml-2" />إضافة عميل</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Users className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{customers.length}</p><p className="text-xs text-muted-foreground">إجمالي العملاء</p></div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Crown className="w-5 h-5 text-warning" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{customers.filter(c => c.type === "VIP").length}</p><p className="text-xs text-muted-foreground">عملاء VIP</p></div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><Star className="w-5 h-5 text-success" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{customers.reduce((s, c) => s + c.loyaltyPoints, 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">إجمالي نقاط الولاء</p></div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><Users className="w-5 h-5 text-destructive" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{customers.reduce((s, c) => s + c.balance, 0).toLocaleString()} ر.س</p><p className="text-xs text-muted-foreground">إجمالي المديونيات</p></div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">العميل</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">الهاتف</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">التصنيف</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">نقاط الولاء</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">الحد الائتماني</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">الرصيد المدين</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">إجمالي المشتريات</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">إجراءات</th>
          </tr></thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <td className="p-3"><div className="flex items-center gap-2">{typeIcon(c.type)}<span className="text-sm font-medium text-card-foreground">{c.name}</span></div></td>
                <td className="p-3 text-sm text-muted-foreground font-mono">{c.phone}</td>
                <td className="p-3"><span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", typeColor(c.type))}>{c.type}</span></td>
                <td className="p-3 text-sm text-primary font-medium">{c.loyaltyPoints}</td>
                <td className="p-3 text-sm text-muted-foreground">{c.creditLimit.toLocaleString()} ر.س</td>
                <td className="p-3 text-sm font-medium" style={{ color: c.balance > 0 ? "hsl(var(--destructive))" : "hsl(var(--success))" }}>{c.balance.toLocaleString()} ر.س</td>
                <td className="p-3 text-sm text-card-foreground">{c.totalPurchases.toLocaleString()} ر.س</td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => confirmDelete(c.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل عميل" : "إضافة عميل جديد"}</DialogTitle>
            <DialogDescription>{editing ? "تعديل بيانات العميل" : "أدخل بيانات العميل الجديد"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">الاسم *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs text-muted-foreground">الهاتف *</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs text-muted-foreground">العنوان</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs text-muted-foreground">التصنيف</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Customer["type"] })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="عادي">عادي</option><option value="VIP">VIP</option><option value="جملة">جملة</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">الحد الائتماني</label><input type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: Number(e.target.value) })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs text-muted-foreground">نقاط الولاء</label><input type="number" value={form.loyaltyPoints} onChange={e => setForm({ ...form, loyaltyPoints: Number(e.target.value) })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">ملاحظات</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editing ? "حفظ التعديلات" : "إضافة"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={handleDelete}>حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
