import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ExposureView from '../views/ExposureView.vue'
import QuizView from '../views/QuizView.vue'
import ResultsView from '../views/ResultsView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/exposure', component: ExposureView },
    { path: '/quiz', component: QuizView },
    { path: '/results', component: ResultsView },
  ],
})
