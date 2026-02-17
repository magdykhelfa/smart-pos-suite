import { useState } from "react";
import { Search, Plus, Edit, Trash2, Filter, Package, AlertTriangle } from "lucide-react";
import { useStore, Product } from "@/store/useStore";
import { t } from "@/i18n/translations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const productCategories = ["هواتف", "إكسسوارات", "كابلات", "أجهزة لوحية", "ساعات", "كمبيوتر"];

const emptyProduct: Omit<Product, "id"> = {
  name: "", sku: "", barcode: "", category: "هواتف", buyPrice: 0, sellPrice: 0, stock: 0, reorderLevel: 10, status: "متوفر",
};

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct, storeInfo } = useStore();
  const lang = storeInfo.language as "العربية" | "English";
  const cur = storeInfo.currency;
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);

  const filtered = products.filter(p => p.name.includes(search) || p.sku.includes(search) || p.barcode.includes(search));

  const openAdd = () => { setEditing(null); setForm(emptyProduct); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setForm(p); setDialogOpen(true); };
  const confirmDelete = (id: string) => { setDeletingId(id); setDeleteDialogOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.barcode) { toast({ title: t(lang, "error"), description: t(lang, "nameAndBarcodeRequired"), variant: "destructive" }); return; }
    const status = form.stock === 0 ? "نفد" : form.stock <= form.reorderLevel ? "منخفض" : "متوفر";
    if (editing) { updateProduct({ ...form, id: editing.id, status } as Product); toast({ title: t(lang, "updatedSuccessfully") }); }
    else { addProduct({ ...form, status }); toast({ title: t(lang, "productAdded") }); }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deletingId) { deleteProduct(deletingId); toast({ title: t(lang, "productDeleted") }); }
    setDeleteDialogOpen(false);
  };

  const statusText = (s: string) => s === "متوفر" ? t(lang, "available") : s === "منخفض" ? t(lang, "low") : t(lang, "depleted");
  const statusVariant = (status: string) => {
    if (status === "متوفر") return "bg-success/10 text-success border-success/20";
    if (status === "منخفض") return "bg-warning/10 text-warning border-warning/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <div className="p-6 space-y-6" dir={lang === "English" ? "ltr" : "rtl"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t(lang, "productManagement")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} {t(lang, "product")} • {products.filter(p => p.status === "منخفض").length} {t(lang, "lowStockLabel")}</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 ml-2" />{t(lang, "addProduct")}</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{products.length}</p><p className="text-xs text-muted-foreground">{t(lang, "totalProducts")}</p></div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-warning" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{products.filter(p => p.status === "منخفض").length}</p><p className="text-xs text-muted-foreground">{t(lang, "lowStockLabel")}</p></div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><Package className="w-5 h-5 text-destructive" /></div>
          <div><p className="text-xl font-bold text-card-foreground">{products.filter(p => p.status === "نفد").length}</p><p className="text-xs text-muted-foreground">{t(lang, "outOfStockLabel")}</p></div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder={t(lang, "searchProductSku")} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "product")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "sku")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "category")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "buyPrice")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "sellPrice")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "profitMargin")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "stock")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "status")}</th>
              <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "actions")}</th>
            </tr></thead>
            <tbody>
              {filtered.map((product, i) => {
                const margin = (((product.sellPrice - product.buyPrice) / product.buyPrice) * 100).toFixed(0);
                return (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="p-3"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm">📦</div><span className="text-sm font-medium text-card-foreground">{product.name}</span></div></td>
                    <td className="p-3 text-sm font-mono text-muted-foreground">{product.sku}</td>
                    <td className="p-3 text-sm text-muted-foreground">{product.category}</td>
                    <td className="p-3 text-sm text-muted-foreground">{product.buyPrice} {cur}</td>
                    <td className="p-3 text-sm font-medium text-card-foreground">{product.sellPrice} {cur}</td>
                    <td className="p-3"><span className="text-sm font-medium text-success">{margin}%</span></td>
                    <td className="p-3"><span className={cn("text-sm font-medium", product.stock <= product.reorderLevel ? "text-warning" : "text-card-foreground")}>{product.stock}</span></td>
                    <td className="p-3"><span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", statusVariant(product.status))}>{statusText(product.status)}</span></td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(product)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => confirmDelete(product.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t(lang, "editProduct") : t(lang, "addNewProduct")}</DialogTitle>
            <DialogDescription>{editing ? t(lang, "editProductData") : t(lang, "enterNewProduct")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">{t(lang, "productName")} *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">{t(lang, "sku")}</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs text-muted-foreground">{t(lang, "barcode")} *</label><input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">{t(lang, "category")}</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">{t(lang, "buyPrice")}</label><input type="number" value={form.buyPrice || ""} onChange={e => setForm({ ...form, buyPrice: Number(e.target.value) })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs text-muted-foreground">{t(lang, "sellPrice")}</label><input type="number" value={form.sellPrice || ""} onChange={e => setForm({ ...form, sellPrice: Number(e.target.value) })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">{t(lang, "quantity")}</label><input type="number" value={form.stock || ""} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-xs text-muted-foreground">{t(lang, "reorderLevel")}</label><input type="number" value={form.reorderLevel || ""} onChange={e => setForm({ ...form, reorderLevel: Number(e.target.value) })} className="w-full bg-muted border-0 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t(lang, "cancel")}</Button>
            <Button onClick={handleSave}>{editing ? t(lang, "saveChanges") : t(lang, "add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t(lang, "confirmDelete")}</DialogTitle><DialogDescription>{t(lang, "confirmDeleteProduct")}</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{t(lang, "cancel")}</Button><Button variant="destructive" onClick={handleDelete}>{t(lang, "delete")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
