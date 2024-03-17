import { SVGIcon } from '../../assets/icons';
import { PlacementCorners } from '../../types';

export type SnackbarType = 'info' | 'success' | 'warning' | 'error';
export type AnimationType = 'fade' | 'slide' | 'zoom' | 'bounce';
export type SnackbarPosition = PlacementCorners | 'topCenter' | 'bottomCenter';

export interface SnackbarItemProps {
    data: SnackbarData;
    onRemove: (id: number) => void;
}

export interface SnackbarOptions {
    type?: SnackbarType;
    timeout?: number;
    animation?: AnimationType;
    showCloseButton?: boolean;
    position?: SnackbarPosition;
    onClick?: () => void;
    onClose?: (manual: boolean) => void;
    customIcon?: SVGIcon;
    lightBg?: boolean;
}

export interface SnackbarData {
    id: number;
    message: string | React.ReactElement;
    title: string;
    options: Required<Omit<SnackbarOptions, 'onClick' | 'onClose' | 'customIcon'>> & {
        onClick?: () => void;
        onClose?: (manual: boolean) => void;
        customIcon?: SVGIcon;
    };
}
