import DateMessageTemplate from './DateMessage';
import DateTimeMessageTemplate from './DateTimeMessage';
import FileMessageTemplate from './FileMessage';
import ImageMessageTemplate from './ImageMessage';
import LoaderTemplate from './Loader';
import OptionsMessageTemplate from './OptionsMessage';
import TextMessageTemplate from './TextMessage';
import TimeMessageTemplate from './TimeMessage';
import VideoMessageTemplate from './VideoMessage';
import YouTubeMessageTemplate from './YouTubeMessage';

export const builtinTemplates: Record<string, React.ComponentType<any>> = {
    default: TextMessageTemplate,
    text: TextMessageTemplate,
    image: ImageMessageTemplate,
    file: FileMessageTemplate,
    pdf: FileMessageTemplate,
    video: VideoMessageTemplate,
    youtube: YouTubeMessageTemplate,
    options: OptionsMessageTemplate,
    date: DateMessageTemplate,
    time: TimeMessageTemplate,
    datetime: DateTimeMessageTemplate,
    loader: LoaderTemplate,
};

export const interactiveMessageTypes = ['options'];

export {
    DateMessageTemplate,
    DateTimeMessageTemplate,
    FileMessageTemplate,
    ImageMessageTemplate,
    LoaderTemplate,
    OptionsMessageTemplate,
    TextMessageTemplate,
    TimeMessageTemplate,
    VideoMessageTemplate,
    YouTubeMessageTemplate,
};

export { LightboxViewer } from './LightboxViewer';
