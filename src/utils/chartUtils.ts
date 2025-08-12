// 图表工具函数
import * as echarts from 'echarts';
import { 
  getThemeColors, 
  createGaugeOption, 
  createSalesChartOption, 
  createUserChartOption, 
  createHeatmapOption 
} from './chartConfig';

// 图表管理器类
export class ChartManager {
  private charts: echarts.ECharts[] = [];

  // 初始化单个图表
  private initChart(containerId: string, option: any): echarts.ECharts | null {
    const chartDom = document.getElementById(containerId);
    if (!chartDom) return null;
    
    const chart = echarts.init(chartDom);
    chart.setOption(option);
    this.charts.push(chart);
    return chart;
  }

  // 初始化所有图表
  initAllCharts() {
    const themeColors = getThemeColors();
    
    // 销售趋势图
    this.initChart('salesChart', createSalesChartOption(themeColors));
    
    // 用户分布饼图
    this.initChart('userChart', createUserChartOption(themeColors));
    
    // 仪表盘
    this.initChart('cpuGauge', createGaugeOption(67, 'CPU', themeColors));
    this.initChart('memoryGauge', createGaugeOption(45, '内存', themeColors));
    this.initChart('diskGauge', createGaugeOption(23, '磁盘', themeColors));
    
    // 热力图
    this.initChart('heatmapChart', createHeatmapOption(themeColors));
  }

  // 刷新所有图表（主题切换时使用）
  refreshCharts() {
    this.dispose();
    setTimeout(() => {
      this.initAllCharts();
    }, 100);
  }

  // 调整图表大小
  resize() {
    this.charts.forEach(chart => chart.resize());
  }

  // 销毁所有图表
  dispose() {
    this.charts.forEach(chart => chart.dispose());
    this.charts.length = 0;
  }
}

// 主题监听器类
export class ThemeWatcher {
  private cleanupFunctions: (() => void)[] = [];
  private onThemeChange: () => void;

  constructor(onThemeChange: () => void) {
    this.onThemeChange = onThemeChange;
  }

  // 开始监听主题变化
  start() {
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const mediaChangeHandler = () => this.onThemeChange();
    mediaQuery.addEventListener('change', mediaChangeHandler);
    this.cleanupFunctions.push(() => mediaQuery.removeEventListener('change', mediaChangeHandler));

    // 监听DOM class变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          this.onThemeChange();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    this.cleanupFunctions.push(() => observer.disconnect());
  }

  // 停止监听
  stop() {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions.length = 0;
  }
}
