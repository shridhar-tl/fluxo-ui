import React from 'react';

interface ToolbarTitleProps {
  title: string;
}

const ToolbarTitle: React.FC<ToolbarTitleProps> = ({ title }) => {
  return (
    <h2 className="eui-cal-toolbar-title" aria-live="polite" aria-atomic="true">{title}</h2>
  );
};

export default React.memo(ToolbarTitle);
