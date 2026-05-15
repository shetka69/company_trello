import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ProductPresetForm,
  PublicQrLink,
  QrCodeCreateForm,
  QrDeleteButton,
  QrDeleteRequestButton,
  QrShipButton,
  QrWarehouseButton,
  qrStatusLabels
} from "@/components/qr/qr-forms";
import { QrScanner } from "@/components/qr/qr-scanner";
import { requirePermission, requireUser } from "@/lib/auth";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function QrCodesPage() {
  const user = await requireUser();
  requirePermission(user, "qr:read");
  const canManageQr = hasUserPermission(user, "qr:manage");
  const canDeleteQr = user.role.code === "DEVELOPER" || user.role.code === "MANAGER";
  const canSeePublicQrLink = user.role.code === "DEVELOPER";

  const [presets, codes] = await Promise.all([
    prisma.qrProductPreset.findMany({
      where: { companyId: user.companyId },
      orderBy: { name: "asc" }
    }),
    prisma.productQrCode.findMany({
      where: { companyId: user.companyId },
      include: { createdBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">QR-коды изделий</h1>
          <p className="mt-1 text-sm text-muted">Генерация, хранение и повторный просмотр QR-паспортов колонок</p>
        </div>
      </div>

      <QrScanner />

      {canManageQr && (
        <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
          <Card>
            <h2 className="mb-4 text-base font-semibold">Пресеты колонок</h2>
            <ProductPresetForm />
            <div className="mt-4 flex flex-wrap gap-2">
              {presets.length === 0 && <p className="text-sm text-muted">Пресетов пока нет.</p>}
              {presets.map((preset) => (
                <Badge key={preset.id}>{preset.name}</Badge>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-base font-semibold">Новый QR-код</h2>
            <QrCodeCreateForm presets={presets} />
          </Card>
        </div>
      )}

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Созданные QR-коды</h2>
          <Badge>{codes.length}</Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {codes.length === 0 && <p className="text-sm text-muted">QR-кодов пока нет.</p>}
          {codes.map((code) => (
            <article key={code.id} className="grid gap-4 overflow-hidden rounded-md border border-stroke bg-surface p-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <div
                className="mx-auto aspect-[360/392] w-full max-w-[180px] rounded-md bg-white p-2 [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: code.qrSvg }}
              />
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">{code.productName}</h3>
                    <p className="mt-1 text-sm text-muted">Номер: {code.productNumber}</p>
                  </div>
                  <Badge variant={code.status === "SHIPPED" ? "green" : code.status === "WAREHOUSE" ? "blue" : "amber"}>{qrStatusLabels[code.status]}</Badge>
                </div>

                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <Info label="Дата изготовления" value={formatDate(code.manufacturedAt)} />
                  <Info label="Кому едет" value={code.recipient} />
                  <Info label="Куда едет" value={code.destination} />
                  <Info label="Срок отправки" value={formatDate(code.shippingDueAt)} />
                  <Info label="Создал" value={code.createdBy.name} />
                  {canSeePublicQrLink && <Info label="Ссылка" value={code.qrPayload} />}
                </dl>

                <div className="flex flex-wrap gap-2">
                  {canSeePublicQrLink && <PublicQrLink token={code.token} />}
                  {canManageQr && code.status === "WAITING" && <QrWarehouseButton codeId={code.id} />}
                  {canManageQr && code.status !== "SHIPPED" && <QrShipButton codeId={code.id} />}
                  {canDeleteQr ? <QrDeleteButton codeId={code.id} /> : <QrDeleteRequestButton codeId={code.id} />}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-panel px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 truncate font-medium">{value}</dd>
    </div>
  );
}
