export type Placement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
    selector: string;
    title?: React.ReactNode;
    content: React.ReactNode;
    placement?: Placement;
    order?: number;
    id?: string | number;
    onNext?(): void;
    onPrev?(): void;
    onSkip?(): void;
}
