import type { MessageRenderProps } from '../types';

function LoaderTemplate(_props: MessageRenderProps) {
    return (
        <span className="eui-chat-typing-dots" aria-label="Typing">
            <span /><span /><span />
        </span>
    );
}

(LoaderTemplate as any).noContainer = false;
(LoaderTemplate as any).showTime = false;

export default LoaderTemplate;
