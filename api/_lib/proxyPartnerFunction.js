const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

function readQueryParam(query, keys) {
  for (const key of keys) {
    const value = query[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return undefined
}

export function createPartnerFunctionProxyHandler(functionName, queryMappings = []) {
  return async function handler(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ success: false, error: 'Method not allowed' })
    }

    if (!supabaseUrl || !anonKey) {
      return res.status(500).json({ success: false, error: 'Server download proxy is not configured.' })
    }

    const authorization = req.headers.authorization
    if (!authorization) {
      return res.status(401).json({ success: false, error: 'Missing authorization header' })
    }

    const url = new URL(`${supabaseUrl}/functions/v1/${functionName}`)

    for (const mapping of queryMappings) {
      const value = readQueryParam(req.query, mapping.from)
      if (value) {
        url.searchParams.set(mapping.to, value)
      }
    }

    const upstream = await fetch(url.toString(), {
      headers: {
        Authorization: authorization,
        apikey: anonKey,
      },
    })

    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'

    if (!upstream.ok) {
      if (contentType.includes('application/json')) {
        const payload = await upstream.text()
        res.setHeader('Content-Type', 'application/json')
        return res.status(upstream.status).send(payload)
      }

      return res.status(upstream.status).json({
        success: false,
        error: `Unable to download ${functionName}.`,
      })
    }

    const buffer = Buffer.from(await upstream.arrayBuffer())
    const disposition = upstream.headers.get('content-disposition')

    res.setHeader('Content-Type', contentType)
    if (disposition) {
      res.setHeader('Content-Disposition', disposition)
    }

    return res.status(200).send(buffer)
  }
}
