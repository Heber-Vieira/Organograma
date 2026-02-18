import * as React from 'react';
import { useState, useMemo } from 'react';
import { HeadcountPlanning, Employee } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { Users, Target, Activity, Loader2, AlertCircle, ArrowUpCircle, ArrowDownCircle, CheckCircle2, TrendingUp, TrendingDown, Minus, X, Ban } from 'lucide-react';

interface HeadcountManagerProps {
    language: 'pt' | 'en' | 'es';
    chartId: string;
    onClose: () => void;
    planningData: HeadcountPlanning[];
    employees: Employee[];
}

interface MemberInfo {
    name: string;
    isActive: boolean;
}

const HeadcountManager: React.FC<HeadcountManagerProps> = ({ language, chartId, onClose, planningData, employees }) => {
    // Custom translations for this component to ensure consistency
    const t = {
        title: language === 'pt' ? 'Planejamento de Headcount' : 'Headcount Planning',
        subtitle: language === 'pt' ? 'Gestão Estratégica' : 'Strategic Management',
        workflow: language === 'pt' ? 'Fluxo' : 'Workflow',
        required: language === 'pt' ? 'Requerido' : 'Required',
        actual: language === 'pt' ? 'Existente' : 'Existing',
        diff: language === 'pt' ? 'Diferença' : 'Difference',
        underStaffed: language === 'pt' ? 'Abaixo do Requerido' : 'Understaffed',
        overStaffed: language === 'pt' ? 'Acima do Requerido' : 'Overstaffed',
        matches: language === 'pt' ? 'Ideal' : 'Ideal',
        totalRequired: language === 'pt' ? 'Total Requerido' : 'Total Required',
        totalActual: language === 'pt' ? 'Total Existente' : 'Total Existing',
        occupancy: language === 'pt' ? 'Ocupação' : 'Occupancy',
    };

    // Process employees to group by department
    const departmentMembers = useMemo(() => {
        const members: { [department: string]: MemberInfo[] } = {};
        employees.forEach(emp => {
            if (emp.department) {
                const normalizedDept = emp.department.trim().toUpperCase();
                if (!members[normalizedDept]) {
                    members[normalizedDept] = [];
                }
                if (emp.name) {
                    members[normalizedDept].push({
                        name: emp.name,
                        isActive: emp.isActive !== false // Default to true if undefined
                    });
                }
            }
        });
        return members;
    }, [employees]);

    const planning = useMemo(() => planningData || [], [planningData]);

    const getStatus = (required: number, actual: number) => {
        if (actual < required) return 'under';
        if (actual > required) return 'over';
        return 'match';
    };

    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        members: MemberInfo[];
    }>({ visible: false, x: 0, y: 0, members: [] });

    // Handle tooltip functionality
    const handleTooltipShow = (e: React.MouseEvent, members: MemberInfo[]) => {
        if (members.length === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            visible: true,
            x: rect.left + rect.width / 2,
            y: rect.top, // Anchored to top of element (to show above)
            members
        });
    };

    const handleTooltipHide = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
    };

    // Calculate Totals
    const totalRequired = useMemo(() => planning.reduce((acc, curr) => acc + (curr.required_count || 0), 0), [planning]);
    const totalActual = useMemo(() => employees.length, [employees]);
    const totalActive = useMemo(() => employees.filter(e => e.isActive !== false).length, [employees]);
    const totalInactive = totalActual - totalActive;
    const occupancyRate = totalRequired > 0 ? Math.round((totalActive / totalRequired) * 100) : 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white dark:bg-[#0f172a] w-full max-w-7xl rounded-[2.5rem] shadow-2xl flex flex-col h-[90vh] overflow-hidden border border-white/10 ring-1 ring-black/5 animate-in zoom-in-95 duration-200">

                {/* Header Premium */}
                <div className="flex flex-col border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] z-20 shrink-0">
                    <div className="flex justify-between items-start p-6 pb-4">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-1">
                                    {t.title}
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest opacity-60">
                                    {t.subtitle}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Summary Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pb-6">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.totalRequired}</div>
                                <div className="text-2xl font-black text-slate-800 dark:text-white">{totalRequired}</div>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.totalActual}</div>
                                <div className="text-2xl font-black text-slate-800 dark:text-white">{totalActual} <span className="text-[10px] font-bold text-slate-400 ml-1">({totalInactive} inativos)</span></div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${occupancyRate > 100 ? 'bg-amber-100 text-amber-600' : occupancyRate < 90 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.occupancy}</div>
                                <div className="text-2xl font-black text-slate-800 dark:text-white">{occupancyRate}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20"
                    onScroll={handleTooltipHide} // Hide tooltip on scroll to avoid misalignment
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-20">
                        {planning.filter(item => item.department && item.department.trim() !== '').map(item => {
                            const deptKey = item.department ? item.department.trim().toUpperCase() : '';
                            const members = departmentMembers[deptKey] || [];
                            const actual = members.length;
                            const required = item.required_count;
                            const status = getStatus(required, actual);
                            const diff = actual - required;

                            return (
                                <div key={item.id} className="group relative bg-white dark:bg-[#1e293b] rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-white/5 overflow-visible">
                                    {/* Status Glow Background - Reduced intensity and size */}
                                    <div className={`absolute -right-4 -top-4 w-12 h-12 blur-xl opacity-0 transition-opacity group-hover:opacity-10 ${status === 'under' ? 'bg-rose-500' :
                                        status === 'over' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`} />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xs font-bold text-slate-800 dark:text-white truncate pr-2 uppercase tracking-tight" title={item.department}>
                                                    {item.department}
                                                </h3>
                                            </div>
                                            <div className={`p-1 rounded-md shadow-sm ${status === 'under' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' :
                                                status === 'over' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                                                    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                                }`}>
                                                {status === 'under' ? <TrendingDown className="w-3 h-3" /> :
                                                    status === 'over' ? <TrendingUp className="w-3 h-3" /> :
                                                        <CheckCircle2 className="w-3 h-3" />}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800/50 flex flex-col items-center justify-center">
                                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">{t.required}</div>
                                                <div className="text-lg font-bold text-slate-800 dark:text-white leading-none">{required}</div>
                                            </div>
                                            <div
                                                className={`flex-1 group/tooltip relative p-2 rounded-lg border cursor-help transition-colors flex flex-col items-center justify-center ${status === 'under' ? 'bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20 hover:bg-rose-100' :
                                                    status === 'over' ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20 hover:bg-amber-100' :
                                                        'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20 hover:bg-emerald-100'
                                                    }`}
                                                onMouseEnter={(e) => handleTooltipShow(e, members)}
                                                onMouseLeave={handleTooltipHide}
                                            >
                                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mb-0.5">{t.actual}</div>
                                                <div className={`text-lg font-bold leading-none ${status === 'under' ? 'text-rose-600' :
                                                    status === 'over' ? 'text-amber-600' :
                                                        'text-emerald-600'
                                                    }`}>{actual}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar Visual */}
                                        <div className="relative h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                                            <div
                                                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${status === 'under' ? 'bg-rose-500' :
                                                    status === 'over' ? 'bg-amber-500' : 'bg-emerald-500'
                                                    }`}
                                                style={{ width: `${Math.min((actual / (required || 1)) * 100, 100)}%` }}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wide ${status === 'under' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' :
                                                status === 'over' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                                }`}>
                                                {status === 'under' ? t.underStaffed :
                                                    status === 'over' ? t.overStaffed : t.matches}
                                            </div>
                                            <div className={`text-[10px] font-bold ${diff > 0 ? 'text-amber-500' :
                                                diff < 0 ? 'text-rose-500' : 'text-emerald-500'
                                                }`}>
                                                {diff > 0 ? `+${diff}` : diff === 0 ? <Minus className="w-3 h-3" /> : diff}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* Footer Info */}
                <div className="bg-white dark:bg-[#0f172a] px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.matches}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/20" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.underStaffed}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.overStaffed}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* FIXED PORTAL TOOLTIP */}
            {tooltip.visible && tooltip.members.length > 0 && (
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%) translateY(-12px)'
                    }}
                >
                    <div className="bg-slate-800/95 text-white text-xs rounded-xl py-3 px-4 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.3)] border border-slate-700/50 backdrop-blur-md w-max max-w-[280px] sm:max-w-[320px] animate-in fade-in zoom-in-95 duration-200">
                        <div className="font-bold mb-2 border-b border-slate-700/80 pb-2 text-slate-300 flex justify-between items-center">
                            <span>Integrantes</span>
                            <span className="bg-slate-700/80 text-white px-2 py-0.5 rounded-md text-[10px] shadow-inner">{tooltip.members.length}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {tooltip.members.map((member, i) => (
                                <div key={i} className={`text-xs font-bold px-2 py-1.5 rounded-lg flex items-center justify-between group/member ${!member.isActive ? 'bg-rose-500/10 text-rose-300' : 'text-slate-200 hover:bg-white/5'}`}>
                                    <span className="truncate">{member.name}</span>
                                    {!member.isActive && <span className="text-[9px] font-black bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded ml-2 uppercase tracking-wide">Inativo</span>}
                                </div>
                            ))}
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-800/95" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeadcountManager;


