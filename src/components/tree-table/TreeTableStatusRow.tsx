import React, { memo, useEffect } from 'react';

import cn from 'classnames';

import { LoadingIcon } from '../../assets/icons';
import { Button } from '../Button';
import type { FlatStatus } from './tree-table-data';
import type { RowHandlers } from './tree-table-internal';
import type { TreeTableLabels } from './tree-table-types';

interface TreeTableStatusRowProps {
    item: FlatStatus;
    index: number;
    height: number;
    indent: number;
    columnCount: number;
    headerRowCount: number;
    tabbable: boolean;
    focused: boolean;
    labels: TreeTableLabels;
    handlers: RowHandlers;
}

function TreeTableStatusRowInner({
    item,
    index,
    height,
    indent,
    columnCount,
    headerRowCount,
    tabbable,
    focused,
    labels,
    handlers,
}: TreeTableStatusRowProps) {
    const { kind } = item;

    useEffect(() => {
        if (kind === 'more') handlers.loadMore(index);
    }, [kind, item.key, index, handlers]);

    const loadingText = kind === 'end' ? labels.loadingMore : labels.loading;

    return (
        <div
            role="row"
            className={cn('eui-tree-table-row', 'eui-tree-table-status-row', `eui-tree-table-status-${kind}`, {
                'eui-tree-table-row-focused': focused,
            })}
            style={{ height }}
            aria-rowindex={headerRowCount + index + 1}
            aria-level={item.level + 1}
            tabIndex={tabbable ? 0 : -1}
            data-tt-index={index}
        >
            <div role="gridcell" aria-colindex={1} aria-colspan={columnCount} className="eui-tree-table-status-cell">
                <div className="eui-tree-table-status-content" style={{ paddingInlineStart: item.level * indent }}>
                    {(kind === 'loading' || kind === 'end') && (
                        <span className="eui-tree-table-status-text" role="status">
                            <LoadingIcon className="eui-tree-table-spinner" aria-hidden="true" />
                            {loadingText}
                        </span>
                    )}
                    {kind === 'more' && (
                        <Button size="sm" layout="plain" variant="primary" tabIndex={-1} onClick={() => handlers.loadMore(index)}>
                            {labels.loadMore}
                        </Button>
                    )}
                    {kind === 'error' && (
                        <>
                            <span className="eui-tree-table-status-error" role="alert">
                                {labels.loadError}
                            </span>
                            <Button size="sm" layout="outlined" variant="primary" tabIndex={-1} onClick={() => handlers.retry(index)}>
                                {labels.retry}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export const TreeTableStatusRow = memo(TreeTableStatusRowInner) as (props: TreeTableStatusRowProps) => React.ReactElement;
