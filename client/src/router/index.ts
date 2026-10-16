import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'tasks',
      component: () => import('@/views/TaskList.vue'),
    },
  ],
});

export default router;
