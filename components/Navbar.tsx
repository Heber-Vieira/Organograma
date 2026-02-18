import * as React from 'react';
import { useState } from 'react';
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
  onBackToDashboard?: () => void;
  t: any;
  companyLogo?: string | null;
  chartName?: string;
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
  onBackToDashboard,
  t,
  companyLogo,
  chartName
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <header className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b shadow-sm sticky top-0 z-50 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isSidebarOpen ? "Recolher Menu" : "Expandir Menu"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
          <div className="bg-[var(--primary-color)] p-1.5 md:p-2 rounded-xl shadow-lg shrink-0">
            <Network className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <h1 className="text-lg md:text-xl font-black tracking-tight uppercase shrink-0">Org<span className="text-[var(--primary-color)]">Flow</span></h1>

          {chartName && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-all">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]" />
              <span className="text-xs md:text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider truncate max-w-[150px] md:max-w-[300px]">
                {chartName}
              </span>
            </div>
          )}

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              Voltar
            </button>
          )}
        </div>

        <div className="flex-1 max-w-md mx-4 md:mx-12 hidden lg:block">
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

        <div className="flex items-center gap-2 md:gap-4">
          {(userName || userEmail) && (
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {t.loggedAs || "Logado como"}
              </span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px]" title={userEmail}>
                {userName || userEmail}
              </span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 md:gap-4">
            <button
              onClick={onToggleDarkMode}
              className="p-2 md:p-2.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onImportClick}
              className="px-3 md:px-4 py-2 bg-[var(--primary-color)] hover:brightness-90 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              title={t.importCsv}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">{t.importCsv}</span>
            </button>

            {userRole === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="px-3 md:px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-[var(--primary-color)] dark:hover:brightness-90 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-md hover:shadow-lg flex items-center gap-2 border border-slate-700 dark:border-white/10"
                title="Painel Administrativo"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
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

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl sm:hidden animate-in slide-in-from-top-2 duration-300 z-50 overflow-hidden">
            <div className="flex flex-col p-4 gap-3">
              <div className="flex items-center justify-between p-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.loggedAs || "Logado como"}</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white uppercase">{userName || userEmail}</span>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex-1 lg:hidden mb-4">
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

              <button
                onClick={() => { onImportClick(); setShowMobileMenu(false); }}
                className="w-full px-4 py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Upload className="w-4 h-4" />
                  <span>{t.importCsv}</span>
                </div>
              </button>

              {userRole === 'admin' && (
                <button
                  onClick={() => { onOpenAdmin(); setShowMobileMenu(false); }}
                  className="w-full px-4 py-3 bg-slate-800 dark:bg-[var(--primary-color)] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </div>
                </button>
              )}

              <button
                onClick={() => { setShowLogoutConfirm(true); setShowMobileMenu(false); }}
                className="w-full px-4 py-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4" />
                  <span>{t.logout || "Sair"}</span>
                </div>
              </button>
            </div>
          </div>
        )}
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
