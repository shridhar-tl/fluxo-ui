import React from 'react';
import SectionNav from './SectionNav';
import type { SectionNavItem } from './SectionNav';

interface PageLayoutProps {
    children: React.ReactNode;
    sectionNavItems: SectionNavItem[];
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, sectionNavItems }) => (
    <div className="flex gap-8 max-w-full">
        <div className="space-y-8 flex-1 min-w-0">
            {children}
        </div>
        <SectionNav items={sectionNavItems} />
    </div>
);

export default PageLayout;
