import React, { useMemo, useState } from 'react';
import { Autocomplete } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { favouriteFruits, groupedSuggestionsCode, suggestions } from './autocomplete-story-data';

const matches = (label: string, query: string) => label.toLowerCase().includes(query.toLowerCase());

const GroupedSuggestions: React.FC = () => {
    const [value, setValue] = useState('');

    const groups = useMemo(() => {
        const favourites = favouriteFruits.filter((item) => !value || matches(item.label, value));
        const others = value.length >= 2 ? suggestions.filter((item) => matches(item.label, value) && !favouriteFruits.some((f) => f.value === item.value)) : [];
        return [
            { label: 'Favourites', items: favourites },
            { label: 'All fruits', items: others },
        ].filter((group) => group.items.length > 0);
    }, [value]);

    return (
        <>
            <ComponentDemo
                title="Grouped Suggestions"
                description="Pass groups ({ label, items }) to show suggestions under headings. With openOnFocus the favourites appear as soon as the field gets focus; the full list joins in after two characters."
            >
                <div style={{ width: '100%', maxWidth: '20rem' }}>
                    <Autocomplete
                        items={groups}
                        value={value}
                        openOnFocus
                        minLength={2}
                        placeholder="Focus to see favourites..."
                        onChange={(e) => setValue(e.value)}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock title="Grouped Suggestions" code={groupedSuggestionsCode} />
            </div>
        </>
    );
};

export default GroupedSuggestions;
