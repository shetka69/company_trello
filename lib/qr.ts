import QRCode from "qrcode";

export async function createQrSvg(payload: string, productNumber?: string) {
  const qrSvg = await QRCode.toString(payload, {
    type: "svg",
    margin: 1,
    width: 320,
    color: {
      dark: "#071018",
      light: "#ffffff"
    }
  });

  if (!productNumber) return qrSvg;

  const embeddedQr = qrSvg
    .replace(/\swidth="[^"]*"/, "")
    .replace(/\sheight="[^"]*"/, "")
    .replace("<svg ", '<svg x="20" y="16" width="320" height="320" ');
  const safeProductNumber = escapeSvgText(productNumber);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="392" viewBox="0 0 360 392" role="img" aria-label="QR ${safeProductNumber}">
<rect width="360" height="392" rx="18" fill="#ffffff"/>
${embeddedQr}
<text x="180" y="358" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#071018">${safeProductNumber}</text>
<text x="180" y="378" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" letter-spacing="1.2" fill="#64748b">ASIA MUSIC</text>
</svg>`;
}

export function publicQrUrl(origin: string, token: string) {
  return `${origin.replace(/\/$/, "")}/qr/${token}`;
}

function escapeSvgText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
