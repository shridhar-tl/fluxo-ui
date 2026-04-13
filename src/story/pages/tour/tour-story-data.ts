import { TourStep } from '../../../components/tour/types';

export const basicSteps: TourStep[] = [
    { selector: '#tour-dashboard-header', title: 'Dashboard Overview', content: 'This is your main dashboard. At a glance you can see key metrics, recent activity, and quick actions.', placement: 'bottom', order: 1 },
    { selector: '#tour-stats-panel', title: 'Key Metrics', content: 'Track your most important numbers here. Cards update in real-time and can be customised from Settings.', placement: 'bottom', order: 2 },
    { selector: '#tour-action-bar', title: 'Quick Actions', content: 'Frequently used actions live here so you never have to dig through menus.', placement: 'top', order: 3 },
    { selector: '#tour-nav-links', title: 'Navigation', content: 'Jump to any section of the app from this sidebar. The active item is highlighted for you.', placement: 'right', order: 4 },
    { selector: '#tour-profile-menu', title: 'Your Profile', content: "Access your account settings, preferences, and sign-out option. You're all set!", placement: 'left', order: 5 },
];

export const startAtSteps: TourStep[] = [
    { selector: '#startat-step-a', title: 'Dashboard Overview', content: 'This is your main dashboard. At a glance you can see key metrics, recent activity, and quick actions.', placement: 'bottom', order: 1 },
    { selector: '#startat-step-b', title: 'Key Metrics', content: 'Track your most important numbers here. Cards update in real-time and can be customised from Settings.', placement: 'bottom', order: 2 },
    { selector: '#startat-step-c', title: 'Quick Actions', content: 'Frequently used actions live here so you never have to dig through menus.', placement: 'top', order: 3 },
    { selector: '#startat-step-d', title: 'Navigation', content: 'Jump to any section of the app from this sidebar. The active item is highlighted for you.', placement: 'right', order: 4 },
    { selector: '#startat-step-e', title: 'Your Profile', content: "Access your account settings, preferences, and sign-out option. You're all set!", placement: 'left', order: 5 },
];

export const callbackSteps: TourStep[] = [
    { selector: '#cb-step-1', title: 'Step One', content: 'Advance or skip — watch the event log below update.', placement: 'bottom', onNext: () => {}, onSkip: () => {} },
    { selector: '#cb-step-2', title: 'Step Two', content: 'Go back or continue — both actions are tracked.', placement: 'bottom', onNext: () => {}, onPrev: () => {}, onSkip: () => {} },
    { selector: '#cb-step-3', title: 'Step Three', content: 'Final step. Click Done or Skip to close.', placement: 'top', onPrev: () => {}, onSkip: () => {} },
];

export const placementSteps: TourStep[] = [
    { selector: '#placement-top', title: 'Top Placement', content: 'This tooltip is anchored above the target element.', placement: 'top' },
    { selector: '#placement-bottom', title: 'Bottom Placement', content: 'This tooltip is anchored below the target element.', placement: 'bottom' },
    { selector: '#placement-left', title: 'Left Placement', content: 'This tooltip is anchored to the left of the target element.', placement: 'left' },
    { selector: '#placement-right', title: 'Right Placement', content: 'This tooltip is anchored to the right of the target element.', placement: 'right' },
];

export type LogEntry = { step: number; event: 'next' | 'prev' | 'skip' | 'done'; time: string };

export const eventLabel: Record<LogEntry['event'], string> = {
    next: 'onNext',
    prev: 'onPrev',
    skip: 'onSkip',
    done: 'onClose (done)',
};

export const darkEventColor: Record<LogEntry['event'], string> = {
    next: 'text-blue-400',
    prev: 'text-yellow-400',
    skip: 'text-red-400',
    done: 'text-green-400',
};

export const lightEventColor: Record<LogEntry['event'], string> = {
    next: 'text-blue-600',
    prev: 'text-yellow-700',
    skip: 'text-red-600',
    done: 'text-green-700',
};
