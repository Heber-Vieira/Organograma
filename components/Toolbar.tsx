import React from 'react';
import { Minus, Plus, Maximize, Scan, Printer, RefreshCcw, FileType, ImageIcon, Sun, Moon } from 'lucide-react';

interface ToolbarProps {
    zoom: number;
    onZoomChange: (action: number | ((prev: number) => number)) => void;
    onFitToView: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    isExporting: boolean;
    showExportMenu: boolean;
    onToggleExportMenu: (show: boolean) => void;
    onExport: (format: 'png' | 'pdf') => void;
    isVisible: boolean;
    onInteract: () => void;
    isSidebarOpen: boolean;
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
    onSaveProject: () => void;
    onLoadProject: () => void;
    t: any;
}

const Toolbar: React.FC<ToolbarProps> = ({
    zoom,
    onZoomChange,
    onFitToView,
    isFullscreen,
    onToggleFullscreen,
    isExporting,
    showExportMenu,
    onToggleExportMenu,
    onExport,
    onSaveProject,
    onLoadProject,
    isVisible,
    onInteract,
    isSidebarOpen,
    isDarkMode,
    onToggleDarkMode,
    t
}) => {
    return (
        <div
            onMouseEnter={onInteract}
            onMouseMove={onInteract}
            className={`absolute bottom-6 left-1/2 flex items-center bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] p-1 pr-5 pl-5 gap-3 border border-slate-100/50 dark:border-slate-700/50 z-[100] transition-all duration-700 ease-in-out pointer-events-auto 
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} 
                ${isSidebarOpen && !isFullscreen ? 'lg:-translate-x-[calc(50%-144px)]' : '-translate-x-1/2'}`}
        >
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onZoomChange((z: number) => Math.max(0.1, z - 0.1))}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <Minus className="w-3 h-3" />
                </button>
                <span className="w-10 text-center text-[10px] font-black text-slate-700 dark:text-slate-200 tabular-nums">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={() => onZoomChange((z: number) => Math.min(4, z + 0.1))}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>

            <div className="w-[1px] h-4 bg-slate-100 dark:bg-slate-700"></div>

            <div className="relative flex items-center">
                <button
                    onClick={onFitToView}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
                    title="Enquadrar e Centralizar"
                >
                    <Maximize className="w-4 h-4" />
                </button>
            </div>

            <div className="w-[1px] h-4 bg-slate-100 dark:bg-slate-700"></div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleDarkMode}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-500 transition-colors group/theme relative"
                    title={isDarkMode ? t.darkMode : t.lightMode}
                >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                    onClick={onToggleFullscreen}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isFullscreen ? 'text-[#00897b] bg-[#00897b]/10' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600'}`}
                    title={isFullscreen ? t.exitFullscreen : t.fullscreen}
                >
                    <Scan className="w-3.5 h-3.5" />
                </button>

                <div className="w-[1px] h-4 bg-slate-100 dark:bg-slate-700"></div>

                <div className="relative">
                    <button
                        onClick={() => onToggleExportMenu(!showExportMenu)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg font-black uppercase text-[8px] tracking-tight transition-all ${showExportMenu ? 'text-[#00897b] bg-[#00897b]/5' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        {isExporting ? <RefreshCcw className="w-3 h-3 animate-spin text-[#00897b]" /> : <Printer className="w-3 h-3" />}
                        <span className="hidden sm:inline">EXPORTAR / IMPRIMIR</span>
                    </button>

                    {showExportMenu && (
                        <div className="absolute bottom-full mb-4 right-0 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-700 p-1 z-[200] animate-in fade-in zoom-in-95 duration-200 origin-bottom">
                            <button
                                onClick={() => onExport('pdf')}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-[9px] font-black uppercase text-slate-600 dark:text-slate-300 group"
                            >
                                <FileType className="w-3 h-3 text-red-500" /> PDF (A4)
                            </button>
                            <button
                                onClick={() => onExport('png')}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/10 text-[9px] font-black uppercase text-slate-600 dark:text-slate-300 group"
                            >
                                <ImageIcon className="w-3 h-3 text-emerald-500" /> PNG HD
                            </button>
                            <div className="h-[1px] bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
                            <button
                                onClick={onSaveProject}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 text-[9px] font-black uppercase text-slate-600 dark:text-slate-300 group"
                            >
                                <FileType className="w-3 h-3 text-blue-500" /> Salvar Projeto
                            </button>
                            <button
                                onClick={onLoadProject}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10 text-[9px] font-black uppercase text-slate-600 dark:text-slate-300 group"
                            >
                                <RefreshCcw className="w-3 h-3 text-amber-500" /> Abrir Projeto
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Toolbar;
