import React from 'react';
import { SwipeableListItem } from '../../../components';
import { TrashIcon, EditIcon, StarIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<SwipeableListItem variant="card" rightActions={...}>
    {/* row body */}
</SwipeableListItem>`;

const Variants: React.FC = () => (
    <>
        <ComponentDemo title="Inline variant (default)" description="Flush list rows — best for traditional list views.">
            <div style={{ width: '100%', maxWidth: 480, border: '1px solid var(--eui-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                <SwipeableListItem rightActions={[{ label: 'Delete', icon: <TrashIcon />, color: 'danger' }]}>
                    <div style={{ color: 'var(--eui-text)' }}>Inline row — swipe left to reveal delete</div>
                </SwipeableListItem>
                <SwipeableListItem rightActions={[{ label: 'Edit', icon: <EditIcon />, color: 'primary' }]}>
                    <div style={{ color: 'var(--eui-text)' }}>Another inline row</div>
                </SwipeableListItem>
            </div>
        </ComponentDemo>

        <ComponentDemo title="Card variant" description="Each row is a rounded card with a subtle border — works well for tile-like list patterns." className="mt-4">
            <div style={{ width: '100%', maxWidth: 480 }}>
                <SwipeableListItem variant="card" leftActions={[{ label: 'Star', icon: <StarIcon />, color: 'primary' }]} rightActions={[{ label: 'Delete', icon: <TrashIcon />, color: 'danger' }]}>
                    <div style={{ color: 'var(--eui-text)' }}>Card-style row — swipe in either direction</div>
                </SwipeableListItem>
                <SwipeableListItem variant="card" rightActions={[{ label: 'Edit', icon: <EditIcon />, color: 'primary' }]}>
                    <div style={{ color: 'var(--eui-text)' }}>Another card row</div>
                </SwipeableListItem>
            </div>
        </ComponentDemo>

        <ComponentDemo title="Compact variant" description="Tighter padding and smaller text for dense lists." className="mt-4">
            <div style={{ width: '100%', maxWidth: 480, border: '1px solid var(--eui-border-subtle)', borderRadius: 8, overflow: 'hidden' }}>
                <SwipeableListItem variant="compact" rightActions={[{ label: 'Delete', icon: <TrashIcon />, color: 'danger' }]}>
                    <div style={{ color: 'var(--eui-text)' }}>Compact row</div>
                </SwipeableListItem>
                <SwipeableListItem variant="compact" rightActions={[{ label: 'Delete', icon: <TrashIcon />, color: 'danger' }]}>
                    <div style={{ color: 'var(--eui-text)' }}>Another compact row</div>
                </SwipeableListItem>
            </div>
        </ComponentDemo>

        <div className="mt-4"><CodeBlock code={code} language="tsx" /></div>
    </>
);

export default Variants;
