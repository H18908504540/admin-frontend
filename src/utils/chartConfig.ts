// 图表配置文件
export interface ThemeColors {
  textPrimary: string;
  textRegular: string;
  borderColor: string;
  bgColor: string;
  isDark: boolean;
}

// 获取主题颜色
export const getThemeColors = (): ThemeColors => {
  const rootElement = document.documentElement;
  const computedStyle = getComputedStyle(rootElement);
  
  return {
    textPrimary: computedStyle.getPropertyValue('--el-text-color-primary').trim() || '#303133',
    textRegular: computedStyle.getPropertyValue('--el-text-color-regular').trim() || '#606266',
    borderColor: computedStyle.getPropertyValue('--el-border-color-lighter').trim() || '#e4e7ed',
    bgColor: computedStyle.getPropertyValue('--el-bg-color').trim() || '#ffffff',
    isDark: document.documentElement.classList.contains('dark') || 
            window.matchMedia('(prefers-color-scheme: dark)').matches
  };
};

// 通用仪表盘配置
export const createGaugeOption = (value: number, name: string, themeColors: ThemeColors) => ({
  series: [{
    type: 'gauge',
    startAngle: 180,
    endAngle: 0,
    center: ['50%', '75%'],
    radius: '90%',
    min: 0,
    max: 100,
    splitNumber: 8,
    axisLine: {
      lineStyle: {
        width: 6,
        color: [
          [0.25, '#67C23A'],
          [0.5, '#E6A23C'],
          [0.75, '#F56C6C'],
          [1, '#F56C6C']
        ]
      }
    },
    pointer: {
      icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
      length: '12%',
      width: 20,
      offsetCenter: [0, '-60%'],
      itemStyle: { color: 'auto' }
    },
    axisTick: {
      length: 12,
      lineStyle: { color: 'auto', width: 2 }
    },
    splitLine: {
      length: 20,
      lineStyle: { color: 'auto', width: 5 }
    },
    axisLabel: {
      color: themeColors.textPrimary,
      fontSize: 12,
      distance: -60,
      fontWeight: 600,
      formatter: (value: number) => {
        const labels = { 25: '低', 50: '中', 75: '高', 100: name === 'CPU' ? '危险' : '满' };
        return labels[value as keyof typeof labels] || '';
      }
    },
    title: {
      offsetCenter: [0, '-20%'],
      fontSize: 16,
      color: themeColors.textPrimary,
      fontWeight: 600
    },
    detail: {
      fontSize: 20,
      offsetCenter: [0, '0%'],
      valueAnimation: true,
      formatter: (value: number) => Math.round(value) + '%',
      color: themeColors.textPrimary
    },
    data: [{ value, name }]
  }]
});

// 销售趋势图配置
export const createSalesChartOption = (themeColors: ThemeColors) => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: themeColors.bgColor,
    borderColor: themeColors.borderColor,
    textStyle: { color: themeColors.textPrimary }
  },
  legend: {
    data: ['销售额', '利润', '访问量'],
    top: 10,
    textStyle: { color: themeColors.textPrimary, fontWeight: 500 }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLine: { lineStyle: { color: themeColors.borderColor } },
    axisLabel: { color: themeColors.textPrimary, fontWeight: 500 }
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: themeColors.borderColor } },
    axisLabel: { color: themeColors.textPrimary, fontWeight: 500 },
    splitLine: { lineStyle: { color: themeColors.borderColor } }
  },
  series: [
    {
      name: '销售额',
      type: 'line',
      smooth: true,
      data: [820, 932, 901, 934, 1290, 1330, 1320, 1500, 1200, 1100, 1300, 1400],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ]
        }
      },
      lineStyle: { color: '#409EFF', width: 3 }
    },
    {
      name: '利润',
      type: 'line',
      smooth: true,
      data: [620, 732, 701, 734, 1090, 1130, 1020, 1200, 1000, 900, 1100, 1200],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
          ]
        }
      },
      lineStyle: { color: '#67C23A', width: 3 }
    },
    {
      name: '访问量',
      type: 'line',
      smooth: true,
      data: [320, 432, 501, 534, 690, 730, 820, 900, 800, 700, 900, 1000],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
            { offset: 1, color: 'rgba(230, 162, 60, 0.1)' }
          ]
        }
      },
      lineStyle: { color: '#E6A23C', width: 3 }
    }
  ]
});

// 用户分布饼图配置
export const createUserChartOption = (themeColors: ThemeColors) => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)',
    backgroundColor: themeColors.bgColor,
    borderColor: themeColors.borderColor,
    textStyle: { color: themeColors.textPrimary }
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 20,
    bottom: 20,
    textStyle: { color: themeColors.textPrimary, fontWeight: 500 }
  },
  series: [{
    name: '用户角色',
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['40%', '50%'],
    avoidLabelOverlap: false,
    label: { show: false, position: 'center' },
    emphasis: {
      label: {
        show: true,
        fontSize: '18',
        fontWeight: 'bold'
      }
    },
    labelLine: { show: false },
    data: [
      { value: 1048, name: '管理员', itemStyle: { color: '#409EFF' } },
      { value: 735, name: '编辑者', itemStyle: { color: '#67C23A' } },
      { value: 580, name: '普通用户', itemStyle: { color: '#E6A23C' } },
      { value: 484, name: '访客', itemStyle: { color: '#F56C6C' } }
    ]
  }]
});

// 热力图配置
export const createHeatmapOption = (themeColors: ThemeColors) => {
  const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
    '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'];
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  const data = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      data.push([j, i, Math.floor(Math.random() * 100)]);
    }
  }

  return {
    tooltip: {
      position: 'top',
      backgroundColor: themeColors.bgColor,
      borderColor: themeColors.borderColor,
      textStyle: { color: themeColors.textPrimary },
      formatter: (params: any) => `${days[params.data[1]]} ${hours[params.data[0]]}：${params.data[2]}人`
    },
    grid: { height: '50%', top: '10%' },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true },
      axisLabel: { color: themeColors.textPrimary, fontWeight: 500 },
      axisLine: { lineStyle: { color: themeColors.borderColor } }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: { show: true },
      axisLabel: { color: themeColors.textPrimary, fontWeight: 500 },
      axisLine: { lineStyle: { color: themeColors.borderColor } }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      textStyle: { color: themeColors.textPrimary, fontWeight: 500 },
      inRange: { color: ['#e0f3ff', '#409EFF', '#1c5aa0'] }
    },
    series: [{
      name: '活跃用户',
      type: 'heatmap',
      data: data,
      label: { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
};

// 统计数据配置
export const getStatsData = () => [
  {
    label: '总用户数',
    value: '12,345',
    icon: 'el-icon-user',
    color: '#409EFF',
    trend: 'up',
    change: '+12.5%'
  },
  {
    label: '今日访问',
    value: '8,432',
    icon: 'el-icon-view',
    color: '#67C23A',
    trend: 'up',
    change: '+8.2%'
  },
  {
    label: '销售额',
    value: '¥89,234',
    icon: 'el-icon-money',
    color: '#E6A23C',
    trend: 'down',
    change: '-3.1%'
  },
  {
    label: '系统负载',
    value: '67%',
    icon: 'el-icon-cpu',
    color: '#F56C6C',
    trend: 'up',
    change: '+5.4%'
  }
];
