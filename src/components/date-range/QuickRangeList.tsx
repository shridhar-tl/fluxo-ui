import { useContext } from 'react';
import { DatePickerPropsContext, DatePickerStateContext, defaultCustomText } from './types';

function QuickRangeList() {
    const { ranges, customLabel } = useContext(DatePickerPropsContext);
    const { setQuickDate } = useContext(DatePickerStateContext);

    return (
        <ul className="eui-drp-quick-list">
            {ranges!.map((option) => (
                <li key={option.value} className="eui-drp-quick-list-item">
                    <Item option={option} onClick={setQuickDate} />
                </li>
            ))}
            <li className="eui-drp-quick-list-item">
                <Item option={{ custom: true, label: customLabel || defaultCustomText }} onClick={setQuickDate} />
            </li>
        </ul>
    );
}

export default QuickRangeList;

function Item({ option, onClick }: any) {
    return (
        <button
            type="button"
            className="eui-drp-quick-list-btn"
            onClick={() => onClick(option)}
        >
            {option.label}
        </button>
    );
}
