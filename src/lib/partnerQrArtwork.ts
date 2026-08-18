import QRCode from 'qrcode'
import type { PartnerCodeItem } from '../types/codeCentre'
import { getPartnerScanUrl } from '../utils/partnerScanUrl'

export interface PartnerQrArtwork {
  pngUrl?: string
  svgUrl?: string
}

const qrColors = {
  dark: '#0a0908',
  light: '#f6f1e8',
}

export async function resolvePartnerQrArtwork(
  code: Pick<PartnerCodeItem, 'alphanumeric' | 'qrPngUrl' | 'qrSvgUrl' | 'scanUrl'>,
): Promise<PartnerQrArtwork> {
  if (code.qrPngUrl || code.qrSvgUrl) {
    return {
      pngUrl: code.qrPngUrl,
      svgUrl: code.qrSvgUrl,
    }
  }

  if (!code.alphanumeric.trim()) {
    return {}
  }

  const target = getPartnerScanUrl(code.alphanumeric, code.scanUrl)

  try {
    const [pngUrl, svgMarkup] = await Promise.all([
      QRCode.toDataURL(target, {
        width: 296,
        margin: 1,
        color: qrColors,
      }),
      QRCode.toString(target, {
        type: 'svg',
        margin: 1,
        color: qrColors,
      }),
    ])

    return {
      pngUrl,
      svgUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`,
    }
  } catch {
    return {}
  }
}
