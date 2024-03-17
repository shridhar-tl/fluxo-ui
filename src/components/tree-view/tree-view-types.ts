import React from 'react';

export interface TreeNode {
    id: string;
    label: string;
    icon?: React.ReactNode;
    children?: TreeNode[];
    isLeaf?: boolean;
    disabled?: boolean;
    data?: Record<string, unknown>;
}

export interface DragDropInfo {
    dragNode: TreeNode;
    dropNode: TreeNode;
    dropPosition: 'before' | 'inside' | 'after';
}

export interface TreeViewProps {
    nodes: TreeNode[];
    expandedKeys?: Set<string>;
    selectedKeys?: Set<string>;
    checkedKeys?: Set<string>;
    defaultExpandedKeys?: Set<string>;
    selectionMode?: 'single' | 'multiple' | 'none';
    checkboxes?: boolean;
    draggable?: boolean;
    loadChildren?: (node: TreeNode) => Promise<TreeNode[]>;
    onExpand?: (keys: Set<string>, node: TreeNode) => void;
    onSelect?: (keys: Set<string>, node: TreeNode) => void;
    onCheck?: (keys: Set<string>, node: TreeNode) => void;
    onDragDrop?: (info: DragDropInfo) => void;
    className?: string;
    nodeTemplate?: (node: TreeNode) => React.ReactNode;
    filterText?: string;
}

export type CheckState = 'checked' | 'unchecked' | 'indeterminate';

export interface TreeNodeProps {
    node: TreeNode;
    level: number;
    expanded: boolean;
    selected: boolean;
    checkState: CheckState;
    checkboxes: boolean;
    draggable: boolean;
    loading: boolean;
    focused: boolean;
    dropPosition: 'before' | 'inside' | 'after' | null;
    nodeTemplate?: (node: TreeNode) => React.ReactNode;
    onToggle: (node: TreeNode) => void;
    onSelect: (node: TreeNode, event: React.MouseEvent | React.KeyboardEvent) => void;
    onCheck: (node: TreeNode) => void;
    onDragStart: (node: TreeNode, event: React.DragEvent) => void;
    onDragOver: (node: TreeNode, event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (node: TreeNode, event: React.DragEvent) => void;
    onDragEnd: (event: React.DragEvent) => void;
}
