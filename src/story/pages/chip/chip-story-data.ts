import type { ChipOption, ChipVariant } from '../../../components';

export const toneList = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const;

export const chipVariants: ChipVariant[] = ['filled', 'soft', 'outlined', 'elevated'];

export const cuisineOptions: ChipOption[] = [
    { value: 'italian', label: 'Italian' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'indian', label: 'Indian' },
    { value: 'thai', label: 'Thai' },
    { value: 'french', label: 'French' },
    { value: 'korean', label: 'Korean', disabled: true },
];

export const planOptions: ChipOption[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly · save 20%', color: 'success' },
];

export const sizeOptions: ChipOption[] = [
    { value: 'xs', label: 'XS' },
    { value: 's', label: 'S' },
    { value: 'm', label: 'M' },
    { value: 'l', label: 'L' },
    { value: 'xl', label: 'XL' },
    { value: 'xxl', label: 'XXL', disabled: true },
];

export const initialRecipients = ['Ava Chen', 'Liam Patel', 'Noah Kim'];

export const suggestionList = ['Mia Lopez', 'Ethan Brooks', 'Zoe Martin', 'Lucas Wright'];
