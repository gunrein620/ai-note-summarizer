#!/usr/bin/env node

import { spawn } from 'child_process'
import fetch from 'node-fetch'
import qrcode from 'qrcode-terminal'
import waitOn from 'wait-on'

console.log('🚀 Starting Voice-to-Markdown with ngrok...\n')

// 백엔드와 프론트엔드 동시 시작
console.log('📦 Starting backend and frontend servers...')
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: ['inherit', 'inherit', 'inherit'],
  shell: true
})

// 서버들이 준비될 때까지 대기
console.log('⏳ Waiting for servers to be ready...')
await waitOn({
  resources: [
    'http-get://localhost:8000',  // 백엔드 (GET 요청)
    'http://localhost:5173'       // 프론트엔드
  ],
  timeout: 60000,
  interval: 1000
})

console.log('✅ Backend and frontend servers are ready!')

// ngrok 시작
console.log('🌐 Starting ngrok tunnel...')
const ngrokProcess = spawn('ngrok', ['http', '5173'], {
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: true
})

// ngrok API가 준비될 때까지 대기
console.log('⏳ Waiting for ngrok to be ready...')
await waitOn({
  resources: ['http://localhost:4040'],
  timeout: 30000,
  interval: 1000
})

// ngrok URL 가져오기
try {
  console.log('🔍 Fetching ngrok URL...')
  const response = await fetch('http://localhost:4040/api/tunnels')
  const data = await response.json()
  
  if (data.tunnels && data.tunnels.length > 0) {
    const tunnel = data.tunnels[0]
    const ngrokUrl = tunnel.public_url
    
    console.log('\n' + '='.repeat(70))
    console.log('🎉 VOICE-TO-MARKDOWN DEVELOPMENT SERVER READY!')
    console.log('='.repeat(70))
    console.log(`📱 Mobile URL:  ${ngrokUrl}`)
    console.log(`💻 Local URL:   http://localhost:5173`)
    console.log(`🔧 Backend:     http://localhost:8000`)
    console.log(`⚙️  ngrok Admin: http://localhost:4040`)
    console.log('='.repeat(70))
    
    // QR 코드 생성
    console.log('\n📱 QR Code for mobile access:')
    qrcode.generate(ngrokUrl, { small: true })
    
    console.log('\n💡 사용법:')
    console.log('- 휴대폰 카메라로 QR 코드 스캔')
    console.log('- 또는 Mobile URL을 휴대폰 브라우저에 입력')
    console.log('- Ctrl+C로 모든 서버 종료')
    console.log('\n🔥 음성을 마크다운으로 변환해보세요! 🔥\n')
    
  } else {
    console.error('❌ ngrok URL을 가져올 수 없습니다')
  }
} catch (error) {
  console.error('❌ ngrok URL 조회 오류:', error.message)
}

// 프로세스 종료 처리
process.on('SIGINT', () => {
  console.log('\n🛑 서버들을 종료합니다...')
  devProcess.kill()
  ngrokProcess.kill()
  process.exit(0)
})

process.on('SIGTERM', () => {
  devProcess.kill()
  ngrokProcess.kill()
  process.exit(0)
})
