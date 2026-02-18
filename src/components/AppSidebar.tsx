import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, Users, Truck, BarChart3, Wallet, Settings, ChevronLeft, Store, Receipt,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { t } from "@/i18n/translations";

const AppSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { storeInfo } = useStore();
  const lang = storeInfo.language as "العربية" | "English";

  const navItems = [
    { label: t(lang, "dashboard"), icon: LayoutDashboard, path: "/" },
    { label: t(lang, "pos"), icon: ShoppingCart, path: "/pos" },
    { label: t(lang, "salesNav"), icon: Receipt, path: "/sales" },
    { label: t(lang, "products"), icon: Package, path: "/products" },
    { label: t(lang, "customers"), icon: Users, path: "/customers" },
    { label: t(lang, "suppliers"), icon: Truck, path: "/suppliers" },
    { label: t(lang, "accounting"), icon: Wallet, path: "/accounting" },
    { label: t(lang, "reports"), icon: BarChart3, path: "/reports" },
    { label: t(lang, "settings"), icon: Settings, path: "/settings" },
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 right-0 h-screen bg-sidebar border-l border-sidebar-border flex flex-col z-50 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-sidebar-foreground font-bold text-lg whitespace-nowrap">
            {t(lang, "appName")}
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive ? "bg-primary text-primary-foreground shadow-md" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button onClick={() => setCollapsed(!collapsed)}
        className="h-12 flex items-center justify-center border-t border-sidebar-border text-sidebar-foreground hover:text-primary transition-colors">
        <ChevronLeft className={cn("w-5 h-5 transition-transform duration-300", collapsed && "rotate-180")} />
      </button>
    </aside>
  );
};

export default AppSidebar;
