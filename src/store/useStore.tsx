import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

// Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  reorderLevel: number;
  status: string;
  unit?: string;
  subUnits?: { name: string; factor: number; price: number }[];
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  type: "VIP" | "عادي" | "جملة";
  loyaltyPoints: number;
  creditLimit: number;
  balance: number;
  totalPurchases: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  creditLimit: number;
  balance: number;
  notes: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: "sale" | "expense" | "revenue" | "purchase" | "salary" | "return";
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  treasury: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  returnedQty?: number;
}

export interface Invoice {
  id: string;
  date: string;
  customer: string;
  customerId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: "مكتملة" | "معلقة" | "ملغاة" | "مرتجعة" | "مرتجع جزئي" | "مدفوع جزئي";
  employee: string;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  notes?: string;
  paidAmount?: number;
}

export interface InventoryLog {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: "sale" | "purchase" | "return" | "adjustment";
  qty: number;
  previousStock: number;
  newStock: number;
  reference?: string;
}

export interface AuditLog {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
}

export interface StoreInfo {
  name: string;
  phone: string;
  address: string;
  taxNumber: string;
  crNumber: string;
  currency: string;
  language: string;
}

export interface TaxSettings {
  enabled: boolean;
  rate: number;
  includedInPrice: boolean;
}

export interface LoyaltySettings {
  enabled: boolean;
  pointsPerUnit: number;
  pointValue: number;
  showOnReceipt: boolean;
  allowUnregistered: boolean;
}

export interface PrinterSettings {
  type: "80mm" | "58mm" | "A4";
  autoPrint: boolean;
  openDrawer: boolean;
  printTwoCopies: boolean;
}

export interface NotificationSettings {
  lowStock: boolean;
  expiryAlert: boolean;
  creditLimit: boolean;
  dueInvoices: boolean;
  dailySummary: boolean;
}

export interface BackupSettings {
  autoBackup: boolean;
  backupTime: string;
  lastBackup: string;
}

export interface GeneralSettings {
  enableQrCode: boolean;
  enableBarcode: boolean;
  screenLockTimeout: number;
}

export interface Permission {
  key: string;
  label: string;
}

export const ALL_PERMISSIONS: Permission[] = [
  { key: "pos", label: "نقاط البيع" },
  { key: "products", label: "المنتجات" },
  { key: "customers", label: "العملاء" },
  { key: "suppliers", label: "الموردين" },
  { key: "accounting", label: "الحسابات" },
  { key: "reports", label: "التقارير" },
  { key: "settings", label: "الإعدادات" },
  { key: "delete_invoices", label: "حذف الفواتير" },
  { key: "edit_prices", label: "تعديل الأسعار" },
  { key: "view_profits", label: "رؤية الأرباح" },
  { key: "inventory", label: "المخزون" },
  { key: "sales", label: "المبيعات" },
];

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  password: string;
  roleId: string;
  active: boolean;
}

// Initial Data
const initialProducts: Product[] = [
  { id: "1", name: "آيفون 15 برو", sku: "IPH-15P", barcode: "1001", category: "هواتف", buyPrice: 1200, sellPrice: 1450, stock: 25, reorderLevel: 10, status: "متوفر", unit: "قطعة" },
  { id: "2", name: "سماعة ايربودز برو", sku: "APD-PRO", barcode: "1002", category: "إكسسوارات", buyPrice: 180, sellPrice: 250, stock: 48, reorderLevel: 20, status: "متوفر", unit: "قطعة" },
  { id: "3", name: "شاحن سريع 65W", sku: "CHR-65W", barcode: "1003", category: "إكسسوارات", buyPrice: 60, sellPrice: 100, stock: 5, reorderLevel: 15, status: "منخفض", unit: "قطعة" },
  { id: "4", name: "كفر حماية شفاف", sku: "CSE-CLR", barcode: "1004", category: "إكسسوارات", buyPrice: 20, sellPrice: 50, stock: 200, reorderLevel: 30, status: "متوفر", unit: "قطعة" },
  { id: "5", name: "كابل تايب سي 2م", sku: "CBL-TC2", barcode: "1005", category: "كابلات", buyPrice: 12, sellPrice: 30, stock: 0, reorderLevel: 50, status: "نفد", unit: "قطعة" },
  { id: "6", name: "سامسونج S24 الترا", sku: "SAM-S24", barcode: "1006", category: "هواتف", buyPrice: 1100, sellPrice: 1350, stock: 18, reorderLevel: 8, status: "متوفر", unit: "قطعة" },
  { id: "7", name: "تابلت آيباد اير", sku: "IPD-AIR", barcode: "1007", category: "أجهزة لوحية", buyPrice: 650, sellPrice: 850, stock: 3, reorderLevel: 5, status: "منخفض", unit: "قطعة" },
  { id: "8", name: "ساعة أبل الترا", sku: "AWU-001", barcode: "1008", category: "ساعات", buyPrice: 750, sellPrice: 950, stock: 15, reorderLevel: 5, status: "متوفر", unit: "قطعة" },
];

