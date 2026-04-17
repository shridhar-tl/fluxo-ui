import React, { Suspense, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import LayoutWrapper from './story/Layout';
import { StoryThemeProvider } from './story/StoryThemeContext';

const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const HomePage = React.lazy(() => import('./story/pages/HomePage'));
const InstallationPage = React.lazy(() => import('./story/pages/InstallationPage'));
const MCPIntegrationPage = React.lazy(() => import('./story/pages/MCPIntegrationPage'));

const AutocompleteMultiPage = React.lazy(() => import('./story/pages/autocomplete-multi/AutocompleteMultiPage'));
const AutocompletePage = React.lazy(() => import('./story/pages/autocomplete/AutocompletePage'));
const ButtonPage = React.lazy(() => import('./story/pages/button/ButtonPage'));
const CheckboxPage = React.lazy(() => import('./story/pages/checkbox/CheckboxPage'));
const ChipsPage = React.lazy(() => import('./story/pages/chips/ChipsPage'));
const DateRangePickerPage = React.lazy(() => import('./story/pages/date-range-picker/DateRangePickerPage'));
const DropdownPage = React.lazy(() => import('./story/pages/dropdown/DropdownPage'));
const InputGroupPage = React.lazy(() => import('./story/pages/input-group/InputGroupPage'));
const InputSwitchPage = React.lazy(() => import('./story/pages/input-switch/InputSwitchPage'));
const MultiselectPage = React.lazy(() => import('./story/pages/multiselect/MultiselectPage'));
const NumericInputPage = React.lazy(() => import('./story/pages/numeric-input/NumericInputPage'));
const PasswordPage = React.lazy(() => import('./story/pages/password/PasswordPage'));
const RadioButtonPage = React.lazy(() => import('./story/pages/radio-button/RadioButtonPage'));
const SelectButtonPage = React.lazy(() => import('./story/pages/select-button/SelectButtonPage'));
const TextAreaPage = React.lazy(() => import('./story/pages/textarea/TextAreaPage'));
const TextInputPage = React.lazy(() => import('./story/pages/text-input/TextInputPage'));
const TabViewPage = React.lazy(() => import('./story/pages/tab-view/TabViewPage'));
const ToggleButtonPage = React.lazy(() => import('./story/pages/toggle-button/ToggleButtonPage'));

const IconsPage = React.lazy(() => import('./story/pages/IconsPage'));
const FieldLabelPage = React.lazy(() => import('./story/pages/field-label/FieldLabelPage'));

const ConfirmPopoverPage = React.lazy(() => import('./story/pages/confirm-popover/ConfirmPopoverPage'));
const ModalPage = React.lazy(() => import('./story/pages/modal/ModalPage'));
const TooltipPage = React.lazy(() => import('./story/pages/tooltip/TooltipPage'));
const DragDropPage = React.lazy(() => import('./story/pages/drag-drop/DragDropPage'));
const SortablePage = React.lazy(() => import('./story/pages/sortable/SortablePage'));
const SplitterPage = React.lazy(() => import('./story/pages/splitter/SplitterPage'));
const TablePage = React.lazy(() => import('./story/pages/table/TablePage'));
const GanttChartPage = React.lazy(() => import('./story/pages/gantt-chart/GanttChartPage'));
const KanbanBoardPage = React.lazy(() => import('./story/pages/kanban-board/KanbanBoardPage'));
const CanvasDrawPage = React.lazy(() => import('./story/pages/canvas-draw/CanvasDrawPage'));
const ProgressBarPage = React.lazy(() => import('./story/pages/progress-bar/ProgressBarPage'));
const StepperPage = React.lazy(() => import('./story/pages/stepper/StepperPage'));
const FabSpeedDialPage = React.lazy(() => import('./story/pages/fab-speed-dial/FabSpeedDialPage'));
const JsonEditorPage = React.lazy(() => import('./story/pages/json-editor/JsonEditorPage'));
const MarkdownPage = React.lazy(() => import('./story/pages/markdown/MarkdownPage'));
const HtmlEditorPage = React.lazy(() => import('./story/pages/html-editor/HtmlEditorPage'));
const StoreBasicPage = React.lazy(() => import('./story/pages/store-basic/StoreBasicPage'));
const StoreMiddlewarePage = React.lazy(() => import('./story/pages/store-middleware/StoreMiddlewarePage'));
const StoreModelPage = React.lazy(() => import('./story/pages/store-model/StoreModelPage'));

const PopoverPage = React.lazy(() => import('./story/pages/popover/PopoverPage'));
const ContextMenuPage = React.lazy(() => import('./story/pages/context-menu/ContextMenuPage'));
const SnackbarPage = React.lazy(() => import('./story/pages/snackbar/SnackbarPage'));
const ShimmerPage = React.lazy(() => import('./story/pages/shimmer/ShimmerPage'));
const TourPage = React.lazy(() => import('./story/pages/tour/TourPage'));
const ListBoxPage = React.lazy(() => import('./story/pages/list-box/ListBoxPage'));
const MaskedInputPage = React.lazy(() => import('./story/pages/masked-input/MaskedInputPage'));
const CalendarPage = React.lazy(() => import('./story/pages/calendar/CalendarPage'));
const CalendarPlaygroundPage = React.lazy(() => import('./story/pages/calendar-playground/CalendarPlaygroundPage'));
const DeferredViewPage = React.lazy(() => import('./story/pages/deferred-view/DeferredViewPage'));
const MultiStateCheckboxPage = React.lazy(() => import('./story/pages/multi-state-checkbox/MultiStateCheckboxPage'));
const DemoShowcasePage = React.lazy(() => import('./story/pages/demo-showcase/DemoShowcasePage'));

const TreeViewPage = React.lazy(() => import('./story/pages/tree-view/TreeViewPage'));
const TimelinePage = React.lazy(() => import('./story/pages/timeline/TimelinePage'));
const FileUploadPage = React.lazy(() => import('./story/pages/file-upload/FileUploadPage'));
const CarouselPage = React.lazy(() => import('./story/pages/carousel/CarouselPage'));
const DrawerPage = React.lazy(() => import('./story/pages/drawer/DrawerPage'));
const BreadcrumbPage = React.lazy(() => import('./story/pages/breadcrumb/BreadcrumbPage'));
const InfiniteScrollPage = React.lazy(() => import('./story/pages/infinite-scroll/InfiniteScrollPage'));
const NotificationCenterPage = React.lazy(() => import('./story/pages/notification-center/NotificationCenterPage'));
const ImageEditorPage = React.lazy(() => import('./story/pages/image-editor/ImageEditorPage'));
const SliderPage = React.lazy(() => import('./story/pages/slider/SliderPage'));
const RatingPage = React.lazy(() => import('./story/pages/rating/RatingPage'));
const ColorPickerPage = React.lazy(() => import('./story/pages/color-picker/ColorPickerPage'));
const TimePickerPage = React.lazy(() => import('./story/pages/time-picker/TimePickerPage'));
const PivotTablePage = React.lazy(() => import('./story/pages/pivot-table/PivotTablePage'));
const PageBannerPage = React.lazy(() => import('./story/pages/page-banner/PageBannerPage'));
const MenuNavPage = React.lazy(() => import('./story/pages/menu-nav/MenuNavPage'));
const AnimateOnViewPage = React.lazy(() => import('./story/pages/animate-on-view/AnimateOnViewPage'));
const HooksUtilsPage = React.lazy(() => import('./story/pages/hooks-utils/HooksUtilsPage'));
const PivotTablePlaygroundPage = React.lazy(() => import('./story/pages/pivot-table-playground/PivotTablePlaygroundPage'));
const LightboxPage = React.lazy(() => import('./story/pages/lightbox/LightboxPage'));
const CollapsiblePanelPage = React.lazy(() => import('./story/pages/collapsible-panel/CollapsiblePanelPage'));
const ServicesPage = React.lazy(() => import('./story/pages/services/ServicesPage'));
const WeekDaySelectorPage = React.lazy(() => import('./story/pages/week-day-selector/WeekDaySelectorPage'));
const CardPage = React.lazy(() => import('./story/pages/card/CardPage'));
const AccordionPage = React.lazy(() => import('./story/pages/accordion/AccordionPage'));
const SignaturePadPage = React.lazy(() => import('./story/pages/signature-pad/SignaturePadPage'));
const DiffViewerPage = React.lazy(() => import('./story/pages/diff-viewer/DiffViewerPage'));
const DockedLayoutPage = React.lazy(() => import('./story/pages/docked-layout/DockedLayoutPage'));
const ReportBuilderPlaygroundPage = React.lazy(() => import('./story/pages/report-builder/ReportBuilderPlaygroundPage'));
const ReportBuilderPage = React.lazy(() => import('./story/pages/report-builder/ReportBuilderPage'));
const ReportViewerPage = React.lazy(() => import('./story/pages/report-builder/ReportViewerPage'));

const App: React.FC = () => {
    return (
        <StoryThemeProvider>
            <Router>
                <ScrollToTop />
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" /></div>}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <LayoutWrapper>
                                <HomePage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/installation"
                        element={
                            <LayoutWrapper>
                                <InstallationPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/mcp-integration"
                        element={
                            <LayoutWrapper>
                                <MCPIntegrationPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/button"
                        element={
                            <LayoutWrapper>
                                <ButtonPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/textinput"
                        element={
                            <LayoutWrapper>
                                <TextInputPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/numericinput"
                        element={
                            <LayoutWrapper>
                                <NumericInputPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/maskedinput"
                        element={
                            <LayoutWrapper>
                                <MaskedInputPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/password"
                        element={
                            <LayoutWrapper>
                                <PasswordPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/textarea"
                        element={
                            <LayoutWrapper>
                                <TextAreaPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/checkbox"
                        element={
                            <LayoutWrapper>
                                <CheckboxPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/multistatecheckbox"
                        element={
                            <LayoutWrapper>
                                <MultiStateCheckboxPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/radiobutton"
                        element={
                            <LayoutWrapper>
                                <RadioButtonPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/selectbutton"
                        element={
                            <LayoutWrapper>
                                <SelectButtonPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/dropdown"
                        element={
                            <LayoutWrapper>
                                <DropdownPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/multiselect"
                        element={
                            <LayoutWrapper>
                                <MultiselectPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/autocomplete"
                        element={
                            <LayoutWrapper>
                                <AutocompletePage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/autocomplete-multi"
                        element={
                            <LayoutWrapper>
                                <AutocompleteMultiPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/togglebutton"
                        element={
                            <LayoutWrapper>
                                <ToggleButtonPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/chips"
                        element={
                            <LayoutWrapper>
                                <ChipsPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/daterangepicker"
                        element={
                            <LayoutWrapper>
                                <DateRangePickerPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/fieldlabel"
                        element={
                            <LayoutWrapper>
                                <FieldLabelPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/inputgroup"
                        element={
                            <LayoutWrapper>
                                <InputGroupPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/inputswitch"
                        element={
                            <LayoutWrapper>
                                <InputSwitchPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/tab-view"
                        element={
                            <LayoutWrapper>
                                <TabViewPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/confirm-popover"
                        element={
                            <LayoutWrapper>
                                <ConfirmPopoverPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/modal"
                        element={
                            <LayoutWrapper>
                                <ModalPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/tooltip"
                        element={
                            <LayoutWrapper>
                                <TooltipPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/drag-drop"
                        element={
                            <LayoutWrapper>
                                <DragDropPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/sortable"
                        element={
                            <LayoutWrapper>
                                <SortablePage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/splitter"
                        element={
                            <LayoutWrapper>
                                <SplitterPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/table"
                        element={
                            <LayoutWrapper>
                                <TablePage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/gantt-chart"
                        element={
                            <LayoutWrapper>
                                <GanttChartPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/kanban-board"
                        element={
                            <LayoutWrapper>
                                <KanbanBoardPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/canvas-draw"
                        element={
                            <LayoutWrapper>
                                <CanvasDrawPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/progress-bar"
                        element={
                            <LayoutWrapper>
                                <ProgressBarPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/stepper"
                        element={
                            <LayoutWrapper>
                                <StepperPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/json-editor"
                        element={
                            <LayoutWrapper>
                                <JsonEditorPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/fab-speed-dial"
                        element={
                            <LayoutWrapper>
                                <FabSpeedDialPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/popover"
                        element={
                            <LayoutWrapper>
                                <PopoverPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/context-menu"
                        element={
                            <LayoutWrapper>
                                <ContextMenuPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/snackbar"
                        element={
                            <LayoutWrapper>
                                <SnackbarPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/shimmer"
                        element={
                            <LayoutWrapper>
                                <ShimmerPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/tour"
                        element={
                            <LayoutWrapper>
                                <TourPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/listbox"
                        element={
                            <LayoutWrapper>
                                <ListBoxPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/store/basic"
                        element={
                            <LayoutWrapper>
                                <StoreBasicPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/store/middleware"
                        element={
                            <LayoutWrapper>
                                <StoreMiddlewarePage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/store/model"
                        element={
                            <LayoutWrapper>
                                <StoreModelPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/calendar"
                        element={
                            <LayoutWrapper>
                                <CalendarPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/calendar-playground"
                        element={
                            <LayoutWrapper>
                                <CalendarPlaygroundPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/components/deferred-view"
                        element={
                            <LayoutWrapper>
                                <DeferredViewPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/demo"
                        element={
                            <LayoutWrapper>
                                <DemoShowcasePage />
                            </LayoutWrapper>
                        }
                    />
                    <Route
                        path="/icons"
                        element={
                            <LayoutWrapper>
                                <IconsPage />
                            </LayoutWrapper>
                        }
                    />
                    <Route path="/components/tree-view" element={<LayoutWrapper><TreeViewPage /></LayoutWrapper>} />
                    <Route path="/components/timeline" element={<LayoutWrapper><TimelinePage /></LayoutWrapper>} />
                    <Route path="/components/file-upload" element={<LayoutWrapper><FileUploadPage /></LayoutWrapper>} />
                    <Route path="/components/carousel" element={<LayoutWrapper><CarouselPage /></LayoutWrapper>} />
                    <Route path="/components/drawer" element={<LayoutWrapper><DrawerPage /></LayoutWrapper>} />
                    <Route path="/components/breadcrumb" element={<LayoutWrapper><BreadcrumbPage /></LayoutWrapper>} />
                    <Route path="/components/infinite-scroll" element={<LayoutWrapper><InfiniteScrollPage /></LayoutWrapper>} />
                    <Route path="/components/notification-center" element={<LayoutWrapper><NotificationCenterPage /></LayoutWrapper>} />
                    <Route path="/components/image-editor" element={<LayoutWrapper><ImageEditorPage /></LayoutWrapper>} />
                    <Route path="/components/slider" element={<LayoutWrapper><SliderPage /></LayoutWrapper>} />
                    <Route path="/components/rating" element={<LayoutWrapper><RatingPage /></LayoutWrapper>} />
                    <Route path="/components/color-picker" element={<LayoutWrapper><ColorPickerPage /></LayoutWrapper>} />
                    <Route path="/components/time-picker" element={<LayoutWrapper><TimePickerPage /></LayoutWrapper>} />
                    <Route path="/components/pivot-table" element={<LayoutWrapper><PivotTablePage /></LayoutWrapper>} />
                    <Route path="/components/page-banner" element={<LayoutWrapper><PageBannerPage /></LayoutWrapper>} />
                    <Route path="/components/menu-nav" element={<LayoutWrapper><MenuNavPage /></LayoutWrapper>} />
                    <Route path="/components/animate-on-view" element={<LayoutWrapper><AnimateOnViewPage /></LayoutWrapper>} />
                    <Route path="/hooks-utils" element={<LayoutWrapper><HooksUtilsPage /></LayoutWrapper>} />
                    <Route path="/components/pivot-table-playground" element={<LayoutWrapper><PivotTablePlaygroundPage /></LayoutWrapper>} />
                    <Route path="/components/lightbox" element={<LayoutWrapper><LightboxPage /></LayoutWrapper>} />
                    <Route path="/components/collapsible-panel" element={<LayoutWrapper><CollapsiblePanelPage /></LayoutWrapper>} />
                    <Route path="/services/dependency-injection" element={<LayoutWrapper><ServicesPage /></LayoutWrapper>} />
                    <Route path="/components/markdown" element={<LayoutWrapper><MarkdownPage /></LayoutWrapper>} />
                    <Route path="/components/week-day-selector" element={<LayoutWrapper><WeekDaySelectorPage /></LayoutWrapper>} />
                    <Route path="/components/card" element={<LayoutWrapper><CardPage /></LayoutWrapper>} />
                    <Route path="/components/accordion" element={<LayoutWrapper><AccordionPage /></LayoutWrapper>} />
                    <Route path="/components/signature-pad" element={<LayoutWrapper><SignaturePadPage /></LayoutWrapper>} />
                    <Route path="/components/diff-viewer" element={<LayoutWrapper><DiffViewerPage /></LayoutWrapper>} />
                    <Route path="/components/docked-layout" element={<LayoutWrapper><DockedLayoutPage /></LayoutWrapper>} />
                    <Route path="/components/report-builder" element={<LayoutWrapper><ReportBuilderPage /></LayoutWrapper>} />
                    <Route path="/components/report-viewer" element={<LayoutWrapper><ReportViewerPage /></LayoutWrapper>} />
                    <Route path="/components/report-builder-playground" element={<LayoutWrapper><ReportBuilderPlaygroundPage /></LayoutWrapper>} />
                    <Route path="/components/html-editor" element={<LayoutWrapper><HtmlEditorPage /></LayoutWrapper>} />
                    <Route
                        path="*"
                        element={
                            <LayoutWrapper>
                                <div className="text-center py-16">
                                    <h1 className="text-4xl font-bold text-gray-300 mb-4">Page Not Found</h1>
                                    <p className="text-gray-500">The page you're looking for doesn't exist yet.</p>
                                </div>
                            </LayoutWrapper>
                        }
                    />
                </Routes>
                </Suspense>
            </Router>
        </StoryThemeProvider>
    );
};

export default App;
