import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/AppSidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { MainNavigation } from "@/components/navigation/MainNavigation";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" attribute="class">
          <SidebarProvider>
            <div className="flex h-screen">
              <AppSidebar />
              <MenuSidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <MainNavigation />
                <main className="flex-1 overflow-y-auto bg-background">
                  <Outlet />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;