const initialCustomers: Customer[] = [
  { id: "1", name: "أحمد محمد", phone: "0501234567", address: "الرياض - حي النزهة", notes: "عميل مميز", type: "VIP", loyaltyPoints: 1250, creditLimit: 5000, balance: 1200, totalPurchases: 45600 },
  { id: "2", name: "فاطمة علي", phone: "0559876543", address: "جدة - حي الصفا", notes: "", type: "عادي", loyaltyPoints: 320, creditLimit: 2000, balance: 0, totalPurchases: 12300 },
  { id: "3", name: "خالد سعيد", phone: "0541112233", address: "الدمام - حي الفيصلية", notes: "يفضل الدفع الآجل", type: "جملة", loyaltyPoints: 890, creditLimit: 15000, balance: 4500, totalPurchases: 89000 },
  { id: "4", name: "نورة أحمد", phone: "0567778899", address: "الرياض - حي العليا", notes: "", type: "عادي", loyaltyPoints: 150, creditLimit: 1000, balance: 0, totalPurchases: 5400 },
  { id: "5", name: "عبدالله العتيبي", phone: "0533445566", address: "مكة - حي العزيزية", notes: "تاجر جملة أجهزة", type: "جملة", loyaltyPoints: 2100, creditLimit: 25000, balance: 8900, totalPurchases: 156000 },
];

const initialSuppliers: Supplier[] = [
  { id: "1", name: "شركة التقنية المتقدمة", phone: "0112345678", address: "الرياض - المنطقة الصناعية", email: "info@advtech.sa", creditLimit: 100000, balance: 15000, notes: "مورد رئيسي للهواتف" },
  { id: "2", name: "مؤسسة الإلكترونيات الحديثة", phone: "0126543210", address: "جدة - حي الصناعية", email: "sales@modern-elec.sa", creditLimit: 50000, balance: 8000, notes: "إكسسوارات وكابلات" },
  { id: "3", name: "شركة سمارت للتوزيع", phone: "0138765432", address: "الدمام - المنطقة الحرة", email: "orders@smartdist.sa", creditLimit: 75000, balance: 0, notes: "أجهزة لوحية وساعات" },
];

const initialTransactions: Transaction[] = [];

const initialInvoices: Invoice[] = [];

const initialCategories: string[] = ["هواتف", "إكسسوارات", "كابلات", "أجهزة لوحية", "ساعات", "كمبيوتر"];

const initialRoles: Role[] = [
  { id: "1", name: "مدير", permissions: ALL_PERMISSIONS.map(p => p.key) },
  { id: "2", name: "مشرف", permissions: ["pos", "products", "customers", "reports", "view_profits", "sales"] },
  { id: "3", name: "كاشير", permissions: ["pos", "customers", "sales"] },
  { id: "4", name: "أمين مخزن", permissions: ["products", "inventory", "suppliers"] },
  { id: "5", name: "محاسب", permissions: ["accounting", "reports", "view_profits"] },
];

