import * as React from 'react';
import { useRef } from 'react';
import { X, Save, Upload, Columns2, Rows2 } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeModalProps {
    employee: Employee;
    onClose: () => void;
    onUpdate: (updated: Employee) => void;
    onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    t: any;
    roles: string[];
    departments: string[];
    onUngroup?: () => void;
    canUngroup?: boolean;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
    employee,
    onClose,
    onUpdate,
    onPhotoUpload,
    t,
    roles,
    departments,
    onUngroup,
    canUngroup
}) => {
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [editingData, setEditingData] = React.useState<Employee>(employee);

    React.useEffect(() => {
        setEditingData(employee);
    }, [employee]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(editingData);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20 animate-in zoom-in-95">
                <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 md:px-10 md:py-5 border-b border-slate-100 dark:border-slate-700 gap-4">
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{t.editTitle}</h2>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors md:relative md:top-0 md:right-0">
                        <X className="w-6 h-6 md:w-7 md:h-7 text-slate-400" />
                    </button>
                </div>
                <form className="p-6 md:p-8 space-y-3 md:space-y-4 overflow-y-auto max-h-[90vh] custom-scrollbar" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t.nameLabel}</label>
                            <input
                                required
                                className="w-full px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold focus:ring-2 ring-[#00897b] transition-all"
                                value={editingData.name}
                                onChange={e => setEditingData({ ...editingData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t.roleLabel}</label>
                            <input
                                required
                                list="roles-list"
                                className="w-full px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold focus:ring-2 ring-[#00897b] transition-all"
                                value={editingData.role}
                                onChange={e => setEditingData({ ...editingData, role: e.target.value })}
                            />
                            <datalist id="roles-list">
                                {roles.map((role, index) => (
                                    <option key={index} value={role} />
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t.deptLabel}</label>
                            <input
                                list="depts-list"
                                className="w-full px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold focus:ring-2 ring-[#00897b] transition-all"
                                value={editingData.department || ''}
                                onChange={e => setEditingData({ ...editingData, department: e.target.value })}
                            />
                            <datalist id="depts-list">
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept} />
                                ))}
                            </datalist>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t.birthDateLabel}</label>
                            <input
                                type="date"
                                className="w-full px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold focus:ring-2 ring-[#00897b] transition-all"
                                value={editingData.birthDate || ''}
                                onChange={e => setEditingData({ ...editingData, birthDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t.shiftLabel}</label>
                            <select
                                className="w-full px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold focus:ring-2 ring-[#00897b] transition-all appearance-none"
                                value={editingData.shift || 'morning'}
                                onChange={e => setEditingData({ ...editingData, shift: e.target.value as any })}
                            >
                                <option value="morning">{t.morning}</option>
                                <option value="afternoon">{t.afternoon}</option>
                                <option value="night">{t.night}</option>
                                <option value="flexible">{t.flexible}</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t.photoLabel}</label>
                            <div className="relative">
                                <input
                                    className="w-full px-5 py-2.5 pr-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold"
                                    value={editingData.photoUrl || ''}
                                    onChange={e => setEditingData({ ...editingData, photoUrl: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current?.click()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                    <Upload className="w-5 h-5 text-slate-500" />
                                </button>
                                <input
                                    type="file"
                                    ref={photoInputRef}
                                    accept="image/*"
                                    onChange={(e) => {
                                        onPhotoUpload(e);
                                        // Update local photoUrl if possible (usually via FileReader in parent)
                                    }}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t.vacationLabel}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t.vacationStartLabel}</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-[11px] focus:ring-2 ring-[#00897b] transition-all"
                                            value={editingData.vacationStart || ''}
                                            onChange={e => setEditingData({ ...editingData, vacationStart: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1">{t.vacationDaysLabel}</label>
                                        <select
                                            className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-[11px] appearance-none focus:ring-2 ring-[#00897b] transition-all"
                                            value={editingData.vacationDays || ''}
                                            onChange={e => setEditingData({ ...editingData, vacationDays: parseInt(e.target.value) as any })}
                                        >
                                            <option value="">{t.selectDays || '...'}</option>
                                            <option value="10">10 Dias</option>
                                            <option value="15">15 Dias</option>
                                            <option value="20">20 Dias</option>
                                            <option value="30">30 Dias</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">{t.childOrientationLabel}</label>
                                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] p-1.5 shadow-inner ring-1 ring-black/5 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setEditingData({ ...editingData, childOrientation: 'horizontal' })}
                                        className={`flex-1 py-3 px-2 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ${editingData.childOrientation !== 'vertical' ? 'bg-white dark:bg-slate-800 text-[#00897b] shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                                        title={t.horizontal}
                                    >
                                        <Columns2 className="w-5 h-5 shrink-0" />
                                        <span className="text-[11px] font-black uppercase whitespace-nowrap">{t.horizontal}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingData({ ...editingData, childOrientation: 'vertical' })}
                                        className={`flex-1 py-3 px-2 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ${editingData.childOrientation === 'vertical' ? 'bg-[#00897b] text-white shadow-lg' : 'text-slate-400 hover:text-slate-500'}`}
                                        title={t.vertical}
                                    >
                                        <Rows2 className="w-5 h-5 shrink-0" />
                                        <span className="text-[11px] font-black uppercase whitespace-nowrap">{t.vertical}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {/* Ungroup Button - Only for groups */}
                        {canUngroup && onUngroup && (
                            <button
                                type="button"
                                onClick={onUngroup}
                                className="flex-1 bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-300 py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Columns2 className="w-6 h-6 rotate-90" /> {t.ungroup || "Desagrupar"}
                            </button>
                        )}

                        <button
                            type="submit"
                            className="flex-[2] bg-[#00897b] hover:bg-[#00695c] text-white py-4 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-[#00897b]/30 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Save className="w-6 h-6" /> {t.saveChanges}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeModal;
