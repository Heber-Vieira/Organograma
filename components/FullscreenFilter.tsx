import * as React from 'react';
import { useState } from 'react';
import { Layout, BarChart3, Users, Check, Ban, Filter, Clock, Palmtree, Briefcase } from 'lucide-react';
import { LayoutType, HeadcountPlanning } from '../types';

interface FullscreenFilterProps {
    isVisible: boolean;
    layout: LayoutType;
    onLayoutChange: (layout: LayoutType) => void;
    stats: any;
    selectedDept: string;
    onSelectedDeptChange: (dept: string) => void;
    selectedRole: string;
    onSelectedRoleChange: (role: string) => void;
    selectedShift: string;
    onSelectedShiftChange: (shift: string) => void;
    departments: string[];
    roles: string[];
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    t: any;
    headcountData?: HeadcountPlanning[];
    chartName?: string;
}

const FullscreenFilter: React.FC<FullscreenFilterProps> = ({
    isVisible,
    layout,
    onLayoutChange,
    stats,
    selectedDept,
    onSelectedDeptChange,
    selectedRole,
    onSelectedRoleChange,
    selectedShift,
    onSelectedShiftChange,
    departments,
    roles,
    onMouseEnter,
    onMouseLeave,
    t,
    headcountData,
    chartName
}) => {
    const [isMetricsHovered, setIsMetricsHovered] = useState(false);

    return (
        <div
            className={`fixed top-16 md:top-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl md:rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.15)] p-4 md:px-8 md:py-4 border border-slate-100/50 dark:border-slate-700/50 z-[100] transition-all duration-500 ease-in-out max-h-[80vh] overflow-y-auto md:overflow-visible ${isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-24 opacity-0 pointer-events-none'}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onWheel={(e) => e.stopPropagation()}
        >
            {chartName && (
                <div className="hidden md:flex items-center gap-3 border-r border-slate-100 dark:border-slate-700 pr-6">
                    <div className="w-2 h-2 rounded-full bg-[#00897b] shrink-0" />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-100 uppercase tracking-wider truncate max-w-[200px]">
                        {chartName}
                    </span>
                </div>
            )}

            <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 pb-3 md:pb-0 md:pr-6">
                <Layout className="w-4 h-4 text-[#00897b] shrink-0" />
                <div className="flex flex-col w-full">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Layout</label>
                    <select
                        value={layout}
                        onChange={(e) => onLayoutChange(e.target.value as LayoutType)}
                        className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 dark:text-slate-100 uppercase cursor-pointer w-full md:min-w-[100px]"
                    >
                        <option value={LayoutType.TECH_CIRCULAR} className="dark:bg-slate-800">Tech Circular</option>
                        <option value={LayoutType.MODERN_PILL} className="dark:bg-slate-800">Modern Pill</option>
                        <option value={LayoutType.CLASSIC_MINIMAL} className="dark:bg-slate-800">Classic Corp</option>
                        <option value={LayoutType.FUTURISTIC_GLASS} className="dark:bg-slate-800">Futuristic</option>
                    </select>
                </div>
            </div>

            <div
                className="relative flex flex-col md:block border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 pb-3 md:pb-0 md:pr-6 transition-all duration-300"
                onMouseEnter={() => window.innerWidth >= 768 && setIsMetricsHovered(true)}
                onMouseLeave={() => window.innerWidth >= 768 && setIsMetricsHovered(false)}
            >
                {/* Header / Trigger */}
                <div
                    className="flex items-center gap-4 cursor-pointer md:cursor-help w-full"
                    onClick={() => setIsMetricsHovered(!isMetricsHovered)}
                >
                    <div className={`transition-all duration-300 shrink-0 ${isMetricsHovered ? 'scale-110 text-[#00897b] drop-shadow-[0_0_8px_rgba(0,137,123,0.5)]' : 'text-[#00897b]'}`}>
                        <BarChart3 className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-[#00897b] transition-colors">Métricas</label>
                        <div className="flex gap-3 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {stats.total}</span>
                            <span className="flex items-center gap-1 text-[#00897b]"><Check className="w-3 h-3" /> {stats.active}</span>
                            <span className="flex items-center gap-1 text-slate-400"><Ban className="w-3 h-3" /> {stats.inactive}</span>
                        </div>
                    </div>
                </div>

                {/* Detailed Metrics Popover / Accordion */}
                {isMetricsHovered && (
                    <div className="relative w-full mt-4 md:absolute md:top-full md:left-0 md:mt-6 md:w-72 bg-slate-50 md:bg-white/95 dark:bg-slate-800/50 md:dark:bg-slate-900/95 backdrop-blur-xl md:backdrop-blur-2xl rounded-xl md:rounded-3xl shadow-inner md:shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-slate-200/50 md:border-white/20 dark:border-white/5 p-4 md:p-6 z-[110] animate-in fade-in slide-in-from-top-2 md:slide-in-from-top-4 duration-300">
                        {/* Connecting bridge to prevent mouse leave (Desktop only) */}
                        <div className="hidden md:block absolute -top-6 left-0 w-full h-6 bg-transparent" />

                        <div className="space-y-4 md:space-y-5">
                            {/* Header / Progress */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-none">{stats.total}</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-wider">{t.totalMembers}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-[#00897b]">{stats.activePercentage}%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden p-[1px]">
                                    <div className="bg-gradient-to-r from-[#00897b] to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.4)]" style={{ width: `${stats.activePercentage}%` }}></div>
                                </div>
                            </div>

                            {/* Cards */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: t.activeMembers, value: stats.active, color: 'bg-[#00897b]' },
                                    { label: t.inactiveMembers, value: stats.inactive, color: 'bg-slate-400' },
                                    { label: t.onVacation, value: stats.vacationCount, color: 'bg-cyan-400' }
                                ].map(m => (
                                    <div key={m.label} className="flex flex-col items-center p-2 md:p-2.5 bg-white/60 dark:bg-white/5 rounded-xl md:rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                                        <span className="text-xs md:text-sm font-black text-slate-700 dark:text-white mb-0.5">{m.value}</span>
                                        <span className="text-[6px] md:text-[7px] font-black text-slate-400 uppercase text-center leading-tight">{m.label.split(' ')[0]}</span>
                                        <div className={`w-3 md:w-4 h-0.5 ${m.color} rounded-full mt-1.5 md:mt-2 opacity-60`}></div>
                                    </div>
                                ))}
                            </div>

                            {/* Dept List */}
                            <div className="space-y-3 border-t border-slate-200/50 dark:border-white/5 pt-3 md:pt-4">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Briefcase className="w-3 h-3" /> Por Departamento</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                    {Object.entries(stats.byDept)
                                        .sort((a: any, b: any) => a[0].localeCompare(b[0]))
                                        .map(([dept, count]: any) => {
                                            // Robust Normalization
                                            const normalizeText = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                                            const normalizedDept = normalizeText(dept);

                                            // Find plan with normalized comparison // DEBUG: Log data presence if needed
                                            const plan = headcountData?.find(h => h.department && normalizeText(h.department) === normalizedDept);

                                            const required = plan?.required_count || 0;
                                            const hasPlan = required > 0;
                                            const percentage = hasPlan ? Math.min((count / required) * 100, 100) : 0;

                                            const statusColor = !hasPlan ? 'bg-slate-200 dark:bg-slate-700' :
                                                count < required ? 'bg-rose-500' :
                                                    count > required ? 'bg-amber-500' : 'bg-emerald-500';

                                            const textColor = !hasPlan ? 'text-slate-400' :
                                                count < required ? 'text-rose-600 dark:text-rose-400' :
                                                    count > required ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';

                                            return (
                                                <div key={dept} className="flex flex-col gap-1 group/item hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-lg transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] md:text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate w-24 md:w-32 uppercase" title={dept}>{dept}</span>
                                                        <div className="flex gap-2 items-center">
                                                            {stats.byDeptVacation[dept] > 0 && <span className="flex items-center gap-0.5 text-[9px] font-black text-cyan-600 dark:text-cyan-400"><Palmtree className="w-2.5 h-2.5" />{stats.byDeptVacation[dept]}</span>}

                                                            {hasPlan ? (
                                                                <div className="flex items-center gap-1">
                                                                    <span className={`text-[10px] font-black ${textColor}`}>{count}</span>
                                                                    <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600">/</span>
                                                                    <span className="text-[10px] font-bold text-slate-400">{required}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="min-w-[1.25rem] text-center text-[9px] md:text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 rounded-md">{count}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {hasPlan && (
                                                        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${statusColor} opacity-80 transition-all duration-500`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 pb-3 md:pb-0 md:pr-6">
                <Filter className="w-4 h-4 text-[#00897b] shrink-0" />
                <div className="flex flex-col w-full">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Departamento</label>
                    <select
                        value={selectedDept}
                        onChange={(e) => onSelectedDeptChange(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 dark:text-slate-100 uppercase cursor-pointer w-full md:min-w-[140px]"
                    >
                        <option value="all">Todos</option>
                        {departments.map(d => <option key={d} value={d} className="dark:bg-slate-800">{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700 pb-3 md:pb-0 md:pr-6">
                <Users className="w-4 h-4 text-[#00897b] shrink-0" />
                <div className="flex flex-col w-full">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Cargo</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => onSelectedRoleChange(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 dark:text-slate-100 uppercase cursor-pointer w-full md:min-w-[140px]"
                    >
                        <option value="all">Todos</option>
                        {roles.map(r => <option key={r} value={r} className="dark:bg-slate-800">{r}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Clock className="w-4 h-4 text-[#00897b] shrink-0" />
                <div className="flex flex-col w-full">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Turno</label>
                    <select
                        value={selectedShift}
                        onChange={(e) => onSelectedShiftChange(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] font-black text-slate-700 dark:text-slate-100 uppercase cursor-pointer w-full md:min-w-[100px]"
                    >
                        <option value="all">Todos</option>
                        {['morning', 'afternoon', 'night', 'flexible'].map(s => <option key={s} value={s} className="dark:bg-slate-800">{t[s]}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FullscreenFilter;
