import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
    Layout, ToggleRight, ToggleLeft, PartyPopper, Sparkles, BarChart3, Activity,
    ChevronUp, ChevronDown, Briefcase, Clock, Users, Filter, Download, UserPlus, Palmtree,
    Ban, Cake, Star, Pin, PinOff, Network, GitFork, Zap, Check, X, HelpCircle,
    Settings, PieChart, ChevronRight
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
    onPrimaryColorChange: (color: string | null) => void;
    systemColors: string[];
    userRole: string;
    onOpenHelp: () => void;
    t: any;
    isReadonly?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    layout,
    onLayoutChange,
    birthdayHighlightMode,
    onBirthdayHighlightModeChange,
    birthdayAnimationType,
    onBirthdayAnimationTypeChange,
    isMetricsVisible,
    onToggleMetricsVisible,
    isVacationHighlightEnabled,
    onToggleVacationHighlight,
    stats,
    selectedDept,
    onSelectedDeptChange,
    selectedRole,
    onSelectedRoleChange,
    selectedShift,
    onSelectedShiftChange,
    departments,
    roles,
    onDownloadTemplate,
    onAddRootNode,
    canViewHeadcount,
    onOpenHeadcount,
    primaryColor,
    onPrimaryColorChange,
    systemColors,
    userRole,
    onOpenHelp,
    t,
    isReadonly
}) => {
    // Default to pinned false for "Smart Dock" feel
    const [isPinned, setIsPinned] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const hideTimeoutRef = useRef<number | null>(null);

    // Expanded if pinned OR hovered
    const isExpanded = isPinned || isHovered;

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (hideTimeoutRef.current) {
            window.clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        // Only close completely if we are supposed to (legacy prop isOpen management)
        // But for visual expansion, we just rely on isHovered state immediately
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] md:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <aside
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`
                    fixed top-20 bottom-4 left-4 z-[100] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col
                    ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-[200%] opacity-0 pointer-events-none'}
                    ${isExpanded ? 'w-64' : 'w-16'}
                `}
            >
                <div className={`
                    flex-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl 
                    rounded-[1.5rem] border border-white/40 dark:border-slate-700/40 
                    shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col
                    transition-all duration-500
                `}>

                    {/* Header / Pin Control */}
                    <div className={`flex items-center ${isExpanded ? 'justify-between px-4 pt-4' : 'justify-center pt-4'} shrink-0 mb-2`}>
                        {isExpanded && (
                            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-300">
                                {t.settingsTitle}
                            </h2>
                        )}
                        <button
                            onClick={() => setIsPinned(!isPinned)}
                            className={`p-2 rounded-full transition-all duration-300 ${isPinned
                                ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title={isPinned ? t.unpinSidebar : t.pinSidebar}
                        >
                            {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
                        <div className={`flex flex-col gap-6 ${isExpanded ? 'p-4 pt-0' : 'p-2 pt-0 items-center'}`}>

                            {/* Visual Engine Section */}
                            {!isReadonly && (
                                <section className="space-y-3">
                                    {isExpanded ? (
                                        <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-300">
                                            <div className="w-1 h-3 bg-[var(--primary-color)] rounded-full"></div>
                                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{t.visualEngine}</h2>
                                        </div>
                                    ) : (
                                        <div className="w-8 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mb-2 mx-auto" />
                                    )}

                                    <div className={`${isExpanded ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}`}>
                                        {[
                                            { id: LayoutType.TECH_CIRCULAR, label: 'Circular', icon: Network, desc: 'Arcos' },
                                            { id: LayoutType.MODERN_PILL, label: 'Moderno', icon: Zap, desc: 'Cards' },
                                            { id: LayoutType.CLASSIC_MINIMAL, label: 'Clássico', icon: GitFork, desc: 'Padrão' },
                                            { id: LayoutType.FUTURISTIC_GLASS, label: 'Glass', icon: Sparkles, desc: 'Glass' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => onLayoutChange(opt.id as LayoutType)}
                                                title={!isExpanded ? opt.label : ''}
                                                className={`
                                                    relative group transition-all duration-300
                                                    ${isExpanded
                                                        ? 'w-full p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center'
                                                        : 'w-10 h-10 rounded-xl flex items-center justify-center'
                                                    }
                                                    ${layout === opt.id
                                                        ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-white shadow-md shadow-[var(--primary-color)]/20'
                                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-[var(--primary-color)]/50 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                    }
                                                `}
                                            >
                                                <opt.icon className={`${isExpanded ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} />
                                                {isExpanded && (
                                                    <div className="flex flex-col items-center animate-in fade-in duration-200 delay-75">
                                                        <span className={`text-[9px] font-black uppercase tracking-wider ${layout === opt.id ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{opt.label}</span>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Separator */}
                            <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

                            {/* Destaque Aniversariantes */}
                            <section className="space-y-3">
                                {isExpanded ? (
                                    <div className="space-y-3 animate-in fade-in duration-300">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-3 bg-rose-400 rounded-full"></div>
                                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{t.birthdayToggle}</h2>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1">
                                            {[
                                                { id: 'off', icon: Ban, label: t.birthdayOff },
                                                { id: 'month', icon: Cake, label: t.birthdayMonth },
                                                { id: 'day', icon: Star, label: t.birthdayDay }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => onBirthdayHighlightModeChange(opt.id as any)}
                                                    className={`p-1.5 rounded-lg border transition-all flex flex-col items-center gap-1 ${birthdayHighlightMode === opt.id
                                                        ? 'bg-rose-500 border-rose-500 text-white shadow-sm'
                                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                        }`}
                                                    title={opt.label}
                                                >
                                                    <opt.icon className="w-3.5 h-3.5" />
                                                </button>
                                            ))}
                                        </div>
                                        {birthdayHighlightMode !== 'off' && (
                                            <div className="flex bg-slate-50 dark:bg-slate-800/50 rounded-lg p-0.5">
                                                {['confetti', 'fireworks', 'mixed'].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => onBirthdayAnimationTypeChange(type as any)}
                                                        className={`flex-1 py-1 rounded-md transition-all ${birthdayAnimationType === type
                                                            ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-500'
                                                            : 'text-slate-400 hover:text-slate-600'
                                                            }`}
                                                        title={type}
                                                    >
                                                        {type === 'confetti' ? <PartyPopper className="w-3 h-3 mx-auto" /> :
                                                            type === 'fireworks' ? <Sparkles className="w-3 h-3 mx-auto" /> :
                                                                <div className="flex justify-center -space-x-1"><PartyPopper className="w-2.5 h-2.5" /><Sparkles className="w-2.5 h-2.5" /></div>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {/* Férias */}
                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/30 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2">
                                                <Palmtree className={`w-3.5 h-3.5 ${isVacationHighlightEnabled ? 'text-[var(--primary-color)]' : 'text-slate-400'}`} />
                                                <span className="text-[9px] font-bold text-slate-500 uppercase">{t.vacationToggle}</span>
                                            </div>
                                            <button
                                                onClick={onToggleVacationHighlight}
                                                className={`relative w-8 h-4 rounded-full transition-colors ${isVacationHighlightEnabled ? 'bg-[var(--primary-color)]' : 'bg-slate-300 dark:bg-slate-600'}`}
                                            >
                                                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isVacationHighlightEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Collapsed — ícones compactos */
                                    <div className="flex flex-col items-center gap-3">
                                        <button
                                            onClick={() => onBirthdayHighlightModeChange(birthdayHighlightMode === 'off' ? 'month' : 'off')}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${birthdayHighlightMode !== 'off' ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                            title="Aniversariantes"
                                        >
                                            <Cake className="w-5 h-5" />
                                            {birthdayHighlightMode !== 'off' && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                                        </button>
                                        <button
                                            onClick={onToggleVacationHighlight}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${isVacationHighlightEnabled ? 'text-[var(--primary-color)] bg-slate-50 dark:bg-slate-800/50' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                            title="Férias"
                                        >
                                            <Palmtree className="w-5 h-5" />
                                            {isVacationHighlightEnabled && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--primary-color)] rounded-full" />}
                                        </button>
                                    </div>
                                )}
                            </section>

                            {/* Separator */}
                            <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

                            {/* Métricas da Equipe */}
                            <section className="space-y-3">
                                {isExpanded ? (
                                    <div className="space-y-2 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
                                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{t.teamMetrics}</h2>
                                            </div>
                                            <button
                                                onClick={onToggleMetricsVisible}
                                                className={`p-1 rounded-md transition-colors ${isMetricsVisible ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {isMetricsVisible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                        {isMetricsVisible && (
                                            <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 space-y-3 border border-slate-100 dark:border-white/5 animate-in slide-in-from-top-1">
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {[
                                                        { label: 'Ativos', value: stats.active, color: 'bg-emerald-400' },
                                                        { label: 'Inativos', value: stats.inactive, color: 'bg-slate-400' },
                                                        { label: 'Férias', value: stats.vacationCount, color: 'bg-cyan-400' }
                                                    ].map(m => (
                                                        <div key={m.label} className="flex flex-col items-center bg-white dark:bg-slate-800 p-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                                                            <span className="text-[10px] font-black text-slate-700 dark:text-white">{m.value}</span>
                                                            <span className="text-[6px] uppercase text-slate-400 tracking-wider">{m.label}</span>
                                                            <div className={`w-4 h-0.5 ${m.color} rounded-full mt-1`}></div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                                    {Object.entries(stats.byDept)
                                                        .sort((a, b) => a[0].localeCompare(b[0]))
                                                        .map(([dept, count]: any) => (
                                                            <div key={dept} className="flex justify-between items-center p-1 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors">
                                                                <span className="text-[9px] font-bold text-slate-500 truncate w-24" title={dept}>{dept}</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    {stats.byDeptVacation[dept] > 0 && (
                                                                        <span className="text-[8px] font-bold text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 px-1 rounded">{stats.byDeptVacation[dept]}</span>
                                                                    )}
                                                                    <span className="text-[9px] font-black text-slate-700 dark:text-slate-300">{count}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={onToggleMetricsVisible}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${isMetricsVisible ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                        title="Métricas"
                                    >
                                        <Activity className="w-5 h-5" />
                                        {isMetricsVisible && <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
                                    </button>
                                )}
                            </section>

                            {/* Workflow Logic (Only visible when expanded for simplicity in Dock mode) */}
                            {isExpanded && (
                                <>
                                    <div className="w-full h-px bg-slate-100 dark:bg-white/5 animate-in fade-in duration-300" />
                                    <section className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-3 bg-amber-500 rounded-full"></div>
                                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{t.workflow}</h2>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Departamento</label>
                                                <select
                                                    value={selectedDept}
                                                    onChange={(e) => onSelectedDeptChange(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800/80 border-none rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 focus:ring-1 focus:ring-[var(--primary-color)] outline-none"
                                                >
                                                    <option value="all">Todos</option>
                                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Turno</label>
                                                <div className="flex bg-slate-50 dark:bg-slate-800/50 rounded-xl p-0.5">
                                                    {['all', 'morning', 'afternoon'].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => onSelectedShiftChange(s)}
                                                            className={`flex-1 py-1 rounded-lg text-[7px] font-black uppercase transition-all ${selectedShift === s ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                                                        >
                                                            {s === 'all' ? 'Geral' : s.substring(0, 1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className={`
                        border-t border-slate-100 dark:border-white/5 
                        ${isExpanded ? 'p-3 grid grid-cols-2 gap-2' : 'p-2 flex flex-col bg-slate-50/50 dark:bg-white/5 items-center gap-3'}
                    `}>
                        {isExpanded && canViewHeadcount && (
                            <button
                                onClick={onOpenHeadcount}
                                className="col-span-2 group flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 transition-all mb-1"
                            >
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-[9px] font-black uppercase text-indigo-700 dark:text-indigo-300 tracking-wide">{t.headcount}</span>
                                </div>
                                <ChevronRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}

                        <button
                            onClick={onDownloadTemplate}
                            title={!isExpanded ? "Baixar Modelo XLSX" : ""}
                            className={`
                                group flex items-center justify-center transition-all bg-white dark:bg-slate-800 hover:bg-[var(--primary-color)] hover:text-white shadow-sm border border-slate-100 dark:border-slate-700
                                ${isExpanded ? 'gap-1.5 h-8 rounded-xl' : 'w-10 h-10 rounded-xl'}
                            `}
                        >
                            <Download className={`${isExpanded ? 'w-3 h-3' : 'w-4 h-4'}`} />
                            {isExpanded && <span className="text-[8px] font-black uppercase tracking-tight">XLSX</span>}
                        </button>

                        {!isReadonly && (
                            <button
                                onClick={onAddRootNode}
                                title={!isExpanded ? t.newRoot : ""}
                                className={`
                                    group flex items-center justify-center transition-all bg-[var(--primary-color)] text-white hover:brightness-110 shadow-md shadow-[var(--primary-color)]/20
                                    ${isExpanded ? 'gap-1.5 h-8 rounded-xl' : 'w-10 h-10 rounded-xl'}
                                `}
                            >
                                <UserPlus className={`${isExpanded ? 'w-3 h-3' : 'w-4 h-4 rotate-0 group-hover:rotate-90 transition-transform'}`} />
                                {isExpanded && <span className="text-[8px] font-black uppercase tracking-tight">{t.newRoot}</span>}
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
