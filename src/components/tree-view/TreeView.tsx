import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TreeNodeComponent from './TreeNodeComponent';
import './TreeView.scss';
import { CheckState, TreeNode, TreeViewProps } from './tree-view-types';

const getAllDescendantIds = (node: TreeNode): string[] => {
    const ids: string[] = [];
    if (node.children) {
        for (const child of node.children) {
            ids.push(child.id);
            ids.push(...getAllDescendantIds(child));
        }
    }
    return ids;
};

const getAllParentIds = (nodeId: string, parentMap: Map<string, string>): string[] => {
    const parents: string[] = [];
    let currentId = parentMap.get(nodeId);
    while (currentId) {
        parents.push(currentId);
        currentId = parentMap.get(currentId);
    }
    return parents;
};

const buildNodeMap = (nodes: TreeNode[]): Map<string, TreeNode> => {
    const map = new Map<string, TreeNode>();
    const traverse = (nodeList: TreeNode[]) => {
        for (const node of nodeList) {
            map.set(node.id, node);
            if (node.children) {
                traverse(node.children);
            }
        }
    };
    traverse(nodes);
    return map;
};

const buildParentMap = (nodes: TreeNode[]): Map<string, string> => {
    const map = new Map<string, string>();
    const traverse = (nodeList: TreeNode[], parentId?: string) => {
        for (const node of nodeList) {
            if (parentId) {
                map.set(node.id, parentId);
            }
            if (node.children) {
                traverse(node.children, node.id);
            }
        }
    };
    traverse(nodes);
    return map;
};

const flattenVisibleNodes = (
    nodes: TreeNode[],
    expandedKeys: Set<string>,
    filterText?: string,
): TreeNode[] => {
    const result: TreeNode[] = [];

    const matchesFilter = (node: TreeNode): boolean => {
        if (!filterText) return true;
        const lower = filterText.toLowerCase();
        if (node.label.toLowerCase().includes(lower)) return true;
        if (node.children) {
            return node.children.some(child => matchesFilter(child));
        }
        return false;
    };

    const traverse = (nodeList: TreeNode[]) => {
        for (const node of nodeList) {
            if (filterText && !matchesFilter(node)) continue;
            result.push(node);
            if (node.children && (expandedKeys.has(node.id) || (filterText && matchesFilter(node)))) {
                traverse(node.children);
            }
        }
    };
    traverse(nodes);
    return result;
};

