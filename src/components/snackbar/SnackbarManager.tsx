import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { warnManagerMissing } from '../../utils/warn-manager-missing';
import { defaultOptions, positions } from './constants';
import SnackbarItem from './Snackbar';
import './snackbar.scss';
import { SnackbarData, SnackbarOptions, SnackbarPosition } from './types';

let snackbarId = 0;
type AddSnackbar = (msg: string | React.ReactElement, title: string | undefined, options?: SnackbarOptions) => number;
type RemoveSnackbar = (id?: number) => void;
let externalAddSnackbar: AddSnackbar;
let externalRemoveSnackbar: RemoveSnackbar;

export const showSnackbar = (message: string | React.ReactElement, title?: string, options?: SnackbarOptions) => {
    if (externalAddSnackbar) {
        return externalAddSnackbar(message, title, options);
    }
    warnManagerMissing('SnackbarManager', 'showSnackbar', '<SnackbarManager /> from fluxo-ui');
    return -1;
};

export const hideSnackbar = (id?: number) => {
    if (externalRemoveSnackbar) {
        externalRemoveSnackbar(id);
        return;
    }
    warnManagerMissing('SnackbarManager', 'hideSnackbar', '<SnackbarManager /> from fluxo-ui');
};

const positionClassMap: Record<SnackbarPosition, string> = {
    topLeft: 'eui-snackbar-top-left',
    topCenter: 'eui-snackbar-top-center',
    topRight: 'eui-snackbar-top-right',
    bottomLeft: 'eui-snackbar-bottom-left',
    bottomCenter: 'eui-snackbar-bottom-center',
    bottomRight: 'eui-snackbar-bottom-right',
    auto: 'eui-snackbar-bottom-center',
};

interface SnackbarManagerProps {
    defaultOptions?: SnackbarOptions;
}

function SnackbarManager({ defaultOptions: defaultOptionsOverride }: SnackbarManagerProps = {}) {
    const [snackbars, setSnackbars] = useState<SnackbarData[]>([]);

    const addSnackbar: AddSnackbar = useCallback(
        (message, title, opts) => {
            const mergedOptions = { ...defaultOptions, ...defaultOptionsOverride, ...opts };
            if ((mergedOptions.timeout === 0 || mergedOptions.timeout === null) && !mergedOptions.showCloseButton) {
                mergedOptions.showCloseButton = true;
            }
            const finalTitle =
                title ||
                (mergedOptions.type === 'success'
                    ? 'Success'
                    : mergedOptions.type === 'error'
                      ? 'Error'
                      : mergedOptions.type === 'warning'
                        ? 'Warning'
                        : 'Info');
            const newSnackbar: SnackbarData = {
                id: ++snackbarId,
                message,
                title: finalTitle,
                options: { ...mergedOptions },
            };
            setSnackbars((prev) => [...prev, newSnackbar]);
            return newSnackbar.id;
        },
        [defaultOptionsOverride],
    );

    const removeSnackbar: RemoveSnackbar = useCallback((id) => {
        if (typeof id === 'number') {
            setSnackbars((prev) => prev.filter((s) => s.id !== id));
        } else {
            setSnackbars([]);
        }
    }, []);

    useEffect(() => {
        externalAddSnackbar = addSnackbar;
        externalRemoveSnackbar = removeSnackbar;
    }, [addSnackbar, removeSnackbar]);

    const handleRemove = (id: number) => {
        setSnackbars((prev) => prev.filter((s) => s.id !== id));
    };

    const grouped = positions.reduce(
        (acc, pos) => {
            acc[pos] = snackbars.filter((s) => s.options.position === pos);
            return acc;
        },
        {} as Record<SnackbarPosition, SnackbarData[]>,
    );

    return createPortal(
        <>
            {positions.map((pos) => (
                <div key={pos} className={classNames('eui-snackbar-container', positionClassMap[pos])}>
                    {grouped[pos]?.map((snack) => (
                        <SnackbarItem key={snack.id} data={snack} onRemove={handleRemove} />
                    ))}
                </div>
            ))}
        </>,
        document.body,
    );
}

export default SnackbarManager;
