
import * as React from 'react';
import { ChartNode, LayoutType, Employee, Language } from '../types';
import NodeRenderer from './NodeRenderer';
import { TRANSLATIONS } from '../utils/translations';
import { Sun, Moon, Clock, Coffee, ShieldCheck } from 'lucide-react';

interface TreeBranchProps {
    node: ChartNode;
    layout: LayoutType;
    level?: number;
    onEdit: (emp: Employee) => void;
    onDelete: (id: string) => void;
    onAddChild: (parentId: string) => void;
    onMoveNode: (draggedId: string, targetId: string, position?: 'before' | 'after' | 'child') => void;
    onToggleStatus: (emp: Employee) => void;
    language: Language;
    birthdayHighlightMode: 'off' | 'month' | 'day';
    birthdayAnimationType: 'confetti' | 'fireworks' | 'mixed';
    isVacationHighlightEnabled: boolean;
    onChildOrientationChange: (emp: Employee, orientation?: 'horizontal' | 'vertical') => void;
    selectedNodeIds: string[];
    onNodeClick: (e: React.MouseEvent, nodeId: string) => void;
    isReadonly?: boolean;
    isDragLocked?: boolean;
    isVerticalChild?: boolean;
    isExporting?: boolean;
}

interface SiblingDropZoneProps {
    onDrop: (draggedId: string) => void;
    isVertical?: boolean;
    lineStyle?: string;
    hideLine?: boolean;
    isExporting?: boolean;
}

