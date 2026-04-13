import React, { useState } from 'react';
import { Sortable } from '../../../components/drag-drop';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import type { Task } from './sortable-story-data';
import { getPriorityColor } from './sortable-story-data';

const initialTasks: Task[] = [
    { id: 1, title: 'Setup project', description: 'Initialize repository and install dependencies', priority: 'high' },
    { id: 2, title: 'Design UI mockups', description: 'Create wireframes and mockups', priority: 'medium' },
    { id: 3, title: 'Implement features', description: 'Build core functionality', priority: 'high' },
    { id: 4, title: 'Write tests', description: 'Add unit and integration tests', priority: 'medium' },
    { id: 5, title: 'Deploy to production', description: 'Configure CI/CD and deploy', priority: 'low' },
];

const code = `import { Sortable } from 'fluxo-ui/dnd';

interface Task {
  id: number;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Setup project', priority: 'high' },
    { id: 2, title: 'Design UI', priority: 'medium' },
    { id: 3, title: 'Deploy', priority: 'low' },
  ]);

  return (
    <Sortable
      items={tasks}
      onChange={(newTasks) => setTasks(newTasks)}
      className="space-y-3"
    >
      {(task) => (
        <div className="bg-gray-100 rounded-lg p-4 cursor-move">
          <h3>{task.title}</h3>
          <span className={\`priority-\${task.priority}\`}>
            {task.priority}
          </span>
        </div>
      )}
    </Sortable>
  );
}`;

const ComplexItems: React.FC = () => {
    const [taskList, setTaskList] = useState<Task[]>(initialTasks);

    return (
        <>
            <ComponentDemo title="Task List with Priority">
                <Sortable items={taskList} onChange={(newItems) => setTaskList(newItems)} className="space-y-3">
                    {(task, index) => (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 cursor-move hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 mt-1">
                                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-gray-900 dark:text-white font-medium mb-1">{task.title}</h3>
                                    {task.description && <p className="text-gray-600 dark:text-gray-400 text-sm">{task.description}</p>}
                                </div>
                                <div className="shrink-0">
                                    <span className="text-gray-500 text-sm">#{index + 1}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </Sortable>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} />
            </div>
        </>
    );
};

export default ComplexItems;
