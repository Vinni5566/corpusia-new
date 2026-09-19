import { Outlet } from "react-router-dom";
import AmbientBackground from "@/components/corpus/AmbientBackground";
import AppSidebar from "@/components/corpus/AppSidebar";
import AppTopbar from "@/components/corpus/AppTopbar";
import MobileNav from "@/components/corpus/MobileNav";
import { CorpusDataProvider } from "@/context/CorpusDataContext";
import { AuthProvider } from "@/context/AuthContext";

export default function AppLayout() {
  return (
    <AuthProvider>
      <CorpusDataProvider>
        <AmbientBackground />
        <div className="relative min-h-screen md:pl-64">
          <AppSidebar />
          <AppTopbar />
          <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
            <Outlet />
          </main>
          <MobileNav />
        </div>
      </CorpusDataProvider>
    </AuthProvider>
  );
}
