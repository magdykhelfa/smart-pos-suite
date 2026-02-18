import { useState, useRef } from "react";
import { Store, Receipt, Shield, Users, Bell, Database, Printer, Plus, Pencil, Trash2, Download, Upload, Eye, EyeOff, UserPlus, X, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useStore, ALL_PERMISSIONS, Role, SystemUser } from "@/store/useStore";
import { t } from "@/i18n/translations";
import { Switch } from "@/components/ui/switch";

type SettingsTab = "store" | "tax" | "loyalty" | "roles" | "notifications" | "backup" | "printer";

const Settings = () => {
  const store = useStore();
  const lang = store.storeInfo.language as "العربية" | "English";
  const [activeTab, setActiveTab] = useState<SettingsTab>("store");
  const [localStore, setLocalStore] = useState({ ...store.storeInfo });
  const [localTax, setLocalTax] = useState({ ...store.taxSettings });
  const [localLoyalty, setLocalLoyalty] = useState({ ...store.loyaltySettings });
  const [localPrinter, setLocalPrinter] = useState({ ...store.printerSettings });
  const [localNotif, setLocalNotif] = useState({ ...store.notificationSettings });

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

  const settingsTabs: { key: SettingsTab; label: string; icon: any }[] = [
    { key: "store", label: t(lang, "storeInfo"), icon: Store },
    { key: "tax", label: t(lang, "taxLabel"), icon: Receipt },
    { key: "loyalty", label: t(lang, "loyaltyLabel"), icon: Star },
    { key: "roles", label: t(lang, "rolesPermissions"), icon: Shield },
    { key: "notifications", label: t(lang, "notificationsLabel"), icon: Bell },
    { key: "printer", label: t(lang, "printerLabel"), icon: Printer },
    { key: "backup", label: t(lang, "backupLabel"), icon: Database },
  ];

  const handleSaveStore = () => {
    store.updateStoreInfo(localStore);
    toast({ title: t(localStore.language as any, "storeInfoSaved") });
  };
  const handleSaveTax = () => { store.updateTaxSettings(localTax); toast({ title: t(lang, "taxSaved"), description: `${t(lang, "taxRate")}: ${localTax.rate}%` }); };
  const handleSaveLoyalty = () => { store.updateLoyaltySettings(localLoyalty); toast({ title: t(lang, "loyaltySaved") }); };
  const handleSavePrinter = () => { store.updatePrinterSettings(localPrinter); toast({ title: t(lang, "printerSaved") }); };
  const handleSaveNotif = () => { store.updateNotificationSettings(localNotif); toast({ title: t(lang, "notifSaved") }); };

  const openNewRole = () => { setEditingRole(null); setRoleName(""); setRolePerms([]); setRoleDialogOpen(true); };
  const openEditRole = (role: Role) => { setEditingRole(role); setRoleName(role.name); setRolePerms([...role.permissions]); setRoleDialogOpen(true); };
  const saveRole = () => {
    if (!roleName.trim()) { toast({ title: t(lang, "enterRoleName"), variant: "destructive" }); return; }
    if (editingRole) { store.updateRole({ ...editingRole, name: roleName, permissions: rolePerms }); toast({ title: t(lang, "roleSaved") }); }
    else { store.addRole({ name: roleName, permissions: rolePerms }); toast({ title: t(lang, "roleAdded") }); }
    setRoleDialogOpen(false);
  };
  const handleDeleteRole = (id: string) => {
    const usersWithRole = store.systemUsers.filter(u => u.roleId === id);
    if (usersWithRole.length > 0) { toast({ title: t(lang, "cannotDeleteRole"), description: `${usersWithRole.length} ${t(lang, "usersLinked")}`, variant: "destructive" }); return; }
    store.deleteRole(id); toast({ title: t(lang, "roleDeleted") });
  };
  const togglePerm = (key: string) => { setRolePerms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]); };

  const openNewUser = () => { setEditingUser(null); setUserName(""); setUserUsername(""); setUserPassword(""); setUserRoleId(store.roles[0]?.id || ""); setShowPassword(false); setUserDialogOpen(true); };
  const openEditUser = (user: SystemUser) => { setEditingUser(user); setUserName(user.name); setUserUsername(user.username); setUserPassword(user.password); setUserRoleId(user.roleId); setShowPassword(false); setUserDialogOpen(true); };
  const saveUser = () => {
    if (!userName.trim() || !userUsername.trim() || !userPassword.trim()) { toast({ title: t(lang, "allFieldsRequired"), variant: "destructive" }); return; }
    if (editingUser) { store.updateSystemUser({ ...editingUser, name: userName, username: userUsername, password: userPassword, roleId: userRoleId }); toast({ title: t(lang, "userSaved") }); }
    else {
      if (store.systemUsers.find(u => u.username === userUsername)) { toast({ title: t(lang, "usernameExists"), variant: "destructive" }); return; }
      store.addSystemUser({ name: userName, username: userUsername, password: userPassword, roleId: userRoleId, active: true }); toast({ title: t(lang, "userAdded") });
    }
    setUserDialogOpen(false);
  };

  const handleExport = () => {
    const data = store.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `cashier-pro-backup-${new Date().toISOString().split("T")[0]}.json`; a.click();
    URL.revokeObjectURL(url);
    store.updateBackupSettings({ ...store.backupSettings, lastBackup: new Date().toLocaleString(lang === "English" ? "en-US" : "ar-EG") });
    toast({ title: t(lang, "backupExported") });
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = store.importData(ev.target?.result as string);
      if (result) { toast({ title: t(lang, "backupRestored") }); setLocalStore({ ...store.storeInfo }); setLocalTax({ ...store.taxSettings }); setLocalLoyalty({ ...store.loyaltySettings }); setLocalPrinter({ ...store.printerSettings }); setLocalNotif({ ...store.notificationSettings }); }
      else { toast({ title: t(lang, "backupError"), variant: "destructive" }); }
    };
    reader.readAsText(file); e.target.value = "";
  };

  const inputClass = "w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="p-6 space-y-6" dir={lang === "English" ? "ltr" : "rtl"}>
      <div><h1 className="text-2xl font-bold text-foreground">{t(lang, "settingsTitle")}</h1><p className="text-sm text-muted-foreground mt-1">{t(lang, "settingsDesc")}</p></div>

      <div className="flex gap-6">
        <div className="w-56 space-y-1">
          {settingsTabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn("w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-right",
                activeTab === tab.key ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <tab.icon className="w-4 h-4 flex-shrink-0" />{tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activeTab === "store" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">{t(lang, "storeInfo")}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">{t(lang, "storeName")}</label><input value={localStore.name} onChange={e => setLocalStore({ ...localStore, name: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, "phoneNumber")}</label><input value={localStore.phone} onChange={e => setLocalStore({ ...localStore, phone: e.target.value })} className={inputClass} /></div>
                <div className="col-span-2"><label className="text-xs text-muted-foreground">{t(lang, "address")}</label><input value={localStore.address} onChange={e => setLocalStore({ ...localStore, address: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, "taxNumber")}</label><input value={localStore.taxNumber} onChange={e => setLocalStore({ ...localStore, taxNumber: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, "crNumber")}</label><input value={localStore.crNumber} onChange={e => setLocalStore({ ...localStore, crNumber: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, "currency")}</label><input value={localStore.currency} onChange={e => setLocalStore({ ...localStore, currency: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs text-muted-foreground">{t(lang, "language")}</label>
                  <select value={localStore.language} onChange={e => setLocalStore({ ...localStore, language: e.target.value })} className={inputClass}>
                    <option>العربية</option><option>English</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleSaveStore}>{t(lang, "saveChanges")}</Button>
            </div>
          )}

          {activeTab === "tax" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">{t(lang, "taxLabel")}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-card-foreground">{t(lang, "enableVat")}</span>
                  <Switch checked={localTax.enabled} onCheckedChange={v => setLocalTax({ ...localTax, enabled: v })} />
                </div>
                <div className="w-48"><label className="text-xs text-muted-foreground">{t(lang, "taxRate")}</label>
                  <input type="number" value={localTax.rate} onChange={e => setLocalTax({ ...localTax, rate: Number(e.target.value) })} className={inputClass} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-card-foreground">{t(lang, "taxIncludedInPrice")}</span>
                  <Switch checked={localTax.includedInPrice} onCheckedChange={v => setLocalTax({ ...localTax, includedInPrice: v })} />
                </div>
                <div className="p-3 rounded-xl bg-accent/30 text-sm text-accent-foreground">{t(lang, "taxIncludedNote")}</div>
              </div>
              <Button onClick={handleSaveTax}>{t(lang, "saveTaxSettings")}</Button>
            </div>
          )}

          {activeTab === "loyalty" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">{t(lang, "loyaltyLabel")}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-card-foreground">{t(lang, "enableLoyalty")}</span>
                  <Switch checked={localLoyalty.enabled} onCheckedChange={v => setLocalLoyalty({ ...localLoyalty, enabled: v })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-muted-foreground">{t(lang, "pointsPerUnit")}</label>
                    <input type="number" step="0.1" value={localLoyalty.pointsPerUnit} onChange={e => setLocalLoyalty({ ...localLoyalty, pointsPerUnit: Number(e.target.value) })} className={inputClass} />
                  </div>
                  <div><label className="text-xs text-muted-foreground">{t(lang, "pointValueLabel")}</label>
                    <input type="number" step="0.01" value={localLoyalty.pointValue} onChange={e => setLocalLoyalty({ ...localLoyalty, pointValue: Number(e.target.value) })} className={inputClass} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-card-foreground">{t(lang, "showOnReceiptLabel")}</span>
                  <Switch checked={localLoyalty.showOnReceipt} onCheckedChange={v => setLocalLoyalty({ ...localLoyalty, showOnReceipt: v })} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-card-foreground">{t(lang, "allowUnregisteredLabel")}</span>
                  <Switch checked={localLoyalty.allowUnregistered} onCheckedChange={v => setLocalLoyalty({ ...localLoyalty, allowUnregistered: v })} />
                </div>
                <div className="p-3 rounded-xl bg-accent/30 text-sm text-accent-foreground">{t(lang, "loyaltyNote")}</div>
              </div>
              <Button onClick={handleSaveLoyalty}>{t(lang, "saveLoyaltySettings")}</Button>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-card-foreground">{t(lang, "rolesPermissions")}</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant={activeRoleTab === "roles" ? "default" : "outline"} onClick={() => setActiveRoleTab("roles")}><Shield className="w-4 h-4 ml-1" />{t(lang, "roles")}</Button>
                  <Button size="sm" variant={activeRoleTab === "users" ? "default" : "outline"} onClick={() => setActiveRoleTab("users")}><Users className="w-4 h-4 ml-1" />{t(lang, "users")}</Button>
                </div>
              </div>
              {activeRoleTab === "roles" && (
                <div className="space-y-3">
                  <Button size="sm" onClick={openNewRole}><Plus className="w-4 h-4 ml-1" />{t(lang, "addNewRole")}</Button>
                  {store.roles.map(role => (
                    <div key={role.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Shield className="w-5 h-5 text-primary" /></div>
                        <div><p className="text-sm font-semibold text-card-foreground">{role.name}</p><p className="text-xs text-muted-foreground">{role.permissions.length} {t(lang, "permissions")}</p></div>
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
                  <Button size="sm" onClick={openNewUser}><UserPlus className="w-4 h-4 ml-1" />{t(lang, "addNewUser")}</Button>
                  {store.systemUsers.map(user => {
                    const role = store.roles.find(r => r.id === user.roleId);
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", user.active ? "bg-success/10" : "bg-muted")}><Users className={cn("w-5 h-5", user.active ? "text-success" : "text-muted-foreground")} /></div>
                          <div><p className="text-sm font-semibold text-card-foreground">{user.name}</p><p className="text-xs text-muted-foreground">@{user.username} • {role?.name || t(lang, "noRole")}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={user.active} onCheckedChange={v => store.updateSystemUser({ ...user, active: v })} />
                          <Button variant="outline" size="sm" onClick={() => openEditUser(user)}><Pencil className="w-3 h-3" /></Button>
                          <Button variant="outline" size="sm" onClick={() => { store.deleteSystemUser(user.id); toast({ title: t(lang, "userDeleted") }); }} className="text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">{t(lang, "notificationsLabel")}</h3>
              <div className="space-y-3">
                {(Object.entries({ lowStock: t(lang, "lowStockAlert"), expiryAlert: t(lang, "expiryAlert"), creditLimit: t(lang, "creditLimitAlert"), dueInvoices: t(lang, "dueInvoicesAlert"), dailySummary: t(lang, "dailySummary") }) as [keyof typeof localNotif, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <span className="text-sm text-card-foreground">{label}</span>
                    <Switch checked={localNotif[key]} onCheckedChange={v => setLocalNotif({ ...localNotif, [key]: v })} />
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveNotif}>{t(lang, "save")}</Button>
            </div>
          )}

          {activeTab === "printer" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">{t(lang, "printerLabel")}</h3>
              <div className="space-y-4">
                <div><label className="text-xs text-muted-foreground">{t(lang, "printerType")}</label>
                  <select value={localPrinter.type} onChange={e => setLocalPrinter({ ...localPrinter, type: e.target.value as any })} className={inputClass}>
                    <option value="80mm">{t(lang, "thermal80")}</option><option value="58mm">{t(lang, "thermal58")}</option><option value="A4">{t(lang, "normalA4")}</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50"><span className="text-sm text-card-foreground">{t(lang, "autoPrintAfterInvoice")}</span><Switch checked={localPrinter.autoPrint} onCheckedChange={v => setLocalPrinter({ ...localPrinter, autoPrint: v })} /></div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50"><span className="text-sm text-card-foreground">{t(lang, "autoOpenDrawer")}</span><Switch checked={localPrinter.openDrawer} onCheckedChange={v => setLocalPrinter({ ...localPrinter, openDrawer: v })} /></div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50"><span className="text-sm text-card-foreground">{t(lang, "printTwoCopies")}</span><Switch checked={localPrinter.printTwoCopies} onCheckedChange={v => setLocalPrinter({ ...localPrinter, printTwoCopies: v })} /></div>
                <Button onClick={handleSavePrinter}>{t(lang, "savePrinterSettings")}</Button>
                <Button variant="outline" onClick={() => { toast({ title: t(lang, "printingTest") }); setTimeout(() => window.print(), 500); }}>{t(lang, "testPrint")}</Button>
              </div>
            </div>
          )}

          {activeTab === "backup" && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-card-foreground">{t(lang, "backupLabel")}</h3>
              <p className="text-sm text-muted-foreground">{t(lang, "lastBackup")} {store.backupSettings.lastBackup}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50"><span className="text-sm text-card-foreground">{t(lang, "autoBackupDaily")}</span><Switch checked={store.backupSettings.autoBackup} onCheckedChange={v => store.updateBackupSettings({ ...store.backupSettings, autoBackup: v })} /></div>
                <div className="w-48"><label className="text-xs text-muted-foreground">{t(lang, "autoBackupTime")}</label><input type="time" value={store.backupSettings.backupTime} onChange={e => store.updateBackupSettings({ ...store.backupSettings, backupTime: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExport}><Download className="w-4 h-4 ml-1" />{t(lang, "exportBackup")}</Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 ml-1" />{t(lang, "restoreBackup")}</Button>
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              </div>
              <div className="p-3 rounded-xl bg-accent/30 text-sm text-accent-foreground">{t(lang, "backupNote")}</div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingRole ? t(lang, "editRole") : t(lang, "addNewRole")}</DialogTitle><DialogDescription>{t(lang, "roleDataDesc")}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-xs text-muted-foreground">{t(lang, "roleName")}</label><input value={roleName} onChange={e => setRoleName(e.target.value)} className={inputClass} placeholder={t(lang, "roleExample")} /></div>
            <div><label className="text-xs text-muted-foreground mb-2 block">{t(lang, "selectPermissions")}</label>
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
              <Button onClick={saveRole} className="flex-1"><Check className="w-4 h-4 ml-1" />{t(lang, "save")}</Button>
              <Button variant="outline" onClick={() => setRoleDialogOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingUser ? t(lang, "editUser") : t(lang, "addNewUser")}</DialogTitle><DialogDescription>{t(lang, "userDataDesc")}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-xs text-muted-foreground">{t(lang, "fullName")}</label><input value={userName} onChange={e => setUserName(e.target.value)} className={inputClass} placeholder={t(lang, "nameExample")} /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, "username")}</label><input value={userUsername} onChange={e => setUserUsername(e.target.value)} className={inputClass} placeholder={t(lang, "usernameExample")} dir="ltr" /></div>
            <div><label className="text-xs text-muted-foreground">{t(lang, "password")}</label>
              <div className="relative"><input type={showPassword ? "text" : "password"} value={userPassword} onChange={e => setUserPassword(e.target.value)} className={inputClass} dir="ltr" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div><label className="text-xs text-muted-foreground">{t(lang, "role")}</label>
              <select value={userRoleId} onChange={e => setUserRoleId(e.target.value)} className={inputClass}>{store.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveUser} className="flex-1"><Check className="w-4 h-4 ml-1" />{t(lang, "save")}</Button>
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
