import classNames from 'classnames';
import { ChevronLeftIcon } from '../../assets/icons';
import { getYearOptions } from './utils';

type YearPickerProps = {
    onCancel: () => void;
    minDate?: Date;
    maxDate?: Date;
    onSelect: (year: number) => void;
    selectedFrom: Date;
    selectedTo: Date;
    selectionMode: string;
};

function YearPicker({ onCancel, minDate, maxDate, onSelect, selectedFrom, selectedTo, selectionMode }: YearPickerProps) {
    const years = getYearOptions(minDate, maxDate);
    const isYearMode = selectionMode === 'year';

    const getYearState = (yr: number) => {
        if (!isYearMode) return { selected: false, inRange: false };
        const fromYear = selectedFrom.getFullYear();
        const toYear = selectedTo.getFullYear();
        const selected = yr === fromYear || yr === toYear;
        const inRange = yr >= fromYear && yr <= toYear;
        return { selected, inRange };
    };

    return (
        <div className="eui-drp-year-picker">
            <div className="eui-drp-picker-header">
                <button type="button" onClick={onCancel} className="eui-drp-picker-back-btn">
                    <ChevronLeftIcon className="eui-drp-nav-icon" />
                </button>
                <span className="eui-drp-picker-title">Select Year</span>
                <span className="eui-drp-picker-spacer" />
            </div>
            <div className="eui-drp-picker-grid">
                {years.map((yr) => {
                    const { selected, inRange } = getYearState(yr);
                    return (
                        <button
                            key={yr}
                            type="button"
                            className={classNames('eui-drp-picker-item', {
                                'eui-drp-picker-item-selected': selected,
                                'eui-drp-picker-item-in-range': !selected && inRange,
                            })}
                            onClick={() => onSelect(yr)}
                        >
                            {yr}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default YearPicker;
