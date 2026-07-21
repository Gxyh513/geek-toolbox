import Header from './Header';
import Sidebar from './Sidebar';
import ToastContainer from '../ui/Toast';
import CommandPalette from '../search/CommandPalette';

/**
 * 应用整体外壳布局
 * 三栏结构：Header + (Sidebar | Main Content)
 */
export default function AppShell({ children }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-[#0d1117]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0d1117]">
          {children}
        </main>
      </div>
      <ToastContainer />
      <CommandPalette />
    </div>
  );
}
