import * as React from 'react';
import { useState, useMemo } from 'react';
import {
    X, Search, HelpCircle, BookOpen, Zap, Target, Layers,
    Palette, Download, TrendingUp, Users, Network,
    ChevronRight, Sparkles, Info, MessageSquare
} from 'lucide-react';

interface HelpCenterProps {
    onClose: () => void;
    primaryColor?: string;
}

interface FeatureItem {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    category: 'basic' | 'strategic' | 'efficiency' | 'design';
    priority: number;
    tip: string;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ onClose, primaryColor }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

    const toggleCard = (id: number) => setExpandedCard(prev => prev === id ? null : id);

    const features: FeatureItem[] = [
        {
            id: 1,
            title: 'Hierarquia & Estrutura',
            description: 'A base de qualquer organograma. Adicione um "Nó Raiz" para começar e use o botão "+" em cada card para adicionar subordinados.',
            icon: <Network className="w-5 h-5" />,
            category: 'basic',
            priority: 1,
            tip: 'Dica: Você pode mover pessoas clicando em "Editar" e alterando o superior hierárquico.'
        },
        {
            id: 2,
            title: 'Importação em Massa',
            description: 'Não perca tempo digitando um por um. Use o botão "Importar CSV/Excel" para carregar centenas de nomes em segundos.',
            icon: <Download className="w-5 h-5" />,
            category: 'efficiency',
            priority: 2,
            tip: 'Dica: Baixe nosso modelo XLSX para garantir que os dados sejam lidos perfeitamente.'
        },
        {
            id: 3,
            title: 'Headcount & Estratégia',
            description: 'Gerencie metas de pessoal por departamento. Compare o "Requerido" com o "Existente" em tempo real.',
            icon: <Target className="w-5 h-5" />,
            category: 'strategic',
            priority: 3,
            tip: 'Dica: Use as Justificativas (ícone de balão) para explicar por que um setor está acima ou abaixo da meta.'
        },
        {
            id: 4,
            title: 'Ações em Massa (Agrupamento)',
            description: 'Selecione múltiplos cards segurando Shift ou clicando na seleção para agrupá-los ou movê-los em bloco.',
            icon: <Users className="w-5 h-5" />,
            category: 'efficiency',
            priority: 4,
            tip: 'Dica: Agrupar pessoas ajuda a manter o gráfico limpo em departamentos com muitos integrantes no mesmo nível.'
        },
        {
            id: 5,
            title: 'Navegação Inteligente',
            description: 'Use o scroll para zoom e arraste a tela para navegar. O botão "Focagem" (Target) centraliza o gráfico automaticamente.',
            icon: <Zap className="w-5 h-5" />,
            category: 'basic',
            priority: 5,
            tip: 'Dica: No mobile, use dois dedos para zoom e arraste para navegar.'
        },
        {
            id: 6,
            title: 'Estilos Visuais High-End',
            description: 'Escolha entre 4 layouts premium (Glass, Tech, Minimal, Pill) que se adaptam à identidade da sua empresa.',
            icon: <Palette className="w-5 h-5" />,
            category: 'design',
            priority: 6,
            tip: 'Dica: O modo "Futuristic Glass" é excelente para apresentações em telas grandes.'
        },
        {
            id: 7,
            title: 'Filtros Dinâmicos',
            description: 'Filtre por Departamento, Turno ou Cargo. A barra lateral e o modo tela cheia oferecem controle total sobre o que você vê.',
            icon: <Layers className="w-5 h-5" />,
            category: 'basic',
            priority: 7,
            tip: 'Dica: Você pode filtrar por "Sem Departamento" para encontrar pessoas não alocadas.'
        },
        {
            id: 8,
            title: 'Exportação Profissional',
            description: 'Gere arquivos prontos para apresentações em PDF, PPTX (PowerPoint) ou imagens de alta resolução (PNG).',
            icon: <Download className="w-5 h-5" />,
            category: 'efficiency',
            priority: 8,
            tip: 'Dica: A exportação em DOCX gera um relatório textual estruturado da organização.'
        },
        {
            id: 9,
            title: 'Alertas de Férias & Aniversários',
            description: 'Mantenha a equipe engajada. O sistema destaca automaticamente quem está fazendo aniversário ou em período de descanso.',
            icon: <Sparkles className="w-5 h-5" />,
            category: 'strategic',
            priority: 9,
            tip: 'Dica: Ative a "Animação de Confete" para celebrar os aniversariantes do dia.'
        },
        {
            id: 10,
            title: 'Identidade Visual',
            description: 'Troque a cor primária do sistema e a logomarca da sua empresa para que o OrgFlow pareça uma ferramenta interna proprietária.',
            icon: <Palette className="w-5 h-5" />,
            category: 'design',
            priority: 10,
            tip: 'Dica: Use o seletor de cores na Dashboard principal para ver as mudanças em tempo real.'
        }
    ];

    const filteredFeatures = useMemo(() => {
        return features
            .filter(f => {
                const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    f.description.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => a.priority - b.priority);
    }, [searchTerm, selectedCategory]);

    const categories = [
        { id: 'all', label: 'Tudo', shortLabel: 'Tudo', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'basic', label: 'Essenciais', shortLabel: 'Base', icon: <Network className="w-4 h-4" /> },
        { id: 'strategic', label: 'Estratégico', shortLabel: 'Estratég.', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'efficiency', label: 'Produtividade', shortLabel: 'Produt.', icon: <Zap className="w-4 h-4" /> },
        { id: 'design', label: 'Design', shortLabel: 'Design', icon: <Palette className="w-4 h-4" /> },
    ];

    return (
        <div className="fixed inset-0 z-[200] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ring-1 ring-black/5">

                {/* Header padding for status bar visibility in some systems */}
                <div className="h-2 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-white dark:bg-[#0f172a] z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <HelpCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Centro de Aprendizado</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Domine o OrgFlow 2.0</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Search & Categories */}
                <div className="px-4 pt-4 pb-3 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                        <input
                            type="text"
                            placeholder="O que você deseja aprender?"
                            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500/50 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Tabs: 5 equal columns, no scroll */}
                    <div className="grid grid-cols-5 gap-1">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all ${selectedCategory === cat.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-500'
                                    }`}
                            >
                                <span className="w-4 h-4 flex items-center justify-center">{cat.icon}</span>
                                <span className="leading-none">{cat.shortLabel}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content List */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
                    {filteredFeatures.length > 0 ? (
                        <>
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {filteredFeatures.length} funcionalidades encontradas
                                </span>
                            </div>

                            {filteredFeatures.map((f) => (
                                <div
                                    key={f.id}
                                    onClick={() => toggleCard(f.id)}
                                    className="group relative bg-white dark:bg-[#1e293b] rounded-[1.75rem] p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-white/5 overflow-hidden cursor-pointer active:scale-[0.98]"
                                >
                                    {/* Priority Badge */}
                                    <div className="absolute top-0 right-0 p-2">
                                        <div className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[8px] font-black text-slate-400 border border-slate-100 dark:border-slate-700">
                                            #{f.priority}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-5">
                                        <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner shrink-0 ${expandedCard === f.id
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white'
                                            }`}>
                                            {f.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-sm font-black mb-2 uppercase tracking-tight transition-colors ${expandedCard === f.id ? 'text-indigo-500' : 'text-slate-800 dark:text-white group-hover:text-indigo-500'
                                                }`}>
                                                {f.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                                {f.description}
                                            </p>

                                            {/* Pro Tip Box - visible when expanded */}
                                            {expandedCard === f.id && (
                                                <div className="mt-4 p-3 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold leading-tight">
                                                        {f.tip}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="self-center shrink-0">
                                            <ChevronRight className={`w-5 h-5 transition-all duration-300 ${expandedCard === f.id
                                                    ? 'text-indigo-500 rotate-90'
                                                    : 'text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1'
                                                }`} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight">Nenhuma lição encontrada</h3>
                            <p className="text-xs text-slate-500 mt-2 font-bold max-w-xs">Tente termos mais simples ou mude a categoria de busca.</p>
                        </div>
                    )}
                </div>

                {/* Footer Advice */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <MessageSquare className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase">Ainda tem dúvidas?</h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">Nossa equipe de suporte está pronta para te ajudar a estruturar sua organização.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
