import * as React from 'react';
import { useState, useRef } from 'react';
import {
    PartyPopper, Sparkles, BarChart3, Activity,
    ChevronUp, ChevronDown, Download, UserPlus, Palmtree,
    Ban, Cake, Star, Pin, PinOff, Network, GitFork, Zap, ChevronRight
} from 'lucide-react';
import { LayoutType } from '../types';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    layout: LayoutType;
    onLayoutChange: (layout: LayoutType) => void;
    birthdayHighlightMode: 'off' | 'month' | 'day';
    onBirthdayHighlightModeChange: (mode: 'off' | 'month' | 'day') => void;
    birthdayAnimationType: 'confetti' | 'fireworks' | 'mixed';
    onBirthdayAnimationTypeChange: (type: 'confetti' | 'fireworks' | 'mixed') => void;
    isMetricsVisible: boolean;
    onToggleMetricsVisible: () => void;
    isVacationHighlightEnabled: boolean;
    onToggleVacationHighlight: () => void;
    stats: any;
    selectedDept: string;
    onSelectedDeptChange: (dept: string) => void;
    selectedRole: string;
    onSelectedRoleChange: (role: string) => void;
    selectedShift: string;
    onSelectedShiftChange: (shift: string) => void;
    departments: string[];
    roles: string[];
    onDownloadTemplate: () => void;
    onAddRootNode: () => void;
    canViewHeadcount: boolean;
    onOpenHeadcount: () => void;
    primaryColor: string;
    userRole: string;
    onOpenHelp: () => void;
    t: any;
    isReadonly?: boolean;
}

/* ─── helpers outside component to prevent re-mount ─────────────── */

function SectionLabel({ label, color, isExpanded }: { label: string; color: string; isExpanded: boolean }) {
    if (!isExpanded) {
        return <div style={{ width: 20, height: 1.5, background: '#e2e8f0', borderRadius: 2, margin: '0 auto 8px', opacity: 0.5 }} />;
    }
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 2, height: 12, borderRadius: 2, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, fontWeight: 900, color: '#94a3b8', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</span>
        </div>
    );
}

function Toggle({ value, onChange, accent }: { value: boolean; onChange: () => void; accent: string }) {
    return (
        <button
            onClick={onChange}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
                width: 32, height: 17, borderRadius: 99, border: 'none', cursor: 'pointer',
                background: value ? accent : '#e2e8f0',
                padding: 0, position: 'relative', transition: 'background .2s', flexShrink: 0
            }}
        >
            <div style={{
                position: 'absolute', top: 2,
                left: value ? 'calc(100% - 15px)' : 2,
                width: 13, height: 13, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left .2s'
            }} />
        </button>
    );
}

/* Stable IconBtn for Sidebar */
function SidebarIconBtn({ onClick, title, icon, active, activeColor, badge }: {
    onClick: () => void; title: string; icon: React.ReactNode;
    active: boolean; activeColor: string; badge?: boolean
}) {
    return (
        <button
            onClick={onClick}
            onMouseDown={(e) => e.stopPropagation()}
            title={title}
            style={{
                width: 38, height: 38, border: 'none', borderRadius: 10,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? `${activeColor}18` : 'transparent',
                color: active ? activeColor : '#94a3b8',
                transition: 'all .15s', position: 'relative'
            }}
        >
            {icon}
            {badge && (
                <span style={{
                    position: 'absolute', top: 7, right: 7,
                    width: 5, height: 5, borderRadius: '50%', background: activeColor
                }} />
            )}
        </button>
    );
}

/* ─── Main component ─────────────────────────────────────────────── */

