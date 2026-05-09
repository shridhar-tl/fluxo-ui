import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import ConversationsDemo from './ConversationsDemo';
import _props_json from './../../../components/chat/conversations/ChatConversations.props.json';

const { chatConversationsProps } = _props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Multi-conversation pattern' },
    { id: 'demo', title: 'Live Demo', description: 'Interactive multi-thread inbox' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'ChatConversations API reference' },
];

const importCode = `import { ChatConversations, ChatWindow } from 'fluxo-ui';

import type { ChatConversationItem, ChatConversationsProps } from 'fluxo-ui';`;

const ChatConversationsPage: React.FC = () => {
    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div id="overview">
                <h1 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: 'var(--eui-text)' }}>
                    Chat Conversations
                </h1>
                <p className="text-base md:text-xl" style={{ color: 'var(--eui-text-muted)' }}>
                    A two-pane inbox layout. The left pane is a searchable, sortable list of conversations; the right pane renders whatever
                    you put inside (typically a <code>ChatWindow</code>). Pin, archive, badge, count unread, group, sort — all driven by your
                    own data shape.
                </p>
            </div>

            <section className="scroll-mt-8" id="demo">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--eui-text)' }}>Live Demo</h2>
                <ConversationsDemo />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--eui-text)' }}>Import</h2>
                <CodeBlock code={importCode} language="tsx" />
            </section>

            <section className="scroll-mt-8" id="props">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--eui-text)' }}>ChatConversations Props</h2>
                <PropsTable props={chatConversationsProps} />
            </section>
        </PageLayout>
    );
};

export default ChatConversationsPage;
