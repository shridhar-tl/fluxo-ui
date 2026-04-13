import { CheckIcon, MinusIcon, FlagIcon, WarningIcon, InfoIcon } from '../../../assets/icons';
import type { ListItem } from '../../../types';

export const basicStates: ListItem[] = [
    { value: null, label: 'No Selection', icon: undefined },
    { value: 'yes', label: 'Yes', icon: CheckIcon },
    { value: 'no', label: 'No', icon: MinusIcon },
];

export const priorityStates: ListItem[] = [
    { value: null, label: 'No Priority', icon: undefined },
    { value: 'low', label: 'Low', icon: InfoIcon },
    { value: 'medium', label: 'Medium', icon: WarningIcon },
    { value: 'high', label: 'High', icon: FlagIcon },
];

export const approvalStates: ListItem[] = [
    { value: 'pending', label: 'Pending', icon: InfoIcon },
    { value: 'approved', label: 'Approved', icon: CheckIcon },
    { value: 'rejected', label: 'Rejected', icon: MinusIcon },
    { value: 'flagged', label: 'Flagged', icon: FlagIcon },
];