const Sidebar: React.FC<SidebarProps> = ({
    isOpen, onClose, layout, onLayoutChange,
    birthdayHighlightMode, onBirthdayHighlightModeChange,
    birthdayAnimationType, onBirthdayAnimationTypeChange,
    isMetricsVisible, onToggleMetricsVisible,
    isVacationHighlightEnabled, onToggleVacationHighlight,
    stats, selectedDept, onSelectedDeptChange,
    selectedRole, onSelectedRoleChange,
    selectedShift, onSelectedShiftChange,
    departments, roles, onDownloadTemplate, onAddRootNode,
    canViewHeadcount, onOpenHeadcount,
    primaryColor,
    userRole, onOpenHelp, t, isReadonly
}) => {
    const [isPinned, setIsPinned] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const hideTimeoutRef = useRef<number | null>(null);

    const isExpanded = isPinned || isHovered;
    const accent = primaryColor || '#f97316';

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (hideTimeoutRef.current) { window.clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null; }
    };
    const handleMouseLeave = () => { setIsHovered(false); };

    const LAYOUTS = [
        { id: LayoutType.TECH_CIRCULAR, label: 'Circular', Icon: Network },
        { id: LayoutType.MODERN_PILL, label: 'Moderno', Icon: Zap },
        { id: LayoutType.CLASSIC_MINIMAL, label: 'Clássico', Icon: GitFork },
        { id: LayoutType.FUTURISTIC_GLASS, label: 'Glass', Icon: Sparkles },
    ];

    const BIRTHDAY_OPTS = [
        { id: 'off', Icon: Ban, label: t.birthdayOff || 'Off' },
        { id: 'month', Icon: Cake, label: t.birthdayMonth || 'Mês' },
        { id: 'day', Icon: Star, label: t.birthdayDay || 'Hoje' },
    ] as const;

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="md:hidden"
                    onClick={onClose}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.38)',
                        backdropFilter: 'blur(4px)', zIndex: 90
                    }}
                />
            )}

            <aside
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                    position: 'fixed',
                    top: 68, bottom: 16, left: 10, zIndex: 100,
                    width: isExpanded ? 220 : 58,
                    transition: 'width .35s cubic-bezier(0.34,1.2,0.64,1), transform .35s ease, opacity .25s ease',
                    transform: isOpen ? 'translateX(0)' : 'translateX(calc(-100% - 20px))',
                    opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    display: 'flex', flexDirection: 'column',
                }}
            >
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 16,
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
                    overflow: 'hidden',
                }}>

                    {/* ── Pin header ── */}
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: isExpanded ? 'space-between' : 'center',
                        padding: isExpanded ? '12px 12px 10px 14px' : '12px 0 8px',
                        flexShrink: 0,
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        {isExpanded && (
                            <span style={{ fontSize: 9.5, fontWeight: 900, color: '#94a3b8', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                                {t.settingsTitle || 'Painel'}
                            </span>
                        )}
                        <button
                            onClick={() => setIsPinned(p => !p)}
                            onMouseDown={(e) => e.stopPropagation()}
                            title={isPinned ? 'Desafixar' : 'Fixar'}
                            style={{
                                width: 26, height: 26, borderRadius: 7, border: 'none', cursor: 'pointer',
                                background: isPinned ? `${accent}18` : 'transparent',
                                color: isPinned ? accent : '#b0bec5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s'
                            }}
                        >
                            {isPinned ? <Pin size={12} /> : <PinOff size={12} />}
                        </button>
                    </div>

                    {/* ── Scrollable content ── */}
                    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="custom-scrollbar">
                        <div style={{
                            display: 'flex', flexDirection: 'column', gap: 18,
                            padding: isExpanded ? '14px 12px' : '12px 8px',
                            alignItems: isExpanded ? 'stretch' : 'center',
                        }}>

                            {/* ── Layout / Visual Engine ── */}
                            <section>
                                <SectionLabel label={t.visualEngine || 'Layout'} color={accent} isExpanded={isExpanded} />
                                {isExpanded ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                        {LAYOUTS.map(({ id, label, Icon }) => {
                                            const isActive = layout === id;
                                            return (
                                                <button
                                                    key={id}
                                                    onClick={() => onLayoutChange(id as LayoutType)}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    style={{
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                                        padding: '8px 4px', borderRadius: 10,
                                                        border: `1.5px solid ${isActive ? accent : 'transparent'}`,
                                                        background: isActive ? `${accent}12` : 'rgba(0,0,0,0.03)',
                                                        cursor: 'pointer', color: isActive ? accent : '#94a3b8',
                                                        transition: 'all .15s'
                                                    }}
                                                >
                                                    <Icon size={14} />
                                                    <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: isActive ? accent : '#94a3b8' }}>{label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                                        {LAYOUTS.map(({ id, label, Icon }) => (
                                            <SidebarIconBtn
                                                key={id}
                                                onClick={() => onLayoutChange(id as LayoutType)}
                                                title={label}
                                                icon={<Icon size={16} />}
                                                active={layout === id}
                                                activeColor={accent}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>


                            <div style={{ height: 1, background: 'rgba(0,0,0,0.05)' }} />

                            {/* ── Aniversários ── */}
                            <section>
                                <SectionLabel label={t.birthdayToggle || 'Aniversários'} color="#f43f5e" isExpanded={isExpanded} />
                                {isExpanded ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                                            {BIRTHDAY_OPTS.map(({ id, Icon, label }) => {
                                                const isActive = birthdayHighlightMode === id;
                                                return (
                                                    <button
                                                        key={id}
                                                        onClick={() => onBirthdayHighlightModeChange(id)}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        title={label}
                                                        style={{
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                                                            padding: '6px 4px', borderRadius: 8,
                                                            border: `1.5px solid ${isActive ? '#f43f5e' : 'transparent'}`,
                                                            background: isActive ? '#f43f5e10' : 'rgba(0,0,0,0.03)',
                                                            color: isActive ? '#f43f5e' : '#94a3b8',
                                                            cursor: 'pointer', transition: 'all .15s'
                                                        }}
                                                    >
                                                        <Icon size={13} />
                                                        <span style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {birthdayHighlightMode !== 'off' && (
                                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.03)', borderRadius: 8, padding: 2 }}>
                                                {(['confetti', 'fireworks', 'mixed'] as const).map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => onBirthdayAnimationTypeChange(type)}
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                        style={{
                                                            flex: 1, padding: '4px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                                                            background: birthdayAnimationType === type ? '#fff' : 'transparent',
                                                            color: birthdayAnimationType === type ? '#f43f5e' : '#94a3b8',
                                                            boxShadow: birthdayAnimationType === type ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s'
                                                        }}
                                                    >
                                                        {type === 'confetti' ? <PartyPopper size={11} /> : type === 'fireworks' ? <Sparkles size={11} /> : (
                                                            <div style={{ display: 'flex' }}><PartyPopper size={9} /><Sparkles size={9} /></div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            background: 'rgba(0,0,0,0.03)', borderRadius: 10, padding: '7px 10px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Palmtree size={13} color={isVacationHighlightEnabled ? accent : '#94a3b8'} />
                                                <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                    {t.vacationToggle || 'Férias'}
                                                </span>
                                            </div>
                                            <Toggle value={isVacationHighlightEnabled} onChange={onToggleVacationHighlight} accent={accent} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                                        <SidebarIconBtn
                                            onClick={() => onBirthdayHighlightModeChange(birthdayHighlightMode === 'off' ? 'month' : 'off')}
                                            title="Aniversários"
                                            icon={<Cake size={16} />}
                                            active={birthdayHighlightMode !== 'off'}
                                            activeColor="#f43f5e"
                                            badge={birthdayHighlightMode !== 'off'}
                                        />
                                        <SidebarIconBtn
                                            onClick={onToggleVacationHighlight}
                                            title="Férias"
                                            icon={<Palmtree size={16} />}
                                            active={isVacationHighlightEnabled}
                                            activeColor={accent}
                                            badge={isVacationHighlightEnabled}
                                        />
                                    </div>
                                )}
                            </section>

                            <div style={{ height: 1, background: 'rgba(0,0,0,0.05)' }} />

                            {/* ── Métricas ── */}
                            <section>
                                <SectionLabel label={t.teamMetrics || 'Métricas'} color="#6366f1" isExpanded={isExpanded} />
                                {isExpanded ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <button
                                            onClick={onToggleMetricsVisible}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '6px 8px', border: 'none', borderRadius: 8, cursor: 'pointer',
                                                background: isMetricsVisible ? '#6366f108' : 'transparent', width: '100%'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Activity size={12} color={isMetricsVisible ? '#6366f1' : '#94a3b8'} />
                                                <span style={{ fontSize: 9, fontWeight: 800, color: isMetricsVisible ? '#6366f1' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                    Ver métricas
                                                </span>
                                            </div>
                                            {isMetricsVisible ? <ChevronUp size={11} color="#6366f1" /> : <ChevronDown size={11} color="#94a3b8" />}
                                        </button>
                                        {isMetricsVisible && (
                                            <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                                                    {[
                                                        { label: 'Ativos', value: stats.active, color: '#10b981' },
                                                        { label: 'Inativos', value: stats.inactive, color: '#94a3b8' },
                                                        { label: 'Férias', value: stats.vacationCount, color: '#06b6d4' }
                                                    ].map(m => (
                                                        <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '6px 4px', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                                            <span style={{ fontSize: 13, fontWeight: 900, color: m.color }}>{m.value}</span>
                                                            <span style={{ fontSize: 7, fontWeight: 700, color: '#b0bec5', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>{m.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: '35vh', overflowY: 'auto' }} className="custom-scrollbar">
                                                    {Object.entries(stats.byDept)
                                                        .sort(([a], [b]) => a.localeCompare(b))
                                                        .map(([dept, count]: any) => (
                                                            <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 4px', borderRadius: 5 }}>
                                                                <span style={{ fontSize: 9, fontWeight: 600, color: '#718096', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={dept}>{dept}</span>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    {stats.byDeptVacation?.[dept] > 0 && (
                                                                        <span style={{ fontSize: 8, fontWeight: 700, color: '#06b6d4', background: '#ecfeff', borderRadius: 4, padding: '1px 4px' }}>{stats.byDeptVacation[dept]}</span>
                                                                    )}
                                                                    <span style={{ fontSize: 10, fontWeight: 900, color: '#475569' }}>{count as number}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <SidebarIconBtn
                                        onClick={onToggleMetricsVisible}
                                        title="Métricas"
                                        icon={<Activity size={16} />}
                                        active={isMetricsVisible}
                                        activeColor="#6366f1"
                                        badge={isMetricsVisible}
                                    />
                                )}
                            </section>

                            {/* ── Filters (expanded only) ── */}
                            {isExpanded && (
                                <>
                                    <div style={{ height: 1, background: 'rgba(0,0,0,0.05)' }} />
                                    <section>
                                        <SectionLabel label={t.workflow || 'Filtros'} color="#f59e0b" isExpanded={isExpanded} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 8.5, fontWeight: 800, color: '#b0bec5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Departamento</label>
                                                <select
                                                    value={selectedDept}
                                                    onChange={e => onSelectedDeptChange(e.target.value)}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 10.5, fontWeight: 600, color: '#475569', outline: 'none', cursor: 'pointer' }}
                                                >
                                                    <option value="all">Todos</option>
                                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 8.5, fontWeight: 800, color: '#b0bec5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Turno</label>
                                                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: 2 }}>
                                                    {[{ id: 'all', label: 'Geral' }, { id: 'morning', label: 'M' }, { id: 'afternoon', label: 'T' }].map(s => (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => onSelectedShiftChange(s.id)}
                                                            onMouseDown={(e) => e.stopPropagation()}
                                                            style={{
                                                                flex: 1, padding: '4px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
                                                                background: selectedShift === s.id ? '#fff' : 'transparent',
                                                                color: selectedShift === s.id ? '#334155' : '#94a3b8',
                                                                boxShadow: selectedShift === s.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                                                fontSize: 9, fontWeight: 800, transition: 'all .15s',
                                                                textTransform: 'uppercase', letterSpacing: '0.05em'
                                                            }}
                                                        >{s.label}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div style={{
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                        padding: isExpanded ? '10px 10px 10px' : '8px 10px 10px',
                        display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0
                    }}>
                        {isExpanded && canViewHeadcount && (
                            <button
                                onClick={onOpenHeadcount}
                                onMouseDown={(e) => e.stopPropagation()}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 12px', border: '1.5px solid #6366f122', borderRadius: 10,
                                    background: 'linear-gradient(135deg,#6366f108,#8b5cf608)',
                                    cursor: 'pointer', transition: 'all .15s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BarChart3 size={13} color="#6366f1" />
                                    <span style={{ fontSize: 9.5, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t.headcount || 'Headcount'}</span>
                                </div>
                                <ChevronRight size={11} color="#6366f1" />
                            </button>
                        )}
                        <div style={{ display: 'flex', gap: 6, justifyContent: isExpanded ? 'stretch' : 'center' }}>
                            <button
                                onClick={onDownloadTemplate}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Baixar Modelo XLSX"
                                style={{
                                    flex: isExpanded ? 1 : undefined, width: isExpanded ? undefined : 38,
                                    height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                    border: '1px solid #e2e8f0', borderRadius: 9, background: '#fff',
                                    cursor: 'pointer', fontSize: 9, fontWeight: 800, color: '#64748b',
                                    textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all .15s'
                                }}
                            >
                                <Download size={13} />
                                {isExpanded && 'XLSX'}
                            </button>
                            {!isReadonly && (
                                <button
                                    onClick={onAddRootNode}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    title={t.newRoot || 'Novo raiz'}
                                    style={{
                                        flex: isExpanded ? 1 : undefined, width: isExpanded ? undefined : 38,
                                        height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                        border: 'none', borderRadius: 9, background: accent,
                                        cursor: 'pointer', fontSize: 9, fontWeight: 800, color: '#fff',
                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                        boxShadow: `0 2px 8px ${accent}44`, transition: 'opacity .15s'
                                    }}
                                >
                                    <UserPlus size={13} />
                                    {isExpanded && (t.newRoot || 'Novo')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
