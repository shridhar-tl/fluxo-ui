import classNames from 'classnames';
import ShimmerDiv from './ShimmerDiv';

type StructureObject = {
    width?: number | string;
    height?: number | string;
    radius?: number | string;
};

interface ShimmerFeedProps {
    count?: number;
    bordered?: boolean;
    structure?: StructureObject[];
    showAvatar?: boolean;
    avatarSize?: number;
}

const defaultStructure: StructureObject[] = [
    { width: '45%', height: 12, radius: 4 },
    { width: '80%', height: 10, radius: 4 },
    { width: '60%', height: 10, radius: 4 },
];

function ShimmerFeed({ count = 5, structure, bordered = true, showAvatar = true, avatarSize = 40 }: ShimmerFeedProps) {
    const bars = structure || defaultStructure;

    return (
        <div className="eui-shimmer-feed">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={classNames('eui-shimmer-feed-row', { 'eui-shimmer-feed-row-bordered': bordered })}>
                    {showAvatar && (
                        <ShimmerDiv
                            className="eui-shimmer-feed-avatar"
                            style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', flexShrink: 0 }}
                        />
                    )}
                    <div className="eui-shimmer-feed-content">
                        {bars.map(({ width = '90%', height = '8px', radius = '4px' }, j) => (
                            <div key={j} className="eui-shimmer-feed-bar" style={{ width, height, borderRadius: radius }} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ShimmerFeed;
