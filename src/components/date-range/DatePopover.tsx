import classNames from 'classnames';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CustomDatePicker from './CustomDatePicker';
import QuickRangeDropdown from './QuickRangeDropdown';
import { DatePickerPropsContext, DatePickerStateContext } from './types';

function DatePopover({ controlRef }: { controlRef: React.RefObject<HTMLButtonElement> }) {
    const { ranges, position = 'auto', classNames: propsClassNames } = useContext(DatePickerPropsContext);
    const { closePicker: onClose, activeView } = useContext(DatePickerStateContext);

    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>();
    const popoverRef = useRef<HTMLDivElement>(null);

    const computePopoverPosition = useCallback(() => {
        if (!controlRef.current || !popoverRef.current) return;
        const controlRect = controlRef.current.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        let top = 0;
        let left = 0;
        const padding = 2;

        if (position === 'auto') {
            if (controlRect.bottom + popoverRect.height + padding < window.innerHeight) {
                top = controlRect.bottom + padding;
            } else {
                top = controlRect.top - popoverRect.height - padding;
            }
            if (controlRect.left + popoverRect.width > window.innerWidth) {
                left = Math.max(2, window.innerWidth - popoverRect.width - padding);
            } else {
                left = controlRect.left;
            }

            if (left + popoverRect.width > window.innerWidth / 2) {
                const controlEnd = controlRect.left + controlRect.width;
                left = Math.max(2, controlEnd - popoverRect.width);
            } else {
                left = controlRect.left;
            }
        } else {
            if (position === 'bottomStart') {
                top = controlRect.bottom + padding;
                left = controlRect.left;
            } else if (position === 'bottomEnd') {
                top = controlRect.bottom + padding;
                left = controlRect.right - popoverRect.width;
            } else if (position === 'topStart') {
                top = controlRect.top - popoverRect.height - padding;
                left = controlRect.left;
            } else if (position === 'topEnd') {
                top = controlRect.top - popoverRect.height - padding;
                left = controlRect.right - popoverRect.width;
            }
            if (left < 0) left = padding;
            if (left + popoverRect.width > window.innerWidth) left = window.innerWidth - popoverRect.width - padding;
            if (top < 0) top = padding;
            if (top + popoverRect.height > window.innerHeight) top = window.innerHeight - popoverRect.height - padding;
        }
        setPopoverStyle({ top: `${top + window.scrollY}px`, left: `${left + window.scrollX}px` });
    }, [position]);

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                controlRef.current &&
                !controlRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        },
        [onClose]
    );

    const isDropdown = ranges?.length && activeView === 'quick';

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        computePopoverPosition();
        window.addEventListener('resize', computePopoverPosition);
        document.addEventListener('scroll', computePopoverPosition, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', computePopoverPosition);
            document.removeEventListener('scroll', computePopoverPosition, true);
        };
    }, [isDropdown, handleClickOutside, computePopoverPosition]);

    return createPortal(
        <div
            ref={popoverRef}
            style={popoverStyle}
            className={classNames(
                'eui-date-range-popover',
                {
                    'eui-drp-popover-hidden': !popoverStyle,
                    'eui-drp-popover-dropdown': isDropdown,
                    'eui-drp-popover-wide': !isDropdown && ranges?.length,
                    'eui-drp-popover-medium': !isDropdown && !ranges?.length,
                },
                propsClassNames?.popover
            )}
        >
            {isDropdown ? <QuickRangeDropdown /> : <CustomDatePicker />}
        </div>,
        document.body
    );
}

export default DatePopover;
