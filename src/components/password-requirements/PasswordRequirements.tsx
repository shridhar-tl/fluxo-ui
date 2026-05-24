import classNames from 'classnames';
import React, { useEffect, useId, useMemo, useRef } from 'react';
import { CheckIcon, CircleIcon, TimesIcon } from '../../assets/icons';
import {
    PasswordStrengthMeter,
    PasswordStrengthMeterProps,
} from '../password-strength';
import {
    PasswordRequirementsInfo,
    PasswordRequirementsPolicy,
    buildPasswordRequirements,
} from './password-requirements';
import '../eui-base.scss';
import './PasswordRequirements.scss';

export type PasswordRequirementsVariant = 'list' | 'inline' | 'card';
export type PasswordRequirementsSize = 'sm' | 'md' | 'lg';
export type PasswordRequirementsIconStyle = 'check' | 'dot' | 'numeric';

export interface PasswordRequirementsCustomRule {
    id: string;
    label: string;
    test: (value: string, confirm?: string) => boolean;
    hint?: string;
}

export interface PasswordRequirementsProps {
    value: string;
    confirm?: string;
    policy?: PasswordRequirementsPolicy;
    customRules?: PasswordRequirementsCustomRule[];
    labels?: Partial<Record<string, string>>;
    showStrengthMeter?: boolean;
    strengthMeterProps?: Omit<PasswordStrengthMeterProps, 'value'>;
    variant?: PasswordRequirementsVariant;
    size?: PasswordRequirementsSize;
    iconStyle?: PasswordRequirementsIconStyle;
    hideOnMet?: boolean;
    title?: string;
    onChange?: (info: PasswordRequirementsInfo) => void;
    id?: string;
    className?: string;
    ariaLabel?: string;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
    value,
    confirm,
    policy,
    customRules,
    labels,
    showStrengthMeter = false,
    strengthMeterProps,
    variant = 'list',
    size = 'md',
    iconStyle = 'check',
    hideOnMet = false,
    title,
    onChange,
    id,
    className,
    ariaLabel,
}) => {
    const generatedId = useId();
    const requirementsId = id ?? `pwreq-${generatedId}`;
    const previousMetRef = useRef<string>('');
    const liveAnnounceTimer = useRef<number | null>(null);

    const info = useMemo(
        () => buildPasswordRequirements({ value, confirm, policy, labels, customRules }),
        [value, confirm, policy, labels, customRules],
    );

    useEffect(() => {
        const currentKey = info.rules.map((r) => `${r.id}:${r.met}`).join('|');
        if (previousMetRef.current !== currentKey) {
            previousMetRef.current = currentKey;
            onChange?.(info);
        }
    }, [info, onChange]);

    const renderIcon = (rule: { met: boolean }, index: number) => {
        if (iconStyle === 'numeric') {
            return (
                <span className={classNames('eui-pwreq-icon eui-pwreq-icon-numeric', { 'eui-pwreq-icon-met': rule.met })}>
                    {rule.met ? <CheckIcon /> : index + 1}
                </span>
            );
        }
        if (iconStyle === 'dot') {
            return (
                <span className={classNames('eui-pwreq-icon eui-pwreq-icon-dot', { 'eui-pwreq-icon-met': rule.met })}>
                    <CircleIcon />
                </span>
            );
        }
        return (
            <span className={classNames('eui-pwreq-icon eui-pwreq-icon-check', { 'eui-pwreq-icon-met': rule.met })}>
                {rule.met ? <CheckIcon /> : <TimesIcon />}
            </span>
        );
    };

    const visibleRules = hideOnMet ? info.rules.filter((r) => !r.met) : info.rules;

    const summaryNode = (
        <output
            className="eui-pwreq-summary"
            aria-live="polite"
            aria-atomic="true"
        >
            {info.totalCount > 0 ? `${info.metCount} of ${info.totalCount} requirements met` : ''}
        </output>
    );

    useEffect(() => {
        if (!showStrengthMeter) return;
        return () => {
            if (liveAnnounceTimer.current) window.clearTimeout(liveAnnounceTimer.current);
        };
    }, [showStrengthMeter]);

    return (
        <div
            id={requirementsId}
            role="group"
            aria-label={ariaLabel ?? 'Password requirements'}
            className={classNames(
                'eui-pwreq',
                `eui-pwreq-variant-${variant}`,
                `eui-pwreq-size-${size}`,
                {
                    'eui-pwreq-all-met': info.allMet,
                },
                className,
            )}
        >
            {variant === 'card' && (title || info.totalCount > 0) && (
                <div className="eui-pwreq-card-header">
                    <span className="eui-pwreq-card-title">{title ?? 'Password requirements'}</span>
                    <span className="eui-pwreq-card-count" aria-hidden="true">
                        {info.metCount}/{info.totalCount}
                    </span>
                </div>
            )}

            {info.totalCount === 0 ? (
                <div className="eui-pwreq-empty">No requirements configured.</div>
            ) : variant === 'inline' ? (
                <ul className="eui-pwreq-inline-list" role="list">
                    {visibleRules.map((rule, idx) => (
                        <li key={rule.id} className={classNames('eui-pwreq-chip', { 'eui-pwreq-chip-met': rule.met })}>
                            {renderIcon(rule, idx)}
                            <span className="eui-pwreq-chip-label">{rule.label}</span>
                            {rule.progress && (
                                <span className="eui-pwreq-chip-progress" aria-hidden="true">
                                    {Math.min(rule.progress.current, rule.progress.required)}/{rule.progress.required}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <ul className="eui-pwreq-list" role="list">
                    {visibleRules.map((rule, idx) => (
                        <li
                            key={rule.id}
                            className={classNames('eui-pwreq-item', {
                                'eui-pwreq-item-met': rule.met,
                            })}
                            aria-label={`${rule.label} — ${rule.met ? 'met' : 'not met'}`}
                        >
                            {renderIcon(rule, idx)}
                            <span className="eui-pwreq-item-label">{rule.label}</span>
                            {rule.progress && (
                                <span className="eui-pwreq-item-progress" aria-hidden="true">
                                    {Math.min(rule.progress.current, rule.progress.required)}/{rule.progress.required}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {summaryNode}

            {showStrengthMeter && (
                <div className="eui-pwreq-strength-slot">
                    <PasswordStrengthMeter {...(strengthMeterProps ?? {})} value={value} />
                </div>
            )}
        </div>
    );
};

export { PasswordRequirements };
export default PasswordRequirements;
