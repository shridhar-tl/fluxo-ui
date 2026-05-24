import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import TreeNodeComponent from './TreeNodeComponent';
import '../eui-base.scss';
import './TreeView.scss';
import { CheckState, TreeNode, TreeViewProps } from './tree-view-types';

const getAllDescendantIds = (node: TreeNode, getChildren: (n: TreeNode) => TreeNode[] | undefined): string[] => {
    const ids: string[] = [];
    const children = getChildren(node);
    if (children) {
        for (const child of children) {
            ids.push(child.id);
            ids.push(...getAllDescendantIds(child, getChildren));
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

const buildNodeMap = (nodes: TreeNode[], getChildren: (n: TreeNode) => TreeNode[] | undefined): Map<string, TreeNode> => {
    const map = new Map<string, TreeNode>();
    const traverse = (nodeList: TreeNode[]) => {
        for (const node of nodeList) {
            map.set(node.id, node);
            const c = getChildren(node);
            if (c) traverse(c);
        }
    };
    traverse(nodes);
    return map;
};

const buildParentMap = (nodes: TreeNode[], getChildren: (n: TreeNode) => TreeNode[] | undefined): Map<string, string> => {
    const map = new Map<string, string>();
    const traverse = (nodeList: TreeNode[], parentId?: string) => {
        for (const node of nodeList) {
            if (parentId) {
                map.set(node.id, parentId);
            }
            const c = getChildren(node);
            if (c) traverse(c, node.id);
        }
    };
    traverse(nodes);
    return map;
};

const matchesFilter = (
    node: TreeNode,
    filterText: string,
    getChildren: (n: TreeNode) => TreeNode[] | undefined,
): boolean => {
    const lower = filterText.toLowerCase();
    if (node.label.toLowerCase().includes(lower)) return true;
    const children = getChildren(node);
    if (children) {
        return children.some((child) => matchesFilter(child, filterText, getChildren));
    }
    return false;
};

const reducedMotionMatches = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    ariaLabel = 'Tree',
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
    const [filterAnnouncement, setFilterAnnouncement] = useState('');
    const childrenCacheRef = useRef<Map<string, TreeNode[]>>(new Map());
    const typeAheadRef = useRef<{ buffer: string; timer: number | null }>({ buffer: '', timer: null });
    const generatedId = useId();
    const liveRegionId = `eui-tv-live-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const containerRef = useRef<HTMLDivElement>(null);

    const expandedKeys = controlledExpandedKeys ?? internalExpandedKeys;
    const selectedKeys = controlledSelectedKeys ?? internalSelectedKeys;
    const checkedKeys = controlledCheckedKeys ?? internalCheckedKeys;

    const getChildren = useCallback((node: TreeNode): TreeNode[] | undefined => {
        const cached = childrenCacheRef.current.get(node.id);
        if (cached) return cached;
        return node.children;
    }, []);

    const nodeMap = useMemo(() => buildNodeMap(nodes, getChildren), [nodes, getChildren]);
    const parentMap = useMemo(() => buildParentMap(nodes, getChildren), [nodes, getChildren]);

    useEffect(() => {
        if (defaultExpandedKeys && controlledExpandedKeys === undefined) {
            setInternalExpandedKeys(new Set(defaultExpandedKeys));
        }
    }, [defaultExpandedKeys, controlledExpandedKeys]);

    const filteredNodes = useMemo(() => {
        if (!filterText) return nodes;
        return nodes.filter((node) => matchesFilter(node, filterText, getChildren));
    }, [nodes, filterText, getChildren]);

    const visibleNodes = useMemo(() => {
        const result: TreeNode[] = [];
        const traverse = (list: TreeNode[]) => {
            for (const node of list) {
                if (filterText && !matchesFilter(node, filterText, getChildren)) continue;
                result.push(node);
                const c = getChildren(node);
                if (c && (expandedKeys.has(node.id) || (filterText && matchesFilter(node, filterText, getChildren)))) {
                    traverse(c);
                }
            }
        };
        traverse(nodes);
        return result;
    }, [nodes, expandedKeys, filterText, getChildren]);

    useEffect(() => {
        if (filterText === undefined || filterText === '') {
            setFilterAnnouncement('');
            return;
        }
        const count = visibleNodes.length;
        const message = `${count} ${count === 1 ? 'result' : 'results'} for "${filterText}"`;
        setFilterAnnouncement('');
        const t = window.setTimeout(() => setFilterAnnouncement(message), 30);
        return () => window.clearTimeout(t);
    }, [filterText, visibleNodes.length]);

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
        const children = getChildren(node);
        if (!children || children.length === 0) {
            return checkedKeys.has(node.id) ? 'checked' : 'unchecked';
        }

        const allDescendants = getAllDescendantIds(node, getChildren);
        const leafDescendants = allDescendants.filter((id) => {
            const n = nodeMap.get(id);
            const nc = n ? getChildren(n) : undefined;
            return n && (!nc || nc.length === 0);
        });

        if (leafDescendants.length === 0) {
            return checkedKeys.has(node.id) ? 'checked' : 'unchecked';
        }

        const checkedCount = leafDescendants.filter((id) => checkedKeys.has(id)).length;

        if (checkedCount === 0) return 'unchecked';
        if (checkedCount === leafDescendants.length) return 'checked';
        return 'indeterminate';
    }, [checkedKeys, nodeMap, getChildren]);

    const handleToggle = useCallback(async (node: TreeNode) => {
        const newExpanded = new Set(expandedKeys);
        const isExpanding = !newExpanded.has(node.id);

        if (isExpanding) {
            const existingChildren = getChildren(node);
            if (loadChildren && (!existingChildren || existingChildren.length === 0) && !node.isLeaf) {
                setLoadingKeys((prev) => new Set(prev).add(node.id));
                try {
                    const children = await loadChildren(node);
                    childrenCacheRef.current.set(node.id, children);
                } finally {
                    setLoadingKeys((prev) => {
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
    }, [expandedKeys, controlledExpandedKeys, loadChildren, onExpand, getChildren]);

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
            const c = getChildren(n);
            if (c) {
                for (const child of c) {
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
            if (!parentNode) continue;
            const pc = getChildren(parentNode);
            if (!pc) continue;

            const allLeaves = getAllDescendantIds(parentNode, getChildren).filter((id) => {
                const n = nodeMap.get(id);
                const nc = n ? getChildren(n) : undefined;
                return n && (!nc || nc.length === 0);
            });
            const allChecked = allLeaves.every((id) => newChecked.has(id));

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
    }, [checkedKeys, controlledCheckedKeys, getCheckState, nodeMap, parentMap, onCheck, getChildren]);

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
            const descendants = getAllDescendantIds(draggedNode, getChildren);
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
    }, [dragNodeId, nodeMap, getChildren]);

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

    const handleTypeAhead = (key: string) => {
        const state = typeAheadRef.current;
        if (state.timer !== null) window.clearTimeout(state.timer);
        state.buffer += key.toLowerCase();
        state.timer = window.setTimeout(() => {
            state.buffer = '';
            state.timer = null;
        }, 600);
        const search = state.buffer;
        const startIndex = focusedNodeId ? visibleNodes.findIndex((n) => n.id === focusedNodeId) + 1 : 0;
        for (let i = 0; i < visibleNodes.length; i++) {
            const idx = (startIndex + i) % visibleNodes.length;
            const candidate = visibleNodes[idx];
            if (candidate.label.toLowerCase().startsWith(search)) {
                setFocusedNodeId(candidate.id);
                scrollToNode(candidate.id);
                return;
            }
        }
    };

    const handleContainerKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!focusedNodeId) {
            if (visibleNodes.length > 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End')) {
                e.preventDefault();
                setFocusedNodeId(visibleNodes[0].id);
            }
            return;
        }

        const currentIndex = visibleNodes.findIndex((n) => n.id === focusedNodeId);
        if (currentIndex === -1) return;
        const currentNode = visibleNodes[currentIndex];

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
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            const cChildren = getChildren(currentNode);
            const hasChildren = cChildren && cChildren.length > 0;
            if (hasChildren && !expandedKeys.has(currentNode.id)) {
                handleToggle(currentNode);
            } else if (hasChildren && expandedKeys.has(currentNode.id)) {
                const firstChildId = cChildren![0].id;
                setFocusedNodeId(firstChildId);
                scrollToNode(firstChildId);
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (expandedKeys.has(currentNode.id)) {
                handleToggle(currentNode);
            } else {
                const parentId = parentMap.get(currentNode.id);
                if (parentId) {
                    setFocusedNodeId(parentId);
                    scrollToNode(parentId);
                }
            }
        } else if (e.key === '*') {
            e.preventDefault();
            const parentId = parentMap.get(currentNode.id);
            const siblings = parentId ? getChildren(nodeMap.get(parentId)!) : nodes;
            if (siblings) {
                const newExpanded = new Set(expandedKeys);
                for (const sib of siblings) {
                    const sc = getChildren(sib);
                    if (sc && sc.length > 0) newExpanded.add(sib.id);
                }
                if (!controlledExpandedKeys) setInternalExpandedKeys(newExpanded);
            }
        } else if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) {
            handleTypeAhead(e.key);
        }
    }, [focusedNodeId, visibleNodes, expandedKeys, controlledExpandedKeys, nodes, getChildren, handleToggle, parentMap, nodeMap]);

    const scrollToNode = (nodeId: string) => {
        if (!containerRef.current) return;
        const el = containerRef.current.querySelector(`[data-node-id="${nodeId}"]`);
        if (el && el instanceof HTMLElement) {
            const behavior = reducedMotionMatches() ? 'auto' : 'smooth';
            el.scrollIntoView({ block: 'nearest', behavior });
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

    const renderNode = (node: TreeNode, posInSet: number, setSize: number) => {
        const level = getNodeLevel(node.id);
        const isExpanded = expandedKeys.has(node.id);
        const isSelected = selectedKeys.has(node.id);
        const isLoading = loadingKeys.has(node.id);
        const isFocused = focusedNodeId === node.id;
        const nodeDropPosition = dropNodeId === node.id ? dropPosition : null;
        const checkState = checkboxes ? getCheckState(node) : ('unchecked' as CheckState);
        const childList = getChildren(node);

        const visibleChildren = childList && (isExpanded || filterText)
            ? childList.filter((child) => !filterText || matchesFilter(child, filterText, getChildren))
            : [];

        return (
            <React.Fragment key={node.id}>
                <TreeNodeComponent
                    node={node}
                    level={level}
                    posInSet={posInSet}
                    setSize={setSize}
                    expanded={isExpanded}
                    selected={isSelected}
                    checkState={checkState}
                    checkboxes={checkboxes}
                    draggable={draggable}
                    loading={isLoading}
                    focused={isFocused}
                    dropPosition={nodeDropPosition}
                    nodeTemplate={nodeTemplate}
                    childCount={childList?.length}
                    onToggle={handleToggle}
                    onSelect={handleSelect}
                    onCheck={handleCheck}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                />
                {(isExpanded || (filterText && childList)) && visibleChildren.length > 0 && (
                    <div className="eui-tv-children" role="group">
                        {visibleChildren.map((child, idx) => renderNode(child, idx + 1, visibleChildren.length))}
                    </div>
                )}
            </React.Fragment>
        );
    };

    return (
        <div
            ref={containerRef}
            className={classNames('eui-tree-view', className)}
            role="tree"
            aria-label={ariaLabel}
            aria-multiselectable={selectionMode === 'multiple'}
            onKeyDown={handleContainerKeyDown}
        >
            {filteredNodes.length === 0 ? (
                <div className="eui-tv-empty">No items to display</div>
            ) : (
                filteredNodes.map((node, idx) => renderNode(node, idx + 1, filteredNodes.length))
            )}
            <div
                id={liveRegionId}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="eui-visually-hidden"
            >
                {filterAnnouncement}
            </div>
        </div>
    );
};

export default TreeView;
