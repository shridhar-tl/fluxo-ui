import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useKeyboard } from '../../hooks/useKeyboard';
import { Button } from '../Button';
import Icon from '../Icon';
import { ConfirmPopoverData } from './types';
import { useConfirmPopoverPosition } from './useConfirmPopoverPosition';
import './confirm-popover.scss';

interface ConfirmPopoverPanelProps {
    data: ConfirmPopoverData;
    onDismiss: (id: number) => void;
}

const ConfirmPopoverPanel = ({ data, onDismiss }: ConfirmPopoverPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { calculatePosition } = useConfirmPopoverPosition();

    const dismiss = () => {
        data.onClose?.();
        onDismiss(data.id);
    };

    useClickOutside(panelRef, dismiss, true);
    useKeyboard({ Escape: dismiss }, true);

    useEffect(() => {
        if (!panelRef.current) return;
        calculatePosition(data.target, panelRef.current, data.placement ?? 'auto');

        const timer = setTimeout(() => setIsVisible(true), 30);
        return () => clearTimeout(timer);
    }, [data.target, data.placement, calculatePosition]);

    return (
        <div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label={data.title ?? 'Confirmation'}
            className={classNames('eui-confirm-popover', {
                'eui-confirm-popover-visible': isVisible,
                'eui-confirm-popover-hidden': !isVisible,
            })}
        >
            <div className="eui-confirm-popover-body">
                {(data.icon || data.title) && (
                    <div className="eui-confirm-popover-header">
                        {data.icon && (
                            <span className="eui-confirm-popover-icon">
                                <Icon icon={data.icon} />
                            </span>
                        )}
                        {data.title && (
                            <h3 className="eui-confirm-popover-title">{data.title}</h3>
                        )}
                    </div>
                )}
                <div className="eui-confirm-popover-message">
                    {typeof data.message === 'string' ? <p>{data.message}</p> : data.message}
                </div>
            </div>
            {data.actions.length > 0 && (
                <div className="eui-confirm-popover-actions">
                    {data.actions.map((action, idx) => (
                        <Button
                            key={idx}
                            size="sm"
                            variant={action.variant ?? 'default'}
                            layout={action.layout ?? 'outlined'}
                            onClick={() => {
                                action.onClick();
                                onDismiss(data.id);
                            }}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConfirmPopoverPanel;
