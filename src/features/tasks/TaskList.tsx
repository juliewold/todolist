import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo } from "react";
import type { Task, TaskList as TaskListModel } from "../../domain/types";
import { reorderVisible } from "../../domain/positions";
import { TaskRow } from "./TaskRow";

interface TaskListProps {
  tasks: readonly Task[];
  /** All tasks, used to keep the global order consistent when reordering. */
  allTasks: readonly Task[];
  lists: readonly TaskListModel[];
  showDate: boolean;
  sortable: boolean;
  onToggle: (id: string) => void;
  onOpen: (task: Task) => void;
  onReorder: (changed: Task[]) => void;
}

export function TaskList({
  tasks,
  allTasks,
  lists,
  showDate,
  sortable,
  onToggle,
  onOpen,
  onReorder,
}: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = useMemo(() => tasks.map((task) => task.id), [tasks]);
  const listById = useMemo(() => new Map(lists.map((list) => [list.id, list])), [lists]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) {
      return;
    }
    const reordered = arrayMove(ids, from, to);
    const changed = reorderVisible(allTasks, reordered);
    if (changed.length > 0) {
      onReorder(changed);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              list={task.listId ? listById.get(task.listId) : undefined}
              showDate={showDate}
              onToggle={onToggle}
              onOpen={onOpen}
              sortable={sortable}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
