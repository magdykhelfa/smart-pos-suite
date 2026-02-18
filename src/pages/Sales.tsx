import { useState, useCallback } from "react";
import { Search, Edit, Printer, RotateCcw, Eye, X } from "lucide-react";
import { useStore, Invoice } from "@/store/useStore";
import { t } from "@/i18n/translations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const Sales = () => {
  const store = useStore();
  const lang = store.storeInfo.language as "العربية" | "English";
  const cur = store.storeInfo.currency;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [editItems, setEditItems] = useState<Invoice["items"]>([]);
  const [editDiscount, setEditDiscount] = useState(0);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnInvoice, setReturnInvoice] = useState<Invoice | null>(null);

  const filtered = store.invoices.filter(inv => {
    const matchesSearch = inv.id.includes(search) || inv.customer.includes(search);
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "all", label: t(lang, "all") },
    { value: "مكتملة", label: t(lang, "completed") },
    { value: "معلقة", label: t(lang, "pending") },
    { value: "مرتجعة", label: t(lang, "returned") },
    { value: "ملغاة", label: t(lang, "cancelled") },
  ];

  const statusColor = (s: string) => {
    if (s === "مكتملة") return "bg-success/10 text-success border-success/20";
    if (s === "معلقة") return "bg-warning/10 text-warning border-warning/20";
    if (s === "مرتجعة") return "bg-info/10 text-info border-info/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };
  const statusLabel = (s: string) => {
    if (s === "مكتملة") return t(lang, "completed");
    if (s === "معلقة") return t(lang, "pending");
    if (s === "مرتجعة") return t(lang, "returned");
    return t(lang, "cancelled");
  };

  const openEdit = (inv: Invoice) => {
    setEditInvoice(inv);
    setEditItems(inv.items.map(i => ({ ...i })));
    setEditDiscount(inv.discount);
  };

  const saveEdit = () => {
    if (!editInvoice) return;
    const subtotal = editItems.reduce((s, i) => s + i.price * i.qty, 0);
    const discountAmount = (subtotal * editDiscount) / 100;
    const taxRate = store.taxSettings.enabled ? store.taxSettings.rate / 100 : 0;
    let tax: number, total: number;
    if (store.taxSettings.includedInPrice) {
      total = subtotal - discountAmount;
      tax = total - total / (1 + taxRate);
    } else {
      tax = (subtotal - discountAmount) * taxRate;
      total = subtotal - discountAmount + tax;
    }
    const updated: Invoice = { ...editInvoice, items: editItems, subtotal, discount: editDiscount, tax, total };
    store.updateInvoice(updated);
    // Adjust transaction
    const diff = updated.total - editInvoice.total;
    if (diff !== 0) {
      store.addTransaction({
        date: new Date().toISOString().split("T")[0], type: diff > 0 ? "sale" : "expense",
        category: t(lang, "invoiceEdit"), amount: Math.abs(diff),
        description: `${t(lang, "invoiceEditDesc")} #${editInvoice.id}`,
        paymentMethod: editInvoice.paymentMethod, treasury: "الخزنة الرئيسية",
      });
    }
    toast({ title: t(lang, "invoiceUpdated") });
    setEditInvoice(null);
  };

  const openReturn = (inv: Invoice) => {
    setReturnInvoice(inv);
    setReturnDialogOpen(true);
  };

  const processReturn = () => {
    if (!returnInvoice) return;
    store.updateInvoice({ ...returnInvoice, status: "مرتجعة" });
    store.addTransaction({
      date: new Date().toISOString().split("T")[0], type: "expense",
      category: t(lang, "returnCategory"), amount: returnInvoice.total,
      description: `${t(lang, "returnDesc")} #${returnInvoice.id}`,
      paymentMethod: returnInvoice.paymentMethod, treasury: "الخزنة الرئيسية",
    });
    // Restore stock
    returnInvoice.items.forEach(item => {
      const product = store.products.find(p => p.name === item.name);
      if (product) {
        const newStock = product.stock + item.qty;
        store.updateProduct({ ...product, stock: newStock, status: newStock === 0 ? "نفد" : newStock <= product.reorderLevel ? "منخفض" : "متوفر" });
      }
    });
    // Reverse loyalty points if applicable
    if (returnInvoice.loyaltyPointsEarned) {
      const customer = store.customers.find(c => c.name === returnInvoice.customer);
      if (customer) {
        store.updateCustomer({ ...customer, loyaltyPoints: Math.max(0, customer.loyaltyPoints - returnInvoice.loyaltyPointsEarned) });
      }
    }
    toast({ title: t(lang, "returnProcessed") });
    setReturnDialogOpen(false);
    setReturnInvoice(null);
  };

  const printInvoice = useCallback((inv: Invoice) => {
    const width = store.printerSettings.type === "58mm" ? "58mm" : store.printerSettings.type === "80mm" ? "80mm" : "210mm";
    const printWindow = window.open("", "_blank", `width=400,height=600`);
    if (!printWindow) return;
    const itemsHtml = inv.items.map(item =>
      `<div style="display:flex;justify-content:space-between;font-size:12px;"><span>${item.name} × ${item.qty}</span><span>${(item.price * item.qty).toLocaleString()} ${cur}</span></div>`
    ).join("");
    printWindow.document.write(`
      <html dir="rtl"><head><style>@media print{@page{size:${width} auto;margin:2mm;}}body{font-family:'Cairo',sans-serif;width:${width};margin:0 auto;padding:5mm;font-size:12px;}.center{text-align:center;}.bold{font-weight:bold;}.line{border-top:1px dashed #000;margin:4px 0;}.row{display:flex;justify-content:space-between;}</style></head><body>
        <div class="center bold" style="font-size:16px;">${store.storeInfo.name}</div>
        <div class="center" style="font-size:10px;">${store.storeInfo.address}</div>
        <div class="center" style="font-size:10px;">${store.storeInfo.phone}</div>
        <div class="line"></div>
        <div class="row"><span>#${inv.id}</span><span>${inv.date}</span></div>
        <div class="row"><span>${inv.customer}</span></div>
        <div class="line"></div>${itemsHtml}<div class="line"></div>
        <div class="row"><span>${t(lang, "subtotal")}</span><span>${inv.subtotal.toLocaleString()} ${cur}</span></div>
        ${inv.discount > 0 ? `<div class="row"><span>${t(lang, "discountLabel")} ${inv.discount}%</span><span>-${((inv.subtotal * inv.discount) / 100).toLocaleString()}</span></div>` : ""}
        ${store.taxSettings.enabled ? `<div class="row"><span>${t(lang, "tax")} ${store.taxSettings.rate}%</span><span>${Number(inv.tax).toFixed(2)} ${cur}</span></div>` : ""}
        <div class="line"></div>
        <div class="row bold" style="font-size:16px;"><span>${t(lang, "grandTotal")}</span><span>${Number(inv.total).toLocaleString()} ${cur}</span></div>
        ${inv.status === "مرتجعة" ? `<div class="center bold" style="color:red;font-size:14px;margin-top:8px;">${t(lang, "returned")}</div>` : ""}
        <div class="line"></div>
        <div class="center" style="font-size:10px;">${inv.paymentMethod}</div>
        <div class="center" style="font-size:10px;margin-top:8px;">${t(lang, "thankYou")}</div>
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  }, [store.printerSettings.type, store.storeInfo, store.taxSettings, cur, lang]);

  const totalSales = store.invoices.filter(i => i.status === "مكتملة").reduce((s, i) => s + i.total, 0);
  const totalReturns = store.invoices.filter(i => i.status === "مرتجعة").reduce((s, i) => s + i.total, 0);
  const netSales = totalSales - totalReturns;

  return (
    <div className="p-6 space-y-6" dir={lang === "English" ? "ltr" : "rtl"}>
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">{t(lang, "salesManagement")}</h1><p className="text-sm text-muted-foreground mt-1">{store.invoices.length} {t(lang, "invoice")}</p></div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4"><p className="text-xs text-muted-foreground">{t(lang, "totalSales")}</p><p className="text-xl font-bold text-success mt-1">{totalSales.toLocaleString()} {cur}</p></div>
        <div className="glass-card rounded-xl p-4"><p className="text-xs text-muted-foreground">{t(lang, "totalReturns")}</p><p className="text-xl font-bold text-destructive mt-1">{totalReturns.toLocaleString()} {cur}</p></div>
        <div className="glass-card rounded-xl p-4"><p className="text-xs text-muted-foreground">{t(lang, "netSales")}</p><p className="text-xl font-bold text-card-foreground mt-1">{netSales.toLocaleString()} {cur}</p></div>
        <div className="glass-card rounded-xl p-4"><p className="text-xs text-muted-foreground">{t(lang, "invoiceCount")}</p><p className="text-xl font-bold text-card-foreground mt-1">{store.invoices.length}</p></div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder={t(lang, "searchInvoice")} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          {statusOptions.map(opt => (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", statusFilter === opt.value ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/50">
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "number")}</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "date")}</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "customer")}</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "items")}</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "total")}</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "payment")}</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "status")}</th>
            <th className="text-right text-xs font-semibold text-muted-foreground p-3">{t(lang, "actions")}</th>
          </tr></thead>
          <tbody>
            {filtered.map((inv, i) => (
              <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                <td className="p-3 text-sm font-mono text-muted-foreground">#{inv.id}</td>
                <td className="p-3 text-sm text-muted-foreground">{inv.date}</td>
                <td className="p-3 text-sm font-medium text-card-foreground">{inv.customer}</td>
                <td className="p-3 text-sm text-muted-foreground">{inv.items.length} {t(lang, "item")}</td>
                <td className="p-3 text-sm font-semibold text-card-foreground">{inv.total.toLocaleString()} {cur}</td>
                <td className="p-3"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{inv.paymentMethod}</span></td>
                <td className="p-3"><span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium", statusColor(inv.status))}>{statusLabel(inv.status)}</span></td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewInvoice(inv)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                    {inv.status === "مكتملة" && <button onClick={() => openEdit(inv)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="w-4 h-4" /></button>}
                    <button onClick={() => printInvoice(inv)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Printer className="w-4 h-4" /></button>
                    {(inv.status === "مكتملة" || inv.status === "معلقة") && <button onClick={() => openReturn(inv)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><RotateCcw className="w-4 h-4" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t(lang, "invoiceDetails")} #{viewInvoice?.id}</DialogTitle><DialogDescription>{viewInvoice?.date}</DialogDescription></DialogHeader>
          {viewInvoice && (
            <div className="space-y-3 text-sm">
              <div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">{t(lang, "customer")}</p><p className="font-medium text-card-foreground">{viewInvoice.customer}</p></div>
              <div className="space-y-1">
                {viewInvoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between p-2 bg-muted/30 rounded-lg"><span className="text-muted-foreground">{item.name} × {item.qty}</span><span className="text-card-foreground font-medium">{(item.price * item.qty).toLocaleString()} {cur}</span></div>
                ))}
              </div>
              <div className="border-t border-border pt-2 space-y-1">
                <div className="flex justify-between text-muted-foreground"><span>{t(lang, "subtotal")}</span><span>{viewInvoice.subtotal.toLocaleString()} {cur}</span></div>
                {viewInvoice.discount > 0 && <div className="flex justify-between text-success"><span>{t(lang, "discountLabel")} {viewInvoice.discount}%</span><span>-{((viewInvoice.subtotal * viewInvoice.discount) / 100).toLocaleString()}</span></div>}
                <div className="flex justify-between text-muted-foreground"><span>{t(lang, "tax")}</span><span>{Number(viewInvoice.tax).toFixed(2)} {cur}</span></div>
                <div className="flex justify-between text-lg font-bold text-card-foreground border-t border-border pt-2"><span>{t(lang, "grandTotal")}</span><span>{Number(viewInvoice.total).toLocaleString()} {cur}</span></div>
              </div>
              {viewInvoice.loyaltyPointsEarned && <div className="text-xs text-primary">{t(lang, "pointsEarned")}: {viewInvoice.loyaltyPointsEarned}</div>}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => printInvoice(viewInvoice)}><Printer className="w-4 h-4 ml-1" />{t(lang, "print")}</Button>
                <Button variant="outline" onClick={() => setViewInvoice(null)}>{t(lang, "close")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={!!editInvoice} onOpenChange={() => setEditInvoice(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t(lang, "editInvoice")} #{editInvoice?.id}</DialogTitle><DialogDescription>{t(lang, "editInvoiceDesc")}</DialogDescription></DialogHeader>
          {editInvoice && (
            <div className="space-y-3">
              {editItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  <span className="flex-1 text-sm text-card-foreground">{item.name}</span>
                  <input type="number" min={0} value={item.qty} onChange={e => { const newItems = [...editItems]; newItems[i] = { ...item, qty: Number(e.target.value) }; setEditItems(newItems); }}
                    className="w-16 bg-muted border-0 rounded-md px-2 py-1 text-sm text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <span className="text-sm text-muted-foreground">× {item.price} {cur}</span>
                  <button onClick={() => setEditItems(editItems.filter((_, idx) => idx !== i))} className="text-destructive hover:text-destructive/80"><X className="w-4 h-4" /></button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t(lang, "discount")} %</span>
                <input type="number" min={0} max={100} value={editDiscount} onChange={e => setEditDiscount(Number(e.target.value))}
                  className="w-16 bg-muted border-0 rounded-md px-2 py-1 text-sm text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditInvoice(null)}>{t(lang, "cancel")}</Button>
                <Button onClick={saveEdit}>{t(lang, "saveChanges")}</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t(lang, "confirmReturn")}</DialogTitle><DialogDescription>{t(lang, "confirmReturnDesc")} #{returnInvoice?.id}</DialogDescription></DialogHeader>
          {returnInvoice && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">{t(lang, "returnAmount")}: <span className="font-bold text-destructive">{returnInvoice.total.toLocaleString()} {cur}</span></p>
              <p className="text-xs text-muted-foreground">{t(lang, "returnNote")}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>{t(lang, "cancel")}</Button>
            <Button variant="destructive" onClick={processReturn}>{t(lang, "processReturn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;
