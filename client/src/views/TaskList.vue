<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useTaskStore } from '@/stores/task';

const store = useTaskStore();
const newTaskTitle = ref('');
const showCompletedOnly = ref(false);

const filteredTasks = computed(() => {
  if (showCompletedOnly.value) {
    return store.tasks.filter((t) => t.completed);
  }
  return store.tasks;
});

onMounted(() => {
  store.fetchTasks();
});

async function handleCreate() {
  const title = newTaskTitle.value.trim();
  if (!title) return;
  try {
    await store.createTask({ title });
    newTaskTitle.value = '';
  } catch {
    // error already in store
  }
}

async function handleDelete(id: number) {
  await store.deleteTask(id);
}

async function handleToggle(id: number) {
  const task = store.tasks.find((t) => t.id === id);
  if (task) await store.toggleTask(task);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <div class="task-page">
    <header>
      <h1>Task Manager</h1>
      <p class="subtitle">
        Vue3 + Node.js (Express) full-stack demo &mdash;
        {{ store.pendingCount }} pending, {{ store.completedCount }} completed
      </p>
    </header>

    <!-- Create form -->
    <form class="create-form" @submit.prevent="handleCreate">
      <input
        v-model="newTaskTitle"
        type="text"
        placeholder="Enter a new task..."
        maxlength="255"
        class="create-input"
      />
      <button type="submit" class="btn btn-primary" :disabled="!newTaskTitle.trim()">
        Add
      </button>
    </form>

    <!-- Error banner -->
    <div v-if="store.error" class="error-banner">
      {{ store.error }}
    </div>

    <!-- Filter toggle -->
    <div class="filter-bar">
      <label class="filter-toggle">
        <input type="checkbox" v-model="showCompletedOnly" />
        <span>Show completed only</span>
      </label>
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.loading && store.tasks.length === 0" class="skeleton-list">
      <div v-for="i in 4" :key="i" class="skeleton-item"></div>
    </div>

    <!-- Task list -->
    <ul v-else-if="filteredTasks.length > 0" class="task-list">
      <li
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-item"
        :class="{ completed: task.completed }"
      >
        <input
          type="checkbox"
          :checked="task.completed"
          @change="handleToggle(task.id)"
          class="task-checkbox"
        />
        <div class="task-content">
          <span class="task-title">{{ task.title }}</span>
          <span class="task-date">{{ formatDate(task.createdAt) }}</span>
        </div>
        <button
          @click="handleDelete(task.id)"
          class="btn btn-danger btn-sm"
          aria-label="Delete task"
        >
          Delete
        </button>
      </li>
    </ul>

    <!-- Empty state -->
    <div v-else-if="!store.loading" class="empty-state">
      <p>No tasks yet. Add one above to get started!</p>
    </div>
  </div>
</template>

<style scoped>
.create-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.create-input {
  flex: 1;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.create-input:focus {
  border-color: var(--color-primary);
}

.error-banner {
  background: #fef2f2;
  color: var(--color-danger);
  border: 1px solid #fecaca;
  border-radius: var(--radius);
  padding: 0.625rem 0.875rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.filter-bar {
  margin-bottom: 0.75rem;
}

.filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.task-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  box-shadow: var(--shadow);
  transition: opacity 0.2s;
}

.task-item.completed {
  opacity: 0.6;
}

.task-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.task-title {
  font-size: 0.95rem;
  font-weight: 500;
}

.task-item.completed .task-title {
  text-decoration: line-through;
}

.task-date {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.btn {
  border: none;
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-danger {
  background: transparent;
  color: var(--color-danger);
  border: 1px solid var(--color-border);
}

.btn-danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.btn-sm {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-item {
  height: 52px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e5e5e5 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: var(--radius);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}
</style>
