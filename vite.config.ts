import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

function applyPartnerAuthHeaders(proxyReq: { setHeader: (name: string, value: string) => void }, req: { headers: { authorization?: string } }, env: Record<string, string>) {
  const authorization = req.headers.authorization
  if (authorization) {
    proxyReq.setHeader('Authorization', authorization)
  }
  if (env.VITE_SUPABASE_ANON_KEY) {
    proxyReq.setHeader('apikey', env.VITE_SUPABASE_ANON_KEY)
  }
}

function createPartnerFunctionProxy(functionName: string, env: Record<string, string>): ProxyOptions {
  return {
    target: env.VITE_SUPABASE_URL,
    changeOrigin: true,
    rewrite: () => `/functions/v1/${functionName}`,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq, req) => {
        applyPartnerAuthHeaders(proxyReq, req, env)
      })
    },
  }
}

function createPartnerCollateralProxy(env: Record<string, string>): ProxyOptions {
  return {
    target: env.VITE_SUPABASE_URL,
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq, req) => {
        const requestUrl = new URL(req.url ?? '', 'http://localhost')
        const template =
          requestUrl.searchParams.get('collateral_template') ??
          requestUrl.searchParams.get('template')
        const search = template ? `?template=${encodeURIComponent(template)}` : ''

        proxyReq.path = `/functions/v1/partner-collateral-pdf${search}`
        applyPartnerAuthHeaders(proxyReq, req, env)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const supabaseUrl = env.VITE_SUPABASE_URL

  return {
    plugins: [react()],
    server: supabaseUrl
      ? {
          proxy: {
            '/api/partner-code-pdf': createPartnerFunctionProxy('partner-code-pdf', env),
            '/api/partner-collateral-pdf': createPartnerCollateralProxy(env),
          },
        }
      : undefined,
  }
})
