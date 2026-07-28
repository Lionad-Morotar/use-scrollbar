import dayjs from 'dayjs';

import type { Task } from '../types/index';

export function formatTask(tasks: Task[] = []) {
  return tasks.map(task => {
    const newTask = {
      ...task,
      id: task.id,
      start: task.start,
      label: task.label,
      duration: task.duration,
      progress: task.progress,
      type: task.type,
      subs: task.subs || [],
      x: task?.x || 0,
      y: task?.y || 0,
      width: task?.width || 0,
      height: task?.height || 0,
      mouseOver: task?.mouseOver || false,
      collapsed: task?.collapsed || false,
      dependentOn: task?.dependentOn || [],
      parentId: task?.parentId || null,
      style: task?.style || {},
      children: task?.children || [],
      allChildren: task?.allChildren || [],
      parents: task?.parents || [],
      parent: task?.parent || null,
      startTime: task?.startTime || dayjs(task.start).valueOf(),
    };
    newTask.endTime = task?.endTime || task.end ? dayjs(task.end).valueOf() : (newTask.startTime + newTask.duration);
    newTask.duration = newTask.duration || (newTask.endTime - newTask.startTime);
    return newTask
  })
}
