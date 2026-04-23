import { createContext, useContext } from 'react';
import type { Dataset } from '../report-builder-types';
import type { SelectOption } from '../report-definition-types';

export interface ParameterOptionsContextValue {
    getOptions: (
        datasetName: string | undefined,
        displayField: string | undefined,
        valueField: string | undefined,
        staticOptions?: SelectOption[],
    ) => SelectOption[];
    datasources: Record<string, Dataset>;
}

export const ParameterOptionsContext = createContext<ParameterOptionsContextValue | null>(null);

export function useParameterOptionsContext(): ParameterOptionsContextValue | null {
    return useContext(ParameterOptionsContext);
}
