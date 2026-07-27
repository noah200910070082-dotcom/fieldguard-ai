/**
 * ECharts 悬浮图表面板 — 4 个半透明实时数据图表，叠加在 3D 场景上方
 *
 * 核心设计: 用 useRef 存储 echarts 实例 + store.subscribe 监听数据变化
 * → 命令式更新图表，完全绕开 React 渲染循环，避免 Zustand → useMemo → 无限循环
 */

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { useSensorStore } from '@/stores/sensor-store'
import { useAppStore } from '@/stores/app-store'

export default function EChartsOverlay() {
  return (
    <>
      <ChartPanel title="温湿度趋势" className="absolute top-3 left-3 w-[290px] h-[200px]">
        <TempHumidityChart />
      </ChartPanel>
      <ChartPanel title="土壤pH对比" className="absolute top-3 right-3 w-[290px] h-[200px]">
        <PHBarChart />
      </ChartPanel>
      <ChartPanel title="病害风险" className="absolute bottom-3 left-3 w-[220px] h-[180px]">
        <DiseaseGaugeChart />
      </ChartPanel>
      <ChartPanel title="设备状态" className="absolute bottom-3 right-3 w-[240px] h-[180px]">
        <DeviceStatusChart />
      </ChartPanel>
    </>
  )
}

