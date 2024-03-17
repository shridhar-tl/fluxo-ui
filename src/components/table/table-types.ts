export type Column = {
    title: string;
    field: string;
    helpText?: string;
    headerClassName?: string;
    cellClassName?: string;
    sortable?: boolean;
    hideBelow?: 'xs' | 'sm' | 'md' | 'mlg' | 'lg' | 'xl' | '2xl' | '3xl';
    template?: (row: any) => React.ReactNode;
};

export type OnChangeParams = {
    sortColumn?: Column;
    sortAsc?: boolean;
    count: number;
    pageNumber: number;
};
