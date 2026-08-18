import { createPartnerFunctionProxyHandler } from './_lib/proxyPartnerFunction.js'

export default createPartnerFunctionProxyHandler('partner-code-pdf', [
  { from: ['code_id'], to: 'code_id' },
])
