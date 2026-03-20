<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  height: {
    type: Number,
    default: 200
  },
  type: {
    type: String,
    default: 'line' // 'line' or 'bar'
  }
})

const hoveredIndex = ref(-1)

const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)

const margin = { top: 40, right: 30, bottom: 40, left: 80 }
const width = 800

const stepSize = 500000 // 50만원 단위

const maxVal = computed(() => {
  const values = props.data.map(d => d.value)
  const maxValue = Math.max(...values, 500000)
  return Math.ceil(maxValue / stepSize) * stepSize || stepSize
})

const yTicks = computed(() => {
  const ticks = []
  for (let val = 0; val <= maxVal.value; val += stepSize) {
    ticks.push(val)
  }
  return ticks
})

const getY = (val) => {
  const chartHeight = props.height - margin.top - margin.bottom
  return margin.top + chartHeight * (1 - val / maxVal.value)
}

const points = computed(() => {
  if (!props.data.length) return []
  const chartWidth = width - margin.left - margin.right
  const xStep = props.type === 'bar' 
    ? chartWidth / props.data.length 
    : chartWidth / (props.data.length - 1 || 1)
  
  return props.data.map((d, i) => {
    const x = props.type === 'bar'
      ? margin.left + (i * xStep) + (xStep / 2)
      : margin.left + i * xStep
    return { x, y: getY(d.value) }
  })
})

const pathData = computed(() => {
  if (props.type !== 'line' || !points.value.length) return ''
  return `M ${points.value[0].x} ${points.value[0].y} ` + 
         points.value.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
})

const areaData = computed(() => {
  if (props.type !== 'line' || !points.value.length) return ''
  const lastX = points.value[points.value.length - 1].x
  const bottomY = props.height - margin.bottom
  return `${pathData.value} L ${lastX} ${bottomY} L ${margin.left} ${bottomY} Z`
})

const barWidth = computed(() => {
  if (props.type !== 'bar' || !props.data.length) return 0
  const chartWidth = width - margin.left - margin.right
  return (chartWidth / props.data.length) * 0.7 // 70% width for bars
})
</script>

<template>
  <div class="chart-container" @mouseleave="hoveredIndex = -1">
    <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3" />
          <stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- 그리드 라인 및 Y축 라벨 (50만원 단위) -->
      <g class="grid-lines">
        <g v-for="tick in yTicks" :key="tick">
          <line 
            :x1="margin.left" :x2="width - margin.right"
            :y1="getY(tick)" :y2="getY(tick)"
            stroke="#e2e8f0" stroke-dasharray="4" stroke-width="1"
          />
          <text :x="margin.left - 10" :y="getY(tick) + 4" text-anchor="end" class="tick-text">
            {{ tick === 0 ? '0' : fmt(tick/10000) + '만' }}
          </text>
        </g>
      </g>

      <!-- 막대 그래프 (Bar Mode) -->
      <g v-if="type === 'bar'">
        <rect v-for="(p, i) in points" :key="i"
          :x="p.x - barWidth/2"
          :y="p.y"
          :width="barWidth"
          :height="height - margin.bottom - p.y"
          fill="var(--primary)"
          rx="4"
          class="bar-rect"
          :class="{ active: hoveredIndex === i }"
          @mouseenter="hoveredIndex = i"
        />
      </g>

      <!-- 선 그래프 (Line Mode) -->
      <template v-else>
        <path :d="areaData" fill="url(#areaGradient)" />
        <path :d="pathData" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="line-path" />
        <g v-for="(p, i) in points" :key="i" class="point-group">
          <circle :cx="p.x" :cy="p.y" :r="hoveredIndex === i ? 7 : 5" fill="white" stroke="var(--primary)" :stroke-width="hoveredIndex === i ? 3 : 2"
            @mouseenter="hoveredIndex = i"
          />
        </g>
      </template>

      <!-- 데이터 툴팁 -->
      <g v-if="hoveredIndex !== -1" class="tooltip-group">
        <rect
          :x="points[hoveredIndex].x - 60"
          :y="points[hoveredIndex].y - 45"
          width="120"
          height="35"
          rx="6"
          class="tooltip-bg"
        />
        <text :x="points[hoveredIndex].x" :y="points[hoveredIndex].y - 32" text-anchor="middle" class="tooltip-title">
          {{ data[hoveredIndex].label }}
        </text>
        <text :x="points[hoveredIndex].x" :y="points[hoveredIndex].y - 18" text-anchor="middle" class="tooltip-value">
          ₩ {{ fmt(data[hoveredIndex].value) }}
        </text>
        <line
          :x1="points[hoveredIndex].x" :x2="points[hoveredIndex].x"
          :y1="points[hoveredIndex].y - 10" :y2="points[hoveredIndex].y"
          stroke="var(--primary)" stroke-width="1" stroke-dasharray="2"
        />
      </g>

      <!-- X축 라벨 -->
      <g class="axis-labels">
        <text v-for="(d, i) in data" :key="i"
          :x="points[i].x"
          :y="height - 10" text-anchor="middle" class="label-text"
          :class="{ active: hoveredIndex === i }">
          {{ d.label.length > 6 ? d.label.substring(0,6)+'..' : d.label }}
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  padding: 10px 0;
  position: relative;
}
svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.line-path {
  filter: drop-shadow(0 4px 6px rgba(99, 102, 241, 0.2));
}
.tick-text {
  font-size: 10px;
  fill: #94a3b8;
  font-weight: 500;
}
.bar-rect {
  transition: all 0.2s ease;
  cursor: pointer;
  opacity: 0.85;
}
.bar-rect:hover, .bar-rect.active {
  opacity: 1;
  filter: brightness(1.1);
  transform: translateY(-2px);
}
.label-text {
  font-size: 11px;
  fill: #64748b;
  font-weight: 500;
  transition: all 0.2s;
}
.label-text.active {
  fill: var(--primary);
  font-weight: 700;
  font-size: 12px;
}

/* Tooltip Styles */
.tooltip-bg {
  fill: rgba(30, 41, 59, 0.9);
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}
.tooltip-title {
  font-size: 10px;
  fill: #cbd5e1;
  font-weight: 500;
}
.tooltip-value {
  font-size: 11px;
  fill: white;
  font-weight: 700;
}
</style>
