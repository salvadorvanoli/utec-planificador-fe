import { Component, computed, input } from '@angular/core';
import { ChartCard } from '../chart-card/chart-card';
import { ChartData, CourseStatistics } from '@app/core/models';

@Component({
  selector: 'app-data-panel',
  imports: [ChartCard],
  templateUrl: './data-panel.html',
  styleUrl: './data-panel.scss'
})
export class DataPanel {
  statistics = input.required<CourseStatistics | null>();

  // Computed properties para transformar los datos del backend a formato de gráficos
  cognitiveProcessesData = computed<ChartData>(() => {
    const stats = this.statistics();
    if (!stats?.cognitiveProcesses) {
      return { labels: [], values: [], colors: [], hoverColors: [] };
    }

    const entries = Object.entries(stats.cognitiveProcesses);
    return {
      labels: entries.map(([key]) => key), // Ya vienen en español del backend
      values: entries.map(([, value]) => value),
      colors: ['#00A9E0', '#F59E42', '#7C3AED', '#22C55E', '#F43F5E'],
      hoverColors: ['#38CFF5', '#FFB86B', '#A78BFA', '#4ADE80', '#FB7185']
    };
  });

  competenciesData = computed<ChartData>(() => {
    const stats = this.statistics();
    if (!stats?.transversalCompetencies) {
      return { labels: [], values: [], colors: [], hoverColors: [] };
    }

    const entries = Object.entries(stats.transversalCompetencies);
    return {
      labels: entries.map(([key]) => key), // Ya vienen en español del backend
      values: entries.map(([, value]) => value),
      colors: ['#22C55E', '#F43F5E', '#FACC15', '#6366F1', '#F472B6'],
      hoverColors: ['#4ADE80', '#FB7185', '#FDE047', '#818CF8', '#F9A8D4']
    };
  });

  modalitiesData = computed<ChartData>(() => {
    const stats = this.statistics();
    if (!stats?.learningModalities) {
      return { labels: [], values: [], colors: [], hoverColors: [] };
    }

    const entries = Object.entries(stats.learningModalities);
    return {
      labels: entries.map(([key]) => key), // Ya vienen en español del backend
      values: entries.map(([, value]) => value),
      colors: ['#6366F1', '#F472B6', '#F59E42', '#00A9E0'],
      hoverColors: ['#818CF8', '#F9A8D4', '#FFB86B', '#38CFF5']
    };
  });

  strategiesData = computed<ChartData>(() => {
    const stats = this.statistics();
    if (!stats?.teachingStrategies) {
      return { labels: [], values: [], colors: [], hoverColors: [] };
    }

    const entries = Object.entries(stats.teachingStrategies);
    return {
      labels: entries.map(([key]) => key), // Ya vienen en español del backend
      values: entries.map(([, value]) => value),
      colors: ['#F43F5E', '#22C55E', '#00A9E0', '#7C3AED', '#F59E42'],
      hoverColors: ['#FB7185', '#4ADE80', '#38CFF5', '#A78BFA', '#FFB86B']
    };
  });
}
