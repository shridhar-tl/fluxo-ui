import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import { useStoryTheme } from '../../StoryThemeContext';
import ControlledMode from './ControlledMode';
import DrawingCanvas from './DrawingCanvas';
import ExportDemo from './ExportDemo';
import FeatureFlags from './FeatureFlags';
import ImageAnnotation from './ImageAnnotation';
import MediaTimelineDemo from './MediaTimelineDemo';
import ReadOnlyMode from './ReadOnlyMode';
import TimedAnnotations from './TimedAnnotations';
import ToolbarPlacement from './ToolbarPlacement';
import ToolSubset from './ToolSubset';

import _CanvasDraw_props_json from './../../../components/canvas-draw/CanvasDraw.props.json';
const { canvasDrawProps, drawItemProps, featuresProps, mediaTimelineProps } = _CanvasDraw_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'image-annotation', title: 'Image Annotation', description: 'Annotate images with drawing tools' },
    { id: 'drawing-canvas', title: 'Drawing Canvas', description: 'Blank canvas for freeform drawing' },
    { id: 'toolbar-placement', title: 'Toolbar Placement', description: 'Top, bottom, left, right positions' },
    { id: 'feature-flags', title: 'Feature Flags', description: 'Enable/disable toolbar sections' },
    { id: 'tool-subset', title: 'Tool Subset', description: 'Show only specific drawing tools' },
    { id: 'timed-annotations', title: 'Timed Annotations', description: 'Time-based show/hide with transitions' },
    { id: 'media-timeline', title: 'Media Timeline', description: 'Timeline component for video editing' },
    { id: 'controlled-mode', title: 'Controlled Mode', description: 'External state management' },
    { id: 'read-only', title: 'Read-Only', description: 'View-only mode with no toolbar' },
    { id: 'export', title: 'Export', description: 'Export drawings as images' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'canvas-draw-props', title: 'CanvasDraw Props', description: 'Component API reference' },
    { id: 'draw-item-props', title: 'DrawItem Properties', description: 'Drawing item object reference' },
    { id: 'features-props', title: 'Features Properties', description: 'Feature flags reference' },
    { id: 'media-timeline-props', title: 'MediaTimeline Props', description: 'Timeline component API' },
    { id: 'feature-grid', title: 'Features', description: 'Feature summary' },
];





const canvasDrawFeatures: FeatureItem[] = [
    {
        title: 'Drawing Tools',
        description: '9 built-in tools: select, arrow, line, rectangle, circle, freehand, text, balloon, step numbers',
        icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z',
    },
    {
        title: 'Multi-Background',
        description: 'Support for image, video, and solid color backgrounds',
        icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z',
    },
    {
        title: 'Percentage Coords',
        description: 'Resolution-independent positioning using 0-1 fractions',
        icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15',
    },
    {
        title: 'Undo / Redo',
        description: 'Full undo/redo stack with snapshot-on-first-change batching',
        icon: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 0 1 0 12h-3',
    },
    {
        title: 'Timed Annotations',
        description: 'Show/hide items at specific timestamps with animated transitions',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
        title: 'Groups',
        description: 'Group items for batch timing and transition control',
        icon: 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z',
    },
    {
        title: 'Image Export',
        description: 'Export as PNG, JPG, WebP, or SVG. Raster export via optional html2canvas',
        icon: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3',
    },
    {
        title: 'Toolbar Placement',
        description: '4 placement options: top, bottom, left, right — plus hidden mode',
        icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
    },
    {
        title: 'Feature Flags',
        description: 'Granular control over which tools and toolbar sections are visible',
        icon: 'M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75',
    },
    {
        title: 'Controlled & Uncontrolled',
        description: 'Works with or without external state — pass items for controlled mode',
        icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
        title: 'Theming',
        description: 'Full dark/light mode support via CSS custom properties',
        icon: 'M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z',
    },
    {
        title: 'Media Timeline',
        description: 'Companion timeline component for video editing workflows',
        icon: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5c0 .621-.504 1.125-1.125 1.125m1.5 0h12m-12 0c-.621 0-1.125.504-1.125 1.125M18 12h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125M18 12c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125m1.5 2.625c0-.621.504-1.125 1.125-1.125m-2.625 3.375h-12m0 0v-1.5c0-.621.504-1.125 1.125-1.125m-1.125 2.625c0 .621.504 1.125 1.125 1.125M6 13.125v1.5c0 .621.504 1.125 1.125 1.125m0 0h12m0 0c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125',
    },
];

const CanvasDrawPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Canvas Draw
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A versatile drawing and annotation component for images, videos, and plain canvases. Supports 9 tools, timed
                    annotations, groups, transitions, image export, and full theme support.
                </p>
            </div>

            <section className="scroll-mt-8" id="image-annotation">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Image Annotation
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use an image as the background. Draw arrows, rectangles, text, step numbers, and more to annotate screenshots, photos,
                    or diagrams.
                </p>
                <ImageAnnotation />
            </section>

            <section className="scroll-mt-8" id="drawing-canvas">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Drawing Canvas</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use a solid color background for freeform drawing, wireframing, or whiteboard-style workflows.
                </p>
                <DrawingCanvas />
            </section>

            <section className="scroll-mt-8" id="toolbar-placement">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Toolbar Placement
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Place the toolbar at any edge of the canvas. Use <code>toolbarPlacement="none"</code> to hide it entirely.
                </p>
                <ToolbarPlacement />
            </section>

            <section className="scroll-mt-8" id="feature-flags">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Feature Flags</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use the <code>features</code> prop to enable or disable specific toolbar sections. By default, all features are enabled.
                </p>
                <FeatureFlags />
            </section>

            <section className="scroll-mt-8" id="tool-subset">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Tool Subset</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Use <code>features.tools</code> to show only specific drawing tools. Disabled tools are hidden from the toolbar.
                </p>
                <ToolSubset />
            </section>

            <section className="scroll-mt-8" id="timed-annotations">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Timed Annotations
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Each item has <code>showAtMs</code>, <code>hideAtMs</code>, and <code>transition</code> properties. When used with video
                    or media, items appear and disappear at the correct timestamps with animated transitions (fade, scale, slide-*).
                </p>
                <TimedAnnotations />
            </section>

            <section className="scroll-mt-8" id="media-timeline">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Media Timeline</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    The <code>MediaTimeline</code> companion component provides a video-editor-style timeline view. Items appear as
                    draggable/resizable bars. Groups are shown with colored lanes.
                </p>
                <MediaTimelineDemo />
            </section>

            <section className="scroll-mt-8" id="controlled-mode">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Controlled Mode
                </h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Pass <code>items</code> and <code>onItemsChange</code> to fully control the drawing state externally. Without{' '}
                    <code>items</code>, the component manages its own internal state.
                </p>
                <ControlledMode />
            </section>

            <section className="scroll-mt-8" id="read-only">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Read-Only Mode</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Set <code>isEditing=&#123;false&#125;</code> to hide the toolbar and disable all interactions. Useful for
                    playback/preview mode.
                </p>
                <ReadOnlyMode />
            </section>

            <section className="scroll-mt-8" id="export">
                <h2 className={cn('text-2xl font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Export</h2>
                <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Pass <code>onExport</code> to enable export buttons. SVG export works out of the box. PNG/JPG/WebP require the optional{' '}
                    <code>html2canvas</code> package — if not installed, export gracefully logs a message and the component continues to
                    work.
                </p>
                <ExportDemo />
            </section>

            <section className="scroll-mt-8" id="import">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Import</h2>
                <CodeBlock
                    code={`import { CanvasDraw, CanvasDrawOverlay, CanvasDrawToolbar, MediaTimeline } from 'fluxo-ui';

// Type imports
import type {
  CanvasDrawProps,
  CanvasDrawOverlayHandle,
  CanvasDrawToolbarProps,
  MediaTimelineProps,
  TimelineItem,
  TimelineGroup,
  DrawItem,
  DrawGroup,
  DrawTool,
  DrawColor,
  DrawObject,
  DrawToolDefaults,
  DrawTransition,
  CanvasBackground,
  CanvasDrawFeatures,
  ToolConfig,
  ImageExportFormat,
} from 'fluxo-ui';

// Utilities
import { colorMap, defaultToolDefaults, contrastColor, autoFontColor } from 'fluxo-ui';`}
                />
            </section>

            <section className="scroll-mt-8" id="canvas-draw-props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    CanvasDraw Props
                </h2>
                <PropsTable props={canvasDrawProps} />
            </section>

            <section className="scroll-mt-8" id="draw-item-props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    DrawItem Properties
                </h2>
                <PropsTable props={drawItemProps} />
            </section>

            <section className="scroll-mt-8" id="features-props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    CanvasDrawFeatures
                </h2>
                <PropsTable props={featuresProps} />
            </section>

            <section className="scroll-mt-8" id="media-timeline-props">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    MediaTimeline Props
                </h2>
                <PropsTable props={mediaTimelineProps} />
            </section>

            <section className="scroll-mt-8" id="feature-grid">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={canvasDrawFeatures} />
            </section>
        </PageLayout>
    );
};

export default CanvasDrawPage;
