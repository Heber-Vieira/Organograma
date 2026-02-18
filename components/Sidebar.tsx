import * as React from 'react';
import { useState, useRef } from 'react';
import {
    Layout, ToggleRight, ToggleLeft, PartyPopper, Sparkles, BarChart3, Activity,
    ChevronUp, ChevronDown, Briefcase, Clock, Users, Filter, Download, UserPlus, Palmtree,
    Ban, Cake, Star, Pin, PinOff, Network, GitFork, Zap, Check, X, HelpCircle
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
    t
}) => {
    const [isPinned, setIsPinned] = useState(true);
    const hideTimeoutRef = useRef<number | null>(null);

    const handleMouseEnter = () => {
        if (hideTimeoutRef.current) {
            window.clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
    };

    const handleMouseLeave = () => {
        if (!isPinned && isOpen) {
            hideTimeoutRef.current = window.setTimeout(() => {
                onClose();
            }, 800);
        }
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
fixed top-24 bottom-4 left-4 right-4 sm:right-auto md:top-24 md:bottom-6 md:left-6 z-[100] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen
                        ? 'w-auto sm:w-72 translate-x-0 opacity-100'
                        : 'w-72 -translate-x-[calc(100%+48px)] opacity-0 pointer-events-none'
                    } flex flex-col`}
            >
                <div className="flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 dark:border-slate-700/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col">
                    <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar p-6 scroll-smooth">
                        {/* Visual Engine Section */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.settingsTitle}</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={onClose}
                                        className="md:hidden p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 transition-colors"
                                        title="Fechar Menu"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setIsPinned(!isPinned)}
                                        className={`hidden md:block p-2 rounded-full transition-colors ${isPinned ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                        title={isPinned ? t.unpinSidebar : t.pinSidebar}
                                    >
                                        {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-1 h-3 bg-[var(--primary-color)] rounded-full"></div>
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{t.visualEngine}</h2>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { id: LayoutType.TECH_CIRCULAR, label: 'Circular', icon: Network, desc: 'Hierarquia em arcos' },
                                    { id: LayoutType.MODERN_PILL, label: 'Moderno', icon: Zap, desc: 'Cards flutuantes' },
                                    { id: LayoutType.CLASSIC_MINIMAL, label: 'Clássico', icon: GitFork, desc: 'Estrutura padrão' },
                                    { id: LayoutType.FUTURISTIC_GLASS, label: 'Glass', icon: Sparkles, desc: 'Efeito translúcido' }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => onLayoutChange(opt.id as LayoutType)}
                                        className={`w-full p-3 rounded-2xl border transition-all flex items-center gap-3 group relative overflow-hidden ${layout === opt.id
                                            ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-white shadow-lg shadow-[var(--primary-color)]/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-[var(--primary-color)]/50 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-xl transition-colors ${layout === opt.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-[var(--primary-color)]/10 group-hover:text-[var(--primary-color)]'}`}>
                                            <opt.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${layout === opt.id ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{opt.label}</span>
                                            <span className={`text-[9px] font-medium ${layout === opt.id ? 'text-white/80' : 'text-slate-400'}`}>{opt.desc}</span>
                                        </div>
                                        {layout === opt.id && (
                                            <div className="absolute right-3 w-2 h-2 rounded-full bg-white animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Toggles Card */}
                            <div className="bg-slate-100/40 dark:bg-white/5 rounded-3xl p-4 border border-white/20 dark:border-white/5 space-y-3">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">{t.birthdayToggle}</span>
                                    <div className="grid grid-cols-3 gap-1 animate-in zoom-in-95 duration-200">
                                        {[
                                            { id: 'off', icon: Ban, label: t.birthdayOff },
                                            { id: 'month', icon: Cake, label: t.birthdayMonth },
                                            { id: 'day', icon: Star, label: t.birthdayDay }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => onBirthdayHighlightModeChange(opt.id as any)}
                                                className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${birthdayHighlightMode === opt.id
                                                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-white shadow-lg'
                                                    : 'bg-white/50 dark:bg-slate-800/50 border-transparent text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                                                    }`}
                                                title={opt.label}
                                            >
                                                <opt.icon className="w-3.5 h-3.5" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {birthdayHighlightMode !== 'off' && (
                                    <div className="space-y-2 pt-1">
                                        <span className="text-[8px] font-black text-slate-400 uppercase ml-1">{t.animationType}</span>
                                        <div className="grid grid-cols-3 gap-1 animate-in zoom-in-95 duration-200">
                                            {['confetti', 'fireworks', 'mixed'].map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => onBirthdayAnimationTypeChange(type as any)}
                                                    className={`p-2 rounded-xl border transition-all ${birthdayAnimationType === type
                                                        ? 'bg-[var(--primary-color)]/20 border-[var(--primary-color)] text-[var(--primary-color)]'
                                                        : 'bg-white/50 dark:bg-slate-800/50 border-transparent text-slate-400'
                                                        }`}
                                                >
                                                    {type === 'confetti' ? <PartyPopper className="w-3 h-3 mx-auto" /> :
                                                        type === 'fireworks' ? <Sparkles className="w-3 h-3 mx-auto" /> :
                                                            <div className="flex justify-center -space-x-1"><PartyPopper className="w-2.5 h-2.5" /><Sparkles className="w-2.5 h-2.5" /></div>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="h-[1px] bg-slate-200/50 dark:bg-white/5"></div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">{t.vacationToggle}</span>
                                    <button onClick={onToggleVacationHighlight} className={`transition-all hover:scale-110 active:scale-90 ${isVacationHighlightEnabled ? 'text-[var(--primary-color)]' : 'text-slate-300'}`}>
                                        {isVacationHighlightEnabled ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Metrics Section */}
                        <section className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-3 bg-[var(--primary-color)] rounded-full"></div>
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{t.teamMetrics}</h2>
                                </div>
                                <button onClick={onToggleMetricsVisible} className="text-slate-300 hover:text-slate-500 transition-colors">
                                    {isMetricsVisible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            {isMetricsVisible && (
                                <div className="bg-slate-100/40 dark:bg-white/5 rounded-3xl p-5 border border-white/20 dark:border-white/5 space-y-5 animate-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[18px] font-black text-slate-800 dark:text-white leading-none">{stats.total}</span>
                                                <span className="text-[8px] font-black text-slate-400 uppercase mt-1">{t.totalMembers}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[11px] font-black text-[var(--primary-color)]">{stats.activePercentage}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden p-[1px]">
                                            <div className="bg-gradient-to-r from-[var(--primary-color)] to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: `${stats.activePercentage}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: t.activeMembers, value: stats.active, color: 'bg-[var(--primary-color)]' },
                                            { label: t.inactiveMembers, value: stats.inactive, color: 'bg-slate-400' },
                                            { label: t.onVacation, value: stats.vacationCount, color: 'bg-cyan-400' }
                                        ].map(m => (
                                            <div key={m.label} className="flex flex-col items-center p-2 bg-white/50 dark:bg-white/5 rounded-2xl border border-white/40 dark:border-white/5">
                                                <span className="text-xs font-black text-slate-700 dark:text-white mb-0.5">{m.value}</span>
                                                <span className="text-[7px] font-black text-slate-400 uppercase text-center leading-tight">{m.label.split(' ')[0]}</span>
                                                <div className={`w-3 h-0.5 ${m.color} rounded-full mt-1.5 opacity-40`}></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* List metrics with scroll */}
                                    <div className="space-y-4 pt-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                        {/* Depts */}
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Briefcase className="w-2.5 h-2.5" /> Departamentos</label>
                                            <div className="space-y-1.5">
                                                {Object.entries(stats.byDept)
                                                    .sort((a, b) => a[0].localeCompare(b[0]))
                                                    .map(([dept, count]: any) => (
                                                        <div key={dept} className="flex justify-between items-center group/item hover:bg-white/50 dark:hover:bg-white/5 p-1.5 rounded-lg transition-all">
                                                            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 truncate w-32">{dept}</span>
                                                            <div className="flex gap-1.5 items-center">
                                                                {stats.byDeptVacation[dept] > 0 && <span className="flex items-center gap-0.5 text-[8px] font-black text-cyan-600 dark:text-cyan-400"><Palmtree className="w-2 h-2" />{stats.byDeptVacation[dept]}</span>}
                                                                <span className="min-w-[1.25rem] text-center text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded-md">{count}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Workflow Section */}
                        <section className="space-y-3">

                            <div className="flex items-center gap-2 px-1">
                                <div className="w-1 h-3 bg-amber-500 rounded-full"></div>
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{t.workflow}</h2>
                            </div>
                            <div className="bg-slate-100/40 dark:bg-white/5 rounded-3xl p-4 border border-white/20 dark:border-white/5 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase ml-2 tracking-tighter">Departamento</label>
                                    <select
                                        value={selectedDept}
                                        onChange={(e) => onSelectedDeptChange(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800/80 border-none rounded-2xl px-4 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm ring-1 ring-black/5"
                                    >
                                        <option value="all">Todos</option>
                                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-slate-400 uppercase ml-2 tracking-tighter">Turno</label>
                                    <div className="flex bg-white/50 dark:bg-slate-800/50 rounded-2xl p-0.5 ring-1 ring-black/5">
                                        {['all', 'morning', 'afternoon', 'night', 'flexible'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => onSelectedShiftChange(s)}
                                                className={`flex-1 py-1.5 rounded-xl text-[7px] font-black uppercase transition-all ${selectedShift === s ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {s === 'all' ? 'GERAL' : t[s]?.substring(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Intelligence Hub Section */}
                        <section className="space-y-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">{t.intelligenceHub || 'Centro de Inteligência'}</h2>

                            {canViewHeadcount && (
                                <button
                                    onClick={onOpenHeadcount}
                                    className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-[var(--primary-color)]/5 to-[var(--primary-color)]/10 dark:from-[var(--primary-color)]/20 dark:to-[var(--primary-color)]/10 rounded-2xl border border-[var(--primary-color)]/20 group hover:shadow-xl hover:shadow-[var(--primary-color)]/10 transition-all duration-500"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                                            <BarChart3 className="w-5 h-5 text-[var(--primary-color)]" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs font-black text-slate-800 dark:text-white leading-tight uppercase tracking-wide">{t.headcount}</div>
                                            <div className="text-[10px] font-bold text-indigo-600/60 dark:text-indigo-400/60">Análise Estratégica</div>
                                        </div>
                                    </div>
                                    <Zap className="w-4 h-4 text-indigo-500 animate-pulse" />
                                </button>
                            )}

                            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl shadow-inner">
                                <button
                                    onClick={onToggleMetricsVisible}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-500 whitespace-nowrap ${isMetricsVisible ? 'bg-white dark:bg-slate-700 shadow-xl shadow-black/5 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                                >
                                    <Activity className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Métricas</span>
                                </button>
                                <button
                                    onClick={onToggleVacationHighlight}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-500 whitespace-nowrap ${isVacationHighlightEnabled ? 'bg-white dark:bg-slate-700 shadow-xl shadow-black/5 text-[var(--primary-color)]' : 'text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                                >
                                    <Palmtree className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-wider">Férias</span>
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Footer Management */}
                    <div className="p-4 bg-slate-50/50 dark:bg-white/5 border-t border-white/20 dark:border-white/5 grid grid-cols-2 gap-2">
                        <button onClick={onDownloadTemplate} className="group flex items-center justify-center gap-2 h-10 rounded-2xl bg-white dark:bg-slate-800 hover:bg-[var(--primary-color)] hover:text-white transition-all shadow-sm border border-slate-100 dark:border-slate-700">
                            <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            <span className="text-[8px] font-black uppercase tracking-tight">XLSX</span>
                        </button>
                        <button onClick={onAddRootNode} className="group flex items-center justify-center gap-2 h-10 rounded-2xl bg-[var(--primary-color)] text-white hover:brightness-110 transition-all shadow-lg shadow-[var(--primary-color)]/20">
                            <UserPlus className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                            <span className="text-[8px] font-black uppercase tracking-tight">{t.newRoot}</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
