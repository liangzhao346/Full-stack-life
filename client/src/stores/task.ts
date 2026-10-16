import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { taskApi, getErrorMessage } from '@/api';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types';

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const completedCount = computed(() => tasks.value.filter((t) => t.completed).length);
  const pendingCount = computed(() => tasks.value.filter((t) => !t.completed).length);

  async function fetchTasks() {
    loading.value = true;
    error.value = null;
    try {
      const result = await taskApi.getAll();
      tasks.value = result.data;
    } catch (err) {
      error.value = getErrorMessage(err);
    } finally {
      loading.value = false;
    }
  }

  async function createTask(input: CreateTaskInput) {
    error.value = null;
    try {
      const result = await taskApi.create(input);
      tasks.value.unshift(result.data);
    } catch (err) {
      error.value = getErrorMessage(err);
      throw err;
    }
  }

  async function updateTask(id: number, input: UpdateTaskInput) {
    error.value = null;
    try {
      const result = await taskApi.update(id, input);
      const index = tasks.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks.value[index] = result.data;
      }
    } catch (err) {
      error.value = getErrorMessage(err);
      throw err;
    }
  }

  async function deleteTask(id: number) {
    error.value = null;
    try {
      await taskApi.delete(id);
      tasks.value = tasks.value.filter((t) => t.id !== id);
    } catch (err) {
      error.value = getErrorMessage(err);
      throw err;
    }
  }

  async function toggleTask(task: Task) {
    await updateTask(task.id, { completed: !task.completed });
  }

  return {
    tasks,
    loading,
    error,
    completedCount,
    pendingCount,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
});
