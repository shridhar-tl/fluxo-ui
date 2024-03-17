import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { icons } from './constants';
import { SnackbarItemProps } from './types';

function getAnimClass(animation: string, position: string, exit: boolean): string {
    if (animation === 'slide') {
        const isTop = position.startsWith('top');
        if (exit) return isTop ? 'eui-snackbar-anim-slide-top-exit' : 'eui-snackbar-anim-slide-bottom-exit';
        return isTop ? 'eui-snackbar-anim-slide-top-enter' : 'eui-snackbar-anim-slide-bottom-enter';
    }
    return `eui-snackbar-anim-${animation}-${exit ? 'exit' : 'enter'}`;
}

function SnackbarItem({ data, onRemove }: SnackbarItemProps) {
    const { id, message, title, options } = data;
    const { type, timeout, animation, showCloseButton, onClick, onClose, customIcon, position, lightBg = true } = options;
    const $remTime = useRef(timeout);
    const [isHovered, setIsHovered] = useState(false);
    const [progress, setProgress] = useState(100);
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const [exit, setExit] = useState(false);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const removeSelf = (manual: boolean) => {
        setExit(true);
        setTimeout(() => {
            onRemove(id);
            if (onClose) onClose(manual);
        }, 300);
    };

    const startTimer = useCallback(() => {
        startTimeRef.current = Date.now();
        clearTimer();
        timerRef.current = window.setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = $remTime.current - elapsed;
            if (remaining <= 0) {
                clearTimer();
                setProgress(0);
                removeSelf(false);
            } else {
                setProgress((remaining / timeout) * 100);
            }
        }, 50);
    }, []);

    useEffect(() => {
        if (timeout && timeout > 0) startTimer();
        return () => clearTimer();
    }, [timeout, startTimer]);

    const handleMouseEnter = () => {
        if (!isHovered) {
            setIsHovered(true);
            if (timerRef.current) {
                clearTimer();
                const elapsed = Date.now() - startTimeRef.current;
                $remTime.current = $remTime.current - elapsed;
            }
        }
    };

    const handleMouseLeave = () => {
        if (isHovered) {
            setIsHovered(false);
            if ($remTime.current > 0) startTimer();
        }
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        removeSelf(true);
    };

    const Icon = customIcon ? customIcon : icons[type];
    const bgClass = `eui-snackbar-${type}-${lightBg ? 'light' : 'dark'}`;

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={classNames('eui-snackbar', bgClass, getAnimClass(animation, position, exit))}
        >
            <div className="eui-snackbar-body">
                <div className="eui-snackbar-icon">
                    <Icon />
                </div>
                <div className="eui-snackbar-content">
                    <div className="eui-snackbar-title">{title}</div>
                    <div className="eui-snackbar-message">{message}</div>
                </div>
                {(showCloseButton || timeout === 0 || timeout === null) && (
                    <button onClick={handleClose} className="eui-snackbar-close">
                        <svg viewBox="0 0 20 20">
                            <path d="M10 8.586l4.95-4.95 1.414 1.414L11.414 10l4.95 4.95-1.414 1.414L10 11.414l-4.95 4.95-1.414-1.414L8.586 10l-4.95-4.95L5.05 3.636z" />
                        </svg>
                    </button>
                )}
            </div>
            {!!timeout && timeout > 0 && (
                <div className="eui-snackbar-progress">
                    <div className="eui-snackbar-progress-bar" style={{ width: `${progress}%` }} />
                </div>
            )}
        </div>
    );
}

export default SnackbarItem;
