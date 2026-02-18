import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HeadcountPlanning, Profile, Employee } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { Users, Target, Activity, Loader2, AlertCircle, ArrowUpCircle, ArrowDownCircle, CheckCircle2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HeadcountManagerProps {
    language: 'pt' | 'en' | 'es';
    chartId: string;
    onClose: () => void;
}

const HeadcountManager: React.FC<HeadcountManagerProps> = ({ language, chartId, onClose }) => {
    const t = TRANSLATIONS[language];
    const [loading, setLoading] = useState(true);
    const [planning, setPlanning] = useState<HeadcountPlanning[]>([]);
    const [departmentMembers, setDepartmentMembers] = useState<{ [dept: string]: string[] }>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Planning
            let planningQuery = supabase
                .from('headcount_planning')
                .select('*')
                .eq('role', 'DEPARTMENT_TARGET'); // Filter for department targets

            if (chartId) {
                planningQuery = planningQuery.eq('chart_id', chartId);
            }

            const { data: planningData, error: planningError } = await planningQuery;

            if (planningError) throw planningError;

            // Fetch Employees to count actual
            let employeesQuery = supabase
                .from('employees')
                .select('department, name');

            if (chartId) {
                employeesQuery = employeesQuery.eq('chart_id', chartId);
            }

            const { data: employeesData, error: employeesError } = await employeesQuery;

            if (employeesError) throw employeesError;

            const members: { [department: string]: string[] } = {};
            (employeesData as any[]).forEach(emp => {
                if (emp.department) {
                    const normalizedDept = emp.department.trim().toUpperCase();
                    if (!members[normalizedDept]) {
                        members[normalizedDept] = [];
                    }
                    if (emp.name) {
                        members[normalizedDept].push(emp.name);
                    }
                }
            });

            setPlanning(planningData || []);
            setDepartmentMembers(members);
        } catch (error) {
            console.error('Erro ao buscar dados de headcount:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (required: number, actual: number) => {
        if (actual < required) return 'under';
        if (actual > required) return 'over';
        return 'match';
    };

    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        members: string[];
    }>({ visible: false, x: 0, y: 0, members: [] });

    // Handle tooltip functionality
    const handleTooltipShow = (e: React.MouseEvent, members: string[]) => {
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white dark:bg-[#0f172a] w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/10 ring-1 ring-black/5">

                {/* Header Premium */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0f172a]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                {t.headcountPlanning}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest opacity-60">
                                {t.workflow}
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

                <div
                    className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20"
                    onScroll={handleTooltipHide} // Hide tooltip on scroll to avoid misalignment
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Analisando Estrutura...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                            {planning.map(item => {
                                const deptKey = item.department ? item.department.trim().toUpperCase() : '';
                                const members = departmentMembers[deptKey] || [];
                                const actual = members.length;
                                const required = item.required_count;
                                const status = getStatus(required, actual);
                                const diff = actual - required;

                                return (
                                    <div key={item.id} className="group relative bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 dark:border-white/5 overflow-visible">
                                        {/* Status Glow Background */}
                                        <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${status === 'under' ? 'bg-rose-500' :
                                            status === 'over' ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`} />

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-black text-slate-800 dark:text-white truncate pr-2">
                                                        {item.department}
                                                    </h3>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">
                                                        DEPARTAMENTO
                                                    </span>
                                                </div>
                                                <div className={`p-2.5 rounded-2xl shadow-sm ${status === 'under' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' :
                                                    status === 'over' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                                                        'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                                    }`}>
                                                    {status === 'under' ? <TrendingDown className="w-5 h-5" /> :
                                                        status === 'over' ? <TrendingUp className="w-5 h-5" /> :
                                                            <CheckCircle2 className="w-5 h-5" />}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{t.required}</div>
                                                    <div className="text-2xl font-black text-slate-800 dark:text-white leading-none">{required}</div>
                                                </div>
                                                <div
                                                    className={`group/tooltip relative p-4 rounded-2xl border cursor-help transition-colors ${status === 'under' ? 'bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20 hover:bg-rose-100' :
                                                        status === 'over' ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20 hover:bg-amber-100' :
                                                            'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20 hover:bg-emerald-100'
                                                        }`}
                                                    onMouseEnter={(e) => handleTooltipShow(e, members)}
                                                    onMouseLeave={handleTooltipHide}
                                                >
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{t.actual}</div>
                                                    <div className={`text-2xl font-black leading-none ${status === 'under' ? 'text-rose-600' :
                                                        status === 'over' ? 'text-amber-600' :
                                                            'text-emerald-600'
                                                        }`}>{actual}</div>
                                                </div>
                                            </div>

                                            {/* Progress Bar Visual */}
                                            <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                                                <div
                                                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${status === 'under' ? 'bg-rose-500' :
                                                        status === 'over' ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}
                                                    style={{ width: `${Math.min((actual / (required || 1)) * 100, 100)}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${status === 'under' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' :
                                                    status === 'over' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                                    }`}>
                                                    {status === 'under' ? t.underStaffed :
                                                        status === 'over' ? t.overStaffed : t.matches}
                                                </div>
                                                <div className={`text-sm font-black ${diff > 0 ? 'text-amber-500' :
                                                    diff < 0 ? 'text-rose-500' : 'text-emerald-500'
                                                    }`}>
                                                    {diff > 0 ? `+${diff}` : diff === 0 ? <Minus className="w-4 h-4" /> : diff}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
                            {tooltip.members.map((name, idx) => (
                                <span key={idx} className="whitespace-normal text-left leading-normal hover:text-indigo-300 transition-colors block border-b border-white/5 last:border-0 pb-1.5 last:pb-0 font-medium">
                                    {name}
                                </span>
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

const X: React.FC<any> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
);
