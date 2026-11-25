import type { AlertType, AlertVariant } from '../../../components';

export const alertTypes: { type: AlertType; title: string; description: string }[] = [
    { type: 'info', title: 'Scheduled maintenance', description: 'The dashboard will be read-only on Sunday from 02:00 to 04:00 UTC.' },
    { type: 'success', title: 'Payment received', description: 'Invoice #4821 has been paid and a receipt was sent to your email.' },
    { type: 'warning', title: 'Storage almost full', description: 'You have used 92% of your workspace storage. Remove files or upgrade.' },
    { type: 'error', title: 'Deployment failed', description: 'The build step exited with code 1. Check the logs to see what went wrong.' },
    { type: 'neutral', title: 'Heads up', description: 'Changes to these settings apply to every member of the workspace.' },
];

export const alertVariants: AlertVariant[] = ['soft', 'solid', 'outline', 'left-accent', 'top-accent', 'minimal'];

export const variantItems = alertVariants.map((variant) => ({ label: variant, value: variant }));

export const buildLog = [
    '[12:04:11] Installing dependencies…',
    '[12:04:39] Compiling 412 modules…',
    '[12:05:02] Error: Cannot find module \'./config/env\'',
    '[12:05:02] Process exited with code 1',
].join('\n');

export const toastMessages: { type: AlertType; title: string }[] = [
    { type: 'success', title: 'Changes saved' },
    { type: 'info', title: 'New version available' },
    { type: 'warning', title: 'Session expires in 5 minutes' },
    { type: 'error', title: 'Could not reach the server' },
];
