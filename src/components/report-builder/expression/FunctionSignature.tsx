import React from 'react';

import classNames from 'classnames';

import type { BuiltinFunction } from './expression-types';

interface FunctionSignatureProps {
    fn: Pick<BuiltinFunction, 'name' | 'params' | 'returnType' | 'returns'>;
    activeParam?: number;
    className?: string;
}

export const FunctionSignature: React.FC<FunctionSignatureProps> = ({ fn, activeParam, className }) => {
    const variadicIndex = fn.params.findIndex((p) => p.variadic);
    const highlighted = activeParam === undefined
        ? -1
        : variadicIndex >= 0 && activeParam >= variadicIndex ? variadicIndex : activeParam;
    return (
        <code className={classNames('eui-fn-signature', className)}>
            <span className="eui-fn-signature-name">{fn.name}</span>
            <span className="eui-fn-signature-punct">(</span>
            {fn.params.map((p, i) => (
                <React.Fragment key={p.name}>
                    {i > 0 && <span className="eui-fn-signature-punct">, </span>}
                    <span className={classNames('eui-fn-signature-param', { active: i === highlighted, optional: p.optional })}>
                        {p.variadic && '...'}
                        {p.name}
                        {p.optional && '?'}
                        <span className="eui-fn-signature-type">: {p.type}{p.variadic && '[]'}</span>
                    </span>
                </React.Fragment>
            ))}
            <span className="eui-fn-signature-punct">)</span>
            <span className="eui-fn-signature-returns">
                <span aria-hidden="true"> → </span>
                <span className="eui-visually-hidden">returns </span>
                {fn.returns?.type ?? fn.returnType}
            </span>
        </code>
    );
};

FunctionSignature.displayName = 'FunctionSignature';
