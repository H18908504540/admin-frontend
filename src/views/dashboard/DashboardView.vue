// src/views/dashboard/DashboardView.vue
<template>
  <div class="dashboard-container">
    <h2>仪表盘</h2>
    <p>欢迎来到管理系统！</p>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-button class="button" text>添加</el-button>
            </div>
          </template>
          <div v-for="o in 4" :key="o" class="text item">
            {{ '待办事项 ' + o }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>系统通知</span>
            </div>
          </template>
          <div v-for="o in 3" :key="o" class="text item">
            {{ '这是一条系统通知示例 ' + o }}
          </div>
           <div id="mainChart" style="width: 100%; height:300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue';
import * as echarts from 'echarts'; // 引入 ECharts

onMounted(() => {
  nextTick(() => { // 确保 DOM 已经渲染
    initChart();
  });
});

const initChart = () => {
  const chartDom = document.getElementById('mainChart');
  if (chartDom) {
    const myChart = echarts.init(chartDom);
    const option = {
      title: {
        text: '示例图表'
      },
      tooltip: {},
      xAxis: {
        data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
      },
      yAxis: {},
      series: [
        {
          name: '销量',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20]
        }
      ]
    };
    myChart.setOption(option);
  } else {
    console.error("ECharts container 'mainChart' not found.");
  }
};

</script>

<style lang="less" scoped>
.dashboard-container {
  padding: 10px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text {
  font-size: 14px;
}
.item {
  margin-bottom: 18px;
}
.box-card {
  margin-bottom: 20px;
}
</style>