const initialUsers: SystemUser[] = [
  { id: "1", name: "أحمد المدير", username: "admin", password: "admin123", roleId: "1", active: true },
  { id: "2", name: "محمد الكاشير", username: "cashier1", password: "cash123", roleId: "3", active: true },
  { id: "3", name: "سارة", username: "sara", password: "sara123", roleId: "3", active: true },
];

// localStorage helpers
const STORAGE_KEY = "cashier-pro-data";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return data[key] !== undefined ? data[key] : fallback;
  } catch { return fallback; }
}

function saveToStorage(data: Record<string, any>) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch { /* ignore */ }
}

// Context
interface StoreContextType {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
  invoices: Invoice[];
  categories: string[];
  inventoryLogs: InventoryLog[];
  auditLogs: AuditLog[];
  storeInfo: StoreInfo;
  taxSettings: TaxSettings;
  loyaltySettings: LoyaltySettings;
  printerSettings: PrinterSettings;
  notificationSettings: NotificationSettings;
  backupSettings: BackupSettings;
  generalSettings: GeneralSettings;
  roles: Role[];
  systemUsers: SystemUser[];
  currentUser: SystemUser | null;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (c: Omit<Customer, "id">) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;
  addSupplier: (s: Omit<Supplier, "id">) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  addInvoice: (inv: Omit<Invoice, "id">) => string;
  updateInvoice: (inv: Invoice) => void;
  addCategory: (cat: string) => void;
  deleteCategory: (cat: string) => boolean;
  addInventoryLog: (log: Omit<InventoryLog, "id">) => void;
  addAuditLog: (log: Omit<AuditLog, "id">) => void;
  updateStoreInfo: (info: StoreInfo) => void;
  updateTaxSettings: (settings: TaxSettings) => void;
  updateLoyaltySettings: (settings: LoyaltySettings) => void;
  updatePrinterSettings: (settings: PrinterSettings) => void;
  updateNotificationSettings: (settings: NotificationSettings) => void;
  updateBackupSettings: (settings: BackupSettings) => void;
  updateGeneralSettings: (settings: GeneralSettings) => void;
  addRole: (role: Omit<Role, "id">) => void;
  updateRole: (role: Role) => void;
  deleteRole: (id: string) => void;
  addSystemUser: (user: Omit<SystemUser, "id">) => void;
  updateSystemUser: (user: SystemUser) => void;
  deleteSystemUser: (id: string) => void;
  login: (username: string, password: string) => SystemUser | null;
  logout: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  getNextInvoiceId: () => string;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
};

