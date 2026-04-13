import React, { useState } from 'react';
import { ListBox } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { frameworkOptions } from './list-box-story-data';

const SearchableList: React.FC = () => {
    const [searchable, setSearchable] = useState<string>();

    return (
        <>
            <ComponentDemo title="With search filter" description="Type to filter the list in real time.">
                <div className="w-full max-w-72">
                    <ListBox
                        options={frameworkOptions}
                        value={searchable}
                        onChange={(v) => setSearchable(v as string)}
                        searchable
                        searchPlaceholder="Search frameworks..."
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock
                    code={`<ListBox
  options={options}
  value={value}
  onChange={setValue}
  searchable
  searchPlaceholder="Search frameworks..."
/>`}
                />
            </div>
        </>
    );
};

export default SearchableList;
