import React from 'react';
import { Minus, Plus, Maximize, Scan, Printer, RefreshCcw, FileType, ImageIcon, Sun, Moon } from 'lucide-react';

/* ─── Stable helper components outside to prevent re-mount ────────── */

interface BtnProps {
    onClick?: () => void;
    title?: string;
    children: React.ReactNode;
    accent?: boolean;
    isDarkMode: boolean;
    textColor: string;
}

const Btn: React.FC<BtnProps> = ({ onClick, title, children, accent, isDarkMode, textColor }) => (
    <button
        onClick={onClick}
        onMouseDown={(e) => e.stopPropagation()} // Prevent background panning
        title={title}
        style={{
            width: 30, height: 30, border: 'none', borderRadius: 7,
            background: accent ? 'var(--primary-color,#f97316)' : 'transparent',
            color: accent ? '#fff' : textColor,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', transition: 'all .15s', flexShrink: 0
        }}
        onMouseEnter={e => { if (!accent) (e.currentTarget as HTMLButtonElement).style.background = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'; }}
        onMouseLeave={e => { if (!accent) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
        {children}
    </button>
);

const Divider = ({ isDarkMode }: { isDarkMode: boolean }) => (
    <div style={{ width: 1, height: 16, background: isDarkMode ? 'rgba(255,255,255,0.09)' : '#e2e8f0', flexShrink: 0 }} />
);

/* ─── Main component ─────────────────────────────────────────────── */

interface ToolbarProps {
    zoom: number;
    onZoomChange: (action: number | ((prev: number) => number)) => void;
    onFitToView: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    isExporting: boolean;
    showExportMenu: boolean;
    onToggleExportMenu: (show: boolean) => void;
    onExport: (format: 'png' | 'pdf') => void;
    isVisible: boolean;
    onInteract: () => void;
    isSidebarOpen: boolean;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onSaveProject: () => void;
    onLoadProject: () => void;
    t: any;
    isReadonly?: boolean;
    isDragLocked?: boolean;
    onToggleDragLock?: () => void;
    onPrint: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    zoom,
    onZoomChange,
    onFitToView,
    isFullscreen,
    onToggleFullscreen,
    isExporting,
    showExportMenu,
    onToggleExportMenu,
    onExport,
    onSaveProject,
    onLoadProject,
    isVisible,
    onInteract,
    isSidebarOpen,
    isDarkMode,
    onToggleDarkMode,
    t,
    isReadonly,
    onPrint,
}) => {
    const bg = isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.96)';
    const border = isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)';
    const textColor = isDarkMode ? '#94a3b8' : '#64748b';
    const textStrong = isDarkMode ? '#e2e8f0' : '#334155';

    return (
        <div
            data-html2canvas-ignore
            className="toolbar"
            onMouseEnter={onInteract}
            onMouseMove={onInteract}
            onMouseDown={(e) => e.stopPropagation()} // Prevent map panning when clicking toolbar background
            style={{
                position: 'fixed',
                bottom: 20,
                left: '50%',
                transform: `translateX(-50%) translateY(${isVisible ? '0' : '80px'})`,
                opacity: isVisible ? 1 : 0,
                transition: 'transform .4s cubic-bezier(0.34,1.56,0.64,1), opacity .3s ease',
                zIndex: 100,
                pointerEvents: isVisible ? 'auto' : 'none',
                display: 'flex', alignItems: 'center', gap: 4,
                background: bg,
                backdropFilter: 'blur(20px)',
                border,
                borderRadius: 14,
                padding: '4px 10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
                minWidth: 0,
                whiteSpace: 'nowrap',
            }}
        >
            {/* Zoom controls */}
            <Btn
                onClick={() => onZoomChange((z: number) => Math.max(0.1, z - 0.1))}
                title="Reduzir zoom"
                isDarkMode={isDarkMode}
                textColor={textColor}
            >
                <Minus size={13} />
            </Btn>
            <span style={{
                minWidth: 36, textAlign: 'center', fontSize: 11, fontWeight: 800,
                color: textStrong, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums'
            }}>
                {Math.round(zoom * 100)}%
            </span>
            <Btn
                onClick={() => onZoomChange((z: number) => Math.min(4, z + 0.1))}
                title="Aumentar zoom"
                isDarkMode={isDarkMode}
                textColor={textColor}
            >
                <Plus size={13} />
            </Btn>

            <Divider isDarkMode={isDarkMode} />

            {/* Fit to view */}
            <Btn
                onClick={onFitToView}
                title="Enquadrar e Centralizar"
                isDarkMode={isDarkMode}
                textColor={textColor}
            >
                <Maximize size={14} />
            </Btn>

            {/* Fullscreen */}
            <Btn
                onClick={onToggleFullscreen}
                title={isFullscreen ? t.exitFullscreen : t.fullscreen}
                accent={isFullscreen}
                isDarkMode={isDarkMode}
                textColor={textColor}
            >
                <Scan size={14} />
            </Btn>

            <Divider isDarkMode={isDarkMode} />

            {/* Dark mode */}
            <Btn
                onClick={onToggleDarkMode}
                title={isDarkMode ? t.lightMode : t.darkMode}
                isDarkMode={isDarkMode}
                textColor={textColor}
            >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </Btn>

            <Divider isDarkMode={isDarkMode} />

            {/* Export */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => onToggleExportMenu(!showExportMenu)}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '5px 10px', border: 'none', borderRadius: 8, cursor: 'pointer',
                        background: showExportMenu
                            ? (isDarkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9')
                            : 'transparent',
                        color: showExportMenu ? textStrong : textColor,
                        fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
                        textTransform: 'uppercase', transition: 'background .15s'
                    }}
                    onMouseEnter={e => { if (!showExportMenu) (e.currentTarget as HTMLButtonElement).style.background = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e => { if (!showExportMenu) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                    {isExporting
                        ? <RefreshCcw size={12} className="animate-spin" style={{ color: '#10b981' }} />
                        : <Printer size={12} />
                    }
                    <span className="hidden sm:inline">Exportar / Imprimir</span>
                </button>

                {showExportMenu && (
                    <div style={{
                        position: 'absolute', bottom: 'calc(100% + 10px)', right: 0,
                        minWidth: 160, background: isDarkMode ? '#0f172a' : '#fff',
                        border: isDarkMode ? '1px solid rgba(255,255,255,0.09)' : '1px solid #e2e8f0',
                        borderRadius: 12, padding: 4,
                        boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
                        zIndex: 200, animation: 'fadeUp .15s ease both'
                    }}>
                        {[
                            { label: 'Imprimir Organograma', icon: <Printer size={13} color="#6366f1" />, onClick: onPrint, hover: isDarkMode ? 'rgba(99,102,241,0.08)' : '#eef2ff' },
                        ].map(item => (
                            <button
                                key={item.label}
                                onClick={item.onClick}
                                onMouseDown={(e) => e.stopPropagation()}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '7px 10px', border: 'none', borderRadius: 8,
                                    background: 'transparent', cursor: 'pointer',
                                    fontSize: 10.5, fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569',
                                    textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left'
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = item.hover}
                                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                            >
                                {item.icon}{item.label}
                            </button>
                        ))}
                        {!isReadonly && (
                            <>
                                <div style={{ height: 1, background: isDarkMode ? 'rgba(255,255,255,0.07)' : '#f1f5f9', margin: '4px 8px' }} />
                                {[
                                    { label: 'Salvar Projeto', icon: <FileType size={13} color="#6366f1" />, onClick: onSaveProject, hover: isDarkMode ? 'rgba(99,102,241,0.08)' : '#eef2ff' },
                                    { label: 'Abrir Projeto', icon: <RefreshCcw size={13} color="#f59e0b" />, onClick: onLoadProject, hover: isDarkMode ? 'rgba(245,158,11,0.08)' : '#fffbeb' },
                                ].map(item => (
                                    <button
                                        key={item.label}
                                        onClick={item.onClick}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '7px 10px', border: 'none', borderRadius: 8,
                                            background: 'transparent', cursor: 'pointer',
                                            fontSize: 10.5, fontWeight: 700, color: isDarkMode ? '#cbd5e1' : '#475569',
                                            textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left'
                                        }}
                                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = item.hover}
                                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                                    >
                                        {item.icon}{item.label}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Toolbar;
