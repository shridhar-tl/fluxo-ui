import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const classCode = `import { createContainer } from 'fluxo-ui/services';

const services = createContainer();

// Class with static dependencies — constructor args are auto-resolved
class LoggerService {
    log(message: string) {
        console.log(\`[LOG] \${message}\`);
    }
}

class UserRepository {
    static dependencies = ['LoggerService'];

    constructor(private $logger: LoggerService) {}

    findById(id: string) {
        this.$logger.log(\`Finding user \${id}\`);
        return { id, name: 'John Doe' };
    }
}

// Register classes — chained
services
    .registerSingleton(LoggerService, 'LoggerService', '$logger')
    .registerSingleton(UserRepository, 'UserRepository', '$userRepo');

// Resolve by name — container instantiates and injects dependencies
const { $userRepo } = services.resolve('UserRepository');
$userRepo.findById('123'); // Logs: [LOG] Finding user 123

// Resolve multiple at once
const { $logger, $userRepo: repo } = services.resolve('LoggerService', 'UserRepository');`;

const interfaceCode = `// With interfaces — register different implementations under the same name
interface ILogger {
    log(message: string): void;
    warn(message: string): void;
}

class ConsoleLogger implements ILogger {
    log(message: string) { console.log(message); }
    warn(message: string) { console.warn(message); }
}

class SilentLogger implements ILogger {
    log(_message: string) { /* noop */ }
    warn(_message: string) { /* noop */ }
}

// Register whichever implementation you need
services.registerSingleton<ILogger>(
    import.meta.env.PROD ? SilentLogger : ConsoleLogger,
    'LoggerService',
    '$logger'
);

// Consumer just uses the interface — doesn't know which class is behind it
const { $logger } = services.resolve<{ $logger: ILogger }>('LoggerService');
$logger.log('works with any implementation');`;

const factoryCode = `// Factory-based — no class needed, just return an object
services.registerSingletonFactory<ILogger>(
    'LoggerService',
    '$logger',
    () => ({
        log: (message: string) => console.log(\`[APP] \${message}\`),
        warn: (message: string) => console.warn(\`[APP] \${message}\`),
    })
);

// Factory with dependencies — resolver gives access to other services
services.registerSingletonFactory(
    'NotificationService',
    '$notification',
    (resolver) => {
        const logger = resolver.resolve<ILogger>('LoggerService');
        return {
            notify(message: string) {
                logger.log(\`Notification: \${message}\`);
            },
        };
    },
    ['LoggerService'] // declare deps for circular detection
);

const { $notification } = services.resolve('NotificationService');
$notification.notify('Hello!'); // Logs: [APP] Notification: Hello!`;

const BasicUsage: React.FC = () => (
    <div className="space-y-6">
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Class-Based Registration</h3>
            <CodeBlock code={classCode} language="typescript" />
        </div>
        <div className="space-y-4">
            <h3 className="text-lg font-medium">With Interfaces</h3>
            <CodeBlock code={interfaceCode} language="typescript" />
        </div>
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Factory-Based Registration</h3>
            <CodeBlock code={factoryCode} language="typescript" />
        </div>
    </div>
);

export default BasicUsage;
