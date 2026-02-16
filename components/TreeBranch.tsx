
import React from 'react';
import { ChartNode, LayoutType, Employee, Language } from '../../types';
import NodeRenderer from './NodeRenderer';

interface TreeBranchProps {
    node: ChartNode;
    layout: LayoutType;
    level?: number;
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
}

const TreeBranch: React.FC<TreeBranchProps> = ({ node, layout, level = 0, onEdit, onDelete, onAddChild, onMoveNode, onToggleStatus, language, birthdayHighlightMode, birthdayAnimationType, isVacationHighlightEnabled, onChildOrientationChange }) => {
    const hasChildren = node.children && node.children.length > 0;

    const dotColors = [
        'bg-[#ab47bc]', // Purple
        'bg-[#f06292]', // Pink
        'bg-[#42a5f5]', // Blue
        'bg-[#26c6da]'  // Cyan
    ];

    const currentDotColor = dotColors[level % dotColors.length];
    const nextDotColor = dotColors[(level + 1) % dotColors.length];

    const isDotted = layout === LayoutType.MODERN_PILL;

    // Line Styles
    const lineStyle = isDotted
        ? 'border-l-2 border-dotted border-slate-400 dark:border-slate-500'
        : 'bg-[#cbd5e1] dark:bg-slate-600 w-[1.5px]';

    const horizontalLineStyle = isDotted
        ? 'border-t-2 border-dotted border-slate-400 dark:border-slate-500'
        : 'bg-[#cbd5e1] dark:bg-slate-600 h-[1.5px]';

    // Drag Logic for Layout Change
    const [isDraggingLayout, setIsDraggingLayout] = React.useState(false);
    const dragStartPos = React.useRef<{ x: number, y: number } | null>(null);

    const handleDragStart = (e: React.MouseEvent) => {
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

    return (
        <div className="flex flex-col items-center">
            {/* Current Node */}
            <div className="relative z-10 px-4">
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
                />
            </div>

            {/* Connection Down to Children */}
            {hasChildren && (
                <div className="flex flex-col items-center w-full">

                    {/* Vertical Line from Parent to Horizontal Junction */}
                    <div className="h-12 flex justify-center relative w-full group/line">
                        <div className={`${lineStyle} h-full`}></div>

                        {/* Central Junction Dot (Visible in Dotted Layout) */}
                        {isDotted && (
                            <div className={`absolute bottom-0 translate-y-1/2 w-3 h-3 rounded-full ${currentDotColor} z-20 shadow-sm`}></div>
                        )}

                        {/* Drag Handle for Layout Change - Only shows on hover or dragging */}
                        <div
                            className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-700 rounded-full border border-slate-300 dark:border-slate-500 shadow-sm flex items-center justify-center cursor-move z-30 transition-all duration-200 ${isDraggingLayout ? 'opacity-100 scale-125 border-[#00897b] text-[#00897b]' : 'opacity-0 group-hover/line:opacity-100 hover:scale-110'}`}
                            onMouseDown={handleDragStart}
                            title="Arraste: Direita ⮕ Horizontal, Baixo ⬇ Vertical"
                        >
                            <div className={`w-2 h-2 rounded-full ${isDraggingLayout ? 'bg-[#00897b]' : 'bg-slate-400 dark:bg-slate-300'} pointer-events-none`} />
                        </div>
                    </div>

                    {/* Children Container */}
                    <div className={`${node.childOrientation === 'vertical' && node.children.length > 1 ? `flex flex-col items-start ml-20 ${isDotted ? 'border-l-2 border-dotted border-slate-400/50' : 'border-l-[1.5px] border-[#cbd5e1]'} dark:border-slate-600/50 pl-10` : 'flex flex-row justify-center w-full'}`}>
                        {node.children.map((child, index) => (
                            <div key={child.id} className={`relative flex flex-col items-center ${node.childOrientation === 'vertical' && node.children.length > 1 ? 'items-start py-4' : 'px-6'}`}>

                                {/* Horizontal Connector Segments (Only for horizontal layout) */}
                                {!(node.childOrientation === 'vertical' && node.children.length > 1) && node.children.length > 1 && (
                                    <>
                                        {/* Left Segment */}
                                        {index > 0 && (
                                            <div className={`absolute top-0 left-0 w-1/2 ${horizontalLineStyle}`}></div>
                                        )}

                                        {/* Right Segment */}
                                        {index < node.children.length - 1 && (
                                            <div className={`absolute top-0 right-0 w-1/2 ${horizontalLineStyle}`}></div>
                                        )}
                                    </>
                                )}

                                {/* Connection Line from Parent/Junction to Child */}
                                <div className={`${node.childOrientation === 'vertical' && node.children.length > 1 ? `absolute -left-10 top-[56px] w-10 ${horizontalLineStyle}` : 'h-12 flex justify-center relative w-full'}`}>
                                    {!(node.childOrientation === 'vertical' && node.children.length > 1) && <div className={`${lineStyle} h-full`}></div>}

                                    {/* Child Node Connection Dot (At the bottom of the connector, near the node) */}
                                    {isDotted && (
                                        <div className={`absolute ${node.childOrientation === 'vertical' ? 'left-0 -translate-x-1/2 top-1/2 -translate-y-1/2' : 'bottom-0 translate-y-1/2'} w-2.5 h-2.5 rounded-full ${nextDotColor} z-20 shadow-sm opacity-80`}></div>
                                    )}
                                </div>

                                {/* Recursive Child Node */}
                                <TreeBranch
                                    {...{ node: child, layout, level: level + 1, onEdit, onDelete, onAddChild, onMoveNode, onToggleStatus, language, birthdayHighlightMode, birthdayAnimationType, isVacationHighlightEnabled, onChildOrientationChange }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TreeBranch;
