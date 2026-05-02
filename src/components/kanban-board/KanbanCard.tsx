import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import { TimesIcon } from '../../assets/icons';
import { useKanban } from './KanbanContext';
import { KanbanCardProps, KanbanPriority } from './kanban-types';
import { formatDueDate, getInitials } from './kanban-utils';

const priorityConfig: Record<KanbanPriority, { className: string; label: string }> = {
    critical: { className: 'eui-kanban-priority-critical', label: 'Critical' },
    high: { className: 'eui-kanban-priority-high', label: 'High' },
    medium: { className: 'eui-kanban-priority-medium', label: 'Medium' },
    low: { className: 'eui-kanban-priority-low', label: 'Low' },
    none: { className: 'eui-kanban-priority-none', label: 'None' },
};

function KanbanCard({ card, column, index }: KanbanCardProps) {
    const { props } = useKanban();
    const {
        cardSize = 'default',
        cardTemplate,
        cardActionsTemplate,
        allowDeleteCard,
        onCardClick,
        onCardDoubleClick,
        onCardDelete,
    } = props;

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            onCardClick?.({ card, column, event: e });
        },
        [card, column, onCardClick],
    );

    const handleDoubleClick = useCallback(
        (e: React.MouseEvent) => {
            onCardDoubleClick?.({ card, column, event: e });
        },
        [card, column, onCardDoubleClick],
    );

    const handleDelete = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onCardDelete?.({ card, columnId: column.id });
        },
        [card, column.id, onCardDelete],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCardClick?.({ card, column, event: e as unknown as React.MouseEvent });
            }
            if (e.key === 'Delete' && allowDeleteCard) {
                onCardDelete?.({ card, columnId: column.id });
            }
        },
        [card, column, allowDeleteCard, onCardClick, onCardDelete],
    );

    const dueInfo = useMemo(
        () => (card.dueDate ? formatDueDate(card.dueDate) : null),
        [card.dueDate],
    );

    const allAssignees = useMemo(() => {
        if (card.assignees?.length) return card.assignees;
        if (card.assignee) return [card.assignee];
        return [];
    }, [card.assignee, card.assignees]);

    const hasSubtasks = card.subtaskCount !== undefined && card.subtaskCount > 0;
    const subtaskPercent = hasSubtasks
        ? Math.round(((card.subtaskCompleted ?? 0) / card.subtaskCount!) * 100)
        : 0;

    const hasActionsOverlay = !!cardActionsTemplate || !!allowDeleteCard;

    if (cardTemplate) {
        return (
            <div
                className={classNames('eui-kanban-card', `eui-kanban-card-${cardSize}`, {
                    'eui-kanban-card-has-actions-overlay': hasActionsOverlay,
                })}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onKeyDown={handleKeyDown}
                role="article"
                tabIndex={0}
                aria-label={card.title}
                data-card-id={card.id}
                data-card-index={index}
            >
                {cardTemplate(card, column)}
                {hasActionsOverlay && (
                    <div className="eui-kanban-card-actions-overlay">
                        {cardActionsTemplate && cardActionsTemplate(card, column)}
                        {allowDeleteCard && (
                            <button
                                className="eui-kanban-card-delete"
                                onClick={handleDelete}
                                aria-label={`Delete card: ${card.title}`}
                                title="Delete card"
                                type="button"
                            >
                                <TimesIcon width={14} height={14} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className={classNames('eui-kanban-card', `eui-kanban-card-${cardSize}`, {
                'eui-kanban-card-blocked': card.blocked,
                'eui-kanban-card-clickable': !!onCardClick,
            })}
            style={card.color ? { borderLeftColor: card.color } : undefined}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
            role="article"
            tabIndex={0}
            aria-label={`${card.title}${card.priority ? `, priority: ${card.priority}` : ''}${dueInfo ? `, ${dueInfo.text}` : ''}`}
            data-card-id={card.id}
            data-card-index={index}
        >
            {card.coverImage && cardSize === 'detailed' && (
                <div className="eui-kanban-card-cover">
                    <img src={card.coverImage} alt="" loading="lazy" />
                </div>
            )}

            <div className="eui-kanban-card-body">
                {card.labels && card.labels.length > 0 && cardSize !== 'compact' && (
                    <div className="eui-kanban-card-labels" role="list" aria-label="Labels">
                        {card.labels.map((label) => (
                            <span
                                key={label.id}
                                className="eui-kanban-label"
                                style={{ backgroundColor: label.color }}
                                role="listitem"
                                title={label.text}
                                aria-label={label.text}
                            >
                                {cardSize === 'detailed' ? label.text : ''}
                            </span>
                        ))}
                    </div>
                )}

                <div className="eui-kanban-card-title">{card.title}</div>

                {card.description && cardSize === 'detailed' && (
                    <div className="eui-kanban-card-description">{card.description}</div>
                )}

                {card.progress !== undefined && cardSize !== 'compact' && (
                    <div className="eui-kanban-card-progress" role="progressbar" aria-valuenow={card.progress} aria-valuemin={0} aria-valuemax={100}>
                        <div className="eui-kanban-card-progress-track">
                            <div
                                className="eui-kanban-card-progress-fill"
                                style={{ width: `${card.progress}%` }}
                            />
                        </div>
                        <span className="eui-kanban-card-progress-text">{card.progress}%</span>
                    </div>
                )}

                <div className="eui-kanban-card-footer">
                    <div className="eui-kanban-card-meta">
                        {card.priority && card.priority !== 'none' && (
                            <span
                                className={classNames('eui-kanban-card-priority', priorityConfig[card.priority].className)}
                                title={`Priority: ${priorityConfig[card.priority].label}`}
                                aria-label={`Priority: ${priorityConfig[card.priority].label}`}
                            >
                                <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" aria-hidden="true">
                                    {card.priority === 'critical' && <path d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5z" />}
                                    {card.priority === 'high' && <path d="M3 13V5l5-3 5 3v8l-5 2z" />}
                                    {card.priority === 'medium' && <path d="M4 12V6l4-2 4 2v6l-4 2z" />}
                                    {card.priority === 'low' && <path d="M5 11V7l3-1.5L11 7v4l-3 1.5z" />}
                                </svg>
                            </span>
                        )}

                        {dueInfo && (
                            <span
                                className={classNames('eui-kanban-card-due', {
                                    'eui-kanban-due-overdue': dueInfo.isOverdue,
                                    'eui-kanban-due-soon': dueInfo.isDueSoon,
                                })}
                                title={dueInfo.text}
                            >
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12" aria-hidden="true">
                                    <circle cx="8" cy="8" r="6.5" />
                                    <path d="M8 4.5V8l2.5 1.5" />
                                </svg>
                                {dueInfo.text}
                            </span>
                        )}

                        {hasSubtasks && (
                            <span className="eui-kanban-card-subtasks" title={`${card.subtaskCompleted ?? 0}/${card.subtaskCount} subtasks`}>
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12" aria-hidden="true">
                                    <path d="M2 4h12M2 8h12M2 12h8" />
                                </svg>
                                {card.subtaskCompleted ?? 0}/{card.subtaskCount}
                            </span>
                        )}

                        {(card.commentCount ?? 0) > 0 && (
                            <span className="eui-kanban-card-comments" title={`${card.commentCount} comments`}>
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12" aria-hidden="true">
                                    <path d="M2 3h12v8H5l-3 3V3z" />
                                </svg>
                                {card.commentCount}
                            </span>
                        )}

                        {(card.attachmentCount ?? 0) > 0 && (
                            <span className="eui-kanban-card-attachments" title={`${card.attachmentCount} attachments`}>
                                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12" aria-hidden="true">
                                    <path d="M10.5 5L6 9.5a2 2 0 102.8 2.8L13.5 7.5a3.5 3.5 0 00-5-5L4 7a2 2 0 002.8 2.8" />
                                </svg>
                                {card.attachmentCount}
                            </span>
                        )}
                    </div>

                    <div className="eui-kanban-card-actions-row">
                        {cardActionsTemplate && cardActionsTemplate(card, column)}

                        {allAssignees.length > 0 && (
                            <div className="eui-kanban-card-assignees" aria-label="Assignees">
                                {allAssignees.slice(0, 3).map((assignee) => (
                                    <span
                                        key={assignee.id}
                                        className="eui-kanban-avatar"
                                        title={assignee.name}
                                    >
                                        {assignee.avatar ? (
                                            <img src={assignee.avatar} alt={assignee.name} loading="lazy" />
                                        ) : (
                                            getInitials(assignee.name)
                                        )}
                                    </span>
                                ))}
                                {allAssignees.length > 3 && (
                                    <span className="eui-kanban-avatar eui-kanban-avatar-overflow">
                                        +{allAssignees.length - 3}
                                    </span>
                                )}
                            </div>
                        )}

                        {allowDeleteCard && (
                            <button
                                className="eui-kanban-card-delete"
                                onClick={handleDelete}
                                aria-label={`Delete card: ${card.title}`}
                                title="Delete card"
                                type="button"
                            >
                                <TimesIcon width={14} height={14} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>

                {hasSubtasks && cardSize !== 'compact' && (
                    <div className="eui-kanban-card-subtask-bar" role="progressbar" aria-valuenow={subtaskPercent} aria-valuemin={0} aria-valuemax={100}>
                        <div className="eui-kanban-card-subtask-fill" style={{ width: `${subtaskPercent}%` }} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default KanbanCard;
