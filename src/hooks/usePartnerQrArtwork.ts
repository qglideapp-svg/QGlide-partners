import { useEffect, useState } from 'react'
import { resolvePartnerQrArtwork, type PartnerQrArtwork } from '../lib/partnerQrArtwork'
import type { PartnerCodeItem } from '../types/codeCentre'

export function usePartnerQrArtwork(
  code: Pick<PartnerCodeItem, 'alphanumeric' | 'qrPngUrl' | 'qrSvgUrl' | 'scanUrl'>,
): PartnerQrArtwork & { loading: boolean } {
  const [artwork, setArtwork] = useState<PartnerQrArtwork>({
    pngUrl: code.qrPngUrl,
    svgUrl: code.qrSvgUrl,
  })
  const [loading, setLoading] = useState(!code.qrPngUrl && !code.qrSvgUrl)

  useEffect(() => {
    let cancelled = false

    setArtwork({
      pngUrl: code.qrPngUrl,
      svgUrl: code.qrSvgUrl,
    })
    setLoading(!code.qrPngUrl && !code.qrSvgUrl)

    void resolvePartnerQrArtwork(code).then((resolved) => {
      if (cancelled) return
      setArtwork(resolved)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [code.alphanumeric, code.qrPngUrl, code.qrSvgUrl, code.scanUrl])

  return { ...artwork, loading }
}
