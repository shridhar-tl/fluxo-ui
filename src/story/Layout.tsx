import cn from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { ConfirmPopoverManager, ContextMenuManager, SnackbarManager, TooltipManager } from '../components';
import Navigation from './Navigation';
import { useStoryTheme } from './StoryThemeContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { isDark } = useStoryTheme();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const closeMobileMenu = useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    return (
        <div
            className={cn('min-h-screen flex transition-colors duration-200', {
                'bg-[#080a0f] text-gray-100': isDark,
                'bg-gray-50 text-gray-900': !isDark,
            })}
        >
            <TooltipManager />
            <ContextMenuManager />
            <ConfirmPopoverManager />
            <SnackbarManager />
            <div
                className={cn('fixed top-0 left-0 right-0 z-50 flex items-center h-12 px-4 border-b md:hidden', {
                    'bg-[#0d0f14] border-white/8': isDark,
                    'bg-white border-gray-200 shadow-sm': !isDark,
                })}
            >
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open navigation menu"
                    className={cn('w-9 h-9 rounded-lg flex items-center justify-center transition-colors', {
                        'hover:bg-white/10 text-gray-300': isDark,
                        'hover:bg-gray-100 text-gray-600': !isDark,
                    })}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
                <div className="flex items-center gap-2 ml-2">
                    <img src="/logo.svg" alt="Fluxo UI" className="w-6 h-6 rounded-md shadow-sm" />
                    <span
                        className={cn('text-sm font-semibold tracking-tight', {
                            'text-white': isDark,
                            'text-gray-900': !isDark,
                        })}
                    >
                        Fluxo UI
                    </span>
                    <span
                        title={`Version ${__FLUXO_UI_VERSION__}`}
                        className={cn(
                            'inline-flex items-center px-1.5 py-px rounded-full text-[9px] font-semibold tracking-wide leading-none border',
                            {
                                'bg-white/10 text-gray-200 border-white/15': isDark,
                                'bg-gray-900/5 text-gray-700 border-gray-900/10': !isDark,
                            },
                        )}
                    >
                        v{__FLUXO_UI_VERSION__}
                    </span>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeMobileMenu}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') closeMobileMenu();
                        }}
                    />
                    <div
                        className={cn('absolute inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col shadow-2xl', {
                            'bg-[#0d0f14]': isDark,
                            'bg-white': !isDark,
                        })}
                    >
                        <button
                            onClick={closeMobileMenu}
                            aria-label="Close navigation menu"
                            className={cn(
                                'absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                                {
                                    'hover:bg-white/10 text-gray-400': isDark,
                                    'hover:bg-gray-100 text-gray-500': !isDark,
                                },
                            )}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                        <Navigation onNavClick={closeMobileMenu} />
                    </div>
                </div>
            )}

            <aside
                className={cn('fixed inset-y-0 left-0 z-40 w-60 border-r flex-col transition-colors duration-200 hidden md:flex', {
                    'border-white/8': isDark,
                    'border-gray-200 shadow-sm': !isDark,
                })}
            >
                <Navigation />
            </aside>

            <div className="flex-1 min-w-0 md:ml-60 flex flex-col min-h-screen max-w-full overflow-x-clip">
                <main className="flex-1">
                    <div className="w-full px-3 py-4 pt-16 md:px-8 md:py-8 md:pt-8">{children}</div>
                </main>
            </div>

            <button
                onClick={scrollToTop}
                aria-label="Scroll to top"
                className={cn(
                    'fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300',
                    {
                        'opacity-100 translate-y-0': showScrollTop,
                        'opacity-0 translate-y-4 pointer-events-none': !showScrollTop,
                        'bg-white/10 hover:bg-white/20 text-gray-300 backdrop-blur-md border border-white/10': isDark,
                        'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200': !isDark,
                    },
                )}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="18 15 12 9 6 15" />
                </svg>
            </button>
        </div>
    );
};

export default Layout;
