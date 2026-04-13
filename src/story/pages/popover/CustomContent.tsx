import React, { useRef, useState } from 'react';
import { Button, Popover } from '../../../components';
import { ListItem } from '../../../types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const statusItems: ListItem[] = [
    { label: 'Online', value: 'online' },
    { label: 'Away', value: 'away' },
    { label: 'Busy', value: 'busy' },
    { label: 'Offline', value: 'offline' },
];

const statusColors: Record<string, string> = {
    online: '#22c55e',
    away: '#eab308',
    busy: '#ef4444',
    offline: '#6b7280',
};

const code = `const renderItem = (item, index, isSelected, isHighlighted) => (
  <div
    className={cn('eui-popover-item', {
      'eui-popover-item-highlighted': isHighlighted,
      'eui-popover-item-selected': isSelected,
    })}
    onClick={() => handleSelect(item, index)}
    onMouseEnter={() => setHighlighted(index)}
  >
    <span
      style={{
        width: 8, height: 8,
        borderRadius: '50%',
        backgroundColor: statusColors[item.value],
      }}
    />
    <span>{item.label}</span>
  </div>
);

<Popover
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  triggerElement={triggerRef.current}
  items={statusItems}
  onSelect={handleSelect}
  renderItem={renderItem}
  width="180px"
/>`;

const CustomContent: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<ListItem>(statusItems[0]);
    const triggerRef = useRef<HTMLSpanElement>(null);

    return (
        <>
            <ComponentDemo title="Custom renderItem" description="Use the renderItem prop to fully customize how each list item is rendered.">
                <div className="flex flex-col items-center gap-3">
                    <span ref={triggerRef}>
                        <Button onClick={() => setIsOpen(!isOpen)}>
                            <span className="flex items-center gap-2">
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: statusColors[selected.value],
                                        display: 'inline-block',
                                    }}
                                />
                                {selected.label}
                            </span>
                        </Button>
                    </span>
                    <Popover
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        triggerElement={triggerRef.current}
                        items={statusItems}
                        onSelect={(item) => {
                            setSelected(item);
                            setIsOpen(false);
                        }}
                        selectedIndex={statusItems.findIndex((i) => i.value === selected.value)}
                        renderItem={(item, _index, isSelected, isHighlighted) => (
                            <div
                                className={`eui-popover-item${isHighlighted ? ' eui-popover-item-highlighted' : ''}${isSelected ? ' eui-popover-item-selected' : ''}`}
                                onClick={() => {
                                    setSelected(item);
                                    setIsOpen(false);
                                }}
                            >
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: statusColors[item.value],
                                        display: 'inline-block',
                                        flexShrink: 0,
                                    }}
                                />
                                <span className="eui-popover-item-label">{item.label}</span>
                            </div>
                        )}
                        width="180px"
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default CustomContent;
