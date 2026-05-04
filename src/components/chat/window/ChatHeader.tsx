import classNames from 'classnames';
import React from 'react';
import { showContextMenu } from '../../context-menu';
import type { MenuItem } from '../../context-menu/types';
import { closeIcon as defaultCloseIcon, menuIcon as defaultMenuIcon, minimizeIcon as defaultMinimizeIcon, restartIcon as defaultRestartIcon } from '../icons';
import type { ChatHeaderConfig, ChatIcons, ChatTooltips, HeaderMenuItem } from '../types';

interface ChatHeaderProps {
    config?: ChatHeaderConfig;
    icons?: ChatIcons;
    tooltips?: ChatTooltips;
    onMinimize?: () => void;
    onClose?: () => void;
    onRestart?: () => void;
    onDragStart?: (event: React.PointerEvent) => void;
    draggable?: boolean;
}

function toContextMenuItem(item: HeaderMenuItem, parentClose?: () => void): MenuItem {
    if (item.divider) {
        return { separator: true } as MenuItem;
    }
    return {
        id: item.id,
        label: typeof item.label === 'string' ? item.label : String(item.label ?? ''),
        icon: item.icon,
        disabled: item.disabled,
        items: item.submenu?.map((s) => toContextMenuItem(s, parentClose)),
        command: () => {
            item.onClick?.();
            parentClose?.();
        },
    };
}

export function ChatHeader({ config, icons, tooltips, onMinimize, onClose, onRestart, onDragStart, draggable }: ChatHeaderProps) {
    const {
        title = 'Live Chat',
        subtitle,
        logo,
        bgColor,
        secBgColor,
        fontColor,
        fontSize,
        padding,
        showMinimize = true,
        showClose = true,
        showRestart = true,
        showMenu = false,
        menuItems,
    } = config || {};

    const headerStyle: React.CSSProperties = {
        background: bgColor && secBgColor ? `linear-gradient(to right, ${bgColor}, ${secBgColor})` : bgColor,
        color: fontColor,
        padding,
        height: padding ? 'initial' : undefined,
    };

    const handleMenu = (event: React.MouseEvent) => {
        if (!menuItems?.length) return;
        const ctxItems = menuItems.map((m) => toContextMenuItem(m));
        showContextMenu(event, ctxItems);
    };

    const showMenuButton = showMenu || (menuItems && menuItems.length > 0);

    return (
        <div
            className={classNames('eui-chat-header', { 'eui-chat-header-draggable': draggable })}
            style={headerStyle}
            onPointerDown={draggable ? onDragStart : undefined}
        >
            {logo ? (
                <div className="eui-chat-header-logo">
                    <img src={logo.url} alt="" style={{ width: logo.width, height: logo.height, margin: logo.margin }} />
                </div>
            ) : null}
            <div className="eui-chat-header-title">
                <span className="eui-chat-title-text" style={{ color: fontColor, fontSize }}>
                    {title}
                </span>
                {subtitle ? (
                    <span className="eui-chat-subtitle-text" style={{ color: fontColor, fontSize }}>
                        {subtitle}
                    </span>
                ) : null}
            </div>
            <div className="eui-chat-header-controls" onPointerDown={(e) => e.stopPropagation()}>
                {showMenuButton && (
                    <button
                        type="button"
                        className="eui-chat-ctrl-btn eui-chat-ctrl-menu"
                        onClick={handleMenu}
                        title={tooltips?.menu || 'Menu'}
                        aria-label={tooltips?.menu || 'Menu'}
                        style={{ color: fontColor }}
                    >
                        {icons?.menu ?? defaultMenuIcon}
                    </button>
                )}
                {showRestart && onRestart && (
                    <button
                        type="button"
                        className="eui-chat-ctrl-btn eui-chat-ctrl-restart"
                        onClick={onRestart}
                        title={tooltips?.restart || 'Restart conversation'}
                        aria-label={tooltips?.restart || 'Restart conversation'}
                        style={{ color: fontColor }}
                    >
                        {icons?.restart ?? defaultRestartIcon}
                    </button>
                )}
                {showMinimize && onMinimize && (
                    <button
                        type="button"
                        className="eui-chat-ctrl-btn eui-chat-ctrl-minimize"
                        onClick={onMinimize}
                        title={tooltips?.minimize || 'Minimize'}
                        aria-label={tooltips?.minimize || 'Minimize'}
                        style={{ color: fontColor }}
                    >
                        {icons?.minimize ?? defaultMinimizeIcon}
                    </button>
                )}
                {showClose && onClose && (
                    <button
                        type="button"
                        className="eui-chat-ctrl-btn eui-chat-ctrl-close"
                        onClick={onClose}
                        title={tooltips?.close || 'Close'}
                        aria-label={tooltips?.close || 'Close'}
                        style={{ color: fontColor }}
                    >
                        {icons?.close ?? defaultCloseIcon}
                    </button>
                )}
            </div>
        </div>
    );
}

export default ChatHeader;
