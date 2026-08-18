import { createPartnerFunctionProxyHandler } from './_lib/proxyPartnerFunction.js'

export default createPartnerFunctionProxyHandler('partner-collateral-pdf', [
  { from: ['collateral_template', 'template'], to: 'template' },
])
