import React from 'react';

interface GuideEntry {
    code: string;
    text: string;
}

const references: GuideEntry[] = [
    { code: 'Field.name', text: 'A field of the current row. Nested fields use dots, such as Field.status.name.' },
    { code: 'Parameters.name', text: 'The value the viewer chose for a report parameter.' },
    { code: 'Variables.name', text: 'The current value of a report variable.' },
    { code: 'BuiltInFields.name', text: 'A value given by the application, such as the signed-in user.' },
    { code: 'Datasources.Name', text: 'Every row of a datasource, for use with functions such as Sum or Count.' },
    { code: 'Datasources.Name.field', text: 'The values of one field across every row of a datasource.' },
    { code: 'RowGroup("name").key', text: 'Inside a table group: the group value. Use .values for its rows.' },
];

const operators: GuideEntry[] = [
    { code: '+  -  *  /', text: 'Arithmetic. + also joins texts.' },
    { code: '==  !=  <  >  <=  >=', text: 'Comparison. Gives true or false.' },
    { code: '&&  ||  !', text: 'And, or, not.' },
    { code: '"text"  \'text\'', text: 'A text value, in double or single quotes.' },
    { code: 'true  false  null', text: 'Fixed values.' },
];

const valueTypes: GuideEntry[] = [
    { code: 'date', text: 'A date, or a text such as 2026-11-22 or 2026-11-22T10:30:00Z.' },
    { code: 'array', text: 'A list of values.' },
    { code: 'rows', text: 'A list of rows, such as Datasources.Name or RowGroup("name").values.' },
    { code: 'any', text: 'Any kind of value.' },
];

const GuideList: React.FC<{ title: string; entries: GuideEntry[] }> = ({ title, entries }) => (
    <>
        <h4 className="eui-fn-ref-heading">{title}</h4>
        <dl className="eui-fn-ref-guide-list">
            {entries.map((entry) => (
                <div key={entry.code}>
                    <dt><code>{entry.code}</code></dt>
                    <dd>{entry.text}</dd>
                </div>
            ))}
        </dl>
    </>
);

export const ExpressionSyntaxGuide: React.FC = () => (
    <div className="eui-fn-ref-guide">
        <p className="eui-fn-ref-guide-intro">
            A property that starts with <code>=</code> is an expression. Function names are not case sensitive.
        </p>
        <GuideList title="Values you can use" entries={references} />
        <GuideList title="Operators" entries={operators} />
        <GuideList title="Parameter types" entries={valueTypes} />
    </div>
);

ExpressionSyntaxGuide.displayName = 'ExpressionSyntaxGuide';
