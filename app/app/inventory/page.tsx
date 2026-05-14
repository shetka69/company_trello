import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InventoryFilters } from "@/components/inventory/inventory-filters";
import {
  DeliveryCreateForm,
  DeliveryDeleteButton,
  DeliveryEditForm,
  DeliveryReceiveForm,
  InventoryItemCreateForm,
  InventoryItemDeleteButton,
  InventoryItemEditForm,
  InventoryTransactionForm
} from "@/components/inventory/inventory-forms";
import { requirePermission, requireUser } from "@/lib/auth";
import { inventoryScopeFor } from "@/lib/data-scope";
import { hasUserPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const transactionLabels = {
  INCOME: "Приход",
  WRITE_OFF: "Списание",
  ADJUSTMENT: "Корректировка",
  PICKUP: "Выдача"
};

const deliveryStatusLabels: Record<string, string> = {
  planned: "Запланирована",
  in_transit: "В пути",
  received: "Принята",
  cancelled: "Отменена"
};

type SearchParams = {
  q?: string;
  category?: string;
  responsibleId?: string;
  low?: string;
  view?: string;
};

export default async function InventoryPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const user = await requireUser();
  requirePermission(user, "inventory:read");
  const params = (await searchParams) ?? {};
  const canManageInventory = hasUserPermission(user, "inventory:manage");
  const itemScope = inventoryScopeFor(user);
  const itemWhere = buildInventoryWhere(itemScope, params);
  const [items, transactions, deliveries, users, categories] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: itemWhere,
      include: { responsible: { select: { name: true } } },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.inventoryTransaction.findMany({
      where: { item: { companyId: user.companyId } },
      include: { item: true, user: true },
      take: 12,
      orderBy: { createdAt: "desc" }
    }),
    prisma.delivery.findMany({
      where: { companyId: user.companyId },
      orderBy: { expectedAt: "asc" }
    }),
    canManageInventory
      ? prisma.user.findMany({
          where: { companyId: user.companyId, isActive: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" }
        })
      : [],
    prisma.inventoryItem.findMany({
      where: itemScope,
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" }
    })
  ]);
  const itemOptions = items.map((item) => ({ id: item.id, name: item.name, unit: item.unit }));
  const view = params.view === "table" ? "table" : "cards";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Склад и ресурсы</h1>
          <p className="mt-1 text-sm text-muted">Остатки, минимальные пороги, поставки и движение ресурсов</p>
        </div>
        {canManageInventory && (
          <div className="flex flex-wrap gap-2">
            <InventoryItemCreateForm users={users} />
            <DeliveryCreateForm />
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        <InventoryFilters categories={categories.map((item) => item.category)} users={users} />
      </Suspense>

      {items.length === 0 && <Card className="text-sm text-muted">Ресурсы по выбранным фильтрам не найдены</Card>}

      {items.length > 0 && view === "cards" && (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const low = item.quantity <= item.minThreshold;
          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{item.name}</h2>
                  <p className="mt-1 text-sm text-muted">{item.category}</p>
                </div>
                <Badge variant={low ? "red" : "green"}>{low ? "Низкий" : "В норме"}</Badge>
              </div>
              <div className="mt-5 text-3xl font-semibold">
                {item.quantity} <span className="text-base text-muted">{item.unit}</span>
              </div>
              <div className="mt-3 text-sm text-muted">
                Минимум: {item.minThreshold} {item.unit}
              </div>
              <div className="mt-2 text-sm text-muted">Ответственный: {item.responsible?.name ?? "Не назначен"}</div>
              {item.comments && <div className="mt-3 rounded-md bg-surface p-3 text-sm leading-5 text-muted">{item.comments}</div>}
              {canManageInventory && (
                <>
                  <InventoryTransactionForm item={{ id: item.id, quantity: item.quantity, unit: item.unit }} />
                  <InventoryItemEditForm
                    item={{
                      id: item.id,
                      name: item.name,
                      category: item.category,
                      quantity: item.quantity,
                      unit: item.unit,
                      minThreshold: item.minThreshold,
                      responsibleId: item.responsibleId,
                      comments: item.comments
                  }}
                  users={users}
                />
                  <InventoryItemDeleteButton itemId={item.id} name={item.name} />
                </>
              )}
            </Card>
          );
        })}
      </div>
      )}

      {items.length > 0 && view === "table" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead className="text-xs uppercase text-muted">
                <tr className="border-b border-stroke">
                  <th className="py-3 pr-4">Название</th>
                  <th className="py-3 pr-4">Категория</th>
                  <th className="py-3 pr-4">Остаток</th>
                  <th className="py-3 pr-4">Минимум</th>
                  <th className="py-3 pr-4">Ответственный</th>
                  <th className="py-3 pr-4">Статус</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const low = item.quantity <= item.minThreshold;
                  return (
                    <tr key={item.id} className="border-b border-stroke/70">
                      <td className="py-3 pr-4 font-medium">{item.name}</td>
                      <td className="py-3 pr-4 text-muted">{item.category}</td>
                      <td className="py-3 pr-4">{item.quantity} {item.unit}</td>
                      <td className="py-3 pr-4 text-muted">{item.minThreshold} {item.unit}</td>
                      <td className="py-3 pr-4 text-muted">{item.responsible?.name ?? "Не назначен"}</td>
                      <td className="py-3 pr-4"><Badge variant={low ? "red" : "green"}>{low ? "Низкий" : "В норме"}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-base font-semibold">Движение ресурсов</h2>
          <div className="space-y-2">
            {transactions.length === 0 && <p className="text-sm text-muted">Пока нет операций</p>}
            {transactions.map((transaction) => (
              <div key={transaction.id} className="rounded-md bg-surface p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium">{transaction.item.name}</div>
                  <Badge>{transactionLabels[transaction.type]}</Badge>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {transaction.quantity} {transaction.item.unit} · {transaction.user?.name ?? "Система"} · {formatDate(transaction.createdAt)}
                </div>
                {transaction.comment && <div className="mt-2 text-sm text-muted">{transaction.comment}</div>}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-base font-semibold">Поставки</h2>
          <div className="space-y-2">
            {deliveries.length === 0 && <p className="text-sm text-muted">Поставок пока нет</p>}
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="rounded-md bg-surface p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="text-sm font-medium">{delivery.title}</div>
                  <Badge variant={delivery.status === "received" ? "green" : delivery.status === "cancelled" ? "red" : "amber"}>
                    {deliveryStatusLabels[delivery.status] ?? delivery.status}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {delivery.supplier ?? "Поставщик не указан"} · {delivery.status} · {formatDate(delivery.expectedAt)}
                </div>
                {delivery.receivedAt && <div className="mt-1 text-xs text-muted">Принята: {formatDate(delivery.receivedAt)}</div>}
                {canManageInventory && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <DeliveryReceiveForm
                      delivery={{
                        id: delivery.id,
                        title: delivery.title,
                        supplier: delivery.supplier,
                        expectedAt: delivery.expectedAt?.toISOString() ?? null,
                        receivedAt: delivery.receivedAt?.toISOString() ?? null,
                        status: delivery.status
                      }}
                      items={itemOptions}
                    />
                    <DeliveryEditForm
                      delivery={{
                        id: delivery.id,
                        title: delivery.title,
                        supplier: delivery.supplier,
                        expectedAt: delivery.expectedAt?.toISOString() ?? null,
                        receivedAt: delivery.receivedAt?.toISOString() ?? null,
                        status: delivery.status
                      }}
                    />
                    <DeliveryDeleteButton deliveryId={delivery.id} title={delivery.title} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function buildInventoryWhere(baseScope: Prisma.InventoryItemWhereInput, params: SearchParams): Prisma.InventoryItemWhereInput {
  const filters: Prisma.InventoryItemWhereInput[] = [baseScope];

  if (params.q?.trim()) {
    const contains = { contains: params.q.trim(), mode: "insensitive" as const };
    filters.push({ OR: [{ name: contains }, { category: contains }, { comments: contains }] });
  }

  if (params.category) filters.push({ category: params.category });
  if (params.responsibleId) filters.push({ responsibleId: params.responsibleId });
  if (params.low === "1") filters.push({ quantity: { lte: prisma.inventoryItem.fields.minThreshold } });

  return { AND: filters };
}
