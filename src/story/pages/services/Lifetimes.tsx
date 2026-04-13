import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const code = `import { createContainer } from 'fluxo-ui/services';

const services = createContainer();

class CounterService {
    private value = 0;
    increment() { return ++this.value; }
    getValue() { return this.value; }
}

// SINGLETON (default) — same instance every time
services.registerSingleton(CounterService, 'CounterService', '$counter');

const { $counter: a } = services.resolve('CounterService');
const { $counter: b } = services.resolve('CounterService');
a.increment(); // 1
b.increment(); // 2 — same instance
console.log(a === b); // true


// TRANSIENT — new instance every time
services.registerTransient(CounterService, 'CounterService', '$counter');

const { $counter: c } = services.resolve('CounterService');
const { $counter: d } = services.resolve('CounterService');
c.increment(); // 1
d.increment(); // 1 — different instances
console.log(c === d); // false


// SCOPED — one instance per scope, different across scopes
services.registerScoped(CounterService, 'CounterService', '$counter');

const scope1 = services.createScope();
const scope2 = services.createScope();

const e = scope1.resolve<CounterService>('CounterService');
const f = scope1.resolve<CounterService>('CounterService');
const g = scope2.resolve<CounterService>('CounterService');

e.increment(); // 1
f.increment(); // 2 — same scope, same instance
g.increment(); // 1 — different scope, different instance

scope1.dispose();
scope2.dispose();


// Factory-based works with all lifetimes too
services.registerScopedFactory(
    'RequestContext', '$reqCtx',
    () => ({ requestId: crypto.randomUUID(), startedAt: Date.now() })
);


// RETAIN — singleton that survives clearInstances()
services.registerSingleton(CounterService, 'CounterService', '$counter', { retain: true });`;

const Lifetimes: React.FC = () => (
    <div className="space-y-4">
        <CodeBlock code={code} language="typescript" />
    </div>
);

export default Lifetimes;
