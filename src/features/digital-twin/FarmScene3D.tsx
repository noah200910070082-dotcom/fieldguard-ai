/**
 * 3D 农田数字孪生 — 嵌入独立 Three.js 场景
 *
 * 独立 HTML 文件 farm-twin.html 包含完整的 3D 场景：
 * - 9格农田 + 作物(玉米/小麦) + 树木 + 房屋 + 池塘 + 拖拉机 + 稻草人
 * - 麦轮植保机器人(含云台/机械臂/超声波传感器) + 巡逻路径动画
 * - 天空球 + 远山 + 蝴蝶粒子 + 水波纹 + 暗角特效
 * - 4个悬浮数据卡片(温度/湿度/病虫害风险/机器人状态)
 * - 鼠标拖拽旋转/滚轮缩放/右键平移
 */

export default function FarmScene3D() {
  return (
    <div className="absolute inset-0">
      <iframe
        src="/farm-twin.html"
        className="w-full h-full border-0"
        title="智慧农田 3D 数字孪生"
        allow="autoplay"
      />
    </div>
  )
}
