import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ConfirmPopoverPanel from './ConfirmPopoverPanel';
import { ConfirmPopoverData, ConfirmPopoverOptions } from './types';

let popoverId = 0;
type ShowFn = (options: ConfirmPopoverOptions) => number;
type CloseFn = (id?: number) => void;

let externalShow: ShowFn;
let externalClose: CloseFn;

export const showConfirmPopover = (options: ConfirmPopoverOptions): number => {
    if (externalShow) return externalShow(options);
    return -1;
};

export const closeConfirmPopover = (id?: number) => {
    if (externalClose) externalClose(id);
};

export class Confirm {
    static show(options: ConfirmPopoverOptions): number {
        return showConfirmPopover(options);
    }

    static close(id?: number) {
        closeConfirmPopover(id);
    }

    static yesNo(
        target: HTMLElement,
        message: ConfirmPopoverOptions['message'],
        onConfirm: () => void,
        onCancel?: () => void,
        options?: Partial<Omit<ConfirmPopoverOptions, 'target' | 'message' | 'actions'>>
    ): number {
        return showConfirmPopover({
            target,
            message,
            title: options?.title ?? 'Confirm',
            icon: options?.icon,
            placement: options?.placement ?? 'auto',
            onClose: options?.onClose,
            actions: [
                {
                    label: options?.title === undefined ? 'No' : 'Cancel',
                    variant: 'default',
                    layout: 'outlined',
                    onClick: () => onCancel?.(),
                },
                {
                    label: 'Yes',
                    variant: 'danger',
                    layout: 'default',
                    onClick: onConfirm,
                },
            ],
        });
    }

    static confirm(
        target: HTMLElement,
        message: ConfirmPopoverOptions['message'],
        onConfirm: () => void,
        onCancel?: () => void,
        options?: Partial<Omit<ConfirmPopoverOptions, 'target' | 'message' | 'actions'>> & {
            confirmText?: string;
            cancelText?: string;
        }
    ): number {
        return showConfirmPopover({
            target,
            message,
            title: options?.title ?? 'Confirm',
            icon: options?.icon,
            placement: options?.placement ?? 'auto',
            onClose: options?.onClose,
            actions: [
                {
                    label: options?.cancelText ?? 'Cancel',
                    variant: 'default',
                    layout: 'outlined',
                    onClick: () => onCancel?.(),
                },
                {
                    label: options?.confirmText ?? 'OK',
                    variant: 'primary',
                    layout: 'default',
                    onClick: onConfirm,
                },
            ],
        });
    }

    static ok(
        target: HTMLElement,
        message: ConfirmPopoverOptions['message'],
        onOk?: () => void,
        options?: Partial<Omit<ConfirmPopoverOptions, 'target' | 'message' | 'actions'>> & {
            okText?: string;
        }
    ): number {
        return showConfirmPopover({
            target,
            message,
            title: options?.title,
            icon: options?.icon,
            placement: options?.placement ?? 'auto',
            onClose: options?.onClose,
            actions: [
                {
                    label: options?.okText ?? 'OK',
                    variant: 'primary',
                    layout: 'default',
                    onClick: () => onOk?.(),
                },
            ],
        });
    }
}

function ConfirmPopoverManager() {
    const [popovers, setPopovers] = useState<ConfirmPopoverData[]>([]);

    const show = useCallback((options: ConfirmPopoverOptions): number => {
        const id = ++popoverId;
        setPopovers((prev) => [...prev, { ...options, id }]);
        return id;
    }, []);

    const close = useCallback((id?: number) => {
        if (typeof id === 'number') {
            setPopovers((prev) => prev.filter((p) => p.id !== id));
        } else {
            setPopovers([]);
        }
    }, []);

    useEffect(() => {
        externalShow = show;
        externalClose = close;
    }, [show, close]);

    const handleDismiss = (id: number) => {
        setPopovers((prev) => prev.filter((p) => p.id !== id));
    };

    if (popovers.length === 0) return null;

    return createPortal(
        <>
            {popovers.map((popover) => (
                <ConfirmPopoverPanel key={popover.id} data={popover} onDismiss={handleDismiss} />
            ))}
        </>,
        document.body
    );
}

export default ConfirmPopoverManager;