let nextId = 100;
const genId = () => String(++nextId);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage("products", initialProducts));
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage("customers", initialCustomers));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadFromStorage("suppliers", initialSuppliers));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage("transactions", initialTransactions));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage("invoices", initialInvoices));
  const [categories, setCategories] = useState<string[]>(() => loadFromStorage("categories", initialCategories));
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => loadFromStorage("inventoryLogs", []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage("auditLogs", []));
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => loadFromStorage("storeInfo", {
    name: "متجر التقنية الحديثة", phone: "0112345678",
    address: "الرياض - حي العليا - شارع التحلية", taxNumber: "300123456700003",
    crNumber: "1010123456", currency: "ر.س", language: "العربية",
  }));
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(() => loadFromStorage("taxSettings", { enabled: true, rate: 15, includedInPrice: false }));
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>(() => loadFromStorage("loyaltySettings", { enabled: true, pointsPerUnit: 1, pointValue: 0.1, showOnReceipt: true, allowUnregistered: true }));
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>(() => loadFromStorage("printerSettings", { type: "80mm", autoPrint: true, openDrawer: true, printTwoCopies: false }));
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => loadFromStorage("notificationSettings", { lowStock: true, expiryAlert: true, creditLimit: true, dueInvoices: true, dailySummary: false }));
  const [backupSettings, setBackupSettings] = useState<BackupSettings>(() => loadFromStorage("backupSettings", { autoBackup: true, backupTime: "02:00", lastBackup: "" }));
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(() => loadFromStorage("generalSettings", { enableQrCode: true, enableBarcode: true, screenLockTimeout: 0 }));
  const [roles, setRoles] = useState<Role[]>(() => loadFromStorage("roles", initialRoles));
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => loadFromStorage("systemUsers", initialUsers));
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => loadFromStorage("currentUser", null));

  // Auto-save to localStorage
  useEffect(() => {
    saveToStorage({ products, customers, suppliers, transactions, invoices, categories, inventoryLogs, auditLogs, storeInfo, taxSettings, loyaltySettings, printerSettings, notificationSettings, backupSettings, generalSettings, roles, systemUsers, currentUser });
  }, [products, customers, suppliers, transactions, invoices, categories, inventoryLogs, auditLogs, storeInfo, taxSettings, loyaltySettings, printerSettings, notificationSettings, backupSettings, generalSettings, roles, systemUsers, currentUser]);

  const addProduct = useCallback((p: Omit<Product, "id">) => setProducts(prev => [...prev, { ...p, id: genId() }]), []);
  const updateProduct = useCallback((p: Product) => setProducts(prev => prev.map(x => x.id === p.id ? p : x)), []);
  const deleteProduct = useCallback((id: string) => setProducts(prev => prev.filter(x => x.id !== id)), []);

  const addCustomer = useCallback((c: Omit<Customer, "id">) => setCustomers(prev => [...prev, { ...c, id: genId() }]), []);
  const updateCustomer = useCallback((c: Customer) => setCustomers(prev => prev.map(x => x.id === c.id ? c : x)), []);
  const deleteCustomer = useCallback((id: string) => setCustomers(prev => prev.filter(x => x.id !== id)), []);

  const addSupplier = useCallback((s: Omit<Supplier, "id">) => setSuppliers(prev => [...prev, { ...s, id: genId() }]), []);
  const updateSupplier = useCallback((s: Supplier) => setSuppliers(prev => prev.map(x => x.id === s.id ? s : x)), []);
  const deleteSupplier = useCallback((id: string) => setSuppliers(prev => prev.filter(x => x.id !== id)), []);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => setTransactions(prev => [{ ...t, id: genId() }, ...prev]), []);

  const getNextInvoiceId = useCallback(() => {
    const maxId = invoices.reduce((max, inv) => Math.max(max, Number(inv.id) || 0), 1000);
    return String(maxId + 1);
  }, [invoices]);

  const addInvoice = useCallback((inv: Omit<Invoice, "id">): string => {
    const id = getNextInvoiceId();
    setInvoices(prev => [{ ...inv, id }, ...prev]);
    return id;
  }, [getNextInvoiceId]);

  const updateInvoice = useCallback((inv: Invoice) => setInvoices(prev => prev.map(x => x.id === inv.id ? inv : x)), []);

  const addCategory = useCallback((cat: string) => setCategories(prev => prev.includes(cat) ? prev : [...prev, cat]), []);
  const deleteCategory = useCallback((cat: string): boolean => {
    const hasProducts = products.some(p => p.category === cat);
    if (hasProducts) return false;
    setCategories(prev => prev.filter(c => c !== cat));
    return true;
  }, [products]);

  const addInventoryLog = useCallback((log: Omit<InventoryLog, "id">) => setInventoryLogs(prev => [{ ...log, id: genId() }, ...prev]), []);
  const addAuditLog = useCallback((log: Omit<AuditLog, "id">) => setAuditLogs(prev => [{ ...log, id: genId() }, ...prev]), []);

  const updateStoreInfo = useCallback((info: StoreInfo) => setStoreInfo(info), []);
  const updateTaxSettings = useCallback((s: TaxSettings) => setTaxSettings(s), []);
  const updateLoyaltySettings = useCallback((s: LoyaltySettings) => setLoyaltySettings(s), []);
  const updatePrinterSettings = useCallback((s: PrinterSettings) => setPrinterSettings(s), []);
  const updateNotificationSettings = useCallback((s: NotificationSettings) => setNotificationSettings(s), []);
  const updateBackupSettings = useCallback((s: BackupSettings) => setBackupSettings(s), []);
  const updateGeneralSettings = useCallback((s: GeneralSettings) => setGeneralSettings(s), []);

  const addRole = useCallback((r: Omit<Role, "id">) => setRoles(prev => [...prev, { ...r, id: genId() }]), []);
  const updateRole = useCallback((r: Role) => setRoles(prev => prev.map(x => x.id === r.id ? r : x)), []);
  const deleteRole = useCallback((id: string) => setRoles(prev => prev.filter(x => x.id !== id)), []);

  const addSystemUser = useCallback((u: Omit<SystemUser, "id">) => setSystemUsers(prev => [...prev, { ...u, id: genId() }]), []);
  const updateSystemUser = useCallback((u: SystemUser) => setSystemUsers(prev => prev.map(x => x.id === u.id ? u : x)), []);
  const deleteSystemUser = useCallback((id: string) => setSystemUsers(prev => prev.filter(x => x.id !== id)), []);

  const login = useCallback((username: string, password: string): SystemUser | null => {
    const user = systemUsers.find(u => u.username === username && u.password === password && u.active);
    if (user) setCurrentUser(user);
    return user || null;
  }, [systemUsers]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const exportData = useCallback(() => {
    return JSON.stringify({
      products, customers, suppliers, transactions, invoices, categories, inventoryLogs, auditLogs,
      storeInfo, taxSettings, loyaltySettings, printerSettings, notificationSettings, backupSettings, generalSettings, roles, systemUsers,
      exportDate: new Date().toISOString(),
    }, null, 2);
  }, [products, customers, suppliers, transactions, invoices, categories, inventoryLogs, auditLogs, storeInfo, taxSettings, loyaltySettings, printerSettings, notificationSettings, backupSettings, generalSettings, roles, systemUsers]);

  const importData = useCallback((json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.products) setProducts(data.products);
      if (data.customers) setCustomers(data.customers);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.transactions) setTransactions(data.transactions);
      if (data.invoices) setInvoices(data.invoices);
      if (data.categories) setCategories(data.categories);
      if (data.inventoryLogs) setInventoryLogs(data.inventoryLogs);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.storeInfo) setStoreInfo(data.storeInfo);
      if (data.taxSettings) setTaxSettings(data.taxSettings);
      if (data.loyaltySettings) setLoyaltySettings(data.loyaltySettings);
      if (data.printerSettings) setPrinterSettings(data.printerSettings);
      if (data.notificationSettings) setNotificationSettings(data.notificationSettings);
      if (data.generalSettings) setGeneralSettings(data.generalSettings);
      if (data.roles) setRoles(data.roles);
      if (data.systemUsers) setSystemUsers(data.systemUsers);
      setBackupSettings(prev => ({ ...prev, lastBackup: new Date().toLocaleString("ar-EG") }));
      return true;
    } catch { return false; }
  }, []);

  return (
    <StoreContext.Provider value={{
      products, customers, suppliers, transactions, invoices, categories, inventoryLogs, auditLogs,
      storeInfo, taxSettings, loyaltySettings, printerSettings, notificationSettings, backupSettings, generalSettings, roles, systemUsers, currentUser,
      addProduct, updateProduct, deleteProduct,
      addCustomer, updateCustomer, deleteCustomer,
      addSupplier, updateSupplier, deleteSupplier,
      addTransaction, addInvoice, updateInvoice,
      addCategory, deleteCategory,
      addInventoryLog, addAuditLog,
      updateStoreInfo, updateTaxSettings, updateLoyaltySettings, updatePrinterSettings, updateNotificationSettings, updateBackupSettings, updateGeneralSettings,
      addRole, updateRole, deleteRole,
      addSystemUser, updateSystemUser, deleteSystemUser,
      login, logout,
      exportData, importData, getNextInvoiceId,
    }}>
      {children}
    </StoreContext.Provider>
  );
};
