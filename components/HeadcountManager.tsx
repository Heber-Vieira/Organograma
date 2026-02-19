import * as React from 'react';
import { useState, useMemo } from 'react';
import { HeadcountPlanning, Employee } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { supabase } from '../lib/supabase';
import { Users, Target, Activity, Loader2, AlertCircle, ArrowUpCircle, ArrowDownCircle, CheckCircle2, TrendingUp, TrendingDown, Minus, X, Ban, MessageSquare, Save } from 'lucide-react';

interface HeadcountManagerProps {
    language: 'pt' | 'en' | 'es';
    chartId: string;
    chartName?: string;
    onClose: () => void;
    planningData: HeadcountPlanning[];
    employees: Employee[];
    onRefresh: () => void;
    onNotification: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

interface MemberInfo {
    name: string;
    isActive: boolean;
}

const HeadcountManager: React.FC<HeadcountManagerProps> = ({ language, chartId, chartName, onClose, planningData, employees, onRefresh, onNotification }) => {
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

    const planning = useMemo(() => planningData || [], [planningData]);

    const getStatus = (required: number, actual: number) => {
        if (actual < required) return 'under';
        if (actual > required) return 'over';
        return 'match';
    };

    // Aggregated Stats by Department
    const aggregatedStats = useMemo(() => {
        const deptKeys = new Set<string>();

        const getNormKey = (d: string | null | undefined) => {
            const val = (d || '').trim();
            if (!val || val.toUpperCase() === 'SEM DEPARTAMENTO') return '';
            return val.toUpperCase();
        };

        planning.forEach(p => deptKeys.add(getNormKey(p.department)));
        employees.forEach(e => deptKeys.add(getNormKey(e.department)));

        return Array.from(deptKeys).map(key => {
            const displayLabel = key === '' ? 'Sem Departamento' :
                (planning.find(p => getNormKey(p.department) === key)?.department ||
                    employees.find(e => getNormKey(e.department) === key)?.department || key);

            // Since planningData is sorted by updated_at DESC in App.tsx, 
            // taking the first match effectively takes the latest plan for this department.
            const plan = planning.find(p => getNormKey(p.department) === key);
            const required = plan?.required_count || 0;

            const deptMembers = employees
                .filter(e => getNormKey(e.department) === key)
                .map(e => ({
                    name: e.name,
                    isActive: e.isActive !== false
                }));

            return {
                id: key || 'unassigned',
                department: displayLabel,
                required,
                actual: deptMembers.length,
                members: deptMembers,
                plan: plan // Passando o objeto original para acesso à justificativa
            };
        })
            .filter(stats => {
                // Se for "Sem Departamento", só mostra se houver integrantes reais.
                // Isso evita que metas "fantasmas" (ex: de clones) poluam o painel.
                if (stats.id === 'unassigned') return stats.actual > 0;
                // Para departamentos nomeados, mostra se houver meta OU integrantes.
                return stats.required > 0 || stats.actual > 0;
            })
            .sort((a, b) => {
                if (a.id === 'unassigned') return 1;
                if (b.id === 'unassigned') return -1;
                return a.department.localeCompare(b.department);
            });
    }, [planning, employees]);

    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        members: MemberInfo[];
    }>({ visible: false, x: 0, y: 0, members: [] });

    const [editingJustification, setEditingJustification] = useState<{
        deptId: string;
        text: string;
        planId: string | null;
    } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const saveJustification = async () => {
        if (!editingJustification || isSaving) return;
        setIsSaving(true);
        try {
            if (editingJustification.planId) {
                const { error } = await supabase
                    .from('headcount_planning')
                    .update({ justification: editingJustification.text, updated_at: new Date().toISOString() })
                    .eq('id', editingJustification.planId);
                if (error) throw error;
            } else {
                // Create a plan record just for the justification if it doesn't exist
                const { error } = await supabase
                    .from('headcount_planning')
                    .insert([{
                        role: 'DEPARTMENT_TARGET',
                        department: editingJustification.deptId === 'unassigned' ? null : editingJustification.deptId,
                        required_count: 0,
                        justification: editingJustification.text,
                        chart_id: chartId
                    }]);
                if (error) throw error;
            }
            onRefresh();
            onNotification('success', 'Justificativa Salva', `A justificativa para ${editingJustification.deptId} foi registrada.`);
            setEditingJustification(null);
        } catch (error: any) {
            console.error('Error saving justification:', error);
            onNotification('error', 'Erro ao Salvar', error.message);
        } finally {
            setIsSaving(false);
        }
    };

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

