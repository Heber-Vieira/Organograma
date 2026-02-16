import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            window.location.reload();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ocorreu um erro.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] dark:bg-[#0f172a] p-4 font-sans">
            <div className="w-full max-w-md bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">
                        Bem-vindo de volta
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Entre com suas credenciais para acessar
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 ml-1">Email</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#00897b] outline-none transition-all font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 ml-1">Senha</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-[#00897b] outline-none transition-all font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00897b] transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{message.text}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#00897b] hover:bg-[#00796b] text-white rounded-xl font-black uppercase tracking-wide transition-all shadow-lg shadow-[#00897b]/20 hover:shadow-[#00897b]/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Entrar
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
