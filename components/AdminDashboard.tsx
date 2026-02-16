import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js'; // Importar para criar cliente temporário
import { Profile } from '../types';
import { Trash2, Shield, ShieldOff, RotateCcw, Search, X, Check, AlertTriangle, Loader2, Ban, UserPlus, Pencil, Save, Eye, EyeOff } from 'lucide-react';

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserEmail?: string;
    onNotification: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
    roles: string[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    isOpen,
    onClose,
    currentUserEmail,
    onNotification,
    roles
}) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Estados para Edição
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'users' | 'headcount'>('users');

    // Estados para Planejamento de Headcount
    const [headcountPlanning, setHeadcountPlanning] = useState<any[]>([]);
    const [isHeadcountLoading, setIsHeadcountLoading] = useState(false);

    // Estados para Criação
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'user' as 'admin' | 'user'
    });
    const [showNewUserPassword, setShowNewUserPassword] = useState(false);

    // Estado para o Modal de Confirmação
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'info'
    });

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        if (isOpen) {
            fetchProfiles();
            fetchHeadcount();
        }
    }, [isOpen]);

    const fetchHeadcount = async () => {
        setIsHeadcountLoading(true);
        try {
            const { data, error } = await supabase
                .from('headcount_planning')
                .select('*')
                .order('role');

            if (error) throw error;
            setHeadcountPlanning(data || []);
        } catch (error) {
            console.error('Erro ao buscar planejamento:', error);
        } finally {
            setIsHeadcountLoading(false);
        }
    };

    const fetchProfiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error: any) {
            console.error('Erro ao buscar perfis:', error);
            setError(error.message || 'Erro ao carregar lista de usuários.');
            onNotification('error', 'Erro ao carregar', 'Não foi possível buscar a lista de usuários.');
        } finally {
            setLoading(false);
        }
    };

    // --- Lógica de Edição ---
    const handleEditUser = (profile: Profile) => {
        setEditingUser({ ...profile });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        setActionLoading('save-edit');
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editingUser.full_name,
                    role: editingUser.role
                })
                .eq('id', editingUser.id);

            if (error) throw error;

            setProfiles(prev => prev.map(p => p.id === editingUser.id ? editingUser : p));
            onNotification('success', 'Usuário Atualizado', 'As informações foram salvas com sucesso.');
            setIsEditModalOpen(false);
        } catch (error: any) {
            console.error('Erro ao editar usuário:', error);
            onNotification('error', 'Erro ao Editar', error.message || 'Falha ao salvar alterações.');
        } finally {
            setActionLoading(null);
        }
    };

    // --- Lógica de Criação ---
    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password || !newUser.full_name) {
            onNotification('warning', 'Campos Obrigatórios', 'Preencha todos os campos.');
            return;
        }

        setActionLoading('create-user');
        try {
            // Usar cliente temporário para não deslogar o admin
            const tempSupabase = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                {
                    auth: {
                        persistSession: false, // Importante: não salvar sessão
                        autoRefreshToken: false,
                        detectSessionInUrl: false
                    }
                }
            );

            // 1. Criar Auth User
            const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        full_name: newUser.full_name,
                        role: newUser.role
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. O trigger deve criar o profile, mas podemos garantir ou atualizar
                // Vamos aguardar um pouco ou tentar atualizar o profile recém criado via trigger
                // Mas como o trigger roda no server, pode ser rápido.

                // Opcional: Atualizar profile explicitamente caso o trigger falhe em alguns campos
                // Mas o trigger geralmente pega o RAW USER META DATA

                onNotification('success', 'Usuário Criado', 'Novo usuário adicionado com sucesso.');
                setIsCreateModalOpen(false);
                setNewUser({ email: '', password: '', full_name: '', role: 'user' });
                fetchProfiles(); // Recarregar lista
            }

        } catch (error: any) {
            console.error('Erro ao criar usuário:', error);
            onNotification('error', 'Erro ao Criar', error.message || 'Falha ao criar novo usuário.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Excluir Usuário',
            message: 'Tem certeza que deseja excluir permanentemente este usuário? Esta ação é irreversível.',
            type: 'danger',
            onConfirm: async () => {
                setActionLoading(id);
                try {
                    const { error } = await supabase
                        .from('profiles')
                        .delete()
                        .eq('id', id);

                    if (error) throw error;
                    setProfiles(prev => prev.filter(p => p.id !== id));
                    onNotification('success', 'Usuário Excluído', 'O usuário foi removido com sucesso.');
                } catch (error) {
                    console.error('Erro ao excluir usuário:', error);
                    onNotification('error', 'Erro', 'Falha ao excluir usuário.');
                } finally {
                    setActionLoading(null);
                    closeConfirmModal();
                }
            }
        });
    };

    const handleToggleStatus = (id: string, currentStatus: boolean) => {
        setConfirmModal({
            isOpen: true,
            title: currentStatus ? 'Bloquear Acesso' : 'Desbloquear Acesso',
            message: `Tem certeza que deseja ${currentStatus ? 'bloquear' : 'liberar'} o acesso deste usuário?`,
            type: currentStatus ? 'danger' : 'warning',
            onConfirm: async () => {
                setActionLoading(id);
                try {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ is_active: !currentStatus })
                        .eq('id', id);

                    if (error) throw error;
                    setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
                    onNotification('success', 'Status Atualizado', `Usuário ${!currentStatus ? 'desbloqueado' : 'bloqueado'} com sucesso.`);
                } catch (error) {
                    console.error('Erro ao alterar status:', error);
                    onNotification('error', 'Erro', 'Falha ao alterar status do usuário.');
                } finally {
                    setActionLoading(null);
                    closeConfirmModal();
                }
            }
        });
    };

    const handlePasswordReset = (email: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Redefinir Senha',
            message: `Enviar email de recuperação de senha para ${email}?`,
            type: 'info',
            onConfirm: async () => {
                setActionLoading(email);
                try {
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: window.location.origin,
                    });

                    if (error) throw error;
                    onNotification('success', 'Email Enviado', `Email de recuperação enviado para ${email}`);
                } catch (error: any) {
                    console.error('Erro ao enviar reset:', error);
                    onNotification('error', 'Erro', error.message);
                } finally {
                    setActionLoading(null);
                    closeConfirmModal();
                }
            }
        });
    };

    const handleToggleHeadcountPermission = async (id: string, currentPermission: boolean) => {
        setActionLoading(id);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ view_headcount_permission: !currentPermission })
                .eq('id', id);

            if (error) throw error;
            setProfiles(prev => prev.map(p => p.id === id ? { ...p, view_headcount_permission: !currentPermission } : p));
            onNotification('success', 'Permissão Atualizada', `Acesso ao headcount ${!currentPermission ? 'liberado' : 'revogado'}.`);
        } catch (error) {
            console.error('Erro ao alterar permissão:', error);
            onNotification('error', 'Erro', 'Falha ao alterar permissão de headcount.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateHeadcount = async (role: string, count: number) => {
        setActionLoading(`headcount-${role}`);
        try {
            const existing = headcountPlanning.find(h => h.role === role);
            if (existing) {
                const { error } = await supabase
                    .from('headcount_planning')
                    .update({ required_count: count, updated_at: new Date().toISOString() })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('headcount_planning')
                    .insert([{ role, required_count: count }]);
                if (error) throw error;
            }
            fetchHeadcount();
            onNotification('success', 'Planejamento Salvo', `Meta para ${role} atualizada.`);
        } catch (error: any) {
            onNotification('error', 'Erro ao Salvar', error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleRole = (id: string, currentRole: string) => {
        const isPromoting = currentRole !== 'admin';
        setConfirmModal({
            isOpen: true,
            title: isPromoting ? 'Promover a Admin' : 'Rebaixar para Usuário',
            message: `Tem certeza que deseja alterar o nível de acesso? ${isPromoting ? 'O usuário terá acesso total ao sistema.' : 'O usuário perderá acesso administrativo.'}`,
            type: isPromoting ? 'warning' : 'danger',
            onConfirm: async () => {
                setActionLoading(id);
                try {
                    const newRole = isPromoting ? 'admin' : 'user';
                    const { error } = await supabase
                        .from('profiles')
                        .update({ role: newRole })
                        .eq('id', id);

                    if (error) throw error;
                    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole as 'admin' | 'user' } : p));
                    onNotification('success', 'Permissão Alterada', `Usuário ${isPromoting ? 'promovido' : 'rebaixado'} com sucesso.`);
                } catch (error) {
                    console.error('Erro ao alterar cargo:', error);
                    onNotification('error', 'Erro', 'Falha ao alterar permissão do usuário.');
                } finally {
                    setActionLoading(null);
                    closeConfirmModal();
                }
            }
        });
    };

    const filteredProfiles = profiles.filter(p =>
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop with Blur */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-[#0f172a] w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-white/20 ring-1 ring-black/5">

                {/* Header Minimalista Con Ações */}
                <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#0f172a] shrink-0">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-1.5 md:p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-white leading-tight truncate">
                                Painel Admin
                            </h2>
                            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                                Gestão de usuários
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-colors shadow-sm"
                        >
                            <UserPlus className="w-4 h-4" />
                            Novo Usuário
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Toolbar Compacta e Abas */}
                <div className="px-4 md:px-6 py-3 md:py-4 flex flex-col gap-3 md:gap-4 shrink-0">
                    <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 py-1.5 md:py-2 px-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Usuários
                        </button>
                        <button
                            onClick={() => setActiveTab('headcount')}
                            className={`flex-1 py-1.5 md:py-2 px-2 text-[10px] md:text-xs font-bold uppercase rounded-lg transition-all whitespace-nowrap ${activeTab === 'headcount' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Planejamento
                        </button>
                    </div>

                    {activeTab === 'users' && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative group flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Buscar membro..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none transition-all placeholder-slate-400"
                                />
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wide transition-colors shadow-sm"
                            >
                                <UserPlus className="w-4 h-4" />
                                Novo Usuário
                            </button>
                        </div>
                    )}
                </div>

                {/* Conteúdo das Abas */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                    {activeTab === 'users' ? (
                        loading ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                <span className="text-xs font-medium animate-pulse">Carregando...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <p className="text-red-500 text-sm font-medium text-center">{error}</p>
                                <button
                                    onClick={fetchProfiles}
                                    className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                                >
                                    Tentar
                                </button>
                            </div>
                        ) : filteredProfiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
                                <Search className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                                <span className="text-sm">Nenhum usuário.</span>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {filteredProfiles.map(profile => (
                                    <div
                                        key={profile.id}
                                        className="group flex items-center justify-between p-3 bg-white dark:bg-[#1e293b]/30 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 rounded-xl transition-all hover:shadow-sm"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`w-9 h-9 min-w-[36px] rounded-lg flex items-center justify-center font-bold text-sm uppercase ${profile.role === 'admin'
                                                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {profile.full_name?.[0] || profile.email[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate flex items-center gap-2">
                                                    {profile.full_name || 'Sem nome'}
                                                    {profile.role === 'admin' && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="Admin"></span>
                                                    )}
                                                    {profile.view_headcount_permission && (
                                                        <span title="Pode ver Headcount">
                                                            <Eye className="w-3 h-3 text-green-500" />
                                                        </span>
                                                    )}
                                                    {!profile.is_active && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Bloqueado"></span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-slate-400 truncate font-mono">
                                                    {profile.email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions Toolbar - Minimalist */}
                                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pl-2">
                                            <button
                                                onClick={() => handleToggleHeadcountPermission(profile.id, !!profile.view_headcount_permission)}
                                                disabled={profile.role === 'admin' || !!actionLoading}
                                                className={`p-1.5 rounded-lg transition-colors ${profile.view_headcount_permission
                                                    ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                                                    : 'text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    } ${profile.role === 'admin' ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                title="Toggle Headcount Permission"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => handleEditUser(profile)}
                                                disabled={!!actionLoading}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Editar Usuário"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => handleToggleRole(profile.id, profile.role || 'user')}
                                                disabled={profile.email === currentUserEmail || !!actionLoading}
                                                className={`p-1.5 rounded-lg transition-colors ${profile.role === 'admin'
                                                    ? 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20'
                                                    : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}
                                                title={profile.role === 'admin' ? "Remover Admin" : "Tornar Admin"}
                                            >
                                                {profile.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                            </button>

                                            <button
                                                onClick={() => handlePasswordReset(profile.email)}
                                                disabled={!!actionLoading}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                title="Resetar Senha"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => handleToggleStatus(profile.id, profile.is_active ?? true)}
                                                disabled={profile.email === currentUserEmail || !!actionLoading}
                                                className={`p-1.5 rounded-lg transition-colors ${profile.is_active
                                                    ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                                    : 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20'
                                                    }`}
                                                title={profile.is_active ? "Bloquear" : "Ativar"}
                                            >
                                                {profile.is_active ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteUser(profile.id)}
                                                disabled={profile.email === currentUserEmail || !!actionLoading}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Excluir Usuário"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        /* Interface de Planejamento Headcount */
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                                <h4 className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 mb-1">Dica Estratégica</h4>
                                <p className="text-xs text-indigo-500/80 leading-relaxed font-medium">
                                    Defina a quantidade ideal de funcionários para cada cargo. O sistema destacará automaticamente áreas com defasagem ou excesso de pessoal.
                                </p>
                            </div>

                            {isHeadcountLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {/* Lista de cargos existentes no organograma para configurar */}
                                    {roles.map(role => {
                                        const planning = headcountPlanning.find(h => h.role === role);
                                        return (
                                            <div key={role} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                                <div>
                                                    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200">{role}</h5>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Meta Atual: {planning?.required_count || 0}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        defaultValue={planning?.required_count || 0}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            // Opcionalmente podemos salvar ao perder o foco ou debounced
                                                        }}
                                                        onBlur={(e) => handleUpdateHeadcount(role || '', parseInt(e.target.value) || 0)}
                                                        className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-white outline-none focus:border-indigo-500"
                                                    />
                                                    {actionLoading === `headcount-${role}` && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Minimalista */}
                <div className="bg-slate-50 dark:bg-slate-900/30 p-3 text-center border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-50">
                        Admin System
                    </p>
                </div>
            </div>

            {/* Modal de Criação de Usuário */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-indigo-500" />
                                Novo Usuário
                            </h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={newUser.full_name}
                                    onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white focus:border-indigo-500 border-2 outline-none transition-all dark:text-white"
                                    placeholder="Ex: João Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white focus:border-indigo-500 border-2 outline-none transition-all dark:text-white"
                                    placeholder="Ex: joao@empresa.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Senha</label>
                                <div className="relative">
                                    <input
                                        type={showNewUserPassword ? "text" : "password"}
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white focus:border-indigo-500 border-2 outline-none transition-all dark:text-white pr-10"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500"
                                    >
                                        {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nível de Acesso</label>
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setNewUser({ ...newUser, role: 'user' })}
                                        className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${newUser.role === 'user' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Usuário
                                    </button>
                                    <button
                                        onClick={() => setNewUser({ ...newUser, role: 'admin' })}
                                        className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${newUser.role === 'admin' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Administrador
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50">
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateUser}
                                disabled={actionLoading === 'create-user'}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                {actionLoading === 'create-user' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar Usuário
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição de Usuário */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-blue-500" />
                                Editar Usuário
                            </h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={editingUser.full_name || ''}
                                    onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white focus:border-blue-500 border-2 outline-none transition-all dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email (Somente Leitura)</label>
                                <input
                                    type="email"
                                    value={editingUser.email}
                                    disabled
                                    className="w-full px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-900/50 border-transparent text-slate-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nível de Acesso</label>
                                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] p-1.5 shadow-inner ring-1 ring-black/5 overflow-hidden">
                                    <button
                                        onClick={() => setEditingUser({ ...editingUser, role: 'user' })}
                                        className={`flex-1 py-1.5 px-2 text-xs font-bold uppercase rounded-md transition-all whitespace-nowrap ${editingUser.role === 'user' || !editingUser.role ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Usuário
                                    </button>
                                    <button
                                        onClick={() => setEditingUser({ ...editingUser, role: 'admin' })}
                                        className={`flex-1 py-1.5 px-2 text-xs font-bold uppercase rounded-md transition-all whitespace-nowrap ${editingUser.role === 'admin' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Administrador
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={actionLoading === 'save-edit'}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                {actionLoading === 'save-edit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação Customizado */}
            {confirmModal.isOpen && (
                <div className="absolute inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 max-w-sm w-full border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                        <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center ${confirmModal.type === 'danger' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            confirmModal.type === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">{confirmModal.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={closeConfirmModal}
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wide text-white transition-colors shadow-lg ${confirmModal.type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' :
                                    confirmModal.type === 'warning' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' :
                                        'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
                                    }`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
