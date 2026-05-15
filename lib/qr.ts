import QRCode from "qrcode";

export async function createQrSvg(payload: string) {
  return QRCode.toString(payload, {
    type: "svg",
    margin: 1,
    width: 320,
    color: {
      dark: "#071018",
      light: "#ffffff"
    }
  });
}

export function publicQrUrl(origin: string, token: string) {
  return `${origin.replace(/\/$/, "")}/qr/${token}`;
}
