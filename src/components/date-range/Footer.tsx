import { useContext } from 'react';
import { DatePickerPropsContext, DatePickerStateContext } from './types';

function Footer({ onDone, onSelectToday }: any) {
    const { showTodayButton } = useContext(DatePickerPropsContext);
    const { closePicker } = useContext(DatePickerStateContext);

    return (
        <div className="eui-drp-footer">
            {showTodayButton && (
                <button type="button" onClick={onSelectToday} className="eui-drp-btn-today">
                    Today
                </button>
            )}
            <button type="button" onClick={closePicker} className="eui-drp-btn-cancel">
                Cancel
            </button>
            <button type="button" onClick={onDone} className="eui-drp-btn-ok">
                OK
            </button>
        </div>
    );
}

export default Footer;
