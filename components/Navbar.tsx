import * as React from 'react';
import { useState } from 'react';
import { Network, Search, Moon, Sun, Upload, Shield, LogOut, AlertTriangle, X, Menu, ChevronLeft, HelpCircle } from 'lucide-react';

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
  onOpenHelp: () => void;
  onBackToDashboard?: () => void;
  t: any;
  companyLogo?: string | null;
  chartName?: string;
  isReadonly?: boolean;
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
  onOpenHelp,
  t,
  companyLogo,
  chartName,
  isReadonly
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <header className="px-3 md:px-4 py-2 flex items-center justify-between border-b shadow-sm sticky top-0 z-50 bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300 h-14">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isSidebarOpen ? "Recolher Menu" : "Expandir Menu"}
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="bg-[var(--primary-color)] p-1.5 rounded-lg shadow-md shrink-0">
            <Network className="text-white w-5 h-5" />
          </div>
          <h1 className="text-base md:text-lg font-black tracking-tight uppercase shrink-0">Org<span className="text-[var(--primary-color)]">Flow</span></h1>

          {chartName && (
            <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-700/50 transition-all">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]" />
              <span className="text-[10px] md:text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider truncate max-w-[150px] md:max-w-[300px]">
                {chartName}
              </span>
            </div>
          )}

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              Voltar
            </button>
          )}
        </div>

        <div className="flex-1 max-w-sm mx-4 md:mx-8 hidden lg:block">
          <div className="relative flex items-center rounded-xl px-3 py-1.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent dark:border-slate-600 shadow-inner h-9">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="bg-transparent border-none outline-none w-full text-xs font-bold text-slate-700 dark:text-slate-100 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center px-1 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <button
              onClick={onOpenHelp}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-[#4f46e5] hover:shadow-[0_1px_2px_rgb(0,0,0,0.05)] transition-all"
              title="Ajuda"
            >
              <HelpCircle className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-amber-500 hover:shadow-[0_1px_2px_rgb(0,0,0,0.05)] transition-all mx-0.5"
            >
              {isDarkMode ? <Sun className="w-4 h-4" strokeWidth={2} /> : <Moon className="w-4 h-4" strokeWidth={2} />}
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-red-500 hover:shadow-[0_1px_2px_rgb(0,0,0,0.05)] transition-all"
              title={t.logout || "Sair"}
            >
              <LogOut className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200/80 dark:bg-slate-700 hidden md:block"></div>

          <div className="hidden sm:flex items-center gap-3">
            {/* Import Button */}
            {!isReadonly && (
              <button
                onClick={onImportClick}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
                title={t.importCsv}
              >
                <Upload className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="hidden md:inline">{t.importCsv}</span>
              </button>
            )}

            {userRole === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="px-3 py-1.5 bg-[#475569] hover:bg-[#334155] text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_2px_5px_rgb(0,0,0,0.1)] flex items-center gap-1.5"
                title="Admin"
              >
                <Shield className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}
          </div>

          {/* User Info - Navbar */}
          {(userName || userEmail) && (
            <>
              <div className="hidden lg:flex flex-col items-start justify-center ml-1">
                <span className="text-[8px] font-black text-[#818cf8] uppercase tracking-widest leading-none mb-0.5">
                  {t.loggedAs || "Acesso"}
                </span>
                <span className="text-xs font-bold text-[#334155] dark:text-slate-300 leading-none truncate max-w-[120px]" title={userEmail}>
                  {userName || userEmail}
                </span>
              </div>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
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

              {!isReadonly && (
                <button
                  onClick={() => { onImportClick(); setShowMobileMenu(false); }}
                  className="w-full px-4 py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="w-4 h-4" />
                    <span>{t.importCsv}</span>
                  </div>
                </button>
              )}

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
