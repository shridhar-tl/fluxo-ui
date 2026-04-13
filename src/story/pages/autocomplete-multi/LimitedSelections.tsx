import React from 'react';
import { AutocompleteMulti } from '../../../components';
import { ComponentDemo } from '../../ComponentDemo';
import { suggestions } from './autocomplete-multi-story-data';

const LimitedSelections: React.FC = () => {
    return (
        <ComponentDemo title="Limited Selections" description="Maximum 3 selections allowed">
            <div className="w-full max-w-96">
                <AutocompleteMulti
                    items={suggestions}
                    value={[]}
                    placeholder="Max 3 selections..."
                    maxSelectedItems={3}
                    onChange={(e) => console.log('Changed:', e.value)}
                />
            </div>
        </ComponentDemo>
    );
};

export default LimitedSelections;
