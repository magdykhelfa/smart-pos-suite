import { useState } from "react";
import { Search, Plus, Edit, Trash2, Truck, Phone, Mail } from "lucide-react";
import { useStore, Supplier } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const emptySupplier: Omit<Supplier, "id"> = {
  name: "", phone: "", address: "", email: "", creditLimit: 50000, balance: 0, notes: "",
};

const Suppliers = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptySupplier);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);

  const filtered = suppliers.filter(s => s.name.includes(search) || s.phone.includes(search));

  const openAdd = () => { setEditing(null); setForm(emptySupplier); setDialogOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm(s); setDialogOpen(true); };
  const confirmDelete = (id: string) => { setDeletingId(id); setDeleteDialogOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.phone) { toast({ title: "خطأ", description: "الاسم والهاتف مطلوبان", variant: "destructive" }); return; }
    if (editing) { updateSupplier({ ...form, id: editing.id } as Supplier); toast({ title: "تم التحديث بنجاح" }); }
    else { addSupplier(form); toast({ title: "تم إضافة المورد بنجاح" }); }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) { deleteSupplier(deletingId); toast({ title: "تم حذف المورد" }); }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة الموردين</h1>
          <p className="text-sm text-muted-foreground mt-1">{suppliers.length} مورد</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 ml-2" />إضافة مورد</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Truck className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{suppliers.length}</p><p className="text-xs text-muted-foreground">إجمالي الموردين</p></div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><Truck className="w-5 h-5 text-destructive" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{suppliers.reduce((s, x) => s + x.balance, 0).toLocaleString()} ر.س</p><p className="text-xs text-muted-foreground">إجمالي المستحقات</p></div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><Truck className="w-5 h-5 text-success" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{suppliers.reduce((s, x) => s + x.creditLimit, 0).toLocaleString()} ر.س</p><p className="text-xs text-muted-foreground">إجمالي الحد الائتماني</p></div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s, i) => (
          <div key={s.id} className="glass-card rounded-xl p-5 animate-fade-in cursor-pointer hover:border-primary/30 transition-all" style={{ animationDelay: `${i * 80}ms` }} onClick={() => setDetailSupplier(s)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Truck className="w-5 h-5 text-primary" /></div>
                <div><p className="text-sm font-semibold text-card-foreground">{s.name}</p><p className="text-xs text-muted-foreground">{s.notes}</p></div>
              </div>
              <div className="flex gap-1">
                <button onClick={e => { e.stopPropagation(); openEdit(s); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={e => { e.stopPropagation(); confirmDelete(s.id); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3.5 h-3.5" />{s.phone}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3.5 h-3.5" />{s.email}</div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
              <div><span className="text-muted-foreground">الحد الائتماني:</span> <span className="font-medium text-card-foreground">{s.creditLimit.toLocaleString()} ر.س</span></div>
              <div><span className="text-muted-foreground">المستحق:</span> <span className={cn("font-medium", s.balance > 0 ? "text-destructive" : "text-success")}>{s.balance.toLocaleString()} ر.س</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailSupplier} onOpenChange={() => setDetailSupplier(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل المورد</DialogTitle>
            <DialogDescription>{detailSupplier?.name}</DialogDescription>
          </DialogHeader>
          {detailSupplier && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">الهاتف</p><p className="font-medium text-card-foreground">{detailSupplier.phone}</p></div>
                <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">البريد</p><p className="font-medium text-card-foreground">{detailSupplier.email}</p></div>
                <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">العنوان</p><p className="font-medium text-card-foreground">{detailSupplier.address}</p></div>
                <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">الحد الائتماني</p><p className="font-medium text-card-foreground">{detailSupplier.creditLimit.toLocaleString()} ر.س</p></div>
                <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">المستحق عليه</p><p className={cn("font-medium", detailSupplier.balance > 0 ? "text-destructive" : "text-success")}>{detailSupplier.balance.toLocaleString()} ر.س</p></div>
              </div>
              {detailSupplier.notes && <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">ملاحظات</p><p className="font-medium text-card-foreground">{detailSupplier.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل مورد" : "إضافة مورد جديد"}</DialogTitle>
            <DialogDescription>{editing ? "تعديل بيانات المورد" : "أدخل بيانات المورد الجديد"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">الاسم *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">الهاتف *</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs text-muted-foreground">البريد الإلكتروني</label><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">العنوان</label><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs text-muted-foreground">الحد الائتماني</label><input type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: Number(e.target.value) })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-xs text-muted-foreground">ملاحظات</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editing ? "حفظ التعديلات" : "إضافة"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>تأكيد الحذف</DialogTitle><DialogDescription>هل أنت متأكد من حذف هذا المورد؟</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button><Button variant="destructive" onClick={handleDelete}>حذف</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;
