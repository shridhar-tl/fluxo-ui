import React from 'react';
import { create, createHook } from '../../../store';
import { undoRedoMiddleware } from '../../../store/middlewares';
import type { UndoRedoStateProps, UndoRedoStore } from '../../../store/middlewares';
import { Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

interface UndoState {
    value: number;
}

const undoStore = create<UndoState>(() => ({ value: 0 }), [undoRedoMiddleware(20)]);
const useUndoStore = createHook<UndoState, UndoState & UndoRedoStateProps>(undoStore);
const typedStore = undoStore as UndoRedoStore<UndoState>;

const undoRedoCode = `import { create, createHook } from 'ether-ui/store';
import { undoRedoMiddleware } from 'ether-ui/store/middlewares';
import type { UndoRedoStateProps, UndoRedoStore } from 'ether-ui/store/middlewares';

interface CounterState { value: number; }

const store = create<CounterState>(
  () => ({ value: 0 }),
  [undoRedoMiddleware(20)]
);
const useStore = createHook<CounterState, CounterState & UndoRedoStateProps>(store);
const typedStore = store as UndoRedoStore<CounterState>;

function UndoDemo() {
  const { value, canUndo, canRedo } = useStore();

  return (
    <div>
      <span>{value}</span>
      <Button label="+1"
        onClick={() => store.setState(s => ({ value: s.value + 1 }))} />
      <Button label="+5"
        onClick={() => store.setState(s => ({ value: s.value + 5 }))} />
      <Button label="Undo" disabled={!canUndo}
        onClick={() => typedStore.undo()} />
      <Button label="Redo" disabled={!canRedo}
        onClick={() => typedStore.redo()} />
    </div>
  );
}`;

const UndoRedoDemo: React.FC = () => {
    const { value, canUndo, canRedo } = useUndoStore();

    return (
        <>
            <ComponentDemo title="Undo / Redo" description="Track state history and navigate back and forth with undoRedoMiddleware">
                <div className="flex flex-col items-center gap-4">
                    <div className="text-4xl font-bold tabular-nums text-[var(--eui-primary)]">{value}</div>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <Button label="+1" size="sm" onClick={() => undoStore.setState((s) => ({ value: s.value + 1 }))} />
                        <Button label="+5" size="sm" onClick={() => undoStore.setState((s) => ({ value: s.value + 5 }))} />
                        <Button label="Undo" size="sm" variant="secondary" disabled={!canUndo} onClick={() => typedStore.undo()} />
                        <Button label="Redo" size="sm" variant="secondary" disabled={!canRedo} onClick={() => typedStore.redo()} />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={undoRedoCode} language="tsx" />
            </div>
        </>
    );
};

export default UndoRedoDemo;
