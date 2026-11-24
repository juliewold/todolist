import { describe, expect, it } from "vitest";
import {
  createLocalRepository,
  createEmptySnapshot,
  type KeyValueStorage,
} from "./localRepository";
import { parseSnapshot } from "../domain/snapshotSchema";
import type { Habit, Task } from "../domain/types";

function memoryStorage(): KeyValueStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

const task: Task = {
  id: "t1",
  title: "Les kapittel 3",
  description: "",
  dueDate: "2026-11-24",
  listId: null,
  priority: 2,
  completedAt: null,
  position: 0,
  createdAt: "2026-11-20T10:00:00.000Z",
};

const habit: Habit = {
  id: "h1",
  name: "Trening",
  icon: "dumbbell",
  color: "rose",
  kind: "duration",
  unit: "min",
  target: 30,
  goalPeriod: "daily",
  position: 0,
};

describe("createLocalRepository", () => {
  it("starts with an empty snapshot", async () => {
    const repository = createLocalRepository(memoryStorage());
    const snapshot = await repository.load();
    expect(snapshot.tasks).toEqual([]);
    expect(snapshot.habits).toEqual([]);
  });

  it("persists tasks and habit entries between instances", async () => {
    const storage = memoryStorage();
    const first = createLocalRepository(storage);
    await first.saveTasks([task]);
    await first.saveHabit(habit);
    await first.saveHabitEntry({ id: "e1", habitId: "h1", date: "2026-11-24", value: 30 });

    const second = createLocalRepository(storage);
    const snapshot = await second.load();
    expect(snapshot.tasks).toEqual([task]);
    expect(snapshot.habits).toEqual([habit]);
    expect(snapshot.habitEntries).toHaveLength(1);
  });

  it("removes a habit together with its entries", async () => {
    const repository = createLocalRepository(memoryStorage());
    await repository.saveHabit(habit);
    await repository.saveHabitEntry({ id: "e1", habitId: "h1", date: "2026-11-24", value: 30 });
    await repository.deleteHabit("h1");
    const snapshot = await repository.load();
    expect(snapshot.habits).toEqual([]);
    expect(snapshot.habitEntries).toEqual([]);
  });

  it("recovers from corrupt stored data", async () => {
    const storage = memoryStorage();
    storage.setItem("todo.data.v1", "{not json");
    const snapshot = await createLocalRepository(storage).load();
    expect(snapshot.tasks).toEqual([]);
  });

  it("imports a snapshot by merging it into the existing data", async () => {
    const repository = createLocalRepository(memoryStorage());
    await repository.saveTasks([task]);
    const imported = { ...createEmptySnapshot(), tasks: [{ ...task, id: "t2" }] };
    await repository.importSnapshot(parseSnapshot(JSON.parse(JSON.stringify(imported))));
    const snapshot = await repository.load();
    expect(snapshot.tasks.map((item) => item.id).sort()).toEqual(["t1", "t2"]);
  });
});
