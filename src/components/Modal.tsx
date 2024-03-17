import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TimesIcon } from '../assets/icons';
import './Modal.scss';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnBackdrop?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md', closeOnBackdrop = true }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const $this = useRef<{ onClose: () => void }>({ onClose });
    $this.current.onClose = onClose;

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                $this.current.onClose?.();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';

            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );

            if (focusableElements && focusableElements.length > 0) {
                (focusableElements[0] as HTMLElement).focus();
            }
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleBackdropClick = (event: React.MouseEvent) => {
        if (closeOnBackdrop && event.target === overlayRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            ref={overlayRef}
            className="eui-modal-overlay"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className={classNames('eui-modal', `eui-modal-${size}`)}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {title && (
                    <div className="eui-modal-header">
                        <h3 id="modal-title" className="eui-modal-title">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="eui-modal-close"
                            aria-label="Close modal"
                        >
                            <TimesIcon />
                        </button>
                    </div>
                )}
                <div className={classNames('eui-modal-body', { 'eui-modal-body-no-title': !title })}>
                    {!title && (
                        <button
                            onClick={onClose}
                            className="eui-modal-close-floating"
                            aria-label="Close modal"
                        >
                            <TimesIcon />
                        </button>
                    )}
                    {children}
                </div>
                {footer && (
                    <div className="eui-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export { Modal };
