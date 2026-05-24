import { warnManagerMissing } from '../../utils/warn-manager-missing';
import { ContextMenuOptions, Handler, MenuItem } from './types';

let externalShowContextMenu: Handler = null;

export function setContextMenuHandler(func: Handler) {
    externalShowContextMenu = func;
}

export function showContextMenu(event: React.MouseEvent, menus: MenuItem[], options?: ContextMenuOptions) {
    event.preventDefault();
    if (externalShowContextMenu) {
        externalShowContextMenu(event, menus, options);
        return;
    }
    warnManagerMissing('ContextMenuManager', 'showContextMenu', '<ContextMenuManager /> from fluxo-ui');
}
