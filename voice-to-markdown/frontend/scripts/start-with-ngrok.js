#!/usr/bin/env node

import { spawn } from 'child_process'
import fetch from 'node-fetch'
import qrcode from 'qrcode-terminal'
import waitOn from 'wait-on'

console.log('🚀 Starting development server with ngrok...\n')

// Vite 서버 시작
console.log('📦 Starting Vite development server...')
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: ['inherit', 'inherit', 'inherit'],
  shell: true
})

// Vite 서버가 준비될 때까지 대기
console.log('⏳ Waiting for Vite server to be ready...')
await waitOn({
  resources: ['http://localhost:5173'],
  timeout: 30000,
  interval: 1000
})

console.log('✅ Vite server is ready!')

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
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 DEVELOPMENT SERVER READY!')
    console.log('='.repeat(60))
    console.log(`📱 Mobile URL: ${ngrokUrl}`)
    console.log(`💻 Local URL:  http://localhost:5173`)
    console.log(`🔧 Admin:      http://localhost:4040`)
    console.log('='.repeat(60))
    
    // QR 코드 생성
    console.log('\n📱 QR Code for mobile access:')
    qrcode.generate(ngrokUrl, { small: true })
    
    console.log('\n💡 Tips:')
    console.log('- Scan the QR code with your phone camera')
    console.log('- Or copy the Mobile URL to your phone browser')
    console.log('- Press Ctrl+C to stop both servers')
    console.log('\n🔥 Happy coding! 🔥\n')
    
  } else {
    console.error('❌ Could not get ngrok URL')
  }
} catch (error) {
  console.error('❌ Error fetching ngrok URL:', error.message)
}

// 프로세스 종료 처리
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...')
  viteProcess.kill()
  ngrokProcess.kill()
  process.exit(0)
})

process.on('SIGTERM', () => {
  viteProcess.kill()
  ngrokProcess.kill()
  process.exit(0)
})
