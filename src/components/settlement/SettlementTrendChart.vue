<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    // [{ label: '02-01', value: 1000 }, ...]
  },
  height: {
    type: Number,
    default: 200
  }
})

const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)

const margin = { top: 20, right: 30, bottom: 30, left: 60 }
const width = 800 // Fixed internal coordinate space for SVG

const maxVal = computed(() => {
  const values = props.data.map(d => d.value)
  return Math.max(...values, 1000000) * 1.1 // Give some headroom
})

const points = computed(() => {
  if (!props.data.length) return ''
  const xStep = (width - margin.left - margin.right) / (props.data.length - 1 || 1)
  
  return props.data.map((d, i) => {
    const x = margin.left + i * xStep
    const y = margin.top + (props.height - margin.top - margin.bottom) * (1 - d.value / maxVal.value)
    return { x, y }
  })
})

const pathData = computed(() => {
  if (!points.value.length) return ''
  return `M ${points.value[0].x} ${points.value[0].y} ` + 
         points.value.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
})

const areaData = computed(() => {
  if (!points.value.length) return ''
  const lastX = points.value[points.value.length - 1].x
  const bottomY = props.height - margin.bottom
  return `${pathData.value} L ${lastX} ${bottomY} L ${margin.left} ${bottomY} Z`
})
</script>

<template>
  <div class="chart-container">
    <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none">
      <!-- 그라데이션 정의 -->
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3" />
          <stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- 그리드 라인 (가로) -->
      <g class="grid-lines">
        <line v-for="i in 4" :key="i"
          :x1="margin.left" :x2="width - margin.right"
          :y1="margin.top + (height - margin.top - margin.bottom) * (i-1)/3"
          :y2="margin.top + (height - margin.top - margin.bottom) * (i-1)/3"
          stroke="#e2e8f0" stroke-dasharray="4" stroke-width="1"
        />
      </g>

      <!-- 영역 그라데이션 -->
      <path :d="areaData" fill="url(#areaGradient)" />

      <!-- 선 그래프 -->
      <path :d="pathData" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="line-path" />

      <!-- 데이터 포인트 -->
      <g v-for="(p, i) in points" :key="i" class="point-group">
        <circle :cx="p.x" :cy="p.y" r="5" fill="white" stroke="var(--primary)" stroke-width="2" />
        <text :x="p.x" :y="p.y - 10" text-anchor="middle" class="data-text" v-if="data.length <= 15">
          {{ fmt(data[i].value) }}
        </text>
      </g>

      <!-- X축 라벨 -->
      <g class="axis-labels">
        <text v-for="(d, i) in data" :key="i"
          :x="margin.left + i * ((width - margin.left - margin.right) / (data.length - 1 || 1))"
          :y="height - 5" text-anchor="middle" class="label-text">
          {{ d.label }}
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
}
svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.line-path {
  filter: drop-shadow(0 4px 6px rgba(99, 102, 241, 0.2));
}
.label-text {
  font-size: 11px;
  fill: #64748b;
  font-weight: 500;
}
.data-text {
  font-size: 10px;
  fill: var(--text-dark);
  font-weight: 700;
  display: none;
}
.point-group:hover .data-text {
  display: block;
}
.point-group {
  cursor: pointer;
}
.point-group circle {
  transition: r 0.2s;
}
.point-group:hover circle {
  r: 7;
  stroke-width: 3;
}
</style>
