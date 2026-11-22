import React from 'react';

import { FunctionReference } from '../expression/FunctionReference';

export const FunctionsPanel: React.FC = () => (
    <div className="eui-rb-panel">
        <p className="eui-rb-panel-intro">
            Every function you can use in an expression. Open a function to see its parameters and examples, or use the book button inside any expression field to insert one where you are typing.
        </p>
        <div className="eui-rb-functions-panel-body">
            <FunctionReference />
        </div>
    </div>
);

FunctionsPanel.displayName = 'FunctionsPanel';
