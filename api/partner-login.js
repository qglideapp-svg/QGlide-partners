const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  if (!supabaseUrl || !anonKey) {
    return res.status(500).json({
      success: false,
      error: 'Sign-in is not configured on the server. Please contact support.',
    })
  }

  let upstream

  try {
    upstream = await fetch(`${supabaseUrl}/functions/v1/partner-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(req.body ?? {}),
    })
  } catch {
    return res.status(502).json({
      success: false,
      error: 'Unable to reach the sign-in service. Please try again.',
    })
  }

  const contentType = upstream.headers.get('content-type') ?? 'application/json'
  const payload = await upstream.text()

  res.setHeader('Content-Type', contentType.includes('application/json') ? 'application/json' : 'application/json')
  return res.status(upstream.status).send(payload || JSON.stringify({ success: false, error: 'Empty response from sign-in service.' }))
}
