import classNames from 'classnames';
import React, { useEffect, useId, useMemo, useRef } from 'react';
import {
    PasswordAllowedChars,
    PasswordPolicy,
    PasswordRule,
    PasswordStrengthInfo,
    PasswordStrengthThresholds,
    PasswordStrengthTier,
    computePasswordStrength,
    tierLabels,
} from './password-strength';
import './PasswordStrengthMeter.scss';

export type PasswordStrengthMeterStyle = 'segments' | 'bar' | 'minimal';

export interface PasswordStrengthMeterProps {
    value: string;
    policy?: PasswordPolicy;
    allowedChars?: PasswordAllowedChars;
    commonPasswords?: string[];
    useDefaultBlocklist?: boolean;
    thresholds?: PasswordStrengthThresholds;
    showTips?: boolean;
    showLabel?: boolean;
    customRules?: PasswordRule[];
    meterStyle?: PasswordStrengthMeterStyle;
    size?: 'sm' | 'md' | 'lg';
    id?: string;
    className?: string;
    ariaLabel?: string;
    onScoreChange?: (info: PasswordStrengthInfo) => void;
}

const tierClassMap: Record<PasswordStrengthTier, string> = {
    weak: 'eui-pwsm-tier-weak',
    fair: 'eui-pwsm-tier-fair',
    good: 'eui-pwsm-tier-good',
    strong: 'eui-pwsm-tier-strong',
};

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
    value,
    policy,
    allowedChars,
    commonPasswords,
    useDefaultBlocklist = true,
    thresholds,
    showTips = true,
    showLabel = true,
    customRules,
    meterStyle = 'segments',
    size = 'md',
    id,
    className,
    ariaLabel,
    onScoreChange,
}) => {
    const generatedId = useId();
    const meterId = id ?? `pwsm-${generatedId}`;
    const previousTier = useRef<PasswordStrengthTier | null>(null);

    const info = useMemo(
        () =>
            computePasswordStrength({
                value,
                policy,
                allowedChars,
                customRules,
                commonPasswords,
                useDefaultBlocklist,
                thresholds,
            }),
        [value, policy, allowedChars, customRules, commonPasswords, useDefaultBlocklist, thresholds],
    );

    useEffect(() => {
        if (previousTier.current !== info.tier) {
            previousTier.current = info.tier;
            onScoreChange?.(info);
        }
    }, [info, onScoreChange]);

    const tierClass = tierClassMap[info.tier];
    const filledSegments = info.tier === 'strong' ? 4 : info.tier === 'good' ? 3 : info.tier === 'fair' ? 2 : value.length > 0 ? 1 : 0;

    return (
        <div
            id={meterId}
            role="group"
            aria-label={ariaLabel ?? 'Password strength'}
            className={classNames('eui-pwsm', `eui-pwsm-size-${size}`, `eui-pwsm-style-${meterStyle}`, tierClass, className)}
        >
            {meterStyle !== 'minimal' && (
                <div className="eui-pwsm-meter" aria-hidden="true">
                    {meterStyle === 'segments' ? (
                        <>
                            {[0, 1, 2, 3].map((idx) => (
                                <span
                                    key={idx}
                                    className={classNames('eui-pwsm-segment', {
                                        'eui-pwsm-segment-filled': idx < filledSegments,
                                    })}
                                />
                            ))}
                        </>
                    ) : (
                        <div className="eui-pwsm-bar-track">
                            <div className="eui-pwsm-bar-fill" style={{ width: `${info.score}%` }} />
                        </div>
                    )}
                </div>
            )}

            <div className="eui-pwsm-info">
                {showLabel && (
                    <div className="eui-pwsm-label-row">
                        <span className="eui-pwsm-label">{tierLabels[info.tier]}</span>
                        <span className="eui-pwsm-score" aria-hidden="true">
                            {info.score}/100
                        </span>
                    </div>
                )}

                <output className="eui-pwsm-live" aria-live="polite" aria-atomic="true">
                    {value.length > 0 ? `Strength: ${tierLabels[info.tier]}` : ''}
                </output>

                {showTips && info.nextTip && (
                    <p className="eui-pwsm-tip">
                        <span aria-hidden="true" className="eui-pwsm-tip-bullet">
                            •
                        </span>
                        {info.nextTip}
                    </p>
                )}
            </div>
        </div>
    );
};

export { PasswordStrengthMeter };
export default PasswordStrengthMeter;
