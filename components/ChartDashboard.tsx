import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Layout, ArrowRight, LogOut, Settings, Copy, Loader2, Pencil, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Chart } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface ChartDashboardProps {
    organizationId: string;
    onSelectChart: (chartId: string) => void;
    userRole: 'admin' | 'user';
    userId: string;
    onLogout: () => void;
    onOpenAdmin: () => void;
    userName?: string;
    onNotification: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
    primaryColor?: string;
    onOpenHelp?: () => void;
}

const ChartDashboard: React.FC<ChartDashboardProps> = ({ organizationId, onSelectChart, userRole, userId, onLogout, onOpenAdmin, userName, onNotification, primaryColor, onOpenHelp }) => {
    const [charts, setCharts] = useState<Chart[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newChartName, setNewChartName] = useState('');
    const [isEditing, setIsEditing] = useState<Chart | null>(null);
    const [editName, setEditName] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'warning'
    });

    useEffect(() => {
        fetchCharts();
    }, [organizationId]);

    const fetchCharts = async () => {
        try {
            let query = supabase
                .from('charts')
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: true });

            const { data, error } = await query;
            if (error) throw error;

            // If RLS is configured correctly, it will automatically filter the charts.
            // But we keep this check in JS just in case RLS is missing or incorrectly configured.
            let finalData = data || [];
            if (userRole !== 'admin') {
                finalData = finalData.filter(chart =>
                    chart.allowed_users && chart.allowed_users.includes(userId)
                );
            }

            setCharts(finalData);
        } catch (error: any) {
            console.error('Error fetching charts:', error);
            onNotification('error', 'Erro ao carregar organogramas', error.message || 'Falha na comunicação com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const checkNameDuplicate = (name: string, excludeId?: string) => {
        return charts.some(c =>
            c.name.trim().toLowerCase() === name.trim().toLowerCase() &&
            c.id !== excludeId
        );
    };

    const handleCreateChart = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newChartName.trim();
        if (!trimmedName) return;

        if (checkNameDuplicate(trimmedName)) {
            onNotification('warning', 'Aviso', 'Já existe um organograma com este nome.');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('charts')
                .insert([{
                    organization_id: organizationId,
                    name: newChartName.trim(),
                    created_by: userId
                }])
                .select()
                .single();

            if (error) throw error;

            setCharts([...charts, data]);
            setNewChartName('');
            setIsCreating(false);
        } catch (error) {
            console.error('Error creating chart:', error);
            onNotification('error', 'Erro', 'Erro ao criar organograma.');
        }
    };

    const generateUUID = () => {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
            return window.crypto.randomUUID();
        }
        // Fallback for non-secure contexts
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleDuplicateChart = async (chart: Chart) => {
        const getDuplicateName = (baseName: string) => {
            let name = `${baseName} (Cópia)`;
            let counter = 2;
            while (checkNameDuplicate(name)) {
                name = `${baseName} (Cópia ${counter})`;
                counter++;
            }
            return name;
        };

        setIsLoading(true);
        try {
            const newName = getDuplicateName(chart.name);

            // 1. Criar novo organograma (removendo campos automáticos)
            const { data: newChart, error: chartError } = await supabase
                .from('charts')
                .insert([{
                    organization_id: organizationId,
                    name: newName,
                    logo_url: chart.logo_url,
                    created_by: userId
                }])
                .select()
                .single();

            if (chartError) throw chartError;

            // 2. Buscar funcionários do original
            const { data: employees, error: empError } = await supabase
                .from('employees')
                .select('*')
                .eq('chart_id', chart.id);

            if (empError) throw empError;

            if (employees && employees.length > 0) {
                // Criar mapeamento de IDs antigos para novos IDs (para manter hierarquia)
                const idMap = new Map();

                // Preparar novos funcionários
                const employeesWithNewIds = employees.map(emp => {
                    const newId = generateUUID();
                    idMap.set(emp.id, newId);

                    // Remover campos que o DB deve gerar ou que vão mudar
                    const { id, created_at, updated_at, chart_id, ...rest } = emp;
                    return {
                        ...rest,
                        id: newId,
                        chart_id: newChart.id
                    };
                });

                // Atualizar parent_id para os novos IDs no mapeamento
                const employeesToInsert = employeesWithNewIds.map(emp => ({
                    ...emp,
                    parent_id: emp.parent_id ? idMap.get(emp.parent_id) : null
                }));

                // Inserir novos funcionários em lote
                const { error: insertEmpError } = await supabase
                    .from('employees')
                    .insert(employeesToInsert);

                if (insertEmpError) throw insertEmpError;
            }

            // 3. Buscar planejamento do original
            const { data: planning, error: planError } = await supabase
                .from('headcount_planning')
                .select('*')
                .eq('chart_id', chart.id);

            if (planError) throw planError;

            if (planning && planning.length > 0) {
                const planningToInsert = planning
                    .filter(p => (p.department || '').trim() !== '') // Evita clonar metas para departamentos vazios ("fantasmas")
                    .map(p => {
                        const { id, created_at, updated_at, chart_id, ...rest } = p;
                        return {
                            ...rest,
                            id: generateUUID(),
                            chart_id: newChart.id
                        };
                    });

                if (planningToInsert.length > 0) {
                    const { error: insertPlanError } = await supabase
                        .from('headcount_planning')
                        .insert(planningToInsert);

                    if (insertPlanError) throw insertPlanError;
                }
            }

            onNotification('success', 'Sucesso', 'Organograma clonado com sucesso!');
            fetchCharts();
        } catch (error) {
            console.error('Error duplicating chart:', error);
            onNotification('error', 'Erro', 'Erro ao clonar organograma. Verifique o console para mais detalhes.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateChartName = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = editName.trim();
        if (!isEditing || !trimmedName) return;

        if (checkNameDuplicate(trimmedName, isEditing.id)) {
            onNotification('warning', 'Aviso', 'Já existe outro organograma com este nome.');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('charts')
                .update({ name: trimmedName })
                .eq('id', isEditing.id);

            if (error) throw error;

            setCharts(charts.map(c => c.id === isEditing.id ? { ...c, name: trimmedName } : c));
            setIsEditing(null);
            setEditName('');
            onNotification('success', 'Sucesso', 'Organograma renomeado com sucesso!');
        } catch (error) {
            console.error('Error updating chart name:', error);
            onNotification('error', 'Erro', 'Erro ao renomear organograma.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteChart = async (chartId: string) => {
        setConfirmationModal({
            isOpen: true,
            title: 'Excluir Organograma?',
            message: 'Tem certeza? Todos os dados deste organograma serão perdidos permanentemente.',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('charts')
                        .delete()
                        .eq('id', chartId);

                    if (error) throw error;
                    setCharts(prev => prev.filter(c => c.id !== chartId));
                } catch (error) {
                    console.error('Error deleting chart:', error);
                    onNotification('error', 'Erro', 'Erro ao excluir organograma.');
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div
                    className="animate-spin rounded-full h-10 w-10 border-b-2"
                    style={{ borderColor: primaryColor || '#4f46e5' }}
                ></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-xl md:text-[22px] font-black text-[#1e293b] dark:text-white mb-0.5 tracking-tight">Meus Organogramas</h1>
                    <p className="text-[13px] text-slate-500/90 dark:text-slate-400 font-medium">Gerencie múltiplos organogramas para sua organização</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Action Icons Pill */}
                    <div className="flex items-center px-1.5 py-1.5 bg-slate-50 dark:bg-[#1e293b]/50 rounded-[14px] border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
                        <button
                            onClick={onOpenAdmin}
                            className="p-1.5 text-slate-500 hover:text-[#4f46e5] hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                            title="Configurações"
                        >
                            <Settings className="w-4.5 h-4.5" strokeWidth={2} />
                        </button>
                        {onOpenHelp && (
                            <button
                                onClick={onOpenHelp}
                                className="p-1.5 text-slate-500 hover:text-[#4f46e5] hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all mx-0.5"
                                title="Ajuda"
                            >
                                <HelpCircle className="w-4.5 h-4.5" strokeWidth={2} />
                            </button>
                        )}
                        <button
                            onClick={onLogout}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                            title="Sair"
                        >
                            <LogOut className="w-4.5 h-4.5" strokeWidth={2} />
                        </button>
                    </div>

                    <div className="h-8 w-px bg-slate-200/80 dark:bg-slate-700 hidden md:block"></div>

                    {/* User Info & Primary Button */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-start justify-center">
                            <span className="text-[9px] font-black text-[#818cf8] uppercase tracking-widest leading-none mb-0.5">Logado como</span>
                            <span className="text-[13px] font-bold text-[#334155] dark:text-slate-300 leading-none">{userName || 'Usuário'}</span>
                        </div>

                        {userRole === 'admin' && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 text-[13px] shadow-[0_2px_10px_rgb(0,0,0,0.1)] hover:shadow-[0_4px_15px_rgb(0,0,0,0.1)] flex-1 md:flex-none justify-center"
                                style={{ backgroundColor: '#475569' }} // Darker slate as seen in mockup
                            >
                                <Plus className="w-4 h-4" strokeWidth={2.5} />
                                <span>Novo Organograma</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {
                isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Criar Organograma</h3>
                            <form onSubmit={handleCreateChart}>
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nome</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all focus:bg-white dark:focus:bg-slate-800"
                                        style={{ borderColor: newChartName.trim() ? primaryColor : undefined }}
                                        placeholder="Ex: Departamento de TI"
                                        value={newChartName}
                                        onChange={e => setNewChartName(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newChartName.trim()}
                                        className="px-4 py-2 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md text-sm"
                                        style={{ backgroundColor: primaryColor || '#4f46e5' }}
                                    >
                                        Criar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Renomear Organograma</h3>
                            <form onSubmit={handleUpdateChartName}>
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Novo Nome</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none transition-all focus:bg-white dark:focus:bg-slate-800"
                                        style={{ borderColor: editName.trim() ? primaryColor : undefined }}
                                        placeholder="Ex: Novo Nome do Organograma"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(null)}
                                        className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!editName.trim()}
                                        className="px-4 py-2 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md text-sm"
                                        style={{ backgroundColor: primaryColor || '#4f46e5' }}
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {charts.map(chart => (
                    <div
                        key={chart.id}
                        className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 border border-slate-200 dark:border-slate-700 hover:border-transparent transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
                        onClick={() => onSelectChart(chart.id)}
                        style={{ borderColor: undefined }} // Override any inline style if needed, prefer class hover
                    >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {userRole === 'admin' && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsEditing(chart);
                                            setEditName(chart.name);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                        title="Renomear"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDuplicateChart(chart); }}
                                        className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                        title="Duplicar"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteChart(chart.id); }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 overflow-hidden"
                            style={{
                                backgroundColor: primaryColor ? `${primaryColor}15` : '#eef2ff',
                                color: primaryColor || '#4f46e5'
                            }}
                        >
                            {chart.logo_url ? (
                                <img src={chart.logo_url} alt={chart.name} className="w-full h-full object-contain" />
                            ) : (
                                <Layout className="w-6 h-6" />
                            )}
                        </div>

                        <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1 pr-6 truncate leading-tight">{chart.name}</h3>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0">
                                {new Date(chart.created_at!).toLocaleDateString()}
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                            <span
                                className="text-xs font-bold uppercase tracking-wide group-hover:underline decoration-2 underline-offset-4 decoration-transparent group-hover:decoration-current transition-all"
                                style={{ color: primaryColor || '#4f46e5' }}
                            >
                                Acessar
                            </span>
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                                style={{
                                    backgroundColor: primaryColor ? `${primaryColor}15` : '#eef2ff',
                                    color: primaryColor || '#4f46e5'
                                }}
                            >
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </div>
                ))}

                {charts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-6 md:p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                        <Layout className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-base font-medium">Nenhum organograma encontrado.</p>
                        {userRole === 'admin' && <p className="text-xs mt-1 opacity-70">Crie o primeiro para começar.</p>}
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                title={confirmationModal.title}
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                variant={confirmationModal.variant}
                confirmText="Sim, Excluir"
                cancelText="Cancelar"
            />
        </div >
    );
};

export default ChartDashboard;
