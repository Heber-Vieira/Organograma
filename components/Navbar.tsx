import * as React from 'react';
import { useState } from 'react';
import { Network, Search, Moon, Sun, Upload, Shield, LogOut, X, Menu, ChevronLeft, HelpCircle, Lock, LockOpen } from 'lucide-react';

/* ─── Stable helper components outside to prevent re-mount ────────── */

interface IconBtnProps {
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
  danger?: boolean;
  active?: boolean;
  activeColor?: string;
  isDarkMode: boolean;
}

const IconBtn: React.FC<IconBtnProps> = ({
  onClick, title, children, danger, active, activeColor, isDarkMode
}) => (
  <button
    onClick={onClick}
    onMouseDown={(e) => e.stopPropagation()} // Prevent map panning interference
    title={title}
    style={{
      width: 32, height: 32, border: 'none', borderRadius: 8,
      background: active
        ? (activeColor ? `${activeColor}18` : 'rgba(239,68,68,0.1)')
        : 'transparent',
      color: active
        ? (activeColor || '#ef4444')
        : isDarkMode ? '#94a3b8' : '#64748b',
      cursor: 'pointer', display: 'flex', alignItems: 'center',
      justifyContent: 'center', transition: 'all .15s', flexShrink: 0,
      position: 'relative'
    }}
    onMouseEnter={e => {
      const btn = e.currentTarget as HTMLButtonElement;
      if (!active) {
        btn.style.background = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
        if (danger) btn.style.color = '#ef4444';
      }
    }}
    onMouseLeave={e => {
      const btn = e.currentTarget as HTMLButtonElement;
      if (!active) {
        btn.style.background = 'transparent';
        btn.style.color = isDarkMode ? '#94a3b8' : '#64748b';
      }
    }}
  >
    {children}
  </button>
);

