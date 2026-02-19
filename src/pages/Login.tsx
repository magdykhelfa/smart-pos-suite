import { useState } from "react";
import { Store, Eye, EyeOff, LogIn } from "lucide-react";
import { useStore } from "@/store/useStore";
import { t } from "@/i18n/translations";
import { Button } from "@/components/ui/button";

const Login = () => {
  const { login, storeInfo } = useStore();
  const lang = storeInfo.language as "العربية" | "English";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = login(username, password);
    if (!user) {
      setError(t(lang, "loginError"));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={lang === "English" ? "ltr" : "rtl"}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{storeInfo.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t(lang, "loginDesc")}</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-card-foreground text-center">{t(lang, "loginTitle")}</h2>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs text-muted-foreground">{t(lang, "username")}</label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={t(lang, "usernameExample")} dir="ltr" autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">{t(lang, "password")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-muted border-0 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" dir="ltr"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 accent-primary rounded" />
            <span className="text-xs text-muted-foreground">{t(lang, "rememberMe")}</span>
          </label>

          <Button type="submit" className="w-full h-11">
            <LogIn className="w-4 h-4 ml-2" />
            {t(lang, "loginButton")}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">admin / admin123</p>
        </form>
      </div>
    </div>
  );
};

export default Login;
