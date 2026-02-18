
import * as React from 'react';
import { useState } from 'react';
import { LayoutType, ChartNode, Employee, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { isEmployeeOnVacation } from '../utils/helpers';
import { Edit2, Plus, Trash2, Sun, Clock, Moon, Coffee, ShieldCheck, Power, Ban, Cake, Columns2, Rows2 } from 'lucide-react';

interface NodeRendererProps {
  node: ChartNode;
  layout: LayoutType;
  level: number;
  onEdit: (emp: Employee) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onMoveNode: (draggedId: string, targetId: string) => void;
  onToggleStatus: (emp: Employee) => void;
  language: Language;
  birthdayHighlightMode: 'off' | 'month' | 'day';
  birthdayAnimationType: 'confetti' | 'fireworks' | 'mixed';
  isVacationHighlightEnabled: boolean;
  onChildOrientationChange: (emp: Employee) => void;
  isSelected?: boolean;
  onNodeClick?: (e: React.MouseEvent, nodeId: string) => void;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({ node, layout, level, onEdit, onDelete, onAddChild, onMoveNode, onToggleStatus, language, birthdayHighlightMode, birthdayAnimationType, isVacationHighlightEnabled, onChildOrientationChange, isSelected, onNodeClick }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const t = TRANSLATIONS[language];

  // Default to true if undefined
  const isActive = node.isActive !== false;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== node.id) {
      onMoveNode(draggedId, node.id);
    }
  };

  const dragProps = {
    draggable: true,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  };

  const dragStyle = isDragOver ? 'ring-4 ring-[#00897b] ring-offset-2 scale-105 shadow-2xl z-50' : '';

  // Selection Style
  const selectionStyle = isSelected ? 'ring-4 ring-indigo-500 ring-offset-2 scale-105 z-40' : '';

  // Style for inactive users: Grayscale, reduced opacity, filter
  const inactiveStyle = !isActive ? 'grayscale opacity-75 contrast-[0.9] saturate-0' : '';
  const inactiveContainerStyle = !isActive ? 'bg-slate-100/50 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-600' : '';

  // Style for vacationers: Soft opacity, slight saturation reduction, but warmer/dreamy feel
  const isVacationBase = isEmployeeOnVacation(node) && isVacationHighlightEnabled;
  const vacationCardStyle = isVacationBase && isActive ? 'opacity-90 saturate-[0.8] brightness-[1.02] contrast-[0.98] drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]' : '';
  const vacationInnerStyle = isVacationBase && isActive ? 'bg-cyan-50/30 dark:bg-cyan-900/10 backdrop-blur-[0.5px]' : '';

  const isBday = (() => {
    if (birthdayHighlightMode === 'off' || !node.birthDate) return false;
    const parts = node.birthDate.split('-');
    if (parts.length < 3) return false;
    const month = parseInt(parts[1], 10); // 1-12
    const day = parseInt(parts[2], 10); // 1-31
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    if (birthdayHighlightMode === 'month') return month === currentMonth;
    if (birthdayHighlightMode === 'day') return month === currentMonth && day === currentDay;
    return false;
  })();

  const birthdayStyle = isBday && isActive ? 'ring-2 ring-pink-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 animate-pulse' : '';

  // Vacation Logic
  const isVacation = isEmployeeOnVacation(node) && isVacationHighlightEnabled;
  const vacationStyle = isVacation && isActive ? 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-white dark:ring-offset-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse' : '';

  const techThemes = [
    { primary: 'text-[#00818a]', bg: 'bg-[#00818a]', border: 'border-[#00818a]', darker: 'border-t-[#005f66]', label: `${t.level} A` },
    { primary: 'text-[#54a434]', bg: 'bg-[#54a434]', border: 'border-[#54a434]', darker: 'border-t-[#3e7a27]', label: `${t.level} B` },
    { primary: 'text-[#f5a623]', bg: 'bg-[#f5a623]', border: 'border-[#f5a623]', darker: 'border-t-[#b87c1b]', label: `${t.level} C` },
    { primary: 'text-[#f37121]', bg: 'bg-[#f37121]', border: 'border-[#f37121]', darker: 'border-t-[#b35418]', label: `${t.level} D` }
  ];

  const theme = techThemes[Math.min(level, techThemes.length - 1)];

  const ShiftIcon = ({ shift }: { shift?: string }) => {
    switch (shift) {
      case 'morning': return <span title={t.morning}><Sun className="w-3 h-3 text-orange-400" /></span>;
      case 'afternoon': return <span title={t.afternoon}><Clock className="w-3 h-3 text-blue-400" /></span>;
      case 'night': return <span title={t.night}><Moon className="w-3 h-3 text-indigo-400" /></span>;
      case 'flexible': return <span title={t.flexible}><Coffee className="w-3 h-3 text-emerald-400" /></span>;
      default: return null;
    }
  };

  const isLeader = node.children && node.children.length > 0;

  const InactiveBadge = () => (
    !isActive ? (
      <div className="absolute top-2 right-2 z-50 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
        <Ban className="w-2.5 h-2.5" />
        {t.inactiveTag}
      </div>
    ) : null
  );

  const ConfettiExplosion = () => (
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 pointer-events-none overflow-visible">
      {/* Generate random confetti particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1.5 rounded-sm animate-confetti-fall opacity-0"
          style={{
            backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][i % 6],
            left: `${Math.random() * 100}%`,
            top: '-10px',
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random()}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
      {/* Streamers (Serpentinas) */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`s-${i}`}
          className="absolute w-0.5 h-6 rounded-full animate-streamer-fall opacity-0"
          style={{
            backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][i % 6],
            left: `${Math.random() * 100}%`,
            top: '-20px',
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random()}s`,
          }}
        />
      ))}
      <style>{`
         @keyframes confetti-fall {
           0% { transform: translateY(0) rotate(0deg); opacity: 1; }
           100% { transform: translateY(60px) rotate(720deg); opacity: 0; }
         }
         @keyframes streamer-fall {
           0% { transform: translateY(0) rotate(0deg) skewX(0deg); opacity: 1; }
           25% { transform: translateY(20px) rotate(10deg) skewX(10deg); }
           50% { transform: translateY(40px) rotate(-10deg) skewX(-10deg); }
           75% { transform: translateY(60px) rotate(10deg) skewX(10deg); }
           100% { transform: translateY(80px) rotate(0deg) skewX(0deg); opacity: 0; }
         }
         .animate-confetti-fall {
           animation: confetti-fall linear infinite;
         }
         .animate-streamer-fall {
           animation: streamer-fall linear infinite;
         }
      `}</style>
    </div>
  );

  const FireworksExplosion = () => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none overflow-visible">
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * 360;
        const distance = 40 + Math.random() * 20;
        const ty = Math.cos(angle * Math.PI / 180) * distance;
        const ty2 = Math.sin(angle * Math.PI / 180) * distance;
        return (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-firework opacity-0"
            style={{
              backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][i % 6],
              left: '50%',
              top: '50%',
              '--tx': `${ty}px`,
              '--ty': `${ty2}px`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${1 + Math.random()}s`
            } as React.CSSProperties}
          />
        )
      })}
      <style>{`
         @keyframes firework {
           0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
           100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); opacity: 0; }
         }
         .animate-firework {
           animation-name: firework;
           animation-timing-function: ease-out;
           animation-iteration-count: infinite;
         }
       `}</style>
    </div>
  );

  const formatBirthday = (dateString?: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}`;
    }
    return dateString;
  };

  const BirthdayBadge = ({ className }: { className?: string }) => (
    isBday && isActive ? (
      <div className={`${className || "absolute -top-3 -right-3"} z-50 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-lg border-2 border-pink-400 animate-bounce group-hover:scale-110 transition-transform pointer-events-auto`} title={`${t.happyBirthday} ${node.birthDate ? `(${formatBirthday(node.birthDate)})` : ''}`}>
        <Cake className="w-4 h-4 text-pink-500 fill-pink-200" />
        {(birthdayAnimationType === 'confetti' || birthdayAnimationType === 'mixed') && <ConfettiExplosion />}
        {(birthdayAnimationType === 'fireworks' || birthdayAnimationType === 'mixed') && <FireworksExplosion />}
      </div>
    ) : null
  );

  const VacationBadge = ({ className }: { className?: string }) => (
    isVacation && isActive ? (
      <div className={`${className || "absolute -top-3 -left-3"} z-50 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-lg border-2 border-cyan-400 animate-bounce group-hover:scale-110 transition-transform pointer-events-auto flex flex-col items-center`} title={t.onVacation}>
        <span className="text-sm">🌴</span>
        <span className="text-[6px] font-black text-cyan-600 dark:text-cyan-400 leading-none mt-0.5">{t.onVacation}</span>
      </div>
    ) : null
  );

  const Actions = () => (
    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[100]">
      <button onClick={(e) => { e.stopPropagation(); onToggleStatus(node); }} className={`p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-full shadow-md hover:text-white border border-slate-100 dark:border-slate-600 ${isActive ? 'hover:bg-amber-500' : 'hover:bg-emerald-500'}`} title={t.toggleStatus}><Power className="w-3.5 h-3.5" /></button>
      <button onClick={(e) => { e.stopPropagation(); onEdit(node); }} className="p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-full shadow-md hover:bg-slate-800 hover:text-white border border-slate-100 dark:border-slate-600" title={t.edit}><Edit2 className="w-3.5 h-3.5" /></button>
      <button onClick={(e) => { e.stopPropagation(); onAddChild(node.id); }} className="p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-full shadow-md hover:bg-[#54a434] hover:text-white border border-slate-100 dark:border-slate-600" title={t.add}><Plus className="w-3.5 h-3.5" /></button>

      {/* Quick Layout Toggle Button - Visible only if node has children */}
      {isActive && node.children && node.children.length > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onChildOrientationChange(node); }}
          className={`p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-full shadow-md hover:text-white border border-slate-100 dark:border-slate-600 ${node.childOrientation === 'vertical' ? 'hover:bg-[#00897b]' : 'hover:bg-indigo-500'}`}
          title={node.childOrientation === 'vertical' ? t.horizontal : t.vertical}
        >
          {node.childOrientation === 'vertical' ? <Columns2 className="w-3.5 h-3.5" /> : <Rows2 className="w-3.5 h-3.5" />}
        </button>
      )}

      <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} className="p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-full shadow-md hover:bg-red-500 hover:text-white border border-slate-100 dark:border-slate-600" title={t.deleteAction}><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
  );

  if (layout === LayoutType.TECH_CIRCULAR) {
    return (
      <div {...dragProps} className={`flex flex-col items-center group relative cursor-move transition-all duration-200 ${dragStyle} ${selectionStyle} ${inactiveStyle} ${vacationCardStyle}`} onClick={(e) => onNodeClick ? onNodeClick(e, node.id) : onEdit(node)}>
        <div className="relative mb-[-30px] z-20">
          <div className={`w-28 h-28 rounded-full border-[6px] border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-100 dark:bg-slate-700 ${!isActive ? 'border-dashed border-slate-400' : ''}`}>
            {node.photoUrl ? (
              <img src={node.photoUrl} alt="" className={`w-full h-full object-cover pointer-events-none ${isBday && isActive ? 'scale-110 transition-transform duration-1000' : ''}`} />
            ) : null}
          </div>
          {isLeader && isActive && (
            <div className="absolute -right-1 bottom-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-white dark:border-slate-800" title={t.leader}>
              <ShieldCheck className="w-3 h-3" />
            </div>
          )}
          {isActive && (node.totalSubordinates || 0) > 0 && (
            <div className="absolute -left-1 bottom-2 bg-sky-500 text-white p-1 rounded-full shadow-lg border-2 border-white dark:border-slate-800 flex items-center justify-center w-6 h-6 text-[9px] font-bold" title="Total de Subordinados">
              {node.totalSubordinates}
            </div>
          )}
          <BirthdayBadge />
          <VacationBadge />
        </div>
        <div className={`relative bg-white dark:bg-[#1e293b] rounded-3xl shadow-lg px-10 py-6 border border-slate-100 dark:border-slate-700 min-w-[320px] text-center pt-10 ${inactiveContainerStyle} ${birthdayStyle} ${vacationStyle} ${vacationInnerStyle}`}>
          <InactiveBadge />
          <div className="flex justify-center items-center gap-2 mb-1">
            <ShiftIcon shift={node.shift} />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{node.department || 'Geral'}</span>
          </div>
          <h3 className={`text-lg font-black uppercase tracking-tight leading-none mb-1 ${!isActive ? 'text-slate-500' : theme.primary}`}>{node.name}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase mb-2">{node.role}</p>
          <p className="text-slate-400 text-[10px] leading-relaxed max-w-[240px] mx-auto opacity-70 italic line-clamp-2">{node.description || t.fallbackDesc}</p>
        </div>
        <Actions />
      </div>
    );
  }

  if (layout === LayoutType.MODERN_PILL) {
    const mColors = [
      { border: 'border-[#9c27b0]', bg: 'bg-gradient-to-r from-[#ab47bc] to-[#8e24aa]', text: 'text-[#ce93d8]' },
      { border: 'border-[#e91e63]', bg: 'bg-gradient-to-r from-[#f06292] to-[#d81b60]', text: 'text-[#f48fb1]' },
      { border: 'border-[#2196f3]', bg: 'bg-gradient-to-r from-[#42a5f5] to-[#1976d2]', text: 'text-[#90caf9]' },
      { border: 'border-[#00bcd4]', bg: 'bg-gradient-to-r from-[#26c6da] to-[#0097a7]', text: 'text-[#80deea]' },
    ];
    const mTheme = mColors[level % mColors.length];

    return (
      <div {...dragProps} className={`flex flex-col items-center group relative cursor-move transition-all duration-200 ${dragStyle} ${selectionStyle} ${inactiveStyle} ${vacationCardStyle}`} onClick={(e) => onNodeClick ? onNodeClick(e, node.id) : onEdit(node)}>
        <div className="relative flex items-center h-28 w-[300px]">
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-24 h-24 rounded-3xl border-[4px] ${!isActive ? 'border-slate-400 border-dashed' : mTheme.border} bg-white dark:bg-slate-800 shadow-xl overflow-hidden`}>
            {node.photoUrl ? (
              <img src={node.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>

          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-24 h-24 pointer-events-none">
            <BirthdayBadge className="absolute -top-2 -left-2" />
            <VacationBadge className="absolute -top-2 -right-2" />
          </div>

          <div className="ml-12 flex flex-col w-full z-10">
            <div className={`absolute -top-2 left-16 z-20 ${!isActive ? 'bg-slate-500' : mTheme.bg} text-white px-4 py-1 rounded-full shadow-md flex items-center gap-2`}>
              <ShiftIcon shift={node.shift} />
              <span className="text-[9px] font-black uppercase tracking-wider">{node.name}</span>
            </div>
            <div className={`bg-[#2c2c2c] dark:bg-[#151a23] rounded-3xl h-[85px] pl-16 pr-5 flex flex-col justify-center shadow-2xl relative border-l-4 ${!isActive ? 'border-slate-500' : 'border-[#00897b]'} ${inactiveContainerStyle} ${birthdayStyle} ${vacationStyle} ${vacationInnerStyle}`}>
              <InactiveBadge />
              <div className={`text-[10px] font-black uppercase tracking-tight mb-0.5 ${!isActive ? 'text-slate-400' : mTheme.text}`}>{node.role}</div>
              <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">{node.department || 'Staff'}</div>
              {isLeader && isActive && <div className="absolute right-3 top-3"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /></div>}
              {isActive && (node.totalSubordinates || 0) > 0 && <div className="absolute right-3 bottom-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded text-[8px] font-bold border border-sky-200 dark:border-sky-800">{node.totalSubordinates} Sub.</div>}
              <div className="text-[8px] text-slate-500 leading-tight line-clamp-1">{node.description || t.fallbackDesc}</div>
            </div>
          </div>
        </div>
        <Actions />
      </div>
    );
  }

  if (layout === LayoutType.CLASSIC_MINIMAL) {
    const getCorporateColor = (level: number, id: string) => {
      if (!isActive) return 'bg-slate-400';
      if (level === 0) return 'bg-slate-800';
      const l1Colors = ['bg-red-600', 'bg-blue-600', 'bg-emerald-600'];
      let hash = 0;
      for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
      return l1Colors[Math.abs(hash) % l1Colors.length];
    };
    const barColor = getCorporateColor(level, node.id);

    return (
      <div {...dragProps} className={`flex flex-col items-center group relative cursor-move transition-all duration-200 ${dragStyle} ${inactiveStyle} ${vacationCardStyle}`} onClick={(e) => onNodeClick ? onNodeClick(e, node.id) : onEdit(node)}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <div className={`w-16 h-16 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-white ${!isActive ? 'border-dashed border-slate-400' : ''}`}>
            {node.photoUrl ? (
              <img src={node.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : null}
          </div>
          <BirthdayBadge />
          <VacationBadge />
        </div>
        <div className={`mt-8 bg-white dark:bg-[#1e293b] rounded-xl shadow-md border border-slate-100 dark:border-slate-700 w-[220px] overflow-hidden ${inactiveContainerStyle} ${birthdayStyle} ${vacationStyle} ${vacationInnerStyle}`}>
          <div className={`h-8 w-full ${barColor} flex justify-center items-center relative`}>
            {isLeader && isActive && <div className="bg-white px-2 rounded-b-md shadow-sm absolute top-0"><ShieldCheck className="w-3 h-3 text-emerald-600" /></div>}
            {isActive && (node.totalSubordinates || 0) > 0 && <div className="absolute right-2 text-[8px] font-bold text-white opacity-80">{node.totalSubordinates} Leads</div>}
          </div>
          <div className="pt-10 pb-5 px-4 text-center relative">
            <InactiveBadge />
            <div className="flex justify-center gap-1 mb-1"><ShiftIcon shift={node.shift} /></div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">{node.name}</h3>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{node.role}</p>
            <p className="text-[9px] text-slate-400 mt-2 leading-relaxed line-clamp-2">{node.description || t.fallbackDesc}</p>
            <div className="mt-2 py-1 bg-slate-50 dark:bg-slate-800 rounded text-[8px] font-black uppercase text-slate-400 tracking-widest">{node.department || '-'}</div>
          </div>
        </div>
        <Actions />
      </div>
    );
  }

  if (layout === LayoutType.FUTURISTIC_GLASS) {
    return (
      <div {...dragProps} className={`flex flex-col items-center group relative cursor-move transition-all duration-300 ${dragStyle} ${selectionStyle} ${inactiveStyle} ${vacationCardStyle}`} onClick={(e) => onNodeClick ? onNodeClick(e, node.id) : onEdit(node)}>
        <div className="relative mb-[-1.5rem] z-20 transform group-hover:scale-110 transition-transform duration-500">
          <div className={`w-20 h-20 p-0.5 clip-path-hex ${!isActive ? 'bg-slate-500' : 'bg-gradient-to-br from-cyan-400 to-blue-600'}`}>
            <div className="w-full h-full overflow-hidden clip-path-hex bg-slate-900">
              {node.photoUrl ? (
                <img src={node.photoUrl} alt="" className="w-full h-full object-cover pointer-events-none" />
              ) : null}
            </div>
          </div>
          {isLeader && isActive && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white border-2 border-slate-900 shadow-[0_0_10px_rgba(34,211,238,0.8)] z-30">
              <ShieldCheck className="w-3 h-3" />
            </div>
          )}
          {isActive && (node.totalSubordinates || 0) > 0 && (
            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-slate-900 shadow-[0_0_10px_rgba(59,130,246,0.8)] z-30 text-[9px] font-bold">
              {node.totalSubordinates}
            </div>
          )}
          <div className="absolute top-0 right-0 flex gap-1">
            <BirthdayBadge className="relative" />
            <VacationBadge className="relative" />
          </div>
        </div>
        <div className={`w-[280px] pt-10 pb-6 px-6 backdrop-blur-xl rounded-[2.5rem] border shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] text-center group-hover:border-cyan-400/50 transition-colors ${!isActive ? 'bg-slate-800/20 border-slate-500/30' : 'bg-white/40 dark:bg-slate-900/40 border-white/30 dark:border-white/10'} ${birthdayStyle} ${vacationStyle} ${vacationInnerStyle}`}>
          <InactiveBadge />
          <div className={`text-[9px] font-black tracking-[0.2em] mb-1 uppercase opacity-80 ${!isActive ? 'text-slate-500' : 'text-cyan-600 dark:text-cyan-400'}`}>{node.department || 'Core'}</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-0.5 tracking-tight">{node.name}</h3>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 ${!isActive ? 'bg-slate-500/10' : 'bg-slate-800/5 dark:bg-white/5'}`}>
            <ShiftIcon shift={node.shift} />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{node.role}</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed italic px-2 opacity-80">{node.description || t.fallbackDesc}</p>
        </div>
        <Actions />
      </div>
    );
  }

  return null;
};

export default NodeRenderer;
