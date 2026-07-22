import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Cloud,
  Droplets,
  CodeXml,
  Grip,
  Leaf,
  Menu,
  Pause,
  Play,
  PlugZap,
  Radio,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Target,
  Thermometer,
  Volume2,
  Wind,
  X,
  Zap,
} from 'lucide-react'
import DashboardPanels from './DashboardPanels'

const zones = [
  { id: 'A-01', crop: '番茄', risk: 18, trend: -3, status: 'healthy', temp: 25.4, humidity: 68 },
  { id: 'A-02', crop: '番茄', risk: 34, trend: 7, status: 'watch', temp: 26.1, humidity: 72 },
  { id: 'B-01', crop: '白菜', risk: 72, trend: 14, status: 'danger', temp: 27.2, humidity: 81 },
  { id: 'B-02', crop: '白菜', risk: 46, trend: 4, status: 'warning', temp: 26.8, humidity: 76 },
  { id: 'C-01', crop: '玉米', risk: 22, trend: -2, status: 'healthy', temp: 25.9, humidity: 66 },
  { id: 'C-02', crop: '玉米', risk: 29, trend: 1, status: 'healthy', temp: 25.7, humidity: 70 },
]

const events = [
  { time: '10:42', title: '精準噴灑完成', detail: 'B-01 · 用藥 18 ml', icon: Droplets, tone: 'orange' },
  { time: '10:37', title: '發現菜青蟲卵塊', detail: '置信度 94.8%', icon: ScanLine, tone: 'red' },
  { time: '09:54', title: '機械抓取成功', detail: 'A-02 · 物理清除', icon: Grip, tone: 'green' },
  { time: '08:20', title: '巡田任務啟動', detail: '預計覆蓋 3.6 公頃', icon: Bot, tone: 'blue' },
]

const actions = {
  healthy: { label: '常規監測', text: '保持 15 分鐘採樣頻率', icon: Activity },
  watch: { label: '近距確認', text: '調高頻率並派車補拍', icon: ScanLine },
  warning: { label: '機械清除', text: '啟動柔性夾爪物理除害', icon: Grip },
  danger: { label: '精準施藥', text: '定點低劑量噴灑並回測', icon: Droplets },
}

const techLayers = [
  { number: '01', label: '端', title: '感知與執行', text: 'RGB、多光譜、溫濕度感測器與巡田車持續採集；抓手、聲光及噴頭完成處置。', icon: Radio },
  { number: '02', label: '邊', title: '即時推理', text: '樹莓派離線運行 YOLO、光譜分類與風險評分，在 500ms 內完成決策。', icon: Zap },
  { number: '03', label: '雲', title: '長期研判', text: '儲存歷史資料、生成趨勢與熱力圖；大模型負責解釋和週期性復盤。', icon: Cloud },
]

