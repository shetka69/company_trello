import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { QrDeleteButton, QrDeleteRequestButton, QrShipButton, QrWarehouseButton, qrStatusLabels } from "@/components/qr/qr-forms";
import { getCurrentUser } from "@/lib/auth";
import { companyDisplayName } from "@/lib/company-display";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function PublicQrPassportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [code, user] = await Promise.all([
    prisma.productQrCode.findUnique({
      where: { token },
      include: { company: { select: { name: true } }, createdBy: { select: { name: true } } }
    }),
    getCurrentUser()
  ]);

  if (!code) {
    notFound();
  }

  const canSeeInternal = Boolean(user && user.companyId === code.companyId && hasUserPermission(user, "qr:read"));
  const canShip = Boolean(user && user.companyId === code.companyId && hasUserPermission(user, "qr:manage") && code.status !== "SHIPPED");
  const canDeleteQr = Boolean(user && user.companyId === code.companyId && (user.role.code === "DEVELOPER" || user.role.code === "MANAGER"));
  const canSeePublicQrLink = Boolean(user && user.companyId === code.companyId && user.role.code === "DEVELOPER");
  const companyName = companyDisplayName(code.company.name);

  return (
    <main className="min-h-screen bg-surface px-4 py-8 text-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        {canSeeInternal && (
          <Link href="/app/qr" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-text">
            <ArrowLeft size={16} />
            К QR-кодам
          </Link>
        )}

        <section className="overflow-hidden rounded-lg border border-stroke bg-panel">
          <div className="border-b border-stroke bg-panelSoft p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-sm text-muted">Паспорт изделия</div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">{code.productName}</h1>
                <p className="mt-1 text-sm text-muted">Номер изделия: {code.productNumber}</p>
              </div>
              <Badge variant={code.status === "SHIPPED" ? "green" : code.status === "WAREHOUSE" ? "blue" : "amber"}>{qrStatusLabels[code.status]}</Badge>
            </div>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-[280px_1fr]">
            <div
              className="mx-auto aspect-[360/392] w-full max-w-[280px] rounded-lg bg-white p-3 [&_svg]:h-full [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: code.qrSvg }}
            />

            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Название изделия" value={code.productName} />
                <Info label="Номер изделия" value={code.productNumber} />
                <Info label="Дата изготовления" value={formatDate(code.manufacturedAt)} />
                <Info label="Производитель" value={companyName} />
              </div>

              <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 shrink-0 text-emerald-200" size={22} />
                  <div>
                    <h2 className="font-semibold text-emerald-100">Проверка подлинности</h2>
                    <p className="mt-2 text-sm leading-6 text-emerald-50/80">
                      QR-код найден в базе {companyName}. Это официальный цифровой паспорт изделия.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-stroke bg-surface p-4">
                <h2 className="font-semibold">Гарантийный талон</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Info label="Изделие" value={code.productName} />
                  <Info label="Серийный номер" value={code.productNumber} />
                  <Info label="Дата изготовления" value={formatDate(code.manufacturedAt)} />
                  <Info label="Статус гарантии" value={code.status === "SHIPPED" ? "Проверяется по обращению" : "Изделие еще не отгружено"} />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Для гарантийного обращения свяжитесь с компанией и назовите номер изделия. Если устройство куплено повторно, гарантийный статус проверяется по истории изделия.
                </p>
              </div>

              {canSeeInternal && (
                <div className="rounded-lg border border-stroke bg-surface p-4">
                  <h2 className="font-semibold">Внутренние данные</h2>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Info label="Кому едет" value={code.recipient} />
                    <Info label="Куда едет" value={code.destination} />
                    <Info label="Срок отправки" value={formatDate(code.shippingDueAt)} />
                    <Info label="Создал" value={code.createdBy.name} />
                    <Info label="Отправлено" value={code.shippedAt ? formatDate(code.shippedAt) : "Еще не отправлено"} />
                    {canSeePublicQrLink && <Info label="Публичная ссылка" value={code.qrPayload} />}
                  </div>
                  {canShip && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {code.status === "WAITING" && <QrWarehouseButton codeId={code.id} />}
                      <QrShipButton codeId={code.id} />
                    </div>
                  )}
                  {canSeeInternal && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {canDeleteQr ? <QrDeleteButton codeId={code.id} /> : <QrDeleteRequestButton codeId={code.id} />}
                    </div>
                  )}
                </div>
              )}

              {!canSeeInternal && (
              <div className="rounded-lg border border-stroke bg-surface p-4">
                <h2 className="font-semibold">Связаться с компанией</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  При обращении сообщите номер изделия: <span className="font-semibold text-text">{code.productNumber}</span>.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-md bg-panel px-3 py-2">Паспорт изделия</span>
                  <span className="rounded-md bg-panel px-3 py-2">Гарантийный талон</span>
                  <span className="rounded-md bg-panel px-3 py-2">Проверка подлинности</span>
                </div>
              </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
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
