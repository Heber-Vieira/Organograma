import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { X, Download, FileType, ImageIcon, Maximize, Minimize, Move, AlignCenter, AlignJustify, Settings2, Printer } from 'lucide-react';

interface PrintSettings {
    scale: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    centerHorizontally: boolean;
    centerVertically: boolean;
    fillPage: boolean;
}

interface PrintPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    onExport: (format: 'pdf' | 'png' | 'print', settings: PrintSettings) => void;
    isDarkMode: boolean;
    companyName: string;
    t: any;
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
    isOpen,
    onClose,
    imageUrl,
    onExport,
    isDarkMode,
    companyName,
    t
}) => {
    const [settings, setSettings] = useState<PrintSettings>({
        scale: 1,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        centerHorizontally: true,
        centerVertically: true,
        fillPage: false
    });

    const [previewScale, setPreviewScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        // Auto-calculate scale to fit preview
        const updatePreviewScale = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                // A4 aspect ratio (Landscape: 297/210 = 1.414)
                const targetRatio = 297 / 210;
                const containerRatio = clientWidth / clientHeight;

                let scale;
                if (containerRatio > targetRatio) {
                    scale = (clientHeight * 0.9) / 210;
                } else {
                    scale = (clientWidth * 0.9) / 297;
                }
                setPreviewScale(scale);
            }
        };

        updatePreviewScale();
        window.addEventListener('resize', updatePreviewScale);
        return () => window.removeEventListener('resize', updatePreviewScale);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSettingChange = (key: keyof PrintSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Simulate A4 Page in Preview (scaled)
    const pageWidth = 297 * previewScale;
    const pageHeight = 210 * previewScale;

    // Calculate Image dimensions and position on the simulated page
    const getImgStyle = () => {
        const availableWidth = 297 - settings.marginLeft - settings.marginRight;
        const availableHeight = 210 - settings.marginTop - settings.marginBottom;

        let width, height;
        if (settings.fillPage) {
            width = availableWidth;
            height = availableHeight;
        } else {
            // Based on original scale (assuming 1 is 100% of available space)
            width = availableWidth * settings.scale;
            height = availableHeight * settings.scale;
        }

        let left = settings.marginLeft;
        let top = settings.marginTop;

        if (settings.centerHorizontally) {
            left = settings.marginLeft + (availableWidth - width) / 2;
        }
        if (settings.centerVertically) {
            top = settings.marginTop + (availableHeight - height) / 2;
        }

        return {
            position: 'absolute' as const,
            left: left * previewScale,
            top: top * previewScale,
            width: width * previewScale,
            height: height * previewScale,
            objectFit: 'contain' as const,
            transition: 'all 0.2s ease',
            imageRendering: 'auto' as const
        };
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-in fade-in">
            <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col md:flex-row overflow-hidden border border-white/10 animate-in zoom-in-95">
                
                {/* Lateral Controls */}
                <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
                            <Settings2 className="w-5 h-5 text-[var(--primary-color)]" />
                            {t.adjustments}
                        </h3>
                        <button onClick={onClose} className="md:hidden p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* Margins */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block">{t.margins} (mm)</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{t.top}</span>
                                    <input type="number" value={settings.marginTop} onChange={e => handleSettingChange('marginTop', Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-none font-bold text-sm text-slate-700 dark:text-slate-200" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{t.bottom}</span>
                                    <input type="number" value={settings.marginBottom} onChange={e => handleSettingChange('marginBottom', Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-none font-bold text-sm text-slate-700 dark:text-slate-200" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{t.left}</span>
                                    <input type="number" value={settings.marginLeft} onChange={e => handleSettingChange('marginLeft', Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-none font-bold text-sm text-slate-700 dark:text-slate-200" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">{t.right}</span>
                                    <input type="number" value={settings.marginRight} onChange={e => handleSettingChange('marginRight', Number(e.target.value))} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border-none font-bold text-sm text-slate-700 dark:text-slate-200" />
                                </div>
                            </div>
                        </div>

                        {/* Scaling */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block">{t.scaleAndFill}</label>
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{t.fitToPage}</span>
                                <button 
                                    onClick={() => handleSettingChange('fillPage', !settings.fillPage)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.fillPage ? 'bg-[var(--primary-color)]' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.fillPage ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            
                            {!settings.fillPage && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                                        <span>ZOOM</span>
                                        <span>{Math.round(settings.scale * 100)}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0.1" max="1.5" step="0.05" 
                                        value={settings.scale} 
                                        onChange={e => handleSettingChange('scale', Number(e.target.value))}
                                        className="w-full accent-[var(--primary-color)]"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Alignment */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block">{t.alignment}</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => handleSettingChange('centerHorizontally', !settings.centerHorizontally)}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${settings.centerHorizontally ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 text-[var(--primary-color)]' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                                >
                                    <AlignCenter className="w-3 h-3" /> {t.centerHorizontally}
                                </button>
                                <button 
                                    onClick={() => handleSettingChange('centerVertically', !settings.centerVertically)}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${settings.centerVertically ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 text-[var(--primary-color)]' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                                >
                                    <AlignJustify className="w-3 h-3 rotate-90" /> {t.centerVertically}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white dark:bg-[#1e293b] border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <button 
                            onClick={() => onExport('pdf', settings)}
                            className="w-full flex items-center justify-center gap-3 bg-[var(--primary-color)] hover:brightness-110 text-white py-4 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[var(--primary-color)]/20 transition-all hover:scale-[1.02]"
                        >
                            <FileType className="w-5 h-5" /> {t.exportPdfA4}
                        </button>
                        <button 
                            onClick={() => onExport('print', settings)}
                            className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                        >
                            <Printer className="w-5 h-5" /> {t.printNow}
                        </button>
                        <button 
                            onClick={() => onExport('png', settings)}
                            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 py-4 rounded-3xl font-black uppercase tracking-widest text-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                        >
                            <ImageIcon className="w-5 h-5 text-emerald-500" /> {t.downloadPng}
                        </button>
                    </div>
                </div>

                {/* Main Preview Area */}
                <div 
                    ref={containerRef}
                    className="flex-1 bg-slate-200 dark:bg-black/40 p-8 flex items-center justify-center relative overflow-hidden"
                >
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] opacity-40">
                        {t.previewA4}
                    </div>

                    <div 
                        className="bg-white shadow-2xl relative overflow-hidden transition-all duration-300"
                        style={{ width: pageWidth, height: pageHeight }}
                    >
                        {/* Simulated Margins */}
                        <div 
                            className="absolute border border-dashed border-red-200 pointer-events-none"
                            style={{ 
                                top: settings.marginTop * previewScale, 
                                bottom: settings.marginBottom * previewScale,
                                left: settings.marginLeft * previewScale,
                                right: settings.marginRight * previewScale
                            }}
                        />

                        {/* Image Preview */}
                        <img 
                            src={imageUrl} 
                            alt="Preview" 
                            style={getImgStyle()}
                        />
                    </div>

                    <button onClick={onClose} className="hidden md:flex absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 rounded-full transition-all text-white backdrop-blur-md">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrintPreviewModal;
