import React, { useCallback, useEffect, useId, useState } from 'react';

import classNames from 'classnames';

import { CheckIcon, ChevronRightIcon, CopyIcon } from '../../../assets/icons';
import { Button } from '../../Button';
import type { BuiltinFunction } from './expression-types';
import { FunctionSignature } from './FunctionSignature';

interface FunctionReferenceItemProps {
    fn: BuiltinFunction;
    defaultOpen?: boolean;
    onInsert?: (fn: BuiltinFunction) => void;
}

const copiedResetMs = 1500;

const CopyExampleButton: React.FC<{ expression: string }> = ({ expression }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), copiedResetMs);
        return () => clearTimeout(timer);
    }, [copied]);

    const copy = useCallback(() => {
        navigator.clipboard?.writeText(expression).then(() => setCopied(true), () => setCopied(false));
    }, [expression]);

    return (
        <Button
            layout="plain"
            size="xs"
            className="eui-fn-ref-copy"
            onClick={copy}
            title={copied ? 'Copied' : 'Copy this example'}
            ariaLabel={copied ? `Copied ${expression}` : `Copy ${expression}`}
            leftIcon={copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
        />
    );
};

export const FunctionReferenceItem: React.FC<FunctionReferenceItemProps> = ({ fn, defaultOpen = false, onInsert }) => {
    const [open, setOpen] = useState(defaultOpen);
    const detailsId = useId();
    const returnType = fn.returns?.type ?? fn.returnType;

    return (
        <li className={classNames('eui-fn-ref-item', { open })}>
            <button
                type="button"
                className="eui-fn-ref-item-header"
                aria-expanded={open}
                aria-controls={detailsId}
                onClick={() => setOpen((v) => !v)}
            >
                <span className="eui-fn-ref-item-title">
                    <FunctionSignature fn={fn} />
                    <span className="eui-fn-ref-item-summary">{fn.description}</span>
                </span>
                <ChevronRightIcon className={classNames('eui-fn-ref-chevron', { open })} aria-hidden="true" />
            </button>
            {open && (
                <div id={detailsId} className="eui-fn-ref-details">
                    {fn.isAsync && <p className="eui-fn-ref-note">Loads data, so it can take a moment to give its result.</p>}
                    <h4 className="eui-fn-ref-heading">Parameters</h4>
                    {fn.params.length === 0 ? (
                        <p className="eui-fn-ref-empty">Takes no parameters.</p>
                    ) : (
                        <dl className="eui-fn-ref-params">
                            {fn.params.map((p) => (
                                <div key={p.name} className="eui-fn-ref-param">
                                    <dt>
                                        <code className="eui-fn-ref-param-name">{p.variadic ? `...${p.name}` : p.name}</code>
                                        <span className="eui-fn-ref-type">{p.type}</span>
                                        {p.optional && <span className="eui-fn-ref-flag">optional</span>}
                                        {p.variadic && <span className="eui-fn-ref-flag">any number</span>}
                                    </dt>
                                    <dd>
                                        {p.description}
                                        {p.defaultValue !== undefined && (
                                            <span className="eui-fn-ref-default">
                                                {' '}Default <code>{p.defaultValue}</code>.
                                            </span>
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}
                    <h4 className="eui-fn-ref-heading">Returns</h4>
                    <p className="eui-fn-ref-returns">
                        <span className="eui-fn-ref-type">{returnType}</span>
                        {fn.returns?.description && <span>{fn.returns.description}</span>}
                    </p>
                    {fn.examples && fn.examples.length > 0 && (
                        <>
                            <h4 className="eui-fn-ref-heading">Examples</h4>
                            <ul className="eui-fn-ref-examples">
                                {fn.examples.map((example) => (
                                    <li key={example.expression}>
                                        <code className="eui-fn-ref-example-code">{example.expression}</code>
                                        {example.result !== undefined && (
                                            <span className="eui-fn-ref-example-result">
                                                <span aria-hidden="true">→ </span>
                                                <span className="eui-visually-hidden">gives </span>
                                                <code>{example.result}</code>
                                            </span>
                                        )}
                                        <CopyExampleButton expression={example.expression} />
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                    {onInsert && (
                        <Button size="sm" variant="primary" className="eui-fn-ref-insert" onClick={() => onInsert(fn)}>
                            Insert {fn.name}
                        </Button>
                    )}
                </div>
            )}
        </li>
    );
};

FunctionReferenceItem.displayName = 'FunctionReferenceItem';
