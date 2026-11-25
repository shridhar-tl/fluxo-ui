import React, { useState } from 'react';

import { FilterIcon } from '../../../assets/icons';
import { Button, Chip, ChipGroup } from '../../../components';
import type { ChipValue } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowLabelStyle, rowStyle, stackStyle } from '../../demo-styles';
import { cuisineOptions } from './chip-story-data';

const code = `const [value, setValue] = useState<ChipValue[]>(['japanese']);

<ChipGroup
    multiple
    value={value}
    onChange={setValue}
    maxSelected={3}
    options={cuisineOptions}
    variant="outlined"
    color="primary"
    ariaLabel="Favourite cuisines"
/>

<ChipGroup multiple value={filters} onChange={setFilters} gap="xs" wrap={false} size="sm" ariaLabel="Quick filters">
    <Chip value="open" icon={FilterIcon}>Open</Chip>
    <Chip value="mine">Assigned to me</Chip>
    <Chip value="urgent" color="danger">Urgent</Chip>
</ChipGroup>`;

const labelFor = (value: ChipValue) => String(cuisineOptions.find((option) => option.value === value)?.label ?? value);

const FilterChips: React.FC = () => {
    const [value, setValue] = useState<ChipValue[]>(['japanese']);
    const [filters, setFilters] = useState<ChipValue[]>(['open']);

    return (
        <>
            <ComponentDemo title="Multiple Selection with a Limit" description="Pick up to three. Unselected chips are disabled once the limit is reached.">
                <div style={stackStyle}>
                    <div style={stackStyle}>
                        <span style={rowLabelStyle}>Outlined</span>
                        <ChipGroup
                            multiple
                            value={value}
                            onChange={setValue}
                            maxSelected={3}
                            options={cuisineOptions}
                            variant="outlined"
                            color="primary"
                            ariaLabel="Favourite cuisines"
                        />
                    </div>
                    <div style={stackStyle}>
                        <span style={rowLabelStyle}>Soft without checkmark</span>
                        <ChipGroup
                            multiple
                            value={value}
                            onChange={setValue}
                            maxSelected={3}
                            options={cuisineOptions}
                            variant="soft"
                            color="success"
                            showCheckmark={false}
                            ariaLabel="Favourite cuisines, soft style"
                        />
                    </div>
                    <div style={stackStyle}>
                        <span style={rowLabelStyle}>Composed chips, single row</span>
                        <div style={{ width: '100%', maxWidth: 420, overflowX: 'auto' }}>
                            <ChipGroup multiple value={filters} onChange={setFilters} gap="xs" wrap={false} size="sm" ariaLabel="Quick filters">
                                <Chip value="open" icon={FilterIcon}>
                                    Open
                                </Chip>
                                <Chip value="mine">Assigned to me</Chip>
                                <Chip value="urgent" color="danger">
                                    Urgent
                                </Chip>
                                <Chip value="stale">No activity 7d</Chip>
                                <Chip value="review">Needs review</Chip>
                            </ChipGroup>
                        </div>
                    </div>
                    <div style={rowStyle}>
                        <Button label="Clear all" size="sm" layout="outlined" onClick={() => setValue([])} disabled={value.length === 0} />
                    </div>
                    <div style={readoutStyle} aria-live="polite">
                        {value.length ? `Selected (${value.length}/3): ${value.map(labelFor).join(', ')}` : 'Nothing selected'}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default FilterChips;