function ChartPanel({
  title,
  className,
  children,
}: {
  title: string
  className: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`z-10 rounded-2xl border p-3 shadow-2xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(6,18,32,0.88), rgba(4,24,14,0.88))',
        borderColor: 'rgba(0,200,100,0.15)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div className="text-[rgba(0,210,100,0.5)] text-[10px] font-mono mb-1.5 tracking-[0.15em]">{title}</div>
      {children}
    </div>
  )
}

// ═══ 通用 echarts 容器 — 初始化 + 销毁 ═══
function useChartContainer(height: number) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    chartRef.current = echarts.init(containerRef.current, undefined, { renderer: 'canvas' })
    const onResize = () => chartRef.current?.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      chartRef.current?.dispose()
    }
  }, [])

  const container = <div ref={containerRef} style={{ height }} />
  return { container, chartRef }
}

/** 面板 1: 温湿度双轴折线图 */
function TempHumidityChart() {
  const { container, chartRef } = useChartContainer(155)
  const [tick, setTick] = useState(0)

  // 2秒刷新一次
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 2000)
    return () => clearInterval(timer)
  }, [])

  // tick 变化时从 store 拿数据更新图表
  useEffect(() => {
    const c = chartRef.current
    if (!c) return
    const store = useSensorStore.getState()
    const zoneId = useAppStore.getState().selectedZoneId
    const history = store.chartHistory[zoneId] ?? []

    c.setOption(
      {
        grid: { top: 8, right: 40, bottom: 20, left: 42 },
        xAxis: {
          type: 'category',
          data: history.map((p) => p.time.slice(-5)),
          axisLabel: { color: '#889994', fontSize: 8, interval: Math.max(1, Math.floor(history.length / 6)) },
          axisLine: { lineStyle: { color: '#ffffff20' } },
        },
        yAxis: [
          {
            type: 'value', name: '°C',
            nameTextStyle: { color: '#ef4444', fontSize: 9 },
            min: 10, max: 45,
            splitLine: { lineStyle: { color: '#ffffff10' } },
            axisLabel: { color: '#ef4444', fontSize: 8 },
          },
          {
            type: 'value', name: '%',
            nameTextStyle: { color: '#3b82f6', fontSize: 9 },
            min: 20, max: 100,
            splitLine: { show: false },
            axisLabel: { color: '#3b82f6', fontSize: 8 },
          },
        ],
        series: [
          { name: '温度', type: 'line', data: history.map((p) => p.temperature), smooth: true, symbol: 'none', lineStyle: { color: '#ef4444', width: 1.5 }, yAxisIndex: 0 },
          { name: '湿度', type: 'line', data: history.map((p) => p.humidity), smooth: true, symbol: 'none', lineStyle: { color: '#3b82f6', width: 1.5 }, yAxisIndex: 1 },
        ],
        legend: { show: false },
        tooltip: { trigger: 'axis', textStyle: { fontSize: 10 } },
      },
      { notMerge: false },
    )
  }, [tick, chartRef])

  return container
}

/** 面板 2: 土壤 pH 横向柱状图 */
function PHBarChart() {
  const { container, chartRef } = useChartContainer(155)
  const [tick, setTick] = useState(0)
  const zones = ['A-01', 'A-02', 'B-01', 'B-02', 'C-01', 'C-02']

  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 2000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const c = chartRef.current
    if (!c) return
    const store = useSensorStore.getState()
    const data = zones.map((z) => ({ zone: z, value: store.latestByZone[z]?.ph ?? 6.5 }))

    c.setOption({
      grid: { top: 5, right: 20, bottom: 15, left: 36 },
      xAxis: { type: 'value', min: 4, max: 9, axisLabel: { color: '#889994', fontSize: 8 }, splitLine: { lineStyle: { color: '#ffffff10' } } },
      yAxis: { type: 'category', data: data.map((d) => d.zone), axisLabel: { color: '#889994', fontSize: 8 }, axisLine: { lineStyle: { color: '#ffffff20' } } },
      series: [{
        type: 'bar',
        data: data.map((d) => ({
          value: d.value,
          itemStyle: { color: d.value < 5.5 || d.value > 7.5 ? '#ef4444' : d.value < 6.0 || d.value > 7.0 ? '#facc15' : '#4ade80', borderRadius: [0, 2, 2, 0] },
        })),
        barWidth: 12,
        markLine: { silent: true, symbol: 'none', lineStyle: { color: '#ffffff40', type: 'dashed', width: 1 }, data: [{ xAxis: 7.0 }] },
      }],
      tooltip: { trigger: 'axis', formatter: '{b}: pH {c}', textStyle: { fontSize: 10 } },
    })
  }, [tick, chartRef, zones])

  return container
}

/** 面板 3: 病害风险仪表盘 */
function DiseaseGaugeChart() {
  const { container, chartRef } = useChartContainer(140)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 2000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const c = chartRef.current
    if (!c) return
    const store = useSensorStore.getState()
    const zoneId = useAppStore.getState().selectedZoneId
    const percent = Math.round((store.latestByZone[zoneId]?.diseaseRisk ?? 0.2) * 100)

    c.setOption({
      series: [{
        type: 'gauge', startAngle: 210, endAngle: -30, center: ['50%', '55%'], radius: '85%',
        min: 0, max: 100, splitNumber: 10,
        axisLine: { show: true, lineStyle: { width: 14, color: [[0.3, '#4ade80'], [0.6, '#facc15'], [1, '#ef4444']] } },
        pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '60%', width: 8, offsetCenter: [0, '-10%'], itemStyle: { color: 'auto' } },
        axisTick: { distance: -14, length: 6, lineStyle: { width: 1, color: '#999' } },
        splitLine: { distance: -18, length: 12, lineStyle: { width: 2, color: '#999' } },
        axisLabel: { color: '#889994', distance: 22, fontSize: 8 },
        anchor: { show: true, showAbove: true, size: 14, itemStyle: { borderWidth: 2, borderColor: '#999' } },
        title: { show: false },
        detail: { valueAnimation: true, fontSize: 22, offsetCenter: [0, '55%'], formatter: '{value}%', color: '#fff', fontWeight: 'bold' },
        data: [{ value: percent }],
      }],
    })
  }, [tick, chartRef])

  return container
}

/** 面板 4: 设备在线状态列表 */
function DeviceStatusChart() {
  const { container, chartRef } = useChartContainer(140)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 2000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const c = chartRef.current
    if (!c) return
    const store = useSensorStore.getState()
    const entries = Object.values(store.devices)
      .filter((d) => d.lastReading && d.lastReading.type !== 'battery')
      .slice(0, 8)
      .map((d) => ({
        id: d.deviceId.split('-')[0],
        value: d.lastReading?.value ?? 0,
        status: d.status,
      }))

    if (entries.length === 0) return

    c.setOption({
      grid: { top: 5, right: 10, bottom: 5, left: 10 },
      xAxis: { show: false },
      yAxis: { type: 'category', data: entries.map((e) => e.id), axisLabel: { color: '#c8d6cf', fontSize: 9, fontWeight: 'bold' }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{
        type: 'bar',
        data: entries.map((e) => ({ value: e.value, itemStyle: { color: e.status === 'danger' ? '#ef4444' : e.status === 'warning' ? '#facc15' : '#4ade80', borderRadius: [0, 3, 3, 0] } })),
        barWidth: 10,
        label: { show: true, position: 'right', color: '#889994', fontSize: 8, formatter: (p: { value: number }) => `${p.value}` },
      }],
      tooltip: { trigger: 'axis', textStyle: { fontSize: 10 } },
    })
  }, [tick, chartRef])

  return container
}
