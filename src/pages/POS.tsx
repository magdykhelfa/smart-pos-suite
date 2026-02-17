import { useState, useCallback } from "react";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, X, ArrowRight, Pause, Printer } from "lucide-react";
import { useStore } from "@/store/useStore";
import { t } from "@/i18n/translations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface CartItem { id: string; name: string; price: number; qty: number; }

const categories = ["الكل", "هواتف", "إكسسوارات", "كابلات", "أجهزة لوحية", "ساعات", "كمبيوتر"];

const POS = () => {
  const { products, addInvoice, addTransaction, storeInfo, taxSettings, printerSettings } = useStore();
  const lang = storeInfo.language as "العربية" | "English";
  const cur = storeInfo.currency;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [discount, setDiscount] = useState(0);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const [customerName, setCustomerName] = useState(t(lang, "walkInCustomer"));
  const [suspendedCarts, setSuspendedCarts] = useState<{ name: string; cart: CartItem[]; discount: number }[]>([]);
  const [suspendedOpen, setSuspendedOpen] = useState(false);

  const posProducts = products.filter(p => p.stock > 0);
  const filteredProducts = posProducts.filter(p => {
    const matchesSearch = p.name.includes(searchQuery) || p.barcode.includes(searchQuery);
    const matchesCategory = activeCategory === "الكل" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { id: product.id, name: product.name, price: product.sellPrice, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: item.qty + delta } : item).filter(item => item.qty > 0));
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxRate = taxSettings.enabled ? taxSettings.rate / 100 : 0;
  let tax: number, total: number;
  if (taxSettings.includedInPrice) {
    total = subtotal - discountAmount;
    tax = total - total / (1 + taxRate);
  } else {
    tax = (subtotal - discountAmount) * taxRate;
    total = subtotal - discountAmount + tax;
  }

  const printReceipt = useCallback((receiptData: any) => {
    const width = printerSettings.type === "58mm" ? "58mm" : printerSettings.type === "80mm" ? "80mm" : "210mm";
    const printWindow = window.open("", "_blank", `width=400,height=600`);
    if (!printWindow) return;
    const itemsHtml = receiptData.items.map((item: any) =>
      `<div style="display:flex;justify-content:space-between;font-size:12px;"><span>${item.name} × ${item.qty}</span><span>${(item.price * item.qty).toLocaleString()} ${cur}</span></div>`
    ).join("");
    printWindow.document.write(`
      <html dir="rtl"><head><style>@media print{@page{size:${width} auto;margin:2mm;}}body{font-family:'Cairo',sans-serif;width:${width};margin:0 auto;padding:5mm;font-size:12px;}.center{text-align:center;}.bold{font-weight:bold;}.line{border-top:1px dashed #000;margin:4px 0;}.row{display:flex;justify-content:space-between;}</style></head><body>
        <div class="center bold" style="font-size:16px;">${storeInfo.name}</div>
        <div class="center" style="font-size:10px;">${storeInfo.address}</div>
        <div class="center" style="font-size:10px;">${storeInfo.phone}</div>
        ${storeInfo.taxNumber ? `<div class="center" style="font-size:10px;">${storeInfo.taxNumber}</div>` : ""}
        <div class="line"></div>
        <div class="row"><span>${receiptData.date}</span></div>
        <div class="row"><span>${receiptData.customer}</span></div>
        <div class="line"></div>${itemsHtml}<div class="line"></div>
        <div class="row"><span>${t(lang, "subtotal")}</span><span>${receiptData.subtotal.toLocaleString()} ${cur}</span></div>
        ${receiptData.discount > 0 ? `<div class="row"><span>${t(lang, "discountLabel")} ${receiptData.discount}%</span><span>-${((receiptData.subtotal * receiptData.discount) / 100).toLocaleString()}</span></div>` : ""}
        ${taxSettings.enabled ? `<div class="row"><span>${t(lang, "tax")} ${taxSettings.rate}%</span><span>${Number(receiptData.tax).toFixed(2)} ${cur}</span></div>` : ""}
        <div class="line"></div>
        <div class="row bold" style="font-size:16px;"><span>${t(lang, "grandTotal")}</span><span>${Number(receiptData.total).toLocaleString()} ${cur}</span></div>
        <div class="line"></div>
        <div class="center" style="font-size:10px;">${receiptData.paymentMethod}</div>
        <div class="center" style="font-size:10px;margin-top:8px;">${t(lang, "thankYou")}</div>
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  }, [printerSettings.type, storeInfo, taxSettings, cur, lang]);

  const completeSale = (method: string) => {
    if (cart.length === 0) { toast({ title: t(lang, "cartEmpty"), variant: "destructive" }); return; }
    const invoice = {
      date: new Date().toLocaleString(lang === "English" ? "en-US" : "ar-EG"),
      customer: customerName,
      items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price })),
      subtotal, discount, tax, total, paymentMethod: method,
      status: method === "آجل" ? "معلقة" as const : "مكتملة" as const,
      employee: "الكاشير",
    };
    addInvoice(invoice);
    addTransaction({ date: new Date().toISOString().split("T")[0], type: "sale", category: "مبيعات", amount: total, description: `فاتورة - ${customerName}`, paymentMethod: method, treasury: "الخزنة الرئيسية" });
    const receiptData = { ...invoice, total: total.toFixed(2) };
    setLastReceipt(receiptData);
    setReceiptOpen(true);
    if (printerSettings.autoPrint) {
      printReceipt(receiptData);
      if (printerSettings.printTwoCopies) setTimeout(() => printReceipt(receiptData), 1000);
    }
    if (printerSettings.openDrawer) toast({ title: t(lang, "cashDrawerOpened") });
    setCart([]); setDiscount(0); setCustomerName(t(lang, "walkInCustomer"));
    toast({ title: t(lang, "saleCompleted") });
  };

  const suspendCart = () => {
    if (cart.length === 0) return;
    setSuspendedCarts(prev => [...prev, { name: customerName, cart: [...cart], discount }]);
    setCart([]); setDiscount(0);
    toast({ title: t(lang, "cartSuspended") });
  };

  const restoreCart = (index: number) => {
    const suspended = suspendedCarts[index];
    setCart(suspended.cart); setDiscount(suspended.discount); setCustomerName(suspended.name);
    setSuspendedCarts(prev => prev.filter((_, i) => i !== index));
    setSuspendedOpen(false);
    toast({ title: t(lang, "cartRestored") });
  };

  return (
    <div className="flex h-screen" dir={lang === "English" ? "ltr" : "rtl"}>
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"><ArrowRight className="w-5 h-5" /></Link>
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder={t(lang, "searchBarcodeOrName")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-muted border-0 rounded-lg pr-10 pl-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          {suspendedCarts.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setSuspendedOpen(true)} className="relative">
              <Pause className="w-4 h-4 ml-1" />{t(lang, "suspended")}
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-warning text-warning-foreground text-[10px] flex items-center justify-center font-bold">{suspendedCarts.length}</span>
            </Button>
          )}
        </div>
        <div className="px-3 py-2 flex gap-2 overflow-x-auto border-b border-border">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map(product => (
              <button key={product.id} onClick={() => addToCart(product)} className="pos-grid-item text-right">
                <div className="w-full aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center"><span className="text-2xl">📦</span></div>
                <p className="text-sm font-medium text-card-foreground line-clamp-1">{product.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                  <p className="text-xs text-muted-foreground">{t(lang, "availableLabel")} {product.stock}</p>
                </div>
                <p className="text-sm font-bold text-primary mt-1">{product.sellPrice} {cur}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[380px] bg-card border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t(lang, "customerLabel")}</span>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)}
              className="flex-1 bg-muted border-0 rounded-md px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground"><span className="text-4xl mb-3">🛒</span><p className="text-sm">{t(lang, "addToCartMsg")}</p></div>
          ) : cart.map(item => (
            <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-card-foreground truncate">{item.name}</p><p className="text-xs text-muted-foreground">{item.price} {cur}</p></div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"><Minus className="w-3 h-3" /></button>
                <span className="w-7 text-center text-sm font-semibold text-card-foreground">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-md bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"><Plus className="w-3 h-3" /></button>
              </div>
              <span className="text-sm font-semibold text-card-foreground w-16 text-left">{(item.price * item.qty).toLocaleString()}</span>
              <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{t(lang, "discount")}</span>
            <input type="number" min={0} max={100} value={discount} onChange={e => setDiscount(Number(e.target.value))}
              className="w-14 bg-muted border-0 rounded-md px-2 py-1 text-sm text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>{t(lang, "subtotal")}</span><span>{subtotal.toLocaleString()} {cur}</span></div>
            {discount > 0 && <div className="flex justify-between text-success"><span>{t(lang, "discountLabel")} ({discount}%)</span><span>- {discountAmount.toLocaleString()}</span></div>}
            {taxSettings.enabled && (
              <div className="flex justify-between text-muted-foreground">
                <span>{t(lang, "tax")} {taxSettings.rate}% {taxSettings.includedInPrice ? t(lang, "includedInPrice") : ""}</span>
                <span>{tax.toFixed(0)} {cur}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-card-foreground pt-2 border-t border-border"><span>{t(lang, "grandTotal")}</span><span>{total.toFixed(0)} {cur}</span></div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <Button onClick={() => completeSale("كاش")} className="flex-col h-12 gap-0.5 text-[10px]"><Banknote className="w-4 h-4" />{t(lang, "cash")}</Button>
            <Button variant="secondary" onClick={() => completeSale("بطاقة")} className="flex-col h-12 gap-0.5 text-[10px]"><CreditCard className="w-4 h-4" />{t(lang, "card")}</Button>
            <Button variant="secondary" onClick={() => completeSale("محفظة")} className="flex-col h-12 gap-0.5 text-[10px]"><Smartphone className="w-4 h-4" />{t(lang, "wallet")}</Button>
            <Button variant="secondary" onClick={() => completeSale("آجل")} className="flex-col h-12 gap-0.5 text-[10px]">💳{t(lang, "credit")}</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="text-xs" onClick={suspendCart}><Pause className="w-3 h-3 ml-1" />{t(lang, "suspend")}</Button>
            <Button variant="destructive" className="text-xs" onClick={() => { setCart([]); setDiscount(0); }}><X className="w-3 h-3 ml-1" />{t(lang, "cancel")}</Button>
          </div>
        </div>
      </div>

      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-center">{t(lang, "receiptTitle")}</DialogTitle><DialogDescription className="text-center">{t(lang, "receiptDesc")}</DialogDescription></DialogHeader>
          {lastReceipt && (
            <div className="space-y-3 text-sm">
              <div className="text-center border-b border-dashed border-border pb-3">
                <p className="font-bold text-card-foreground">{storeInfo.name}</p>
                <p className="text-xs text-muted-foreground">{storeInfo.address}</p>
                <p className="text-xs text-muted-foreground">{lastReceipt.date}</p>
                <p className="text-xs text-muted-foreground">{t(lang, "customerLabel")} {lastReceipt.customer}</p>
              </div>
              <div className="space-y-1">
                {lastReceipt.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{item.name} × {item.qty}</span><span className="text-card-foreground">{(item.price * item.qty).toLocaleString()} {cur}</span></div>
                ))}
              </div>
              <div className="border-t border-dashed border-border pt-2 space-y-1">
                <div className="flex justify-between text-muted-foreground"><span>{t(lang, "subtotal")}</span><span>{lastReceipt.subtotal.toLocaleString()} {cur}</span></div>
                {lastReceipt.discount > 0 && <div className="flex justify-between text-success"><span>{t(lang, "discountLabel")} {lastReceipt.discount}%</span><span>-{((lastReceipt.subtotal * lastReceipt.discount) / 100).toLocaleString()}</span></div>}
                {taxSettings.enabled && <div className="flex justify-between text-muted-foreground"><span>{t(lang, "tax")} {taxSettings.rate}%</span><span>{Number(lastReceipt.tax).toFixed(0)} {cur}</span></div>}
                <div className="flex justify-between text-lg font-bold text-card-foreground border-t border-dashed border-border pt-2"><span>{t(lang, "grandTotal")}</span><span>{Number(lastReceipt.total).toLocaleString()} {cur}</span></div>
                <div className="text-center text-xs text-muted-foreground mt-2">{lastReceipt.paymentMethod}</div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setReceiptOpen(false)}>{t(lang, "close")}</Button>
                <Button variant="outline" onClick={() => printReceipt(lastReceipt)}><Printer className="w-4 h-4 ml-1" />{t(lang, "print")}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={suspendedOpen} onOpenChange={setSuspendedOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t(lang, "suspendedInvoices")}</DialogTitle><DialogDescription>{suspendedCarts.length} {t(lang, "suspendedCount")}</DialogDescription></DialogHeader>
          <div className="space-y-2">
            {suspendedCarts.map((sc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div><p className="text-sm font-medium text-card-foreground">{sc.name}</p><p className="text-xs text-muted-foreground">{sc.cart.length} {t(lang, "item")}</p></div>
                <Button size="sm" onClick={() => restoreCart(i)}>{t(lang, "restore")}</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
