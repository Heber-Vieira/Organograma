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
}

const ChartDashboard: React.FC<ChartDashboardProps> = ({ organizationId, onSelectChart, userRole, onLogout, onOpenAdmin, userEmail, onNotification }) => {
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
        return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Meus Organogramas</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gerencie múltiplos organogramas para sua organização</p>
                </div>

                <div className="flex items-center gap-4">
                    {userRole === 'admin' && (
                        <>
                            <button
                                onClick={onOpenAdmin}
                                className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                                title="Configurações"
                            >
                                <Settings className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
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
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95">
                        <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Criar Novo Organograma</h3>
                        <form onSubmit={handleCreateChart}>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Nome do Organograma</label>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-indigo-500 outline-none transition-colors"
                                    placeholder="Ex: Departamento de TI"
                                    value={newChartName}
                                    onChange={e => setNewChartName(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newChartName.trim()}
                                    className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    Criar Organograma
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {charts.map(chart => (
                    <div key={chart.id} className="group relative bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 border border-slate-100 dark:border-slate-700 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => onSelectChart(chart.id)}>
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            {userRole === 'admin' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteChart(chart.id); }}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 overflow-hidden">
                            {chart.logo_url ? (
                                <img src={chart.logo_url} alt={chart.name} className="w-full h-full object-contain" />
                            ) : (
                                <Layout className="w-8 h-8" />
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 pr-8">{chart.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Criado em {new Date(chart.created_at!).toLocaleDateString()}</p>

                        <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-wide uppercase group-hover:translate-x-2 transition-transform">
                            Abrir Organograma <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                    </div>
                ))}

                {charts.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-slate-400">
                        <Layout className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg">Nenhum organograma encontrado.</p>
                        {userRole === 'admin' && <p className="text-sm">Crie o primeiro para começar.</p>}
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
