import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n'
import './index.css'
import { wsSimulator } from '@/services/websocket-sim'

// 启动 WebSocket 模拟 (树莓派 5G 传感器数据推送)
wsSimulator.start()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
