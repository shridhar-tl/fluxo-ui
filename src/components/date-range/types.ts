import { createContext } from 'react';

export type DateRangeValue = [Date, Date];

export type SelectionMode = 'day' | 'week' | 'month' | 'year';

export interface RangeOption {
    value: string | number;
    label: string;
    range: [Date, Date];
}

export type PopoverPosition = 'bottomStart' | 'bottomEnd' | 'topStart' | 'topEnd' | 'auto';

export const defaultCustomText = 'Custom';

export type DateSelectedCallbackArg = { name?: string; range?: string | number; value: DateRangeValue; args: any };

interface PropsBase {
    value?: DateRangeValue | (string | number) | Date;
    ranges?: RangeOption[];
    minDate?: Date;
    maxDate?: Date;
    onChange: (selection: DateSelectedCallbackArg) => void;
    onClose?: () => void;
    customLabel?: string;
    showTodayButton?: boolean;
    dateFormat?: string;
    separator?: string;
    args?: any;
    locale?: any;
    position?: PopoverPosition;
    selectionMode?: SelectionMode;
    firstDayOfWeek?: number;
    range?: boolean;
    classNames?: {
        container?: string;
        control?: string;
        popover?: string;
    };
}

export interface DateRangePickerProps extends PropsBase {
    id?: string;
    name?: string;
    className?: string;
    styles?: React.CSSProperties;
    disabled?: boolean;
    placeholder?: string;
    iconOnly?: boolean;
}

export interface ContextType {
    customRange: DateRangeValue;
    activeView: 'quick' | 'custom';
    selectedRange: string | number | 'custom';
    //setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    closePicker: () => void;
    setCustomRange: React.Dispatch<React.SetStateAction<DateRangeValue>>;
    setActiveView: React.Dispatch<React.SetStateAction<'quick' | 'custom'>>;
    setCustomDate: (range: DateRangeValue) => void;
    setQuickDate: (option: RangeOption | { custom: true }) => void;
}

export const DatePickerPropsContext = createContext<PropsBase>({} as any);
export const PropsProvider = DatePickerPropsContext.Provider;

export const DatePickerStateContext = createContext<ContextType>({} as any);
export const StateProvider = DatePickerStateContext.Provider;
