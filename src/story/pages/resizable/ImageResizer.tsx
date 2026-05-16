import React from 'react';
import { Resizable } from '../../../components/resizable';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<Resizable
  defaultWidth={300}
  defaultHeight={200}
  minWidth={120}
  minHeight={80}
  showHandles="hover"
  ariaLabel="Photo"
>
  <img src="/photo.jpg" alt="Mountain view" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
</Resizable>`;

const ImageResizer: React.FC = () => (
    <ComponentDemo
        title="Resizable Media"
        description="Wrap any element — including images, iframes, or charts. Handles only appear on hover with showHandles='hover'."
    >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
                <Resizable
                    defaultWidth={320}
                    defaultHeight={200}
                    minWidth={120}
                    minHeight={80}
                    aspectRatio
                    showHandles="hover"
                    ariaLabel="Photo"
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 8,
                            background: 'linear-gradient(120deg, #60a5fa, #a78bfa, #f472b6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 600,
                            boxShadow: 'var(--eui-shadow)',
                        }}
                    >
                        Hover to reveal handles
                    </div>
                </Resizable>
            </div>
            <CodeBlock code={code} />
        </div>
    </ComponentDemo>
);

export default ImageResizer;
