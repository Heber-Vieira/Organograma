import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Layout, ArrowRight, LogOut, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Chart } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface ChartDashboardProps {
    organizationId: string;
    onSelectChart: (chartId: string) => void;
    userRole: 'admin' | 'user';
    onLogout: () => void;
    onOpenAdmin: () => void;
    userEmail?: string;
    onNotification: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
    primaryColor?: string;
}

const ChartDashboard: React.FC<ChartDashboardProps> = ({ organizationId, onSelectChart, userRole, onLogout, onOpenAdmin, userEmail, onNotification, primaryColor }) => {
    const [charts, setCharts] = useState<Chart[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newChartName, setNewChartName] = useState('');
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
            const { data, error } = await supabase
                .from('charts')
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setCharts(data || []);
        } catch (error) {
            console.error('Error fetching charts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateChart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChartName.trim()) return;

        try {
            const { data, error } = await supabase
                .from('charts')
                .insert([{
                    organization_id: organizationId,
                    name: newChartName.trim()
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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Meus Organogramas</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Gerencie múltiplos organogramas para sua organização</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {userRole === 'admin' && (
                        <>
                            <button
                                onClick={onOpenAdmin}
                                className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                                title="Configurações"
                                style={{ color: undefined }} // Let hover classes handle default slate, or specific primary hover? let's stick to slate for settings icon to be neutral, or primary? User wants elegant. Neutral is usually more elegant for settings.
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/10 transition-all active:scale-95 hover:brightness-110 text-sm"
                                style={{ backgroundColor: primaryColor || '#4f46e5' }}
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden md:inline">Novo Organograma</span>
                            </button>
                        </>
                    )}
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    <div className="hidden md:block text-right mr-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logado como</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{userEmail}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title="Sair"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {isCreating && (
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
            )}

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
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteChart(chart.id); }}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
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
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
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
        </div>
    );
};

export default ChartDashboard;
