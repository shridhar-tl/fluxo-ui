import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const classSwapCode = `import { createContainer } from 'fluxo-ui/services';

const services = createContainer();

// Define interface
interface IBrowserService {
    openUrl(url: string): void;
    getStorage(key: string): string | null;
}

// Different class implementations
class ChromeBrowserService implements IBrowserService {
    openUrl(url: string) { chrome.tabs.create({ url }); }
    getStorage(key: string) { return localStorage.getItem(key); }
}

class FirefoxBrowserService implements IBrowserService {
    openUrl(url: string) { browser.tabs.create({ url }); }
    getStorage(key: string) { return localStorage.getItem(key); }
}

class DevBrowserService implements IBrowserService {
    openUrl(url: string) { console.log('DEV: would open', url); }
    getStorage(key: string) { return sessionStorage.getItem(key); }
}

// Register the right one based on environment
const browserType = detectBrowser();

if (browserType === 'chrome') {
    services.registerSingleton<IBrowserService>(ChromeBrowserService, 'BrowserService', '$browser');
} else if (browserType === 'firefox') {
    services.registerSingleton<IBrowserService>(FirefoxBrowserService, 'BrowserService', '$browser');
} else {
    services.registerSingleton<IBrowserService>(DevBrowserService, 'BrowserService', '$browser');
}

// Consumer code doesn't care which implementation
class NotificationService {
    static dependencies = ['BrowserService'];
    constructor(private $browser: IBrowserService) {}

    notify(message: string, link?: string) {
        console.log(message);
        if (link) this.$browser.openUrl(link);
    }
}

services.registerSingleton(NotificationService, 'NotificationService', '$notification');
const { $notification } = services.resolve('NotificationService');
$notification.notify('New PR!', 'https://github.com/...');`;

const factorySwapCode = `// Same pattern works with factories
if (import.meta.env.PROD) {
    services.registerSingletonFactory<IBrowserService>(
        'BrowserService', '$browser',
        () => new ChromeBrowserService()
    );
} else {
    services.registerSingletonFactory<IBrowserService>(
        'BrowserService', '$browser',
        () => ({
            openUrl: (url: string) => console.log('Mock open:', url),
            getStorage: (key: string) => sessionStorage.getItem(key),
        })
    );
}

// Re-registering clears all non-retained singleton caches automatically
services.registerSingleton<IBrowserService>(DevBrowserService, 'BrowserService', '$browser');
// ^ All services that depended on BrowserService will get fresh instances next resolve`;

const SwappingImplementations: React.FC = () => (
    <div className="space-y-6">
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Swapping Classes</h3>
            <CodeBlock code={classSwapCode} language="typescript" />
        </div>
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Swapping with Factories</h3>
            <CodeBlock code={factorySwapCode} language="typescript" />
        </div>
    </div>
);

export default SwappingImplementations;
