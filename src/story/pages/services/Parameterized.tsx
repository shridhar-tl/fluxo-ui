import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const code = `import { createContainer } from 'ether-ui/services';

const services = createContainer();

// A singleton auth service
class AuthService {
    getTokenForUser(userId: string) {
        return \`bearer-token-for-\${userId}\`;
    }
}

services.registerSingleton(AuthService, 'AuthService', '$auth');

// Parameterized — userId is passed at resolution time
// The factory receives (resolver, ...args)
services.registerParameterized(
    'ApiClient', '$api', 'scoped',
    (resolver, userId: string) => {
        const auth = resolver.resolve<AuthService>('AuthService');
        const token = auth.getTokenForUser(userId);

        return {
            userId,
            get: async (path: string) => {
                console.log(\`GET \${path} as \${userId} with \${token}\`);
                return { data: 'response' };
            },
        };
    }
);

// Resolve with arguments
const scope = services.createScope();
const client = scope.resolveWithArgs('ApiClient', 'user-42');
await client.get('/api/profile');
// Logs: GET /api/profile as user-42 with bearer-token-for-user-42

// Same args in same scope → same instance (scoped lifetime)
const client2 = scope.resolveWithArgs('ApiClient', 'user-42');
console.log(client === client2); // true

// Different args → different instance
const client3 = scope.resolveWithArgs('ApiClient', 'user-99');
console.log(client === client3); // false

scope.dispose();`;

const Parameterized: React.FC = () => (
    <div className="space-y-4">
        <CodeBlock code={code} language="typescript" />
    </div>
);

export default Parameterized;
