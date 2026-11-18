import React, { useState } from 'react';
import { AutocompleteMulti } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { suggestions } from './autocomplete-multi-story-data';

const CustomValues: React.FC = () => {
    const [items, setItems] = useState(suggestions);
    const [values, setValues] = useState<string[]>([]);

    const addCustomValue = (text: string) => {
        if (!items.some((item) => item.value.toLowerCase() === text.toLowerCase())) {
            setItems((prev) => [...prev, { label: text, value: text }]);
        }
        setValues((prev) => (prev.includes(text) ? prev : [...prev, text]));
    };

    return (
        <ComponentDemo title="Custom Values" description="Type any text and press Enter to add it when it is not in the suggestions">
            <div className="w-full max-w-96">
                <AutocompleteMulti
                    items={items}
                    value={values}
                    placeholder="Type a fruit and press Enter..."
                    onChange={(e) => setValues(e.value)}
                    onCustomValue={addCustomValue}
                />
            </div>
        </ComponentDemo>
    );
};

export default CustomValues;