    // Calculate Totals - Based on planning data to match overall strategy
    // Calculate Totals - Based on aggregated stats to ensure consistency and de-duplication
    const totalRequired = useMemo(() => aggregatedStats.reduce((acc, curr) => acc + curr.required, 0), [aggregatedStats]);
    const totalActual = useMemo(() => employees.length, [employees]);
    const totalActive = useMemo(() => employees.filter(e => e.isActive !== false).length, [employees]);
    const totalInactive = totalActual - totalActive;
    const occupancyRate = totalRequired > 0 ? Math.round((totalActive / totalRequired) * 100) : 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-[#0f172a] w-full max-w-[95vw] sm:max-w-7xl rounded-2xl shadow-xl flex flex-col h-[95vh] sm:h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">

                {/* Header Premium - Ultra Compact Single Row */}
                <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] z-20 shrink-0 gap-4 overflow-x-auto custom-scrollbar">
                    {/* Left: Branding */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/20">
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-tight whitespace-nowrap">
                                {t.title}
                            </h2>
                            <div className="flex items-center gap-2">
                                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest opacity-80 whitespace-nowrap">
                                    {t.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Center/Right: Stats - Inline */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden md:flex h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                        <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <Target className="w-3.5 h-3.5 text-indigo-500" />
                            <div className="flex flex-col leading-none">
                                <span className="text-[8px] font-bold text-slate-400 uppercase">{t.totalRequired}</span>
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">{totalRequired}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <Users className="w-3.5 h-3.5 text-emerald-500" />
                            <div className="flex flex-col leading-none">
                                <span className="text-[8px] font-bold text-slate-400 uppercase">{t.totalActual}</span>
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1">
                                    {totalActual}
                                    {totalInactive > 0 && <span className="text-[8px] font-medium text-slate-400">({totalInactive})</span>}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <TrendingUp className={`w-3.5 h-3.5 ${occupancyRate > 100 ? 'text-amber-500' : occupancyRate < 90 ? 'text-rose-500' : 'text-emerald-500'}`} />
                            <div className="flex flex-col leading-none">
                                <span className="text-[8px] font-bold text-slate-400 uppercase">{t.occupancy}</span>
                                <span className="text-xs font-black text-slate-700 dark:text-slate-200">{occupancyRate}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 ml-auto"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div
                    className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20"
                    onScroll={handleTooltipHide}
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 pb-20">
                        {aggregatedStats.map(item => {
                            const actual = item.actual;
                            const required = item.required;
                            const members = item.members;
                            const status = getStatus(required, actual);
                            const diff = actual - required;

                            return (
                                <div key={item.id} className="group relative bg-white dark:bg-[#1e293b] rounded-xl p-2.5 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-white/5 overflow-visible flex flex-col justify-between min-h-[110px]">
                                    {/* Status Glow Background */}
                                    <div className={`absolute -right-4 -top-4 w-12 h-12 blur-xl opacity-0 transition-opacity group-hover:opacity-10 ${status === 'under' ? 'bg-rose-500' :
                                        status === 'over' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`} />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-1.5">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-[10px] font-bold text-slate-800 dark:text-white truncate pr-1 uppercase tracking-tight" title={item.department}>
                                                    {item.department}
                                                </h3>
                                            </div>
                                            <div className={`p-0.5 rounded shadow-sm ${status === 'under' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20' :
                                                status === 'over' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                                                    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                                }`}>
                                                {status === 'under' ? <TrendingDown className="w-2.5 h-2.5" /> :
                                                    status === 'over' ? <TrendingUp className="w-2.5 h-2.5" /> :
                                                        <CheckCircle2 className="w-2.5 h-2.5" />}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 mb-2">
                                            <div className="flex-1 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800/50 flex flex-col items-center justify-center">
                                                <div className="text-[7px] font-bold text-slate-400 uppercase tracking-tight">{t.required}</div>
                                                <div className="text-sm font-bold text-slate-800 dark:text-white leading-none">{required}</div>
                                            </div>
                                            <div
                                                className={`flex-1 group/tooltip relative p-1 rounded-lg border cursor-help transition-colors flex flex-col items-center justify-center ${status === 'under' ? 'bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20 hover:bg-rose-100' :
                                                    status === 'over' ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20 hover:bg-amber-100' :
                                                        'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20 hover:bg-emerald-100'
                                                    }`}
                                                onMouseEnter={(e) => handleTooltipShow(e, members)}
                                                onMouseLeave={handleTooltipHide}
                                            >
                                                <div className="text-[7px] font-bold text-slate-400 uppercase tracking-tight">{t.actual}</div>
                                                <div className={`text-sm font-bold leading-none ${status === 'under' ? 'text-rose-600' :
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

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className={`flex items-center gap-1 px-1 py-0.5 rounded-md text-[7px] font-bold uppercase tracking-wide ${status === 'under' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30' :
                                                status === 'over' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                                }`}>
                                                {status === 'under' ? t.underStaffed :
                                                    status === 'over' ? t.overStaffed : t.matches}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {status !== 'match' && (
                                                    <button
                                                        onClick={() => setEditingJustification({
                                                            deptId: item.id,
                                                            text: item.plan?.justification || '',
                                                            planId: item.plan?.id || null
                                                        })}
                                                        className={`p-1 rounded-md transition-all ${item.plan?.justification ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'}`}
                                                        title={item.plan?.justification ? "Ver/Editar Justificativa" : "Adicionar Justificativa"}
                                                    >
                                                        <MessageSquare className={`${item.plan?.justification ? 'w-3 h-3' : 'w-2.5 h-2.5'} transition-all`} />
                                                        {item.plan?.justification && (
                                                            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse" />
                                                        )}
                                                    </button>
                                                )}
                                                <div className={`text-[9px] font-bold ${diff > 0 ? 'text-amber-500' :
                                                    diff < 0 ? 'text-rose-500' : 'text-emerald-500'
                                                    }`}>
                                                    {diff > 0 ? `+${diff}` : diff === 0 ? <Minus className="w-2.5 h-2.5" /> : diff}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Justification Preview (Sticky Note Style) */}
                                        {item.plan?.justification && (
                                            <div className="mt-1.5 p-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg relative overflow-hidden group/note">
                                                <div className="absolute top-0 right-0 w-3 h-3 bg-amber-200 dark:bg-amber-800 rounded-bl-md shadow-sm" />
                                                <p className="text-[9px] text-amber-800 dark:text-amber-200 line-clamp-2 italic leading-tight pr-1">
                                                    "{item.plan.justification}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* Footer Info - Compact */}
                <div className="bg-white dark:bg-[#0f172a] px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                            <span className="font-bold text-slate-400 uppercase tracking-widest">{t.matches}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/20" />
                            <span className="font-bold text-slate-400 uppercase tracking-widest">{t.underStaffed}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20" />
                            <span className="font-bold text-slate-400 uppercase tracking-widest">{t.overStaffed}</span>
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
            {/* Justification Editor Modal */}
            {editingJustification && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Justificativa</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingJustification.deptId}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingJustification(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6">
                            <textarea
                                autoFocus
                                className="w-full h-40 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500/50 transition-all resize-none shadow-inner"
                                placeholder="Explique o motivo do desvio neste departamento..."
                                value={editingJustification.text}
                                onChange={(e) => setEditingJustification({ ...editingJustification, text: e.target.value })}
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setEditingJustification(null)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    disabled={isSaving}
                                    onClick={saveJustification}
                                    className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>Salvar Justificativa</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeadcountManager;


