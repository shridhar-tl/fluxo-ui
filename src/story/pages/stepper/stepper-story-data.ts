import React from 'react';
import type { StepItem } from '../../../components';

type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

const UserIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { d: 'M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z' })
);

const CartIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { d: 'M1 1.75A.75.75 0 0 1 1.75 1h1.628a1.75 1.75 0 0 1 1.734 1.51L5.18 3a65.25 65.25 0 0 1 13.36 1.412.75.75 0 0 1 .58.875 48.645 48.645 0 0 1-1.618 6.2.75.75 0 0 1-.712.513H6a2.503 2.503 0 0 0-2.292 1.5H17.25a.75.75 0 0 1 0 1.5H2.76a.75.75 0 0 1-.748-.807 4.002 4.002 0 0 1 2.716-3.486L3.626 2.716a.25.25 0 0 0-.248-.216H1.75A.75.75 0 0 1 1 1.75ZM6 17.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z' })
);

const CreditCardIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { fillRule: 'evenodd', d: 'M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z', clipRule: 'evenodd' })
);

const TruckIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { d: 'M6.5 3c-1.051 0-2.093.04-3.125.117A1.49 1.49 0 0 0 2 4.607V10.5h-.5a.5.5 0 0 0-.5.5v2a2 2 0 0 0 2 2h1a2 2 0 0 0 4 0h5a2 2 0 0 0 4 0h.5a1.5 1.5 0 0 0 1.5-1.5v-2A4.5 4.5 0 0 0 15 7h-1.5V4.607a1.49 1.49 0 0 0-1.375-1.49A44.07 44.07 0 0 0 6.5 3ZM6 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm9-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z' })
);

const CheckCircleIcon: IconComponent = (props) => React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor', ...props },
    React.createElement('path', { fillRule: 'evenodd', d: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z', clipRule: 'evenodd' })
);

const basicSteps: StepItem[] = [
    { label: 'Account' },
    { label: 'Profile' },
    { label: 'Review' },
    { label: 'Complete' },
];

const detailedSteps: StepItem[] = [
    { label: 'Account Setup', description: 'Create your account credentials' },
    { label: 'Personal Info', description: 'Fill in your personal details' },
    { label: 'Preferences', description: 'Customize your experience', optional: true },
    { label: 'Confirmation', description: 'Review and confirm' },
];

const iconSteps: StepItem[] = [
    { label: 'Account', icon: UserIcon, description: 'Sign in or register' },
    { label: 'Cart', icon: CartIcon, description: 'Review your items' },
    { label: 'Payment', icon: CreditCardIcon, description: 'Enter payment details' },
    { label: 'Shipping', icon: TruckIcon, description: 'Delivery information' },
    { label: 'Done', icon: CheckCircleIcon, description: 'Order confirmed' },
];

const statusSteps: StepItem[] = [
    { label: 'Validated', status: 'completed' },
    { label: 'Processing', status: 'active' },
    { label: 'Payment Failed', status: 'error' },
    { label: 'Shipping', status: 'pending' },
];

const warningSteps: StepItem[] = [
    { label: 'Upload', status: 'completed' },
    { label: 'Validation', status: 'warning', description: '2 warnings found' },
    { label: 'Processing', status: 'active' },
    { label: 'Complete', status: 'pending' },
];

export { basicSteps, detailedSteps, iconSteps, statusSteps, warningSteps };
