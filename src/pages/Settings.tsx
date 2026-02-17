import { useState, useRef } from "react";
import { Store, Receipt, Shield, Users, Bell, Database, Printer, Plus, Pencil, Trash2, Download, Upload, Eye, EyeOff, UserPlus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useStore, ALL_PERMISSIONS, Role, SystemUser } from "@/store/useStore";
import { Switch } from "@/components/ui/switch";

type SettingsTab = "store" | "tax" | "roles" | "notifications" | "backup" | "printer";

const settingsTabs: { key: SettingsTab; label: string; icon: any }[] = [
  { key: "store", label: "بيانات المتجر", icon: Store },
  { key: "tax", label: "الضرائب", icon: Receipt },
  { key: "roles", label: "الأدوار والصلاحيات", icon: Shield },
  { key: "notifications", label: "التنبيهات", icon: Bell },
  { key: "printer", label: "الطابعة", icon: Printer },
  { key: "backup", label: "النسخ الاحتياطي", icon: Database },
];

const Settings = () => {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("store");
  const [localStore, setLocalStore] = useState({ ...store.storeInfo });
  const [localTax, setLocalTax] = useState({ ...store.taxSettings });
  const [localPrinter, setLocalPrinter] = useState({ ...store.printerSettings });
  const [localNotif, setLocalNotif] = useState({ ...store.notificationSettings });

  // Roles & Users dialogs
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [rolePerms, setRolePerms] = useState<string[]>([]);

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userName, setUserName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRoleId, setUserRoleId] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [activeRoleTab, setActiveRoleTab] = useState<"roles" | "users">("roles");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store info
  const handleSaveStore = () => {
    store.updateStoreInfo(localStore);
    toast({ title: "✅ تم حفظ بيانات المتجر بنجاح" });
  };

  // Tax
  const handleSaveTax = () => {
    store.updateTaxSettings(localTax);
    toast({ title: "✅ تم حفظ إعدادات الضرائب", description: `نسبة الضريبة: ${localTax.rate}%` });
  };

  // Printer
  const handleSavePrinter = () => {
    store.updatePrinterSettings(localPrinter);
    toast({ title: "✅ تم حفظ إعدادات الطابعة" });
  };

  // Notifications
  const handleSaveNotif = () => {
    store.updateNotificationSettings(localNotif);
    toast({ title: "✅ تم حفظ إعدادات التنبيهات" });
  };

  // Roles
  const openNewRole = () => {
    setEditingRole(null);
    setRoleName("");
    setRolePerms([]);
    setRoleDialogOpen(true);
  };
  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRolePerms([...role.permissions]);
    setRoleDialogOpen(true);
  };
  const saveRole = () => {
    if (!roleName.trim()) { toast({ title: "أدخل اسم الدور", variant: "destructive" }); return; }
    if (editingRole) {
      store.updateRole({ ...editingRole, name: roleName, permissions: rolePerms });
      toast({ title: "✅ تم تعديل الدور" });
    } else {
      store.addRole({ name: roleName, permissions: rolePerms });
      toast({ title: "✅ تم إضافة دور جديد" });
    }
    setRoleDialogOpen(false);
  };
  const handleDeleteRole = (id: string) => {
    const usersWithRole = store.systemUsers.filter(u => u.roleId === id);
    if (usersWithRole.length > 0) {
      toast({ title: "لا يمكن حذف هذا الدور", description: `يوجد ${usersWithRole.length} مستخدم مرتبط به`, variant: "destructive" });
      return;
    }
    store.deleteRole(id);
    toast({ title: "تم حذف الدور" });
  };
  const togglePerm = (key: string) => {
    setRolePerms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  // Users
  const openNewUser = () => {
    setEditingUser(null);
    setUserName("");
    setUserUsername("");
    setUserPassword("");
    setUserRoleId(store.roles[0]?.id || "");
    setShowPassword(false);
    setUserDialogOpen(true);
  };
  const openEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setUserName(user.name);
    setUserUsername(user.username);
    setUserPassword(user.password);
    setUserRoleId(user.roleId);
    setShowPassword(false);
    setUserDialogOpen(true);
  };
  const saveUser = () => {
    if (!userName.trim() || !userUsername.trim() || !userPassword.trim()) {
      toast({ title: "جميع الحقول مطلوبة", variant: "destructive" }); return;
    }
    if (editingUser) {
      store.updateSystemUser({ ...editingUser, name: userName, username: userUsername, password: userPassword, roleId: userRoleId });
      toast({ title: "✅ تم تعديل المستخدم" });
    } else {
      const exists = store.systemUsers.find(u => u.username === userUsername);
      if (exists) { toast({ title: "اسم المستخدم موجود بالفعل", variant: "destructive" }); return; }
      store.addSystemUser({ name: userName, username: userUsername, password: userPassword, roleId: userRoleId, active: true });
      toast({ title: "✅ تم إضافة مستخدم جديد" });
    }
    setUserDialogOpen(false);
  };

  // Backup
  const handleExport = () => {
    const data = store.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cashier-pro-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    store.updateBackupSettings({ ...store.backupSettings, lastBackup: new Date().toLocaleString("ar-EG") });
    toast({ title: "✅ تم تصدير النسخة الاحتياطية" });
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = store.importData(ev.target?.result as string);
      if (result) {
        toast({ title: "✅ تم استعادة النسخة الاحتياطية بنجاح" });
        setLocalStore({ ...store.storeInfo });
        setLocalTax({ ...store.taxSettings });
        setLocalPrinter({ ...store.printerSettings });
        setLocalNotif({ ...store.notificationSettings });
      } else {
        toast({ title: "خطأ في ملف النسخة الاحتياطية", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const inputClass = "w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">الإعدادات</h1><p className="text-sm text-muted-foreground mt-1">تخصيص إعدادات النظام</p></div>

      <div className="flex gap-6">
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

        <div className="flex-1">
          {/* Store Info */}
          {activeTab === "store" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">بيانات المتجر</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">اسم المتجر</label><input value={localStore.name} onChange={e => setLocalStore({ ...localStore, name: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs text-muted-foreground">رقم الهاتف</label><input value={localStore.phone} onChange={e => setLocalStore({ ...localStore, phone: e.target.value })} className={inputClass} /></div>
                <div className="col-span-2"><label className="text-xs text-muted-foreground">العنوان</label><input value={localStore.address} onChange={e => setLocalStore({ ...localStore, address: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs text-muted-foreground">الرقم الضريبي</label><input value={localStore.taxNumber} onChange={e => setLocalStore({ ...localStore, taxNumber: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs text-muted-foreground">رقم السجل التجاري</label><input value={localStore.crNumber} onChange={e => setLocalStore({ ...localStore, crNumber: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs text-muted-foreground">العملة</label><input value={localStore.currency} onChange={e => setLocalStore({ ...localStore, currency: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs text-muted-foreground">اللغة</label>
                  <select value={localStore.language} onChange={e => setLocalStore({ ...localStore, language: e.target.value })} className={inputClass}>
                    <option>العربية</option><option>English</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleSaveStore}>حفظ التغييرات</Button>
            </div>
          )}

          {/* Tax */}
          {activeTab === "tax" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">إعدادات الضرائب</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-card-foreground">تفعيل ضريبة القيمة المضافة</span>
                  <Switch checked={localTax.enabled} onCheckedChange={v => setLocalTax({ ...localTax, enabled: v })} />
                </div>
                <div className="w-48"><label className="text-xs text-muted-foreground">نسبة الضريبة %</label>
                  <input type="number" value={localTax.rate} onChange={e => setLocalTax({ ...localTax, rate: Number(e.target.value) })} className={inputClass} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-card-foreground">الضريبة مشمولة في السعر</span>
                  <Switch checked={localTax.includedInPrice} onCheckedChange={v => setLocalTax({ ...localTax, includedInPrice: v })} />
                </div>
                <div className="p-3 rounded-xl bg-accent/30 text-sm text-accent-foreground">
                  💡 عند تفعيل "مشمولة في السعر"، سيتم احتساب الضريبة ضمن سعر البيع وليس إضافية.
                </div>
              </div>
              <Button onClick={handleSaveTax}>حفظ إعدادات الضرائب</Button>
            </div>
          )}

          {/* Roles & Users */}
          {activeTab === "roles" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-card-foreground">الأدوار والصلاحيات</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant={activeRoleTab === "roles" ? "default" : "outline"} onClick={() => setActiveRoleTab("roles")}>
                    <Shield className="w-4 h-4 ml-1" />الأدوار
                  </Button>
                  <Button size="sm" variant={activeRoleTab === "users" ? "default" : "outline"} onClick={() => setActiveRoleTab("users")}>
                    <Users className="w-4 h-4 ml-1" />المستخدمين
                  </Button>
                </div>
              </div>

              {activeRoleTab === "roles" && (
                <div className="space-y-3">
                  <Button size="sm" onClick={openNewRole}><Plus className="w-4 h-4 ml-1" />إضافة دور جديد</Button>
                  {store.roles.map(role => (
                    <div key={role.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
                        <div>
                          <p className="text-sm font-semibold text-card-foreground">{role.name}</p>
                          <p className="text-xs text-muted-foreground">{role.permissions.length} صلاحية</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditRole(role)}><Pencil className="w-3 h-3" /></Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteRole(role.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeRoleTab === "users" && (
                <div className="space-y-3">
                  <Button size="sm" onClick={openNewUser}><UserPlus className="w-4 h-4 ml-1" />إضافة مستخدم جديد</Button>
                  {store.systemUsers.map(user => {
                    const role = store.roles.find(r => r.id === user.roleId);
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", user.active ? "bg-success/10" : "bg-muted")}>
                            <Users className={cn("w-5 h-5", user.active ? "text-success" : "text-muted-foreground")} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-card-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">@{user.username} • {role?.name || "بدون دور"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={user.active} onCheckedChange={v => store.updateSystemUser({ ...user, active: v })} />
                          <Button variant="outline" size="sm" onClick={() => openEditUser(user)}><Pencil className="w-3 h-3" /></Button>
                          <Button variant="outline" size="sm" onClick={() => { store.deleteSystemUser(user.id); toast({ title: "تم حذف المستخدم" }); }} className="text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">إعدادات التنبيهات</h3>
              <div className="space-y-3">
                {(Object.entries({ lowStock: "تنبيه المخزون المنخفض", expiryAlert: "تنبيه انتهاء الصلاحية", creditLimit: "تنبيه تجاوز الحد الائتماني", dueInvoices: "تنبيه الفواتير المستحقة", dailySummary: "ملخص يومي" }) as [keyof typeof localNotif, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <span className="text-sm text-card-foreground">{label}</span>
                    <Switch checked={localNotif[key]} onCheckedChange={v => setLocalNotif({ ...localNotif, [key]: v })} />
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveNotif}>حفظ</Button>
            </div>
          )}

          {/* Printer */}
          {activeTab === "printer" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">إعدادات الطابعة</h3>
              <div className="space-y-4">
                <div><label className="text-xs text-muted-foreground">نوع الطابعة</label>
                  <select value={localPrinter.type} onChange={e => setLocalPrinter({ ...localPrinter, type: e.target.value as any })} className={inputClass}>
                    <option value="80mm">طابعة حرارية 80mm</option>
                    <option value="58mm">طابعة حرارية 58mm</option>
                    <option value="A4">طابعة عادية A4</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-card-foreground">طباعة تلقائية بعد كل فاتورة</span>
                  <Switch checked={localPrinter.autoPrint} onCheckedChange={v => setLocalPrinter({ ...localPrinter, autoPrint: v })} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-card-foreground">فتح درج الكاش تلقائياً</span>
                  <Switch checked={localPrinter.openDrawer} onCheckedChange={v => setLocalPrinter({ ...localPrinter, openDrawer: v })} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-card-foreground">طباعة نسختين</span>
                  <Switch checked={localPrinter.printTwoCopies} onCheckedChange={v => setLocalPrinter({ ...localPrinter, printTwoCopies: v })} />
                </div>
                <Button onClick={handleSavePrinter}>حفظ إعدادات الطابعة</Button>
                <Button variant="outline" onClick={() => {
                  toast({ title: "🖨️ جاري طباعة صفحة اختبار..." });
                  setTimeout(() => window.print(), 500);
                }}>طباعة صفحة اختبار</Button>
              </div>
            </div>
          )}

          {/* Backup */}
          {activeTab === "backup" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">النسخ الاحتياطي</h3>
              <p className="text-sm text-muted-foreground">آخر نسخة: {store.backupSettings.lastBackup}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-card-foreground">نسخ احتياطي تلقائي يومياً</span>
                  <Switch checked={store.backupSettings.autoBackup} onCheckedChange={v => store.updateBackupSettings({ ...store.backupSettings, autoBackup: v })} />
                </div>
                <div className="w-48"><label className="text-xs text-muted-foreground">وقت النسخ التلقائي</label>
                  <input type="time" value={store.backupSettings.backupTime} onChange={e => store.updateBackupSettings({ ...store.backupSettings, backupTime: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExport}><Download className="w-4 h-4 ml-1" />تصدير نسخة احتياطية</Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 ml-1" />استعادة نسخة</Button>
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              </div>
              <div className="p-3 rounded-xl bg-accent/30 text-sm text-accent-foreground">
                💡 النسخة الاحتياطية تشمل جميع البيانات: المنتجات، العملاء، الموردين، الفواتير، الحسابات، والإعدادات.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRole ? "تعديل الدور" : "إضافة دور جديد"}</DialogTitle>
            <DialogDescription>حدد اسم الدور والصلاحيات المسموحة</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><label className="text-xs text-muted-foreground">اسم الدور</label>
              <input value={roleName} onChange={e => setRoleName(e.target.value)} className={inputClass} placeholder="مثال: مشرف المبيعات" />
            </div>
            <div><label className="text-xs text-muted-foreground mb-2 block">الصلاحيات</label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map(perm => (
                  <label key={perm.key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                    <input type="checkbox" checked={rolePerms.includes(perm.key)} onChange={() => togglePerm(perm.key)} className="w-4 h-4 accent-primary rounded" />
                    <span className="text-xs text-card-foreground">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveRole} className="flex-1"><Check className="w-4 h-4 ml-1" />حفظ</Button>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}</DialogTitle>
            <DialogDescription>أدخل بيانات المستخدم وحدد دوره</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><label className="text-xs text-muted-foreground">الاسم الكامل</label>
              <input value={userName} onChange={e => setUserName(e.target.value)} className={inputClass} placeholder="مثال: أحمد محمد" />
            </div>
            <div><label className="text-xs text-muted-foreground">اسم المستخدم</label>
              <input value={userUsername} onChange={e => setUserUsername(e.target.value)} className={inputClass} placeholder="مثال: ahmed" dir="ltr" />
            </div>
            <div><label className="text-xs text-muted-foreground">كلمة المرور</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={userPassword} onChange={e => setUserPassword(e.target.value)} className={inputClass} dir="ltr" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div><label className="text-xs text-muted-foreground">الدور</label>
              <select value={userRoleId} onChange={e => setUserRoleId(e.target.value)} className={inputClass}>
                {store.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveUser} className="flex-1"><Check className="w-4 h-4 ml-1" />حفظ</Button>
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
