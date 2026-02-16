import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="mr-[240px] min-h-screen transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
