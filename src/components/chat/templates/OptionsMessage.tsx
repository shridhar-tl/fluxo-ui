import React from 'react';
import type { MessageRenderProps } from '../types';

interface OptionItem {
    title: string;
    subTitle?: string;
    value?: string;
    isLink?: boolean;
    imageUrl?: string;
    icon?: React.ReactNode;
    [key: string]: any;
}

function OptionsMessageTemplate({ message, onSendMessage }: MessageRenderProps) {
    const [selected, setSelected] = React.useState<OptionItem | null>(null);
    const options: OptionItem[] = (message.media?.options as OptionItem[] | undefined) || [];
    const flowId = message.media?.flowId;
    const isImageOptions = options.some((o) => o.imageUrl);

    const handleClick = React.useCallback(
        (option: OptionItem, index: number) => {
            setSelected(option);
            onSendMessage?.({
                method: 'flow-response',
                type: 'options',
                flowId,
                selected: option,
                selectedIndex: index,
            });
        },
        [flowId, onSendMessage],
    );

    if (selected) {
        return <div className="eui-chat-msg-text">{[selected.title, selected.subTitle].filter(Boolean).join(', ')}</div>;
    }

    return (
        <div className="eui-chat-opts-wrap">
            {message.content && <div className="eui-chat-msg-text eui-chat-opts-prompt">{message.content}</div>}
            <div className={'eui-chat-opts-list ' + (isImageOptions ? 'eui-chat-opts-image' : '')}>
                {options.map((option, i) =>
                    option.isLink ? (
                        <a key={i} href={option.value} target="_blank" rel="noreferrer" className="eui-chat-opt-item">
                            {option.imageUrl && <img src={option.imageUrl} alt={option.title} className="eui-chat-opt-img" />}
                            <span className="eui-chat-opt-title">{option.title}</span>
                            {option.subTitle && <span className="eui-chat-opt-subtitle">{option.subTitle}</span>}
                        </a>
                    ) : (
                        <button key={i} type="button" className="eui-chat-opt-item" onClick={() => handleClick(option, i)}>
                            {option.imageUrl && <img src={option.imageUrl} alt={option.title} className="eui-chat-opt-img" />}
                            {option.icon && <span className="eui-chat-opt-icon">{option.icon}</span>}
                            <span className="eui-chat-opt-title">{option.title}</span>
                            {option.subTitle && <span className="eui-chat-opt-subtitle">{option.subTitle}</span>}
                        </button>
                    ),
                )}
            </div>
        </div>
    );
}

(OptionsMessageTemplate as any).noContainer = true;

export default OptionsMessageTemplate;
