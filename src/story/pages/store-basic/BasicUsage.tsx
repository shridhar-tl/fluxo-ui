import React from 'react';
import { Button } from '../../../components';
import { create, createHook } from '../../../store';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

interface CounterState {
    count: number;
}

const counterStore = create<CounterState>(() => ({ count: 0 }));
const useCounter = createHook(counterStore);

const code = `import { create, createHook } from 'fluxo-ui/store';

interface CounterState {
  count: number;
}

const counterStore = create<CounterState>(() => ({ count: 0 }));
const useCounter = createHook(counterStore);

function Counter() {
  const { count } = useCounter();

  return (
    <div>
      <span>Count: {count}</span>
      <Button label="Increment"
        onClick={() => counterStore.setState(s => ({ count: s.count + 1 }))} />
      <Button label="Decrement"
        onClick={() => counterStore.setState(s => ({ count: s.count - 1 }))} />
      <Button label="Reset" variant="secondary"
        onClick={() => counterStore.reset()} />
    </div>
  );
}`;

const CounterDisplay: React.FC = () => {
    const { count } = useCounter();

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-5xl font-bold tabular-nums text-[var(--eui-primary)]">{count}</div>
            <div className="flex gap-3">
                <Button label="Decrement" size="sm" onClick={() => counterStore.setState((s) => ({ count: s.count - 1 }))} />
                <Button label="Increment" size="sm" onClick={() => counterStore.setState((s) => ({ count: s.count + 1 }))} />
                <Button label="Reset" size="sm" variant="secondary" onClick={() => counterStore.reset()} />
            </div>
        </div>
    );
};

const BasicUsage: React.FC = () => {
    return (
        <>
            <ComponentDemo title="Counter Store" description="A simple counter using create() and createHook() for React integration">
                <CounterDisplay />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
