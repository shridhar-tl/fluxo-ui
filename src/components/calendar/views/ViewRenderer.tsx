import React from 'react';
import type { ViewProps, CalendarViewDefinition } from '../calendar-types';

interface ViewRendererProps extends ViewProps {
  viewDefinition: CalendarViewDefinition | undefined;
}

const ViewRenderer: React.FC<ViewRendererProps> = ({ viewDefinition, ...viewProps }) => {
  if (!viewDefinition) {
    return (
      <div className="eui-cal-view-missing">
        <p>View not found. Register a plugin that provides this view.</p>
      </div>
    );
  }

  const ViewComponent = viewDefinition.component;
  return <ViewComponent {...viewProps} />;
};

export default React.memo(ViewRenderer);
