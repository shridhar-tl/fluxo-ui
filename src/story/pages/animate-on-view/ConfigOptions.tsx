import cn from 'classnames';
import React, { useState } from 'react';
import { AnimateOnView } from '../../../components';
import type { AnimationType } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const code = `<AnimateOnView
  animation="bounceIn"
  duration={1000}
  delay={200}
  easing="ease-out"
  once={false}
  threshold={0.3}
>
  <div>Configurable animation</div>
</AnimateOnView>`;

const animationOptions: AnimationType[] = [
    'fadeIn', 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight',
    'zoomIn', 'zoomOut', 'slideUp', 'bounceIn', 'rotateIn',
    'flipX', 'flipY', 'scaleUp',
];

const ConfigOptions: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [animation, setAnimation] = useState<AnimationType>('bounceIn');
    const [duration, setDuration] = useState(600);
    const [once, setOnce] = useState(false);
    const [key, setKey] = useState(0);

    const replay = () => setKey((k) => k + 1);

    return (
        <>
            <ComponentDemo title="Configuration" description="Customize animation type, duration, and behavior.">
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <select
                            value={animation}
                            onChange={(e) => { setAnimation(e.target.value as AnimationType); replay(); }}
                            className={cn('px-3 py-1.5 rounded-md border text-sm', {
                                'bg-white/5 border-white/15 text-gray-200': isDark,
                                'bg-white border-gray-300 text-gray-800': !isDark,
                            })}
                        >
                            {animationOptions.map((a) => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>

                        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--eui-text-muted)' }}>
                            Duration:
                            <input
                                type="range"
                                min={200}
                                max={2000}
                                step={100}
                                value={duration}
                                onChange={(e) => { setDuration(Number(e.target.value)); replay(); }}
                            />
                            <span className="font-mono text-xs">{duration}ms</span>
                        </label>

                        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--eui-text-muted)' }}>
                            <input
                                type="checkbox"
                                checked={once}
                                onChange={(e) => setOnce(e.target.checked)}
                            />
                            Animate once
                        </label>

                        <button
                            onClick={replay}
                            className="px-3 py-1.5 rounded-md text-sm font-medium"
                            style={{ backgroundColor: 'var(--eui-primary)', color: 'var(--eui-text-on-primary)' }}
                        >
                            Replay
                        </button>
                    </div>

                    <AnimateOnView
                        key={key}
                        animation={animation}
                        duration={duration}
                        once={once}
                    >
                        <div
                            className={cn('p-8 rounded-xl border text-center', {
                                'bg-white/3 border-white/10': isDark,
                                'bg-white border-gray-200 shadow-md': !isDark,
                            })}
                        >
                            <p className="text-xl font-bold" style={{ color: 'var(--eui-primary)' }}>{animation}</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--eui-text-muted)' }}>{duration}ms | {once ? 'once' : 'every time'}</p>
                        </div>
                    </AnimateOnView>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ConfigOptions;
