import { Sidebar, SidebarTrigger } from "@/components/ui/sidebar";

export function MenuSidebar() {
  return (
    <Sidebar side="left">
      <div className="flex flex-col h-full bg-kahra-darker border-r border-kahra-dark/50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Explore</h2>
            <SidebarTrigger className="text-gray-400 hover:text-white transition-colors" />
          </div>
          <nav className="flex-1">
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Careers</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </Sidebar>
  );
}
