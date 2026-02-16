import { createContext, useContext, useState, ReactNode, useCallback } from "react";

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
  type: "sale" | "expense" | "revenue" | "purchase" | "salary";
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
  treasury: string;
}

export interface Invoice {
  id: string;
  date: string;
  customer: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: "مكتملة" | "معلقة" | "ملغاة";
  employee: string;
}

// Initial Data
const initialProducts: Product[] = [
  { id: "1", name: "آيفون 15 برو", sku: "IPH-15P", barcode: "1001", category: "هواتف", buyPrice: 1200, sellPrice: 1450, stock: 25, reorderLevel: 10, status: "متوفر" },
  { id: "2", name: "سماعة ايربودز برو", sku: "APD-PRO", barcode: "1002", category: "إكسسوارات", buyPrice: 180, sellPrice: 250, stock: 48, reorderLevel: 20, status: "متوفر" },
  { id: "3", name: "شاحن سريع 65W", sku: "CHR-65W", barcode: "1003", category: "إكسسوارات", buyPrice: 60, sellPrice: 100, stock: 5, reorderLevel: 15, status: "منخفض" },
  { id: "4", name: "كفر حماية شفاف", sku: "CSE-CLR", barcode: "1004", category: "إكسسوارات", buyPrice: 20, sellPrice: 50, stock: 200, reorderLevel: 30, status: "متوفر" },
  { id: "5", name: "كابل تايب سي 2م", sku: "CBL-TC2", barcode: "1005", category: "كابلات", buyPrice: 12, sellPrice: 30, stock: 0, reorderLevel: 50, status: "نفد" },
  { id: "6", name: "سامسونج S24 الترا", sku: "SAM-S24", barcode: "1006", category: "هواتف", buyPrice: 1100, sellPrice: 1350, stock: 18, reorderLevel: 8, status: "متوفر" },
  { id: "7", name: "تابلت آيباد اير", sku: "IPD-AIR", barcode: "1007", category: "أجهزة لوحية", buyPrice: 650, sellPrice: 850, stock: 3, reorderLevel: 5, status: "منخفض" },
  { id: "8", name: "ساعة أبل الترا", sku: "AWU-001", barcode: "1008", category: "ساعات", buyPrice: 750, sellPrice: 950, stock: 15, reorderLevel: 5, status: "متوفر" },
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

const initialTransactions: Transaction[] = [
  { id: "1", date: "2026-02-16", type: "sale", category: "مبيعات", amount: 12450, description: "مبيعات اليوم", paymentMethod: "كاش", treasury: "الخزنة الرئيسية" },
  { id: "2", date: "2026-02-16", type: "expense", category: "إيجار", amount: 5000, description: "إيجار المحل - فبراير", paymentMethod: "تحويل", treasury: "الحساب البنكي" },
  { id: "3", date: "2026-02-15", type: "sale", category: "مبيعات", amount: 9800, description: "مبيعات أمس", paymentMethod: "كاش", treasury: "الخزنة الرئيسية" },
  { id: "4", date: "2026-02-15", type: "expense", category: "رواتب", amount: 8000, description: "راتب موظف كاشير", paymentMethod: "تحويل", treasury: "الحساب البنكي" },
  { id: "5", date: "2026-02-14", type: "purchase", category: "مشتريات", amount: 25000, description: "شحنة هواتف آيفون", paymentMethod: "تحويل", treasury: "الحساب البنكي" },
  { id: "6", date: "2026-02-14", type: "revenue", category: "إيرادات أخرى", amount: 500, description: "بيع كرتون فارغة", paymentMethod: "كاش", treasury: "الخزنة الرئيسية" },
  { id: "7", date: "2026-02-13", type: "expense", category: "كهرباء", amount: 1200, description: "فاتورة الكهرباء", paymentMethod: "تحويل", treasury: "الحساب البنكي" },
  { id: "8", date: "2026-02-13", type: "sale", category: "مبيعات", amount: 15600, description: "مبيعات", paymentMethod: "بطاقة", treasury: "الخزنة الرئيسية" },
];

const initialInvoices: Invoice[] = [
  { id: "1047", date: "2026-02-16 14:30", customer: "أحمد محمد", items: [{ name: "آيفون 15 برو", qty: 1, price: 1450 }], subtotal: 1450, discount: 0, tax: 217.5, total: 1667.5, paymentMethod: "كاش", status: "مكتملة", employee: "محمد الكاشير" },
  { id: "1046", date: "2026-02-16 13:15", customer: "فاطمة علي", items: [{ name: "سماعة ايربودز برو", qty: 1, price: 250 }, { name: "كفر حماية شفاف", qty: 2, price: 50 }], subtotal: 350, discount: 0, tax: 52.5, total: 402.5, paymentMethod: "بطاقة", status: "مكتملة", employee: "محمد الكاشير" },
  { id: "1045", date: "2026-02-16 12:00", customer: "عميل عابر", items: [{ name: "شاحن سريع 65W", qty: 1, price: 100 }], subtotal: 100, discount: 10, tax: 13.5, total: 103.5, paymentMethod: "كاش", status: "مكتملة", employee: "سارة" },
  { id: "1044", date: "2026-02-16 10:45", customer: "خالد سعيد", items: [{ name: "سامسونج S24 الترا", qty: 2, price: 1350 }], subtotal: 2700, discount: 5, tax: 384.75, total: 2949.75, paymentMethod: "آجل", status: "معلقة", employee: "محمد الكاشير" },
];

// Context
interface StoreContextType {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
  invoices: Invoice[];
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
  addInvoice: (inv: Omit<Invoice, "id">) => void;
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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

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
  const addInvoice = useCallback((inv: Omit<Invoice, "id">) => setInvoices(prev => [{ ...inv, id: String(Number(prev[0]?.id || 1000) + 1) }, ...prev]), []);

  return (
    <StoreContext.Provider value={{
      products, customers, suppliers, transactions, invoices,
      addProduct, updateProduct, deleteProduct,
      addCustomer, updateCustomer, deleteCustomer,
      addSupplier, updateSupplier, deleteSupplier,
      addTransaction, addInvoice,
    }}>
      {children}
    </StoreContext.Provider>
  );
};
