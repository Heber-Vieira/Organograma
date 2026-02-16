import React, { useState } from 'react';
import { Network, Search, Moon, Sun, Upload, Shield, LogOut, AlertTriangle, X, Menu, ChevronLeft } from 'lucide-react';

interface NavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onImportClick: () => void;
  onLogout: () => void;
  userEmail?: string;
  userName?: string; // Nova prop
  userRole?: 'admin' | 'user';
  onOpenAdmin: () => void;
  t: any;
}

const Navbar: React.FC<NavbarProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  searchTerm,
  onSearchChange,
  isDarkMode,
  onToggleDarkMode,
  onImportClick,
  onLogout,
  userEmail,
  userName, // Recebendo o nome
  userRole,
  onOpenAdmin,
  t
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header className="px-6 py-4 flex items-center justify-between border-b shadow-sm sticky top-0 z-50 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isSidebarOpen ? "Recolher Menu" : "Expandir Menu"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="bg-gradient-to-tr from-[#00897b] to-[#43a047] p-2 rounded-xl shadow-lg">
            <Network className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight uppercase">Org<span className="text-[#00897b]">Flow</span></h1>
        </div>

        <div className="flex-1 max-w-md mx-12 hidden md:block">
          <div className="relative flex items-center rounded-2xl px-4 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent dark:border-slate-600 shadow-inner">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="bg-transparent border-none outline-none w-full text-sm font-bold text-slate-700 dark:text-slate-100"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {(userName || userEmail) && (
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t.loggedAs || "Logado como"}
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200" title={userEmail}>
                {userName || userEmail}
              </span>
            </div>
          )}
          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={onImportClick}
            className="px-4 py-2 bg-[#00897b] hover:bg-[#00796b] text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            title={t.importCsv}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">{t.importCsv}</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg flex items-center gap-2 border border-slate-700 dark:border-indigo-500"
              title="Painel Administrativo"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
            title={t.logout || "Sair"}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
            <div className="mb-4 w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Sair do Sistema</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Tem certeza que deseja encerrar sua sessão?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
