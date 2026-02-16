import { useState } from "react";
import { Store, Receipt, Shield, Users, Bell, Database, Globe, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type SettingsTab = "store" | "tax" | "roles" | "notifications" | "backup" | "printer";

const settingsTabs: { key: SettingsTab; label: string; icon: any }[] = [
  { key: "store", label: "بيانات المتجر", icon: Store },
  { key: "tax", label: "الضرائب", icon: Receipt },
  { key: "roles", label: "الأدوار والصلاحيات", icon: Shield },
  { key: "notifications", label: "التنبيهات", icon: Bell },
  { key: "printer", label: "الطابعة", icon: Printer },
  { key: "backup", label: "النسخ الاحتياطي", icon: Database },
];

const roles = [
  { name: "مدير", permissions: ["الكل"] },
  { name: "مشرف", permissions: ["المبيعات", "المنتجات", "التقارير", "العملاء"] },
  { name: "كاشير", permissions: ["نقاط البيع", "العملاء"] },
  { name: "أمين مخزن", permissions: ["المنتجات", "المخزون", "الموردين"] },
  { name: "محاسب", permissions: ["الحسابات", "التقارير", "الفواتير"] },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("store");
  const [storeInfo, setStoreInfo] = useState({
    name: "متجر التقنية الحديثة",
    phone: "0112345678",
    address: "الرياض - حي العليا - شارع التحلية",
    taxNumber: "300123456700003",
    crNumber: "1010123456",
    currency: "ر.س",
    language: "العربية",
  });
  const [taxSettings, setTaxSettings] = useState({
    enabled: true,
    rate: 15,
    includedInPrice: false,
    taxNumber: "300123456700003",
  });
  const [notifications, setNotifications] = useState({
    lowStock: true,
    expiryAlert: true,
    creditLimit: true,
    dueInvoices: true,
    dailySummary: false,
  });

  const handleSaveStore = () => toast({ title: "تم حفظ بيانات المتجر بنجاح" });
  const handleSaveTax = () => toast({ title: "تم حفظ إعدادات الضرائب" });
  const handleSaveNotifications = () => toast({ title: "تم حفظ إعدادات التنبيهات" });
  const handleBackup = () => toast({ title: "تم إنشاء نسخة احتياطية", description: "تم حفظ النسخة بنجاح" });

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">الإعدادات</h1><p className="text-sm text-muted-foreground mt-1">تخصيص إعدادات النظام</p></div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 space-y-1">
          {settingsTabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-right",
                activeTab === tab.key ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
              <tab.icon className="w-4 h-4 flex-shrink-0" />{tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "store" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">بيانات المتجر</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">اسم المتجر</label><input value={storeInfo.name} onChange={e => setStoreInfo({ ...storeInfo, name: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs text-muted-foreground">رقم الهاتف</label><input value={storeInfo.phone} onChange={e => setStoreInfo({ ...storeInfo, phone: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div className="col-span-2"><label className="text-xs text-muted-foreground">العنوان</label><input value={storeInfo.address} onChange={e => setStoreInfo({ ...storeInfo, address: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs text-muted-foreground">الرقم الضريبي</label><input value={storeInfo.taxNumber} onChange={e => setStoreInfo({ ...storeInfo, taxNumber: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs text-muted-foreground">رقم السجل التجاري</label><input value={storeInfo.crNumber} onChange={e => setStoreInfo({ ...storeInfo, crNumber: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs text-muted-foreground">العملة</label><input value={storeInfo.currency} onChange={e => setStoreInfo({ ...storeInfo, currency: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-xs text-muted-foreground">اللغة</label>
                  <select value={storeInfo.language} onChange={e => setStoreInfo({ ...storeInfo, language: e.target.value })} className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>العربية</option><option>English</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleSaveStore}>حفظ التغييرات</Button>
            </div>
          )}

          {activeTab === "tax" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">إعدادات الضرائب</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={taxSettings.enabled} onChange={e => setTaxSettings({ ...taxSettings, enabled: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-card-foreground">تفعيل ضريبة القيمة المضافة</span>
                </label>
                <div className="w-48"><label className="text-xs text-muted-foreground">نسبة الضريبة %</label><input type="number" value={taxSettings.rate} onChange={e => setTaxSettings({ ...taxSettings, rate: Number(e.target.value) })} className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={taxSettings.includedInPrice} onChange={e => setTaxSettings({ ...taxSettings, includedInPrice: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-card-foreground">الضريبة مشمولة في السعر</span>
                </label>
              </div>
              <Button onClick={handleSaveTax}>حفظ</Button>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">الأدوار والصلاحيات</h3>
              <div className="space-y-3">
                {roles.map(role => (
                  <div key={role.name} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
                      <div><p className="text-sm font-semibold text-card-foreground">{role.name}</p><p className="text-xs text-muted-foreground">{role.permissions.join(" • ")}</p></div>
                    </div>
                    <Button variant="outline" size="sm">تعديل</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">إعدادات التنبيهات</h3>
              <div className="space-y-3">
                {Object.entries({ lowStock: "تنبيه المخزون المنخفض", expiryAlert: "تنبيه انتهاء الصلاحية", creditLimit: "تنبيه تجاوز الحد الائتماني", dueInvoices: "تنبيه الفواتير المستحقة", dailySummary: "ملخص يومي" }).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 cursor-pointer">
                    <span className="text-sm text-card-foreground">{label}</span>
                    <input type="checkbox" checked={notifications[key as keyof typeof notifications]} onChange={e => setNotifications({ ...notifications, [key]: e.target.checked })} className="w-4 h-4 accent-primary" />
                  </label>
                ))}
              </div>
              <Button onClick={handleSaveNotifications}>حفظ</Button>
            </div>
          )}

          {activeTab === "printer" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">إعدادات الطابعة</h3>
              <div className="space-y-4">
                <div><label className="text-xs text-muted-foreground">نوع الطابعة</label>
                  <select className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>طابعة حرارية 80mm</option><option>طابعة حرارية 58mm</option><option>طابعة عادية A4</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" /><span className="text-sm text-card-foreground">طباعة تلقائية بعد كل فاتورة</span></label>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" /><span className="text-sm text-card-foreground">فتح درج الكاش تلقائياً</span></label>
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-4 h-4 accent-primary" /><span className="text-sm text-card-foreground">طباعة نسختين</span></label>
                <Button onClick={() => toast({ title: "تم الحفظ" })}>حفظ</Button>
              </div>
            </div>
          )}

          {activeTab === "backup" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">النسخ الاحتياطي</h3>
              <p className="text-sm text-muted-foreground">آخر نسخة: 2026-02-16 10:00</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" /><span className="text-sm text-card-foreground">نسخ احتياطي تلقائي يومياً</span></label>
                <div className="w-48"><label className="text-xs text-muted-foreground">وقت النسخ التلقائي</label><input type="time" defaultValue="02:00" className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBackup}>إنشاء نسخة الآن</Button>
                <Button variant="outline">استعادة نسخة</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
