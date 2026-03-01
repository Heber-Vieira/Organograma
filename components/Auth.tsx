import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, GitBranch, Shield, Users } from 'lucide-react';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [orgBranding, setOrgBranding] = useState<{ name: string; logo: string | null; tagline: string } | null>(null);

    // Fetch dynamic branding from the organization OR the first chart
    useEffect(() => {
        const fetchBranding = async () => {
            try {
                // 1. Tentar pegar da organização
                const { data: orgData } = await supabase
                    .from('organizations')
                    .select('name, logo_url')
                    .limit(1)
                    .maybeSingle();

                if (orgData && (orgData.name || orgData.logo_url)) {
                    setOrgBranding({
                        name: orgData.name || 'OrgFlow',
                        logo: orgData.logo_url,
                        tagline: 'gestão inteligente de pessoas'
                    });
                    return;
                }

                // 2. Se não tiver na org, tentar pegar do primeiro organograma (fallback)
                const { data: chartData } = await supabase
                    .from('charts')
                    .select('name, logo_url')
                    .order('created_at', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                if (chartData) {
                    setOrgBranding({
                        name: chartData.name,
                        logo: chartData.logo_url,
                        tagline: 'seu organograma inteligente'
                    });
                }
            } catch (err) {
                console.warn('Erro ao carregar branding:', err);
            }
        };
        fetchBranding();
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            window.location.reload();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Ocorreu um erro ao autenticar.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                .auth-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f0f2f7;
                    font-family: 'Inter', sans-serif;
                    padding: 1rem;
                }

                .auth-card {
                    display: flex;
                    width: 100%;
                    max-width: 860px;
                    min-height: 520px;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.14);
                }

                /* ─── LEFT PANEL ──────────────────────────────── */
                .auth-left {
                    width: 420px;
                    flex-shrink: 0;
                    background: linear-gradient(155deg, #3b1f6e 0%, #5a2d9f 45%, #7c3fca 100%);
                    padding: 44px 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                }

                .auth-left::before {
                    content: '';
                    position: absolute;
                    top: -80px;
                    right: -80px;
                    width: 260px;
                    height: 260px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    pointer-events: none;
                }

                .auth-left::after {
                    content: '';
                    position: absolute;
                    bottom: -60px;
                    left: -60px;
                    width: 200px;
                    height: 200px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.04);
                    pointer-events: none;
                }

                .auth-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .auth-logo-icon {
                    width: 38px;
                    height: 38px;
                    background: rgba(255,255,255,0.15);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                }

                .auth-logo-text {
                    font-size: 18px;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.3px;
                }

                .auth-logo-sub {
                    font-size: 11px;
                    font-weight: 500;
                    color: rgba(255,255,255,0.6);
                    letter-spacing: 0.5px;
                    margin-top: 1px;
                }

                .auth-badge {
                    display: inline-block;
                    background: rgba(255,255,255,0.12);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 999px;
                    padding: 5px 14px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                    color: rgba(255,255,255,0.85);
                    text-transform: uppercase;
                    margin-bottom: 22px;
                }

                .auth-headline {
                    font-size: 30px;
                    font-weight: 800;
                    color: #fff;
                    line-height: 1.2;
                    margin: 0 0 14px;
                    letter-spacing: -0.5px;
                }

                .auth-desc {
                    font-size: 13.5px;
                    color: rgba(255,255,255,0.65);
                    line-height: 1.65;
                    margin: 0;
                }

                .auth-security-box {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.13);
                    border-radius: 14px;
                    padding: 16px 18px;
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                }

                .auth-security-icon {
                    width: 36px;
                    height: 36px;
                    background: rgba(255,255,255,0.12);
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #b39ddb;
                    flex-shrink: 0;
                }

                .auth-security-title {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.9);
                    margin: 0 0 3px;
                }

                .auth-security-text {
                    font-size: 12px;
                    color: rgba(255,255,255,0.55);
                    margin: 0;
                    line-height: 1.5;
                }

                /* ─── RIGHT PANEL ─────────────────────────────── */
                .auth-right {
                    flex: 1;
                    background: #fff;
                    padding: 44px 44px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .auth-welcome {
                    font-size: 26px;
                    font-weight: 800;
                    color: #e91e8c;
                    margin: 0 0 6px;
                    letter-spacing: -0.4px;
                }

                .auth-subtitle {
                    font-size: 13.5px;
                    color: #6b7280;
                    margin: 0 0 30px;
                    line-height: 1.55;
                }

                .auth-form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .auth-field-label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 7px;
                }

                .auth-label {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    color: #9ca3af;
                }

                .auth-forgot {
                    font-size: 12px;
                    font-weight: 600;
                    color: #5a2d9f;
                    text-decoration: none;
                    cursor: pointer;
                    background: none;
                    border: none;
                    padding: 0;
                    font-family: inherit;
                }

                .auth-forgot:hover { color: #3b1f6e; text-decoration: underline; }

                .auth-input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .auth-input-icon {
                    position: absolute;
                    left: 16px;
                    color: #9ca3af;
                    width: 17px;
                    height: 17px;
                    pointer-events: none;
                }

                .auth-input {
                    width: 100%;
                    height: 50px;
                    padding: 0 16px 0 44px;
                    background: #f3f4f8;
                    border: 2px solid transparent;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #1f2937;
                    font-family: 'Inter', sans-serif;
                    box-sizing: border-box;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s;
                }

                .auth-input::placeholder { color: #c4c9d4; }

                .auth-input:focus {
                    border-color: #5a2d9f;
                    background: #fafbff;
                }

                .auth-eye-btn {
                    position: absolute;
                    right: 14px;
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    color: #9ca3af;
                    display: flex;
                    align-items: center;
                    transition: color 0.15s;
                }

                .auth-eye-btn:hover { color: #5a2d9f; }

                .auth-error {
                    display: flex;
                    align-items: flex-start;
                    gap: 9px;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 10px;
                    padding: 12px 14px;
                    font-size: 13px;
                    color: #dc2626;
                    font-weight: 500;
                }

                .auth-submit {
                    width: 100%;
                    height: 52px;
                    margin-top: 4px;
                    background: linear-gradient(135deg, #3b1f6e, #5a2d9f);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 13px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    box-shadow: 0 8px 24px rgba(90,45,159,0.35);
                    transition: opacity 0.2s, box-shadow 0.2s, transform 0.15s;
                }

                .auth-submit:hover:not(:disabled) {
                    opacity: 0.92;
                    box-shadow: 0 12px 32px rgba(90,45,159,0.45);
                    transform: translateY(-1px);
                }

                .auth-submit:disabled { opacity: 0.65; cursor: not-allowed; }

                .auth-footer {
                    margin-top: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .auth-footer-text {
                    font-size: 11.5px;
                    color: #c4c9d4;
                }

                .auth-footer-icons {
                    display: flex;
                    gap: 10px;
                    color: #d1d5db;
                }

                /* Responsive */
                @media (max-width: 680px) {
                    .auth-left { display: none; }
                    .auth-right { padding: 36px 28px; }
                }
            `}</style>

            <div className="auth-root">
                <div className="auth-card">
                    {/* ── LEFT PANEL ── */}
                    <div className="auth-left">
                        <div>
                            <div className="auth-logo">
                                {orgBranding?.logo ? (
                                    <img src={orgBranding.logo} alt="Logo" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover' }} />
                                ) : (
                                    <div className="auth-logo-icon">
                                        <GitBranch size={20} />
                                    </div>
                                )}
                                <div>
                                    <div className="auth-logo-text">{orgBranding?.name || 'OrgChart'}</div>
                                    <div className="auth-logo-sub">{orgBranding?.tagline || 'gestão de pessoas'}</div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="auth-badge">Plataforma Corporativa</div>
                            <h1 className="auth-headline">
                                {orgBranding?.name ? (
                                    <>{orgBranding.name}</>
                                ) : (
                                    <>Organograma<br />Inteligente</>
                                )}
                            </h1>
                            <p className="auth-desc">
                                Visualize hierarquias, gerencie equipes e tome decisões com base em dados reais da sua organização.
                            </p>
                        </div>

                        <div className="auth-security-box">
                            <div className="auth-security-icon">
                                <Shield size={18} />
                            </div>
                            <div>
                                <p className="auth-security-title">Acesso Seguro</p>
                                <p className="auth-security-text">Seus dados são protegidos com autenticação corporativa de ponta.</p>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL ── */}
                    <div className="auth-right">
                        <h2 className="auth-welcome">Bem-vindo de volta!</h2>
                        <p className="auth-subtitle">
                            Insira suas credenciais corporativas para acessar o painel de gestão.
                        </p>

                        <form onSubmit={handleAuth} className="auth-form">
                            {/* Email */}
                            <div>
                                <div className="auth-field-label">
                                    <span className="auth-label">E-mail Corporativo</span>
                                </div>
                                <div className="auth-input-wrap">
                                    <Mail className="auth-input-icon" />
                                    <input
                                        type="email"
                                        placeholder="seu@empresa.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="auth-input"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="auth-field-label">
                                    <span className="auth-label">Senha de Acesso</span>
                                    <button type="button" className="auth-forgot">Esqueci minha senha</button>
                                </div>
                                <div className="auth-input-wrap">
                                    <Lock className="auth-input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        className="auth-input"
                                        style={{ paddingRight: 48 }}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="auth-eye-btn"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error message */}
                            {message && (
                                <div className="auth-error">
                                    <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span>{message.text}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button type="submit" disabled={loading} className="auth-submit">
                                {loading ? (
                                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <>Entrar no Sistema &nbsp;→</>
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <span className="auth-footer-text">Protegido por autenticação segura</span>
                            <div className="auth-footer-icons">
                                <Users size={16} />
                                <Shield size={16} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

export default Auth;