/* ─── Main component ─────────────────────────────────────────────── */

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
  userName?: string;
  userRole?: 'admin' | 'user';
  onOpenAdmin: () => void;
  onOpenHelp: () => void;
  onBackToDashboard?: () => void;
  t: any;
  companyLogo?: string | null;
  chartName?: string;
  isReadonly?: boolean;
  isDragLocked?: boolean;
  onToggleDragLock?: () => void;
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
  userName,
  userRole,
  onOpenAdmin,
  onBackToDashboard,
  onOpenHelp,
  t,
  companyLogo,
  chartName,
  isReadonly,
  isDragLocked,
  onToggleDragLock
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const displayName = userName || userEmail || 'Usuário';
  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  const handleConfirmLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px 0 8px',
        gap: 8,
        background: isDarkMode
          ? 'rgba(15,23,42,0.95)'
          : 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.07)',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 12px rgba(0,0,0,0.06)'
      }}>

        {/* ── LEFT: Logo + Chart pill + Back ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <IconBtn onClick={onToggleSidebar} title={isSidebarOpen ? 'Recolher' : 'Expandir'} isDarkMode={isDarkMode}>
            {isSidebarOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
          </IconBtn>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 6px 0 2px' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'var(--primary-color, #f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.18)', flexShrink: 0
            }}>
              <Network size={14} color="#fff" />
            </div>
            <span style={{
              fontSize: 14, fontWeight: 900, letterSpacing: '-0.03em',
              color: isDarkMode ? '#f1f5f9' : '#0f172a',
              textTransform: 'uppercase', lineHeight: 1
            }}>
              Org<span style={{ color: 'var(--primary-color, #f97316)' }}>Flow</span>
            </span>
          </div>

          {chartName && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '3px 10px 3px 6px',
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
              borderRadius: 8
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary-color, #f97316)', flexShrink: 0 }} />
              <span style={{
                fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: isDarkMode ? '#cbd5e1' : '#475569',
                maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {chartName}
              </span>
            </div>
          )}

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', border: 'none', borderRadius: 7, cursor: 'pointer',
                background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                color: isDarkMode ? '#94a3b8' : '#64748b',
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', transition: 'all .15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.09)' : '#e2e8f0')}
              onMouseLeave={e => (e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9')}
            >
              <ChevronLeft size={12} />Voltar
            </button>
          )}
        </div>

        {/* ── CENTER: Search ── */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 16px', maxWidth: 460, margin: '0 auto' }} className="hidden lg:flex">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 12px', height: 34, borderRadius: 10,
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            border: searchFocused
              ? `1.5px solid var(--primary-color, #f97316)`
              : isDarkMode ? '1.5px solid rgba(255,255,255,0.07)' : '1.5px solid #e2e8f0',
            transition: 'border-color .2s, box-shadow .2s',
            boxShadow: searchFocused ? '0 0 0 3px var(--primary-color, #f97316)18' : 'none',
            width: '100%', maxWidth: 380
          }}>
            <Search size={13} color="#94a3b8" />
            <input
              type="text"
              placeholder={t.searchPlaceholder || 'Buscar...'}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 12, fontWeight: 500, color: isDarkMode ? '#e2e8f0' : '#334155'
              }}
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onMouseDown={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, color: '#94a3b8', display: 'flex' }}
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: Actions + User ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 'auto' }}>
          <div style={{
            alignItems: 'center',
            background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e9ecef',
            borderRadius: 10, padding: '2px 4px', gap: 1
          }} className="hidden sm:flex">
            <IconBtn onClick={onOpenHelp} title="Ajuda" isDarkMode={isDarkMode}><HelpCircle size={15} /></IconBtn>
            <IconBtn onClick={onToggleDarkMode} title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'} isDarkMode={isDarkMode}>
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </IconBtn>
            {!isReadonly && (
              <IconBtn
                onClick={onToggleDragLock}
                title={isDragLocked ? 'Bloqueado — clique para desbloquear' : 'Clique para bloquear edição'}
                active={isDragLocked}
                activeColor="#ef4444"
                isDarkMode={isDarkMode}
              >
                <>
                  {isDragLocked ? <Lock size={14} /> : <LockOpen size={14} />}
                  {isDragLocked && (
                    <span style={{
                      position: 'absolute', top: 5, right: 5,
                      width: 5, height: 5, borderRadius: '50%',
                      background: '#ef4444', animation: 'ping 1.5s ease-in-out infinite'
                    }} />
                  )}
                </>
              </IconBtn>
            )}
            <IconBtn onClick={() => setShowLogoutConfirm(true)} title="Sair" danger isDarkMode={isDarkMode}><LogOut size={15} /></IconBtn>
          </div>

          <div style={{ width: 1, height: 20, background: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }} className="hidden sm:block" />

          <div style={{ alignItems: 'center', gap: 6 }} className="hidden sm:flex">
            {!isReadonly && (
              <button
                onClick={onImportClick}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                  borderRadius: 8, background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                  cursor: 'pointer', fontSize: 10.5, fontWeight: 700,
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all .15s'
                }}
                onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = 'var(--primary-color, #f97316)55'; b.style.color = 'var(--primary-color, #f97316)'; }}
                onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'; b.style.color = isDarkMode ? '#94a3b8' : '#64748b'; }}
              >
                <Upload size={12} strokeWidth={2.5} /><span className="hidden md:inline">{t.importCsv || 'Importar'}</span>
              </button>
            )}
            <button
              onClick={onOpenAdmin}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', border: 'none', borderRadius: 8,
                background: 'var(--primary-color, #f97316)',
                cursor: 'pointer', fontSize: 10.5, fontWeight: 800,
                color: '#fff', letterSpacing: '0.07em',
                textTransform: 'uppercase', transition: 'all .15s',
                boxShadow: '0 2px 8px var(--primary-color, #f97316)55'
              }}
            >
              <Shield size={12} strokeWidth={2.5} />
              <span className="hidden md:inline">
                {userRole === 'admin' ? 'Admin' : 'Aparência'}
              </span>
            </button>
          </div>

          {(userName || userEmail) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '4px 10px 4px 4px',
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e9ecef',
              borderRadius: 99
            }} className="hidden lg:flex">
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-color, #f97316), var(--primary-color, #f97316)aa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 900, color: '#fff', flexShrink: 0
              }}>{initials}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: isDarkMode ? '#cbd5e1' : '#374151', maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
            </div>
          )}

          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="sm:hidden" style={{ width: 34, height: 34, border: 'none', borderRadius: 8, background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', color: isDarkMode ? '#94a3b8' : '#64748b', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}>
            {showMobileMenu ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </header>

      {/* ── Mobile dropdown ── */}
      {showMobileMenu && (
        <div className="sm:hidden flex flex-col gap-3" style={{
          position: 'absolute', top: 52, left: 0, right: 0,
          background: isDarkMode ? '#0f172a' : '#fff',
          borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 49,
          padding: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid #f1f5f9' }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Logado como</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>{displayName}</p>
            </div>
          </div>
          <button onClick={() => { onImportClick(); setShowMobileMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: 'none', borderRadius: 12, background: 'var(--primary-color, #f97316)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            <Upload size={16} />{t.importCsv || 'Importar CSV'}
          </button>
          <button onClick={() => { setShowLogoutConfirm(true); setShowMobileMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '1px solid #fecaca', borderRadius: 12, background: isDarkMode ? 'rgba(239,68,68,0.08)' : '#fff5f5', color: '#dc2626', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            <LogOut size={16} />{t.logout || 'Sair'}
          </button>
        </div>
      )}

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: isDarkMode ? '#0f172a' : '#fff', borderRadius: 20, padding: '28px 28px 24px', width: '100%', maxWidth: 340, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <LogOut size={20} color="#ef4444" />
            </div>
            <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: isDarkMode ? '#f1f5f9' : '#0f172a' }}>Sair do Sistema</p>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#94a3b8' }}>Tem certeza que deseja encerrar sua sessão?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, padding: '10px 0', border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', borderRadius: 10, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: isDarkMode ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cancelar</button>
              <button onClick={handleConfirmLogout} style={{ flex: 1, padding: '10px 0', border: 'none', borderRadius: 10, background: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>Sair</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
