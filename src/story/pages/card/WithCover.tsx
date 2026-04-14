import React from 'react';
import { Button, Card } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Card
    variant="elevated"
    padding="md"
    cover={<img src="..." alt="" />}
    title="Aurora Peak"
    subtitle="Iceland — 2024"
    actions={<Button label="Save" size="xs" variant="primary" />}
>
    Seven day hike across the northern ridge.
</Card>`;

const IMG =
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=640&q=60';

const WithCover: React.FC = () => (
    <>
        <ComponentDemo title="With Cover Media & Orientation" description="Vertical and horizontal layouts with a cover slot.">
            <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                <div style={{ width: 280 }}>
                    <Card
                        variant="elevated"
                        padding="md"
                        cover={<img src={IMG} alt="Mountain" style={{ height: 160 }} />}
                        title="Aurora Peak"
                        subtitle="Iceland — 2024"
                        actions={<Button label="Save" size="xs" variant="primary" />}
                    >
                        <span style={{ color: 'var(--eui-text-muted)', fontSize: 13 }}>Seven day hike across the northern ridge.</span>
                    </Card>
                </div>
                <div style={{ flex: '1 1 420px', minWidth: 0 }}>
                    <Card
                        variant="outlined"
                        orientation="horizontal"
                        title="Desert Dunes"
                        subtitle="Morocco — 2025"
                        cover={<img src={IMG} alt="Mountain" />}
                        footer={<Button label="Book" size="sm" variant="primary" />}
                    >
                        <span style={{ color: 'var(--eui-text-muted)', fontSize: 13 }}>
                            Guided three-day trek through the Sahara with camel support and star-lit camping.
                        </span>
                    </Card>
                </div>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default WithCover;