function App() {
  const [selectedZone, setSelectedZone] = useState(zones[2])
  const [risk, setRisk] = useState(zones[2].risk)
  const [patrolling, setPatrolling] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [now, setNow] = useState(new Date())
  const [activePanel, setActivePanel] = useState('overview')
  const [guideStep, setGuideStep] = useState(0)
  const [showGuide, setShowGuide] = useState(() => window.localStorage.getItem('fieldguard-guide-seen') !== '1')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => setRisk(selectedZone.risk), [selectedZone])

  const riskState = useMemo(() => {
    if (risk < 30) return { key: 'healthy', label: '低風險', color: '#53a765' }
    if (risk < 50) return { key: 'watch', label: '需關注', color: '#d5a43d' }
    if (risk < 70) return { key: 'warning', label: '預警', color: '#e67d34' }
    return { key: 'danger', label: '高風險', color: '#d34f3f' }
  }, [risk])

  const currentAction = actions[riskState.key]

  const runAction = (label) => {
    setNotice(`${label}指令已下發，巡田車正在前往 ${selectedZone.id}`)
    window.setTimeout(() => setNotice(''), 3800)
  }

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3800)
  }

  const openDashboard = (panel = 'overview') => {
    setActivePanel(panel)
    window.setTimeout(() => document.querySelector('#monitor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  const finishGuide = () => {
    window.localStorage.setItem('fieldguard-guide-seen', '1')
    setShowGuide(false)
    setGuideStep(0)
    openDashboard('overview')
  }

  const selectZone = (zone) => {
    setSelectedZone(zone)
    document.querySelector('#monitor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="智護田首頁">
          <span className="brand-mark"><Leaf size={19} strokeWidth={2.4} /></span>
          <span>智護田</span>
          <em>FIELDGUARD AI</em>
        </a>
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="主選單">
          <a href="#overview" onClick={() => setMenuOpen(false)}>系統總覽</a>
          <a href="#monitor" onClick={() => setMenuOpen(false)}>風險監測</a>
          <a href="#loop" onClick={() => setMenuOpen(false)}>處置閉環</a>
          <a href="#architecture" onClick={() => setMenuOpen(false)}>技術架構</a>
        </nav>
        <div className="header-actions">
          <span className="online"><i /> 系統在線</span>
          <button className="header-cta button-3d" onClick={() => openDashboard('overview')}>進入控制台 <ArrowRight size={15} /></button>
        </div>
        <button className="menu-button" onClick={() => setMenuOpen((v) => !v)} aria-label="開啟選單">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <section className="hero" id="top">
        <div className="animated-farm-bg" aria-hidden="true"><i /><i /><i /><span /><span /></div>
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> 多模態感知 × 具身智能</div>
          <h1>讓每一株作物<br />都被<span>提前看見。</span></h1>
          <p className="hero-lead">融合 RGB、多光譜與環境數據，讓巡田機器人自主完成「感知、決策、執行、反饋」的病蟲害防治閉環。</p>
          <div className="hero-buttons">
            <button className="button primary button-3d" onClick={() => openDashboard('overview')}>立即進入控制台 <ArrowDown size={17} /></button>
            <a className="button ghost" href="#architecture">了解系統原理 <ChevronRight size={17} /></a>
          </div>
          <div className="proof-row">
            <div><strong>3–7<small>天</small></strong><span>提前發現病害</span></div>
            <div><strong>&lt;500<small>ms</small></strong><span>邊緣決策延遲</span></div>
            <div><strong>24<small>/7</small></strong><span>無人持續巡護</span></div>
          </div>
        </div>

        <div className="hero-visual" aria-label="智護田巡田機器人示意圖">
          <div className="scan-grid" />
          <div className="floating-tag tag-one"><Radio size={14} /> 6 個節點在線</div>
          <div className="floating-tag tag-two"><Target size={14} /> 病斑已定位</div>
          <div className="robot-scene">
            <div className="robot-arm">
              <i className="joint joint-a" /><i className="arm arm-a" />
              <i className="joint joint-b" /><i className="arm arm-b" />
              <i className="joint joint-c" /><i className="claw claw-a" /><i className="claw claw-b" />
            </div>
            <div className="robot-body">
              <span className="camera"><i /></span>
              <span className="body-line" />
              <span className="tank"><Droplets size={18} /></span>
              <span className="wheel wheel-left" /><span className="wheel wheel-right" />
            </div>
            <span className="plant plant-a"><Sprout /></span>
            <span className="plant plant-b"><Sprout /></span>
            <span className="plant plant-c"><Sprout /></span>
            <span className="scan-beam" />
          </div>
          <div className="risk-card">
            <div><span>B-01 地塊</span><strong style={{ color: '#e97954' }}>高風險</strong></div>
            <div className="risk-line"><i /><i /><i /><i className="hot" /><i className="hot" /><i className="peak" /></div>
            <small>葉片光譜異常 · 建議精準處置</small>
          </div>
        </div>
      </section>

      <section className="trust-strip" id="overview">
        <span>核心技術路線</span>
        <div><strong>YOLO</strong><i /> <strong>LeRobot</strong><i /> <strong>SO-101</strong><i /> <strong>Raspberry Pi</strong><i /> <strong>MQTT</strong></div>
      </section>

      <section className="section dashboard-section" id="monitor">
        <div className="section-heading split">
          <div>
            <span className="kicker">LIVE FIELD</span>
            <h2>一張圖，掌握全田風險。</h2>
          </div>
          <div className="live-clock"><i /> 即時數據 · {now.toLocaleTimeString('zh-Hant', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        </div>

        <div className="dashboard-shell">
          <aside className="dash-sidebar">
            <div className="mini-brand"><span><Leaf size={17} /></span> 智護田控制台</div>
            <div className="side-title">示範農場</div>
            <button className={activePanel === 'overview' ? 'side-active' : ''} onClick={() => setActivePanel('overview')}><Activity size={17} /> 總覽 <span>6</span></button>
            <button className={activePanel === 'alerts' ? 'side-active' : ''} onClick={() => setActivePanel('alerts')}><ShieldCheck size={17} /> 預警中心 <b>2</b></button>
            <button className={activePanel === 'robot' ? 'side-active' : ''} onClick={() => setActivePanel('robot')}><Bot size={17} /> 機器人</button>
            <button className={activePanel === 'sensors' ? 'side-active' : ''} onClick={() => setActivePanel('sensors')}><Radio size={17} /> 感測節點</button>
            <button className={activePanel === 'integration' ? 'side-active' : ''} onClick={() => setActivePanel('integration')}><PlugZap size={17} /> 裝置接入 <i>NEW</i></button>
            <div className="side-spacer" />
            <div className="robot-mini">
              <div><Bot size={18} /><span><strong>FG-01</strong><small>{patrolling ? '巡田中' : '已暫停'}</small></span></div>
              <button onClick={() => setPatrolling((v) => !v)} aria-label={patrolling ? '暫停巡田' : '繼續巡田'}>
                {patrolling ? <Pause size={14} /> : <Play size={14} />}
              </button>
            </div>
          </aside>

          <div className="dash-main">
            <div className="mobile-workspace-tabs">
              {[
                ['overview', '總覽'], ['alerts', '預警'], ['robot', '機器人'], ['sensors', '感測'], ['integration', '接入'],
              ].map(([key, label]) => <button key={key} className={activePanel === key ? 'active' : ''} onClick={() => setActivePanel(key)}>{label}</button>)}
            </div>
            {activePanel === 'overview' ? <>
            <div className="dash-topline">
              <div><strong>上午好，守田人</strong><span>全場 6 個地塊，2 個需要關注</span></div>
              <div className="weather"><Sun size={20} /><span><strong>26.8°C</strong><small>晴 · 適宜巡田</small></span></div>
            </div>

            <div className="stat-grid">
              <article><span className="stat-icon green"><Leaf /></span><div><small>作物健康度</small><strong>86.4<em>%</em></strong><b>較昨日 +2.1%</b></div></article>
              <article><span className="stat-icon amber"><ShieldCheck /></span><div><small>平均風險指數</small><strong>36.8</strong><b>可控範圍</b></div></article>
              <article><span className="stat-icon blue"><Bot /></span><div><small>今日覆蓋</small><strong>2.8<em> ha</em></strong><b>任務完成 78%</b></div></article>
              <article><span className="stat-icon purple"><Droplets /></span><div><small>節省藥劑</small><strong>64<em>%</em></strong><b>精準噴灑估算</b></div></article>
            </div>

            <div className="dash-content-grid">
              <article className="panel field-panel">
                <div className="panel-head"><div><strong>地塊風險圖</strong><span>點擊地塊查看處置建議</span></div><span className="legend"><i className="low" />低 <i className="mid" />中 <i className="high" />高</span></div>
                <div className="field-map">
                  {zones.map((zone) => (
                    <button
                      key={zone.id}
                      className={`field-cell ${zone.status} ${selectedZone.id === zone.id ? 'selected' : ''}`}
                      onClick={() => selectZone(zone)}
                    >
                      <span>{zone.id}</span><strong>{zone.crop}</strong><b>{zone.risk}</b><small>風險指數</small>
                    </button>
                  ))}
                  <div className={`rover ${patrolling ? 'moving' : ''}`}><Bot size={15} /><span>FG-01</span></div>
                </div>
              </article>

              <article className="panel risk-panel">
                <div className="panel-head"><div><strong>{selectedZone.id} 智能研判</strong><span>{selectedZone.crop} · 最新樣本 1 分鐘前</span></div><span className={`risk-pill ${riskState.key}`}>{riskState.label}</span></div>
                <div className="gauge-wrap">
                  <div className="gauge" style={{ '--risk': `${risk * 1.8}deg`, '--risk-color': riskState.color }}>
                    <div><strong>{risk}</strong><span>/ 100</span></div>
                  </div>
                  <input aria-label="調整風險模擬值" type="range" min="0" max="100" value={risk} onChange={(e) => setRisk(Number(e.target.value))} />
                  <small>拖動滑桿模擬感測數據變化</small>
                </div>
                <div className="factor-list">
                  <div><span>光譜異常</span><i><b style={{ width: `${Math.min(100, risk + 12)}%` }} /></i><strong>{Math.min(100, risk + 12)}</strong></div>
                  <div><span>病斑面積</span><i><b style={{ width: `${Math.max(4, risk - 8)}%` }} /></i><strong>{Math.max(4, risk - 8)}</strong></div>
                  <div><span>環境風險</span><i><b style={{ width: `${selectedZone.humidity}%` }} /></i><strong>{selectedZone.humidity}</strong></div>
                </div>
                <button className="action-button" onClick={() => runAction(currentAction.label)}>
                  <currentAction.icon size={18} /> 執行：{currentAction.label} <ArrowRight size={16} />
                </button>
              </article>
            </div>

            <div className="bottom-grid">
              <article className="panel environment-panel">
                <div className="panel-head"><strong>環境感測</strong><span>ESP32-S3 · 在線</span></div>
                <div className="env-items">
                  <div><Thermometer /><span><small>空氣溫度</small><strong>{selectedZone.temp}°C</strong></span></div>
                  <div><Droplets /><span><small>相對濕度</small><strong>{selectedZone.humidity}%</strong></span></div>
                  <div><Wind /><span><small>風速</small><strong>1.8 m/s</strong></span></div>
                </div>
              </article>
              <article className="panel events-panel">
                <div className="panel-head"><strong>處置動態</strong><button>查看全部</button></div>
                <div className="event-row">
                  {events.slice(0, 3).map((event) => <div key={event.time}><span className={event.tone}><event.icon /></span><p><strong>{event.title}</strong><small>{event.detail}</small></p><time>{event.time}</time></div>)}
                </div>
              </article>
            </div>
            </> : <DashboardPanels activePanel={activePanel} patrolling={patrolling} setPatrolling={setPatrolling} notify={showNotice} />}
          </div>
        </div>
      </section>

      <section className="section loop-section" id="loop">
        <div className="section-heading center">
          <span className="kicker">CLOSED LOOP</span>
          <h2>不只看見問題，更自主解決。</h2>
          <p>風險上升時，系統選擇最小必要干預；處置後重新監測，讓每次行動都能被量化驗證。</p>
        </div>
        <div className="loop-track">
          {[
            { no: '01', icon: ScanLine, title: '多模態感知', text: 'RGB + 多光譜 + 環境數據', tone: 'sage' },
            { no: '02', icon: Activity, title: 'AI 風險研判', text: '連續評分與分級預警', tone: 'gold' },
            { no: '03', icon: Bot, title: '自主處置', text: '抓取 · 驅離 · 精準噴灑', tone: 'orange' },
            { no: '04', icon: ShieldCheck, title: '效果回測', text: '更新評分並優化策略', tone: 'green' },
          ].map((item, index) => (
            <div className={`loop-card ${item.tone}`} key={item.no}>
              <span>{item.no}</span><item.icon /><h3>{item.title}</h3><p>{item.text}</p>
              {index < 3 && <i className="loop-arrow"><ArrowRight /></i>}
            </div>
          ))}
        </div>

        <div className="response-matrix">
          <div className="matrix-copy">
            <span className="kicker">MINIMUM INTERVENTION</span>
            <h3>先物理防治，必要時才施藥。</h3>
            <p>相同的「有蟲」不應得到相同答案。系統依目標類型和危害程度，從溫和到積極逐級選擇手段。</p>
            <ul>
              <li><Check /> 虫卵與慢速幼蟲：柔性抓手清除</li>
              <li><Check /> 鳥類與小型動物：隨機化聲光驅離</li>
              <li><Check /> 高風險病害：定點、定量精準噴灑</li>
            </ul>
          </div>
          <div className="matrix-table">
            {[
              { range: '0–30', name: '常規', desc: '持續監測', icon: Activity, width: '25%', tone: 'green' },
              { range: '30–50', name: '關注', desc: '加密採樣、近距確認', icon: ScanLine, width: '48%', tone: 'yellow' },
              { range: '50–70', name: '警告', desc: '機械抓取或聲光驅離', icon: Grip, width: '70%', tone: 'orange' },
              { range: '70–100', name: '嚴重', desc: '精準噴灑、立即回測', icon: Droplets, width: '100%', tone: 'red' },
            ].map((row) => <div className={`matrix-row ${row.tone}`} key={row.range}><span>{row.range}</span><row.icon /><p><strong>{row.name}</strong><small>{row.desc}</small></p><i><b style={{ width: row.width }} /></i></div>)}
          </div>
        </div>
      </section>

      <section className="architecture-section" id="architecture">
        <div className="section architecture-inner">
          <div className="section-heading split light">
            <div><span className="kicker">CLOUD · EDGE · DEVICE</span><h2>讓每一層，做它最擅長的事。</h2></div>
            <p>即使農田斷網，核心判斷和執行仍可在本地完成；網路恢復後再同步資料到雲端。</p>
          </div>
          <div className="layer-grid">
            {techLayers.map((layer) => <article key={layer.number}><span>{layer.number} / {layer.label}</span><layer.icon /><h3>{layer.title}</h3><p>{layer.text}</p><i /></article>)}
          </div>
          <div className="open-source-card">
            <div className="source-icon"><CodeXml /></div>
            <div><span>OPEN-SOURCE FOUNDATION</span><h3>站在開源機器人的肩膀上。</h3><p>採用 SO-101 低成本機械臂結構，配合 LeRobot 的統一控制與數據接口，縮短從原型到田間驗證的距離。</p></div>
            <div className="repo-links">
              <a href="https://github.com/TheRobotStudio/SO-ARM100" target="_blank" rel="noreferrer"><span><strong>SO-101</strong><small>硬體結構與組裝</small></span><ArrowRight /></a>
              <a href="https://github.com/huggingface/lerobot" target="_blank" rel="noreferrer"><span><strong>LeRobot</strong><small>具身智能訓練框架</small></span><ArrowRight /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="section final-cta">
        <div className="cta-mark"><Leaf /></div>
        <span className="kicker">SMART FARMING, MADE REAL</span>
        <h2>把科技帶進田裡，<br />讓農業更有餘裕。</h2>
        <p>少一點浪費，多一點提前；讓每一次防治都有依據。</p>
        <a className="button primary" href="#monitor">體驗智能巡田 <ArrowRight /></a>
      </section>

      <footer>
        <div className="brand footer-brand"><span className="brand-mark"><Leaf size={18} /></span><span>智護田</span><em>FIELDGUARD AI</em></div>
        <p>多模態感知與 AI 驅動的農作物病蟲害智能防治機器人系統</p>
        <span>方向 2 · 智慧農業與鄉村數智建設 · 2026</span>
      </footer>

      <button className="floating-console-3d" onClick={() => openDashboard('overview')}><Activity />控制台</button>
      <button className="guide-trigger" onClick={() => { setGuideStep(0); setShowGuide(true) }}><Sparkles />新手指引</button>

      {showGuide && (
        <div className="guide-overlay" role="dialog" aria-modal="true" aria-label="智護田新手指引">
          <div className="guide-card">
            <button className="guide-close" onClick={finishGuide} aria-label="關閉新手指引"><X /></button>
            <span className="guide-count">0{guideStep + 1} / 03</span>
            <div className="guide-icon">{guideStep === 0 ? <Activity /> : guideStep === 1 ? <ShieldCheck /> : <PlugZap />}</div>
            <h3>{['先看全田風險', '再處理預警與任務', '最後接入真實裝置'][guideStep]}</h3>
            <p>{[
              '點擊地塊即可切換溫濕度、風險分數與建議處置；拖動風險滑桿可演示模型分級。',
              '左側可進入預警中心、機器人與感測節點。按鈕都可以操作，適合直接向評審演示。',
              '在「裝置接入」填入 MQTT WebSocket、API 和裝置 ID，即可替換目前的模擬資料。',
            ][guideStep]}</p>
            <div className="guide-dots"><i className={guideStep === 0 ? 'active' : ''} /><i className={guideStep === 1 ? 'active' : ''} /><i className={guideStep === 2 ? 'active' : ''} /></div>
            <div className="guide-actions">
              <button onClick={finishGuide}>跳過，直接進入</button>
              <button className="guide-next button-3d" onClick={() => guideStep < 2 ? setGuideStep((step) => step + 1) : finishGuide()}>{guideStep < 2 ? '下一步' : '開始使用'} <ArrowRight /></button>
            </div>
          </div>
        </div>
      )}

      {notice && <div className="toast"><Check size={17} /> {notice}</div>}
    </main>
  )
}

export default App
