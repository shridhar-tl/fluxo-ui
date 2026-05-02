import classNames from 'classnames';
import React from 'react';
import { TreeNodeProps } from './tree-view-types';

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
    node,
    level,
    posInSet,
    setSize,
    expanded,
    selected,
    checkState,
    checkboxes,
    draggable: isDraggable,
    loading,
    focused,
    dropPosition,
    nodeTemplate,
    childCount,
    onToggle,
    onSelect,
    onCheck,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
}) => {
    const isExpandable = !node.isLeaf && ((childCount ?? 0) > 0 || loading || !node.isLeaf);
    const hasChildren = (childCount ?? 0) > 0;

    const handleToggleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(node);
    };

    const handleNodeClick = (e: React.MouseEvent) => {
        if (!node.disabled) {
            onSelect(node, e);
        }
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!node.disabled) {
            onCheck(node);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (node.disabled) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (checkboxes) {
                onCheck(node);
            } else {
                onSelect(node, e);
            }
        }

        if (e.key === 'ArrowRight' && isExpandable && !expanded) {
            e.preventDefault();
            onToggle(node);
        }

        if (e.key === 'ArrowLeft' && expanded) {
            e.preventDefault();
            onToggle(node);
        }
    };

    const handleDragStart = (e: React.DragEvent) => {
        if (!isDraggable || node.disabled) return;
        onDragStart(node, e);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (!isDraggable) return;
        e.preventDefault();
        onDragOver(node, e);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (!isDraggable) return;
        onDragLeave(e);
    };

    const handleDrop = (e: React.DragEvent) => {
        if (!isDraggable) return;
        e.preventDefault();
        onDrop(node, e);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        onDragEnd(e);
    };

    const nodeClasses = classNames('eui-tv-node', {
        'eui-tv-node-selected': selected,
        'eui-tv-node-disabled': node.disabled,
        'eui-tv-node-focused': focused,
        'eui-tv-node-drop-before': dropPosition === 'before',
        'eui-tv-node-drop-inside': dropPosition === 'inside',
        'eui-tv-node-drop-after': dropPosition === 'after',
    });

    const expandIconClasses = classNames('eui-tv-expand-icon', {
        'eui-tv-expand-icon-expanded': expanded,
    });

    return (
        <div
            className={nodeClasses}
            role="treeitem"
            aria-expanded={isExpandable ? expanded : undefined}
            aria-selected={selected}
            aria-disabled={node.disabled}
            aria-level={level + 1}
            aria-posinset={posInSet}
            aria-setsize={setSize}
            tabIndex={focused ? 0 : -1}
            data-node-id={node.id}
            style={{ paddingLeft: `${level * 1.5}rem` }}
            onClick={handleNodeClick}
            onKeyDown={handleKeyDown}
            draggable={isDraggable && !node.disabled}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
        >
            <span
                className="eui-tv-expand-area"
                onClick={handleToggleClick}
            >
                {isExpandable && !loading && (
                    <svg className={expandIconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                )}
                {loading && (
                    <span className="eui-tv-spinner" />
                )}
            </span>

            {checkboxes && (
                <span
                    className="eui-tv-checkbox-area"
                    onClick={handleCheckboxClick}
                    role="checkbox"
                    aria-checked={checkState === 'checked' ? true : checkState === 'indeterminate' ? 'mixed' : false}
                >
                    <span className={classNames('eui-tv-checkbox', {
                        'eui-tv-checkbox-checked': checkState === 'checked',
                        'eui-tv-checkbox-indeterminate': checkState === 'indeterminate',
                        'eui-tv-checkbox-disabled': node.disabled,
                    })}>
                        {checkState === 'checked' && (
                            <svg viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                            </svg>
                        )}
                        {checkState === 'indeterminate' && (
                            <svg viewBox="0 0 16 16" fill="currentColor">
                                <rect x="3" y="7" width="10" height="2" rx="1" />
                            </svg>
                        )}
                    </span>
                </span>
            )}

            {isDraggable && !node.disabled && (
                <span className="eui-tv-drag-handle">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5" />
                        <circle cx="15" cy="6" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="18" r="1.5" />
                        <circle cx="15" cy="18" r="1.5" />
                    </svg>
                </span>
            )}

            {node.icon && (
                <span className="eui-tv-node-icon">{node.icon}</span>
            )}

            <span className="eui-tv-node-label">
                {nodeTemplate ? nodeTemplate(node) : node.label}
            </span>

            {hasChildren && !expanded && (
                <span className="eui-tv-child-count">{childCount}</span>
            )}
        </div>
    );
};

export default React.memo(TreeNodeComponent);
