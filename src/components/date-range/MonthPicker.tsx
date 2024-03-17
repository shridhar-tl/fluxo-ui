import classNames from 'classnames';
import { startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeftIcon } from '../../assets/icons';

type MonthPickerProps = {
    onBackClick: () => void;
    onSelect: (index: number) => void;
    year: number;
    selectedFrom: Date;
    selectedTo: Date;
    selectionMode: string;
};

function MonthPicker({ onBackClick, onSelect, year, selectedFrom, selectedTo, selectionMode }: MonthPickerProps) {
    const monthNames = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'short' }));
    const isMonthMode = selectionMode === 'month';
    // ToDo: disable month based on current year

    const getMonthState = (idx: number) => {
        if (!isMonthMode) return { selected: false, inRange: false };
        const ms = startOfMonth(new Date(year, idx, 1));
        const me = endOfMonth(ms);
        const fromStart = startOfMonth(selectedFrom);
        const toEnd = endOfMonth(selectedTo);
        const selected = ms.getTime() === fromStart.getTime() || ms.getTime() === startOfMonth(selectedTo).getTime();
        const inRange = ms >= fromStart && me <= toEnd;
        return { selected, inRange };
    };

    return (
        <div className="eui-drp-month-picker">
            <div className="eui-drp-picker-header">
                <button type="button" onClick={onBackClick} className="eui-drp-picker-back-btn">
                    <ChevronLeftIcon className="eui-drp-nav-icon" />
                </button>
                <span className="eui-drp-picker-title">Select Month</span>
                <span className="eui-drp-picker-spacer" />
            </div>
            <div className="eui-drp-picker-grid">
                {monthNames.map((mon: string, idx: number) => {
                    const { selected, inRange } = getMonthState(idx);
                    return (
                        <button
                            key={idx}
                            type="button"
                            className={classNames('eui-drp-picker-item', {
                                'eui-drp-picker-item-selected': selected,
                                'eui-drp-picker-item-in-range': !selected && inRange,
                            })}
                            onClick={() => onSelect(idx)}
                        >
                            {mon}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default MonthPicker;