const SiblingDropZone: React.FC<SiblingDropZoneProps> = ({ onDrop, isVertical, lineStyle, hideLine, isExporting }) => {
    const [isOver, setIsOver] = React.useState(false);
    const dragCounter = React.useRef(0);

    if (isExporting) return null;
    return (
        <div data-html2canvas-ignore className={`relative flex items-center justify-center ${isVertical ? 'w-full h-8' : 'w-8 absolute top-0 bottom-0'}`}
             style={!isVertical ? { left: 'auto', right: 'auto', transform: 'translateX(-50%)', marginLeft: '-1.5rem' } : {}}>
            
            {/* Vertical line passing through when not hovered */}
            {isVertical && !isOver && !hideLine && (
                <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 ${lineStyle || 'w-[2px] bg-[#cbd5e1] dark:bg-slate-600'}`}></div>
            )}

            <div
                className={`transition-all duration-150 cursor-pointer z-[60] relative ${isVertical 
                    ? `w-full h-full ${isOver ? 'bg-[var(--primary-color)]/25 border-2 border-dashed border-[var(--primary-color)] shadow-[0_0_16px_var(--primary-color)]/40 my-1' : 'bg-transparent border-2 border-transparent my-0'}`
                    : `w-full h-full ${isOver ? 'bg-[var(--primary-color)]/25 border-2 border-dashed border-[var(--primary-color)] shadow-[0_0_16px_var(--primary-color)]/40' : 'bg-transparent border-2 border-transparent'}`
                }`}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); dragCounter.current++; setIsOver(true); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDragLeave={(e) => { e.stopPropagation(); dragCounter.current--; if (dragCounter.current <= 0) { dragCounter.current = 0; setIsOver(false); } }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dragCounter.current = 0;
                    setIsOver(false);
                    const draggedId = e.dataTransfer.getData('text/plain');
                    if (draggedId) onDrop(draggedId);
                }}
            />
        </div>
    );
};

const TreeBranch: React.FC<TreeBranchProps> = ({ node, layout, level = 0, onEdit, onDelete, onAddChild, onMoveNode, onToggleStatus, language, birthdayHighlightMode, birthdayAnimationType, isVacationHighlightEnabled, onChildOrientationChange, selectedNodeIds, onNodeClick, isReadonly, isDragLocked, isVerticalChild, isExporting }) => {
    const hasChildren = node.children && node.children.length > 0;

    const dotColors = [
        'bg-[#ab47bc]', // Purple
        'bg-[#f06292]', // Pink
        'bg-[#42a5f5]', // Blue
        'bg-[#26c6da]'  // Cyan
    ];

    const currentDotColor = dotColors[level % dotColors.length];
    const nextDotColor = dotColors[(level + 1) % dotColors.length];

    const isModernPill = layout === LayoutType.MODERN_PILL;
    const isNodeInactive = node.isActive === false;
    const isDotted = isModernPill || isNodeInactive;

    const mColors = [
        { border: 'border-[#9c27b0]', bg: 'bg-gradient-to-r from-[#ab47bc] to-[#8e24aa]', text: 'text-[#ce93d8]' },
        { border: 'border-[#e91e63]', bg: 'bg-gradient-to-r from-[#f06292] to-[#d81b60]', text: 'text-[#f48fb1]' },
        { border: 'border-[#2196f3]', bg: 'bg-gradient-to-r from-[#42a5f5] to-[#1976d2]', text: 'text-[#90caf9]' },
        { border: 'border-[#00bcd4]', bg: 'bg-gradient-to-r from-[#26c6da] to-[#0097a7]', text: 'text-[#80deea]' },
    ];
    const mTheme = mColors[level % mColors.length];

    // Helper for line styling
    const lineStyle = `${isDotted ? 'border-r-2 border-dashed border-slate-400' : 'w-[2px] bg-[#cbd5e1] dark:bg-slate-600'} transition-all duration-300`;
    const horizontalLineStyle = `${isDotted ? 'border-t-2 border-dashed border-slate-400' : 'h-[2px] bg-[#cbd5e1] dark:bg-slate-600'} transition-all duration-300`;

    // Drag Logic for Layout Change
    const [isDraggingLayout, setIsDraggingLayout] = React.useState(false);
    const dragStartPos = React.useRef<{ x: number, y: number } | null>(null);

    const handleDragStart = (e: React.MouseEvent) => {
        if (isReadonly) return;
        e.stopPropagation();
        e.preventDefault();
        setIsDraggingLayout(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };

    const handleDragMove = (e: MouseEvent) => {
        // Optional: Add visual feedback logic here if needed
    };

    const handleDragEnd = (e: MouseEvent) => {
        if (!dragStartPos.current) return;

        const deltaX = e.clientX - dragStartPos.current.x;
        const deltaY = e.clientY - dragStartPos.current.y;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Threshold of 30px to trigger change
        if (absX > 30 && absX > absY) {
            // Horizontal Gesture (Drag Right/Left)
            if (node.childOrientation !== 'horizontal') {
                onChildOrientationChange(node, 'horizontal');
            }
        } else if (absY > 30 && absY > absX) {
            // Vertical Gesture (Drag Down/Up)
            if (node.childOrientation !== 'vertical') {
                onChildOrientationChange(node, 'vertical');
            }
        }

        setIsDraggingLayout(false);
        dragStartPos.current = null;
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
    };

    React.useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        };
    }, []);

    // Grouping Logic for Vertical Layout (Role -> Shift)
    const groupedChildren = React.useMemo(() => {
        // CRITICAL: If this node is already rendered inside a vertical column (isVerticalChild),
        // do NOT re-group its children with Role+Shift headers. This prevents duplicate
        // "MANHÃ" / "JARDINEIRO I" headers when intermediate nodes have children.
        if (isVerticalChild || node.childOrientation !== 'vertical' || !node.children) return null;

        const roleGroups: Record<string, ChartNode[]> = {};

        // First Level: Group by Role
        node.children.forEach(child => {
            const rawRole = child.role || 'Outros';
            // Normalize: remove accents, collapse spaces, trim, uppercase
            const roleKey = rawRole
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
                .replace(/\s+/g, ' ').trim().toUpperCase();

            if (!roleGroups[roleKey]) roleGroups[roleKey] = [];
            roleGroups[roleKey].push(child);
        });

        // Sort roles alphabetically
        const sortedRoles = Object.entries(roleGroups).sort((a, b) => a[0].localeCompare(b[0]));

        // Second Level: Group by Shift within each Role
        return sortedRoles.map(([role, children]) => {
            const shiftGroups: Record<string, ChartNode[]> = {};
            const shiftOrder = ['morning', 'afternoon', 'night', 'flexible'];

            children.forEach(child => {
                const rawShift = child.shift || 'flexible';
                // Strip accents first, then lowercase and trim
                const cleanShift = rawShift
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .trim().toLowerCase();

                // Normalization Map: Now accent-free, so 'manha' matches directly
                const shiftMap: Record<string, string> = {
                    'manha': 'morning', 'morning': 'morning',
                    'tarde': 'afternoon', 'afternoon': 'afternoon',
                    'noite': 'night', 'night': 'night',
                    'flexivel': 'flexible', 'flexible': 'flexible'
                };

                const shiftKey = shiftMap[cleanShift] || cleanShift;

                if (!shiftGroups[shiftKey]) shiftGroups[shiftKey] = [];
                shiftGroups[shiftKey].push(child);
            });

            const sortedShifts = Object.entries(shiftGroups).sort((a, b) => {
                const indexA = shiftOrder.indexOf(a[0]);
                const indexB = shiftOrder.indexOf(b[0]);
                return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
            });

            return { role, shiftGroups: sortedShifts, totalChildren: children.length };
        });
    }, [node.children, node.childOrientation, isVerticalChild]);

    const getShiftConfig = (shiftKey: string) => {
        const t = TRANSLATIONS[language];
        switch (shiftKey) {
            case 'morning': return {
                label: t.morning,
                icon: <Sun className="w-3.5 h-3.5" />,
                bg: 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
                border: 'border-orange-200 dark:border-orange-800',
                text: 'text-orange-700 dark:text-orange-300',
                iconColor: 'text-orange-500'
            };
            case 'afternoon': return {
                label: t.afternoon,
                icon: <Clock className="w-3.5 h-3.5" />,
                bg: 'bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/30',
                border: 'border-blue-200 dark:border-blue-800',
                text: 'text-blue-700 dark:text-blue-300',
                iconColor: 'text-blue-500'
            };
            case 'night': return {
                label: t.night,
                icon: <Moon className="w-3.5 h-3.5" />,
                bg: 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30',
                border: 'border-indigo-200 dark:border-indigo-800',
                text: 'text-indigo-700 dark:text-indigo-300',
                iconColor: 'text-indigo-500'
            };
            case 'flexible': return {
                label: t.flexible,
                icon: <Coffee className="w-3.5 h-3.5" />,
                bg: 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
                border: 'border-emerald-200 dark:border-emerald-800',
                text: 'text-emerald-700 dark:text-emerald-300',
                iconColor: 'text-emerald-500'
            };
            default: return {
                label: shiftKey,
                icon: <ShieldCheck className="w-3.5 h-3.5" />,
                bg: 'bg-slate-50 dark:bg-slate-800',
                border: 'border-slate-200 dark:border-slate-700',
                text: 'text-slate-600 dark:text-slate-400',
                iconColor: 'text-slate-500'
            };
        }
    };

    return (
        <div className={`flex flex-col items-center org-tree-node ${isVerticalChild ? '' : ''}`}>
            {/* Current Node */}
            <div className={`relative z-10 hover:z-[100] ${isVerticalChild ? 'px-0 mb-4' : 'px-4'}`}>
                <NodeRenderer
                    node={node}
                    layout={layout}
                    level={level}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddChild={onAddChild}
                    onMoveNode={onMoveNode}
                    onToggleStatus={onToggleStatus}
                    language={language}
                    birthdayHighlightMode={birthdayHighlightMode}
                    birthdayAnimationType={birthdayAnimationType}
                    isVacationHighlightEnabled={isVacationHighlightEnabled}

                    onChildOrientationChange={onChildOrientationChange}
                    isSelected={selectedNodeIds.includes(node.id)}
                    onNodeClick={onNodeClick}
                    isReadonly={isReadonly}
                    isDragLocked={isDragLocked}
                    isExporting={isExporting}
                />
            </div>

            {/* Connection Down to Children */}
            {hasChildren && (
                <div className="flex flex-col items-center w-full">

                    {/* Vertical Line from Parent to Horizontal Junction (Shared) */}
                    {!isVerticalChild && (
                        <div className="h-12 flex justify-center relative w-full group/line">
                            {/* 
                                FIx: If we have multiple groups (vertical), we want a "Fork" layout.
                                Parent line goes halfway down (h-1/2), then hits the bus.
                                Otherwise, it goes full height (h-full).
                            */}
                            <div className={`${lineStyle} ${groupedChildren && groupedChildren.length > 1 ? 'h-1/2' : 'h-full'}`}></div>

                            {/* Central Junction Dot (Visible in Dotted Layout) */}
                            {isDotted && (
                                <div className={`absolute bottom-0 translate-y-1/2 w-3 h-3 rounded-full ${currentDotColor} z-20 shadow-sm`}></div>
                            )}

                            {/* Drag Handle */}
                            {!isReadonly && !isDragLocked && (
                                <div
                                    className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-700 rounded-full border border-slate-300 dark:border-slate-500 shadow-sm flex items-center justify-center cursor-move z-30 transition-all duration-200 ${isDraggingLayout ? 'opacity-100 scale-125 border-[var(--primary-color)] text-[var(--primary-color)]' : 'opacity-0 group-hover/line:opacity-100 hover:scale-110'}`}
                                    onMouseDown={handleDragStart}
                                    title="Arraste: Direita ⮕ Horizontal, Baixo ⬇ Vertical"
                                >
                                    <div className={`w-2 h-2 rounded-full ${isDraggingLayout ? 'bg-[var(--primary-color)]' : 'bg-slate-400 dark:bg-slate-300'} pointer-events-none`} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* NEW: Role-Based Vertical Columns with Nested Shift Grouping */}
                    {node.childOrientation === 'vertical' && groupedChildren ? (
                        <div className="flex flex-row justify-center items-start gap-8 px-4 org-children-container">
                            {groupedChildren.map(({ role, shiftGroups, totalChildren }, groupIndex) => (
                                <div key={role} className="flex flex-col items-center relative">

                                    {/* Horizontal Connector to this Column (if multiple columns) */}
                                    {groupedChildren.length > 1 && (
                                        <>
                                            {/* Top Horizontal Bar Segments */}
                                            <div className="absolute top-[-24px] w-full h-0">
                                                {groupIndex > 0 && (
                                                    <div className={`absolute right-1/2 w-[calc(50%+1rem)] ${horizontalLineStyle} top-0`}></div>
                                                )}
                                                {groupIndex < groupedChildren.length - 1 && (
                                                    <div className={`absolute left-1/2 w-[calc(50%+1rem)] ${horizontalLineStyle} top-0`}></div>
                                                )}
                                            </div>
                                            {/* Vertical Line down to Header */}
                                            <div className={`absolute top-[-24px] left-1/2 -translate-x-1/2 h-6 ${lineStyle}`}></div>
                                        </>
                                    )}

                                    {/* Role Header */}
                                    {!isExporting && (
                                        <div data-html2canvas-ignore className={`mb-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 relative z-10`}>
                                            {role}
                                            <span className="ml-2 opacity-50 text-[10px]">({totalChildren})</span>
                                        </div>
                                    )}

                                    {/* Stack of Shifts within Role */}
                                    <div className="flex flex-col items-center w-full gap-4">
                                        {shiftGroups.map(([shiftKey, children]) => {
                                            const config = getShiftConfig(shiftKey);
                                            return (
                                                <div key={`${role}-${shiftKey}`} className="flex flex-col items-center w-full relative">

                                                    {/* Connector from Role Header to Shift Header */}
                                                    <div className={`h-4 ${lineStyle}`}></div>

                                                    {/* Shift Sub-Header */}
                                                    {!isExporting && (
                                                        <div data-html2canvas-ignore className={`mb-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border flex items-center gap-1.5 ${config.bg} ${config.border} ${config.text}`}>
                                                            <span className={`${config.iconColor}`}>{config.icon}</span>
                                                            {config.label}
                                                        </div>
                                                    )}

                                                    {/* Children in this Shift */}
                                                    <div className="flex flex-col items-center relative gap-0 w-full">
                                                        {children.map((child, childIndex) => (
                                                            <React.Fragment key={child.id}>
                                                                {/* Drop Zone BEFORE first child in shift */}
                                                                {childIndex === 0 && !isReadonly && !isDragLocked && !isExporting && (
                                                                    <div className="w-full">
                                                                        <div className={`h-4 mx-auto ${lineStyle}`}></div>
                                                                        <SiblingDropZone
                                                                            isVertical
                                                                            lineStyle={lineStyle}
                                                                            isExporting={isExporting}
                                                                            onDrop={(draggedId) => onMoveNode(draggedId, child.id, 'before')}
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div className="flex flex-col items-center relative w-full">
                                                                    {/* Connection line */}
                                                                    <div className={`h-4 ${lineStyle}`}></div>

                                                                    <TreeBranch
                                                                        {...{ node: child, layout, level: level + 1, onEdit, onDelete, onAddChild, onMoveNode, onToggleStatus, language, birthdayHighlightMode, birthdayAnimationType, isVacationHighlightEnabled, onChildOrientationChange, selectedNodeIds, onNodeClick, isReadonly, isDragLocked, isVerticalChild: true, isExporting }}
                                                                    />
                                                                </div>

                                                                {/* Drop Zone AFTER each child in shift */}
                                                                {!isReadonly && !isDragLocked && !isExporting && (
                                                                    <div className="w-full">
                                                                        <SiblingDropZone
                                                                            isVertical
                                                                            lineStyle={lineStyle}
                                                                            hideLine={!child.children || child.children.length === 0}
                                                                            isExporting={isExporting}
                                                                            onDrop={(draggedId) => onMoveNode(draggedId, child.id, 'after')}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Standard Horizontal Layout with Sibling Drop Zones */
                        <div className="flex flex-row justify-center w-full items-start org-children-container org-horizontal-layout">
                            {node.children.map((child, index) => (
                                <div key={child.id} className="relative flex flex-row items-start">
                                    {/* Drop Zone BEFORE each child */}
                                    {!isReadonly && !isDragLocked && !isExporting && (
                                        <SiblingDropZone
                                            onDrop={(draggedId) => onMoveNode(draggedId, child.id, 'before')}
                                            isExporting={isExporting}
                                        />
                                    )}

                                    <div className={`relative flex flex-col items-center px-6`}>
                                        {/* Horizontal Connector Segments - Added 1px overlap to prevent gaps */}
                                        {node.children.length > 1 && (
                                            <>
                                                {/* Left Segment */}
                                                {index > 0 && (
                                                    <div className={`absolute top-0 left-[-2px] w-[calc(50%+2px)] ${horizontalLineStyle}`}></div>
                                                )}

                                                {/* Right Segment */}
                                                {index < node.children.length - 1 && (
                                                    <div className={`absolute top-0 right-[-2px] w-[calc(50%+2px)] ${horizontalLineStyle}`}></div>
                                                )}
                                            </>
                                        )}

                                        {/* Connection Line from Parent/Junction to Child */}
                                        <div className="h-12 flex justify-center relative w-full">
                                            <div className={`${lineStyle} h-full`}></div>

                                            {/* Child Node Connection Dot */}
                                            {isDotted && (
                                                <div className={`absolute bottom-0 translate-y-1/2 w-3 h-3 rounded-full ${nextDotColor} z-20 shadow-md border-2 border-white dark:border-slate-800`}></div>
                                            )}
                                        </div>

                                        <TreeBranch
                                            {...{ node: child, layout, level: level + 1, onEdit, onDelete, onAddChild, onMoveNode, onToggleStatus, language, birthdayHighlightMode, birthdayAnimationType, isVacationHighlightEnabled, onChildOrientationChange, selectedNodeIds, onNodeClick, isReadonly, isDragLocked, isExporting }}
                                        />
                                    </div>

                                    {/* Drop Zone AFTER last child only */}
                                    {index === node.children.length - 1 && !isReadonly && !isDragLocked && !isExporting && (
                                        <div className="absolute right-[-1rem] top-0 bottom-0 translate-x-full">
                                            <SiblingDropZone
                                                onDrop={(draggedId) => onMoveNode(draggedId, child.id, 'after')}
                                                isExporting={isExporting}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TreeBranch;