const TreeView: React.FC<TreeViewProps> = ({
    nodes,
    expandedKeys: controlledExpandedKeys,
    selectedKeys: controlledSelectedKeys,
    checkedKeys: controlledCheckedKeys,
    defaultExpandedKeys,
    selectionMode = 'single',
    checkboxes = false,
    draggable = false,
    loadChildren,
    onExpand,
    onSelect,
    onCheck,
    onDragDrop,
    className,
    nodeTemplate,
    filterText,
}) => {
    const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string>>(
        () => defaultExpandedKeys ?? new Set(),
    );
    const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string>>(new Set());
    const [internalCheckedKeys, setInternalCheckedKeys] = useState<Set<string>>(new Set());
    const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
    const [dragNodeId, setDragNodeId] = useState<string | null>(null);
    const [dropNodeId, setDropNodeId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<'before' | 'inside' | 'after' | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const expandedKeys = controlledExpandedKeys ?? internalExpandedKeys;
    const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
    const checkedKeys = controlledCheckedKeys ?? internalCheckedKeys;

    const nodeMap = useMemo(() => buildNodeMap(nodes), [nodes]);
    const parentMap = useMemo(() => buildParentMap(nodes), [nodes]);

    const visibleNodes = useMemo(
        () => flattenVisibleNodes(nodes, expandedKeys, filterText),
        [nodes, expandedKeys, filterText],
    );

    const getNodeLevel = useCallback((nodeId: string): number => {
        let level = 0;
        let currentId = parentMap.get(nodeId);
        while (currentId) {
            level++;
            currentId = parentMap.get(currentId);
        }
        return level;
    }, [parentMap]);

    const getCheckState = useCallback((node: TreeNode): CheckState => {
        if (!node.children || node.children.length === 0) {
            return checkedKeys.has(node.id) ? 'checked' : 'unchecked';
        }

        const allDescendants = getAllDescendantIds(node);
        const leafDescendants = allDescendants.filter(id => {
            const n = nodeMap.get(id);
            return n && (!n.children || n.children.length === 0);
        });

        if (leafDescendants.length === 0) {
            return checkedKeys.has(node.id) ? 'checked' : 'unchecked';
        }

        const checkedCount = leafDescendants.filter(id => checkedKeys.has(id)).length;

        if (checkedCount === 0) return 'unchecked';
        if (checkedCount === leafDescendants.length) return 'checked';
        return 'indeterminate';
    }, [checkedKeys, nodeMap]);

    const handleToggle = useCallback(async (node: TreeNode) => {
        const newExpanded = new Set(expandedKeys);
        const isExpanding = !newExpanded.has(node.id);

        if (isExpanding) {
            if (loadChildren && (!node.children || node.children.length === 0) && !node.isLeaf) {
                setLoadingKeys(prev => new Set(prev).add(node.id));
                try {
                    const children = await loadChildren(node);
                    node.children = children;
                } finally {
                    setLoadingKeys(prev => {
                        const next = new Set(prev);
                        next.delete(node.id);
                        return next;
                    });
                }
            }
            newExpanded.add(node.id);
        } else {
            newExpanded.delete(node.id);
        }

        if (!controlledExpandedKeys) {
            setInternalExpandedKeys(newExpanded);
        }
        onExpand?.(newExpanded, node);
    }, [expandedKeys, controlledExpandedKeys, loadChildren, onExpand]);

    const handleSelect = useCallback((node: TreeNode, event: React.MouseEvent | React.KeyboardEvent) => {
        if (selectionMode === 'none') return;

        let newSelected: Set<string>;

        if (selectionMode === 'multiple') {
            newSelected = new Set(selectedKeys);
            if (event.ctrlKey || event.metaKey) {
                if (newSelected.has(node.id)) {
                    newSelected.delete(node.id);
                } else {
                    newSelected.add(node.id);
                }
            } else {
                newSelected = new Set([node.id]);
            }
        } else {
            newSelected = new Set([node.id]);
        }

        if (!controlledSelectedKeys) {
            setInternalSelectedKeys(newSelected);
        }
        onSelect?.(newSelected, node);
        setFocusedNodeId(node.id);
    }, [selectionMode, selectedKeys, controlledSelectedKeys, onSelect]);

    const handleCheck = useCallback((node: TreeNode) => {
        const newChecked = new Set(checkedKeys);
        const currentState = getCheckState(node);
        const shouldCheck = currentState !== 'checked';

        const toggleNode = (n: TreeNode, check: boolean) => {
            if (check) {
                newChecked.add(n.id);
            } else {
                newChecked.delete(n.id);
            }
            if (n.children) {
                for (const child of n.children) {
                    if (!child.disabled) {
                        toggleNode(child, check);
                    }
                }
            }
        };

        toggleNode(node, shouldCheck);

        const parentIds = getAllParentIds(node.id, parentMap);
        for (const pid of parentIds) {
            const parentNode = nodeMap.get(pid);
            if (!parentNode || !parentNode.children) continue;

            const allLeaves = getAllDescendantIds(parentNode).filter(id => {
                const n = nodeMap.get(id);
                return n && (!n.children || n.children.length === 0);
            });
            const allChecked = allLeaves.every(id => newChecked.has(id));

            if (allChecked) {
                newChecked.add(pid);
            } else {
                newChecked.delete(pid);
            }
        }

        if (!controlledCheckedKeys) {
            setInternalCheckedKeys(newChecked);
        }
        onCheck?.(newChecked, node);
    }, [checkedKeys, controlledCheckedKeys, getCheckState, nodeMap, parentMap, onCheck]);

    const handleDragStart = useCallback((node: TreeNode, event: React.DragEvent) => {
        setDragNodeId(node.id);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', node.id);
        if (event.currentTarget instanceof HTMLElement) {
            event.currentTarget.style.opacity = '0.5';
        }
    }, []);

    const handleDragOver = useCallback((node: TreeNode, event: React.DragEvent) => {
        if (!dragNodeId || dragNodeId === node.id) return;

        const draggedNode = nodeMap.get(dragNodeId);
        if (draggedNode) {
            const descendants = getAllDescendantIds(draggedNode);
            if (descendants.includes(node.id)) return;
        }

        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const y = event.clientY - rect.top;
        const height = rect.height;

        let pos: 'before' | 'inside' | 'after';
        if (y < height * 0.25) {
            pos = 'before';
        } else if (y > height * 0.75) {
            pos = 'after';
        } else {
            pos = 'inside';
        }

        setDropNodeId(node.id);
        setDropPosition(pos);
    }, [dragNodeId, nodeMap]);

    const handleDragLeave = useCallback(() => {
        setDropNodeId(null);
        setDropPosition(null);
    }, []);

    const handleDrop = useCallback((node: TreeNode) => {
        if (!dragNodeId || !dropPosition) return;

        const dragNode = nodeMap.get(dragNodeId);
        if (dragNode && onDragDrop) {
            onDragDrop({
                dragNode,
                dropNode: node,
                dropPosition,
            });
        }

        setDragNodeId(null);
        setDropNodeId(null);
        setDropPosition(null);
    }, [dragNodeId, dropPosition, nodeMap, onDragDrop]);

    const handleDragEnd = useCallback((event: React.DragEvent) => {
        if (event.currentTarget instanceof HTMLElement) {
            event.currentTarget.style.opacity = '';
        }
        setDragNodeId(null);
        setDropNodeId(null);
        setDropPosition(null);
    }, []);

    const handleContainerKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!focusedNodeId) {
            if (visibleNodes.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                setFocusedNodeId(visibleNodes[0].id);
            }
            return;
        }

        const currentIndex = visibleNodes.findIndex(n => n.id === focusedNodeId);
        if (currentIndex === -1) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < visibleNodes.length - 1) {
                const nextId = visibleNodes[currentIndex + 1].id;
                setFocusedNodeId(nextId);
                scrollToNode(nextId);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                const prevId = visibleNodes[currentIndex - 1].id;
                setFocusedNodeId(prevId);
                scrollToNode(prevId);
            }
        } else if (e.key === 'Home') {
            e.preventDefault();
            if (visibleNodes.length > 0) {
                setFocusedNodeId(visibleNodes[0].id);
                scrollToNode(visibleNodes[0].id);
            }
        } else if (e.key === 'End') {
            e.preventDefault();
            if (visibleNodes.length > 0) {
                const lastId = visibleNodes[visibleNodes.length - 1].id;
                setFocusedNodeId(lastId);
                scrollToNode(lastId);
            }
        }
    }, [focusedNodeId, visibleNodes]);

    const scrollToNode = (nodeId: string) => {
        if (!containerRef.current) return;
        const el = containerRef.current.querySelector(`[data-node-id="${nodeId}"]`);
        if (el) {
            el.scrollIntoView({ block: 'nearest' });
        }
    };

    useEffect(() => {
        if (focusedNodeId && containerRef.current) {
            const el = containerRef.current.querySelector(`[data-node-id="${focusedNodeId}"]`) as HTMLElement;
            if (el) {
                el.focus();
            }
        }
    }, [focusedNodeId]);

    const renderNode = (node: TreeNode) => {
        const level = getNodeLevel(node.id);
        const isExpanded = expandedKeys.has(node.id);
        const isSelected = selectedKeys.has(node.id);
        const isLoading = loadingKeys.has(node.id);
        const isFocused = focusedNodeId === node.id;
        const nodeDropPosition = dropNodeId === node.id ? dropPosition : null;
        const checkState = checkboxes ? getCheckState(node) : ('unchecked' as CheckState);

        return (
            <React.Fragment key={node.id}>
                <TreeNodeComponent
                    node={node}
                    level={level}
                    expanded={isExpanded}
                    selected={isSelected}
                    checkState={checkState}
                    checkboxes={checkboxes}
                    draggable={draggable}
                    loading={isLoading}
                    focused={isFocused}
                    dropPosition={nodeDropPosition}
                    nodeTemplate={nodeTemplate}
                    onToggle={handleToggle}
                    onSelect={handleSelect}
                    onCheck={handleCheck}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                />
                {isExpanded && node.children && (
                    <div className="eui-tv-children" role="group">
                        {node.children
                            .filter(child => {
                                if (!filterText) return true;
                                return matchesFilter(child, filterText);
                            })
                            .map(child => renderNode(child))}
                    </div>
                )}
            </React.Fragment>
        );
    };

    const filteredNodes = useMemo(() => {
        if (!filterText) return nodes;
        return nodes.filter(node => matchesFilter(node, filterText));
    }, [nodes, filterText]);

    return (
        <div
            ref={containerRef}
            className={classNames('eui-tree-view', className)}
            role="tree"
            aria-multiselectable={selectionMode === 'multiple'}
            onKeyDown={handleContainerKeyDown}
        >
            {filteredNodes.length === 0 ? (
                <div className="eui-tv-empty">No items to display</div>
            ) : (
                filteredNodes.map(node => renderNode(node))
            )}
        </div>
    );
};

const matchesFilter = (node: TreeNode, filterText: string): boolean => {
    const lower = filterText.toLowerCase();
    if (node.label.toLowerCase().includes(lower)) return true;
    if (node.children) {
        return node.children.some(child => matchesFilter(child, lower));
    }
    return false;
};

export default TreeView;
