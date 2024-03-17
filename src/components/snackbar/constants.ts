import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from '../../assets/icons';
import { SnackbarOptions, SnackbarPosition, SnackbarType } from './types';

export const icons: Record<SnackbarType, React.FunctionComponent> = {
    info: InfoIcon,
    success: SuccessIcon,
    warning: WarningIcon,
    error: ErrorIcon,
};

export const positions: SnackbarPosition[] = ['topLeft', 'topCenter', 'topRight', 'bottomLeft', 'bottomCenter', 'bottomRight'];

export const defaultOptions: Required<Omit<SnackbarOptions, 'onClick' | 'onClose' | 'customIcon'>> = {
    type: 'info',
    timeout: 4000,
    animation: 'fade',
    showCloseButton: false,
    position: 'topRight',
    lightBg: true,
};
