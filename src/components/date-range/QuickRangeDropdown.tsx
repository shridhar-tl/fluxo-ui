import classNames from 'classnames';
import { useContext } from 'react';
import { DatePickerPropsContext, DatePickerStateContext, defaultCustomText } from './types';

function QuickRangeDropdown() {
    const { ranges, customLabel } = useContext(DatePickerPropsContext);
    const { selectedRange, setQuickDate } = useContext(DatePickerStateContext);

    if (!ranges?.length) {
        return;
    }

    return (
        <ul className="eui-drp-quick-dropdown">
            {ranges.map((option) => (
                <li key={option.value} className="eui-drp-quick-item">
                    <Item option={option} selected={selectedRange === option.value} onClick={setQuickDate} />
                </li>
            ))}
            <li className="eui-drp-quick-item">
                <Item option={{ custom: true, label: customLabel || defaultCustomText }} selected={!selectedRange} onClick={setQuickDate} />
            </li>
        </ul>
    );
}

export default QuickRangeDropdown;

function Item({ option, selected, onClick }: any) {
    return (
        <button
            type="button"
            className={classNames('eui-drp-quick-item-btn', selected && 'eui-drp-quick-item-selected')}
            onClick={() => onClick(option)}
        >
            {option.label}
        </button>
    );
}
