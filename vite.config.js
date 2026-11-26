import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// O front roda em localhost:5173 e a API em localhost:8000.
// O "proxy" faz o Vite repassar para a API tudo que começa com /api.
// Assim o navegador acha que é tudo o mesmo endereço e não precisa liberar CORS na API.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const enderecoApi = env.API_URL || 'http://localhost:8000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': enderecoApi,
        '/health': enderecoApi,
      },
    },
  }
})
