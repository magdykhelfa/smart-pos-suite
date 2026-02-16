export const salesData = [
  { month: "يناير", sales: 42000, lastYear: 35000 },
  { month: "فبراير", sales: 38000, lastYear: 32000 },
  { month: "مارس", sales: 51000, lastYear: 41000 },
  { month: "أبريل", sales: 47000, lastYear: 44000 },
  { month: "مايو", sales: 53000, lastYear: 46000 },
  { month: "يونيو", sales: 49000, lastYear: 43000 },
  { month: "يوليو", sales: 61000, lastYear: 50000 },
];

export const topProducts = [
  { name: "آيفون 15 برو", sold: 145, revenue: 210250 },
  { name: "سماعة ايربودز", sold: 230, revenue: 57500 },
  { name: "شاحن سريع 65W", sold: 312, revenue: 31200 },
  { name: "كفر حماية", sold: 450, revenue: 22500 },
  { name: "كابل تايب سي", sold: 520, revenue: 15600 },
];

export const alerts = [
  { type: "warning" as const, message: "5 منتجات قاربت على النفاد", time: "منذ 10 دقائق" },
  { type: "error" as const, message: "3 منتجات انتهت صلاحيتها", time: "منذ ساعة" },
  { type: "info" as const, message: "فاتورة آجل مستحقة: عميل أحمد", time: "منذ 3 ساعات" },
  { type: "warning" as const, message: "عميل تجاوز الحد الائتماني", time: "منذ 5 ساعات" },
];

export const posProducts = [
  { id: "1", name: "آيفون 15 برو", price: 1450, category: "هواتف", barcode: "1001", stock: 25 },
  { id: "2", name: "سماعة ايربودز برو", price: 250, category: "إكسسوارات", barcode: "1002", stock: 48 },
  { id: "3", name: "شاحن سريع 65W", price: 100, category: "إكسسوارات", barcode: "1003", stock: 120 },
  { id: "4", name: "كفر حماية شفاف", price: 50, category: "إكسسوارات", barcode: "1004", stock: 200 },
  { id: "5", name: "كابل تايب سي 2م", price: 30, category: "كابلات", barcode: "1005", stock: 300 },
  { id: "6", name: "سامسونج S24 الترا", price: 1350, category: "هواتف", barcode: "1006", stock: 18 },
  { id: "7", name: "تابلت آيباد اير", price: 850, category: "أجهزة لوحية", barcode: "1007", stock: 12 },
  { id: "8", name: "ساعة أبل الترا", price: 950, category: "ساعات", barcode: "1008", stock: 15 },
  { id: "9", name: "شاحن لاسلكي", price: 75, category: "إكسسوارات", barcode: "1009", stock: 90 },
  { id: "10", name: "باور بانك 20000", price: 120, category: "إكسسوارات", barcode: "1010", stock: 65 },
  { id: "11", name: "ماوس لوجيتك", price: 45, category: "كمبيوتر", barcode: "1011", stock: 80 },
  { id: "12", name: "لوحة مفاتيح ميكانيكية", price: 180, category: "كمبيوتر", barcode: "1012", stock: 35 },
];

export const categories = ["الكل", "هواتف", "إكسسوارات", "كابلات", "أجهزة لوحية", "ساعات", "كمبيوتر"];

export const inventoryProducts = [
  { id: "1", name: "آيفون 15 برو", sku: "IPH-15P", barcode: "1001", category: "هواتف", buyPrice: 1200, sellPrice: 1450, stock: 25, reorderLevel: 10, status: "متوفر" },
  { id: "2", name: "سماعة ايربودز برو", sku: "APD-PRO", barcode: "1002", category: "إكسسوارات", buyPrice: 180, sellPrice: 250, stock: 48, reorderLevel: 20, status: "متوفر" },
  { id: "3", name: "شاحن سريع 65W", sku: "CHR-65W", barcode: "1003", category: "إكسسوارات", buyPrice: 60, sellPrice: 100, stock: 5, reorderLevel: 15, status: "منخفض" },
  { id: "4", name: "كفر حماية شفاف", sku: "CSE-CLR", barcode: "1004", category: "إكسسوارات", buyPrice: 20, sellPrice: 50, stock: 200, reorderLevel: 30, status: "متوفر" },
  { id: "5", name: "كابل تايب سي 2م", sku: "CBL-TC2", barcode: "1005", category: "كابلات", buyPrice: 12, sellPrice: 30, stock: 0, reorderLevel: 50, status: "نفد" },
  { id: "6", name: "سامسونج S24 الترا", sku: "SAM-S24", barcode: "1006", category: "هواتف", buyPrice: 1100, sellPrice: 1350, stock: 18, reorderLevel: 8, status: "متوفر" },
  { id: "7", name: "تابلت آيباد اير", sku: "IPD-AIR", barcode: "1007", category: "أجهزة لوحية", buyPrice: 650, sellPrice: 850, stock: 3, reorderLevel: 5, status: "منخفض" },
  { id: "8", name: "ساعة أبل الترا", sku: "AWU-001", barcode: "1008", category: "ساعات", buyPrice: 750, sellPrice: 950, stock: 15, reorderLevel: 5, status: "متوفر" },
];
