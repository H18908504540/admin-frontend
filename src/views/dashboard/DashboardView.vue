<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="dashboard-header">
      <h2>数据仪表盘</h2>
      <p>实时监控系统运行状态</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="(stat, index) in statsData" :key="index">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-trend" :class="stat.trend">
                <i :class="stat.trend === 'up' ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
                {{ stat.change }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>销售趋势分析</span>
              <el-tag type="success">实时数据</el-tag>
            </div>
          </template>
          <div id="salesChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户角色分布</span>
              <el-tag type="primary">统计数据</el-tag>
            </div>
          </template>
          <div id="userChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统监控仪表盘 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="8" v-for="gauge in gauges" :key="gauge.id">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>{{ gauge.title }}</span>
            </div>
          </template>
          <div :id="gauge.id" class="chart-container small-chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热力图 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户活跃度热力图</span>
              <el-tag type="warning">近30天</el-tag>
          </div>
          </template>
          <div id="heatmapChart" class="chart-container large-chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick, ref, onUnmounted } from 'vue';
import { ChartManager, ThemeWatcher } from '../../utils/chartUtils';
import { getStatsData } from '../../utils/chartConfig';

// 统计数据
const statsData = ref(getStatsData());

// 仪表盘配置
const gauges = ref([
  { id: 'cpuGauge', title: 'CPU 使用率' },
  { id: 'memoryGauge', title: '内存使用率' },
  { id: 'diskGauge', title: '磁盘使用率' }
]);

// 图表管理器
const chartManager = new ChartManager();
const themeWatcher = new ThemeWatcher(() => {
  chartManager.refreshCharts();
});

// 窗口大小调整处理
const handleResize = () => {
  chartManager.resize();
};

onMounted(() => {
  nextTick(() => {
    // 初始化图表
    chartManager.initAllCharts();
    
    // 启动主题监听
    themeWatcher.start();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
  });
});

onUnmounted(() => {
  // 清理资源
  chartManager.dispose();
  themeWatcher.stop();
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="less" scoped>
.dashboard-container {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: calc(100vh - 160px);

  .dashboard-header {
    text-align: center;
    margin-bottom: 30px;
    
    h2 {
      color: var(--el-text-color-primary);
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    p {
      color: var(--el-text-color-regular);
      font-size: 16px;
      margin: 0;
      font-weight: 500;
    }
  }

  .stats-row {
    margin-bottom: 30px;

    .stat-card {
      border-radius: 12px;
      border: none;
      background: var(--el-bg-color);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px var(--el-color-primary-light-8);
      }

      .stat-content {
        display: flex;
        align-items: center;
        padding: 10px 0;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;

          i {
            font-size: 24px;
            color: white;
          }
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--el-text-color-primary);
            line-height: 1.2;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: var(--el-text-color-regular);
            margin-bottom: 4px;
            font-weight: 500;
          }

          .stat-trend {
            font-size: 12px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;

            &.up {
              color: var(--el-color-success);
              background: var(--el-color-success-light-9);
            }

            &.down {
              color: var(--el-color-danger);
              background: var(--el-color-danger-light-9);
            }

            i {
              margin-right: 2px;
            }
          }
        }
      }
    }
  }

  .charts-row {
    margin-bottom: 20px;

        .chart-card {
      border-radius: 12px;
      border: none;
      background: var(--el-bg-color);
      box-shadow: 0 2px 12px var(--el-color-primary-light-9);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 20px var(--el-color-primary-light-8);
      }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
        padding: 0;

        span {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .chart-container {
        width: 100%;
        height: 350px;
        
        &.small-chart {
          height: 250px;
        }

        &.large-chart {
          height: 400px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .stats-row .el-col {
      margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;

    .dashboard-header {
      h2 {
        font-size: 24px;
      }

      p {
  font-size: 14px;
}
    }

    .stats-row .stat-card .stat-content {
          .stat-icon {
            width: 50px;
            height: 50px;

            i {
              font-size: 20px;
            }
          }

      .stat-info .stat-value {
              font-size: 20px;
      }
    }

    .charts-row .chart-container {
        &.small-chart {
          height: 200px;
        }

        &:not(.small-chart):not(.large-chart) {
          height: 280px;
        }

        &.large-chart {
          height: 300px;
      }
    }
  }
}
</style>