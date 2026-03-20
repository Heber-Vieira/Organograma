import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Layout, ArrowRight, LogOut, Settings, Copy, Loader2, Pencil, HelpCircle, Shield } from 'lucide-react';
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
    userAvatar?: string | null;
}

const ChartDashboard: React.FC<ChartDashboardProps> = ({ organizationId, onSelectChart, userRole, userId, onLogout, onOpenAdmin, userName, onNotification, primaryColor, onOpenHelp, userAvatar }) => {
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
        if (!organizationId) {
            setIsLoading(false);
            return;
        }

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
                    (chart.allowed_users && chart.allowed_users.includes(userId)) ||
                    (chart.editor_users && chart.editor_users.includes(userId)) ||
                    chart.created_by === userId
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
                    name: trimmedName,
                    created_by: userId
                }])
                .select()
                .single();

            if (error) throw error;

            // --- Lógica: Substituir o do Sistema ---
            // Se o admin cria um novo, removemos qualquer um que seja considerado "de sistema"
            if (userRole === 'admin') {
                const { data: systemCharts } = await supabase
                    .from('charts')
                    .select('id')
                    .neq('id', data.id) // Não remover o que acabamos de criar
                    .or('created_by.is.null, name.ilike.%sistema%, name.ilike.%exemplo%');

                if (systemCharts && systemCharts.length > 0) {
                    const systemChartIds = systemCharts.map(c => c.id);
                    // 1. Remover funcionários desses charts
                    await supabase.from('employees').delete().in('chart_id', systemChartIds);
                    // 2. Remover os charts de sistema
                    await supabase.from('charts').delete().in('id', systemChartIds);
                    console.log('Removendo organogramas de sistema:', systemChartIds);
                }
            }

            onNotification('success', 'Organograma Criado', 'Seu organograma foi criado e substituiu o do sistema.');
            setNewChartName('');
            setIsCreating(false);
            fetchCharts(); // Atualiza a lista removendo o do sistema
        } catch (error: any) {
            console.error('Error creating chart:', error);
            onNotification('error', 'Erro', error.message || 'Erro ao criar organograma.');
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

    const accentColor = primaryColor || '#f97316';
    const accentBg = `${accentColor}12`;
    const accentMid = `${accentColor}22`;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: '#f8f9fb' }}>
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
                        style={{ borderTopColor: accentColor, borderRightColor: `${accentColor}40` }}
                    />
                    <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Carregando</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fb 0%, #f1f4f9 100%)' }}>
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .chart-card { animation: fadeUp .35s ease both; }
                .chart-card:nth-child(1) { animation-delay: .05s }
                .chart-card:nth-child(2) { animation-delay: .10s }
                .chart-card:nth-child(3) { animation-delay: .15s }
                .chart-card:nth-child(4) { animation-delay: .20s }
                .chart-card:nth-child(n+5) { animation-delay: .25s }
            `}</style>

            {/* ── Top Bar ── */}
            <header style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                position: 'sticky', top: 0, zIndex: 40,
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Left: title */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#18181b', letterSpacing: '-0.02em' }}>Meus Organogramas</span>
                        {charts.length > 0 && (
                            <span style={{
                                fontSize: 11, fontWeight: 700, color: accentColor,
                                background: accentBg, borderRadius: 20, padding: '2px 8px',
                                border: `1px solid ${accentMid}`
                            }}>
                                {charts.length}
                            </span>
                        )}
                    </div>

                    {/* Right: actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* User pill */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '5px 12px 5px 8px',
                            background: '#f4f4f5', borderRadius: 99,
                            border: '1px solid #e4e4e7'
                        }}>
                            <div style={{
                                width: 26, height: 26, borderRadius: '50%',
                                background: userAvatar ? 'transparent' : `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
                                overflow: 'hidden'
                            }}>
                                {userAvatar ? (
                                    <img src={userAvatar} alt={userName || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    (userName || 'U')[0].toUpperCase()
                                )}
                            </div>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#3f3f46' }}>{userName || 'Usuário'}</span>
                        </div>

                        {/* Divider */}
                        <div style={{ width: 1, height: 20, background: '#e4e4e7' }} />

                        {/* Help */}
                        {onOpenHelp && (
                            <button onClick={onOpenHelp} title="Ajuda" style={{
                                width: 34, height: 34, border: 'none', background: 'transparent',
                                borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: '#a1a1aa', transition: 'all .15s'
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f4f4f5'; (e.currentTarget as HTMLButtonElement).style.color = '#52525b'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa'; }}
                            >
                                <HelpCircle size={16} strokeWidth={2} />
                            </button>
                        )}

                        {/* Logout */}
                        <button onClick={onLogout} title="Sair" style={{
                            width: 34, height: 34, border: 'none', background: 'transparent',
                            borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#a1a1aa', transition: 'all .15s'
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa'; }}
                        >
                            <LogOut size={16} strokeWidth={2} />
                        </button>

                        {/* Divider */}
                        <div style={{ width: 1, height: 20, background: '#e4e4e7' }} />

                        {/* Admin/Config */}
                        <button onClick={onOpenAdmin} title={userRole === 'admin' ? "Administração" : "Aparência"} style={{
                            height: 34, padding: '0 14px', border: '1.5px solid #e4e4e7',
                            background: '#fff', borderRadius: 8, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 12, fontWeight: 700, color: '#52525b',
                            letterSpacing: '0.04em', transition: 'all .15s'
                        }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f4f4f5'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#d4d4d8'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e4e4e7'; }}
                        >
                            <Shield size={13} strokeWidth={2.5} />
                            {userRole === 'admin' ? 'ADMIN' : 'APARÊNCIA'}
                        </button>

                        {/* New chart */}
                        <button onClick={() => setIsCreating(true)} style={{
                            height: 34, padding: '0 14px', border: 'none',
                            background: accentColor, borderRadius: 8, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 12, fontWeight: 700, color: '#fff',
                            letterSpacing: '0.01em', transition: 'opacity .15s',
                            boxShadow: `0 2px 8px ${accentColor}55`
                        }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
                        >
                            <Plus size={14} strokeWidth={2.5} />
                            Novo
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Main content ── */}
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

                {/* Empty state */}
                {charts.length === 0 ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '72px 24px', textAlign: 'center',
                        border: '1.5px dashed #e4e4e7', borderRadius: 20,
                        background: 'rgba(255,255,255,0.5)'
                    }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, background: accentBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 14, color: accentColor
                        }}>
                            <Layout size={24} />
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#3f3f46', margin: 0 }}>Nenhum organograma ainda</p>
                        {userRole === 'admin' && (
                            <p style={{ fontSize: 13, color: '#a1a1aa', margin: '6px 0 0' }}>Clique em <strong>Novo</strong> para criar o primeiro.</p>
                        )}
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 16
                    }}>
                        {charts.map((chart, i) => (
                            <div
                                key={chart.id}
                                className="chart-card"
                                onClick={() => onSelectChart(chart.id)}
                                style={{
                                    background: '#fff',
                                    border: '1.5px solid #e9eaec',
                                    borderRadius: 16,
                                    padding: '18px 18px 14px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'box-shadow .2s, border-color .2s, transform .2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                }}
                                onMouseEnter={e => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)';
                                    el.style.borderColor = accentColor + '55';
                                    el.style.transform = 'translateY(-2px)';
                                    const actions = el.querySelector('[data-actions]') as HTMLElement | null;
                                    if (actions) actions.style.opacity = '1';
                                }}
                                onMouseLeave={e => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.boxShadow = 'none';
                                    el.style.borderColor = '#e9eaec';
                                    el.style.transform = 'translateY(0)';
                                    const actions = el.querySelector('[data-actions]') as HTMLElement | null;
                                    if (actions) actions.style.opacity = '0';
                                }}
                            >
                                {/* Admin/Creator actions */}
                                {(userRole === 'admin' || chart.created_by === userId) && (
                                    <div data-actions style={{
                                        position: 'absolute', top: 10, right: 10,
                                        display: 'flex', gap: 2, opacity: 0, transition: 'opacity .15s'
                                    }}>
                                        {[
                                            { icon: <Pencil size={13} />, label: 'Renomear', color: '#10b981', bg: '#ecfdf5', action: (e: React.MouseEvent) => { e.stopPropagation(); setIsEditing(chart); setEditName(chart.name); } },
                                            { icon: <Copy size={13} />, label: 'Duplicar', color: '#6366f1', bg: '#eef2ff', action: (e: React.MouseEvent) => { e.stopPropagation(); handleDuplicateChart(chart); } },
                                            { icon: <Trash2 size={13} />, label: 'Excluir', color: '#ef4444', bg: '#fef2f2', action: (e: React.MouseEvent) => { e.stopPropagation(); handleDeleteChart(chart.id); } },
                                        ].map(({ icon, label, color, bg, action }) => (
                                            <button key={label} onClick={action} title={label} style={{
                                                width: 26, height: 26, border: 'none', background: 'transparent',
                                                borderRadius: 6, cursor: 'pointer', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                color: '#a1a1aa', transition: 'all .12s'
                                            }}
                                                onMouseEnter={e2 => { (e2.currentTarget as HTMLButtonElement).style.background = bg; (e2.currentTarget as HTMLButtonElement).style.color = color; }}
                                                onMouseLeave={e2 => { (e2.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e2.currentTarget as HTMLButtonElement).style.color = '#a1a1aa'; }}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Logo / Icon */}
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: accentBg, color: accentColor,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden', flexShrink: 0
                                }}>
                                    {chart.logo_url
                                        ? <img src={chart.logo_url} alt={chart.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        : <Layout size={18} />
                                    }
                                </div>

                                {/* Name + date */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        margin: 0, fontSize: 13.5, fontWeight: 700,
                                        color: '#18181b', whiteSpace: 'nowrap',
                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                        paddingRight: (userRole === 'admin' || chart.created_by === userId) ? 60 : 0
                                    }}>
                                        {chart.name}
                                    </p>
                                    <p style={{ margin: '3px 0 0', fontSize: 10.5, color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.04em' }}>
                                        {new Date(chart.created_at!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    paddingTop: 10, borderTop: '1px solid #f0f0f0'
                                }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                        Acessar
                                    </span>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%',
                                        background: accentBg, color: accentColor,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'transform .2s'
                                    }}>
                                        <ArrowRight size={12} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Modal: Criar ── */}
            {isCreating && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 20, padding: '28px 28px 24px',
                        width: '100%', maxWidth: 360, boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
                        border: '1px solid #f0f0f0'
                    }}>
                        <p style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: '#18181b' }}>Criar Organograma</p>
                        <form onSubmit={handleCreateChart}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Nome</label>
                            <input
                                autoFocus type="text"
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 10, outline: 'none',
                                    border: `1.5px solid ${newChartName.trim() ? accentColor : '#e4e4e7'}`,
                                    fontSize: 14, color: '#18181b', background: '#fafafa',
                                    transition: 'border-color .15s', boxSizing: 'border-box'
                                }}
                                placeholder="Ex: Departamento de TI"
                                value={newChartName}
                                onChange={e => setNewChartName(e.target.value)}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                                <button type="button" onClick={() => setIsCreating(false)} style={{
                                    padding: '8px 16px', border: '1.5px solid #e4e4e7', borderRadius: 8,
                                    background: '#fff', fontSize: 13, fontWeight: 600, color: '#71717a', cursor: 'pointer'
                                }}>Cancelar</button>
                                <button type="submit" disabled={!newChartName.trim()} style={{
                                    padding: '8px 20px', border: 'none', borderRadius: 8,
                                    background: accentColor, fontSize: 13, fontWeight: 700, color: '#fff',
                                    cursor: 'pointer', opacity: newChartName.trim() ? 1 : 0.45
                                }}>Criar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Modal: Renomear ── */}
            {isEditing && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 50,
                    background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 20, padding: '28px 28px 24px',
                        width: '100%', maxWidth: 360, boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
                        border: '1px solid #f0f0f0'
                    }}>
                        <p style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: '#18181b' }}>Renomear Organograma</p>
                        <form onSubmit={handleUpdateChartName}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Novo Nome</label>
                            <input
                                autoFocus type="text"
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 10, outline: 'none',
                                    border: `1.5px solid ${editName.trim() ? accentColor : '#e4e4e7'}`,
                                    fontSize: 14, color: '#18181b', background: '#fafafa',
                                    transition: 'border-color .15s', boxSizing: 'border-box'
                                }}
                                placeholder="Novo Nome"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                                <button type="button" onClick={() => setIsEditing(null)} style={{
                                    padding: '8px 16px', border: '1.5px solid #e4e4e7', borderRadius: 8,
                                    background: '#fff', fontSize: 13, fontWeight: 600, color: '#71717a', cursor: 'pointer'
                                }}>Cancelar</button>
                                <button type="submit" disabled={!editName.trim()} style={{
                                    padding: '8px 20px', border: 'none', borderRadius: 8,
                                    background: accentColor, fontSize: 13, fontWeight: 700, color: '#fff',
                                    cursor: 'pointer', opacity: editName.trim() ? 1 : 0.45
                                }}>Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

