import { NotificationChannel, NotificationPriority, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type NotifyInput = {
  companyId: string;
  userId?: string | null;
  title: string;
  body: string;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  meta?: Prisma.InputJsonValue;
};

export async function createNotification(input: NotifyInput) {
  const notification = await prisma.notification.create({
    data: {
      companyId: input.companyId,
      userId: input.userId,
      title: input.title,
      body: input.body,
      priority: input.priority ?? "NORMAL",
      channel: input.channel ?? "INTERNAL",
      meta: input.meta
    }
  });

  if (input.channel === "TELEGRAM") {
    await sendTelegramNotification(input);
  }

  return notification;
}

export async function createLowStockNotification(input: {
  companyId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  minThreshold: number;
}) {
  const existing = await prisma.notification.findFirst({
    where: {
      companyId: input.companyId,
      priority: "CRITICAL",
      readAt: null,
      meta: {
        path: ["itemId"],
        equals: input.itemId
      }
    },
    select: { id: true }
  });

  if (existing) return null;

  return createNotification({
    companyId: input.companyId,
    title: "Низкий остаток на складе",
    body: `${input.itemName}: ${input.quantity} ${input.unit}, минимум ${input.minThreshold} ${input.unit}`,
    priority: "CRITICAL",
    meta: { itemId: input.itemId, reason: "low_stock" }
  });
}

export async function resolveLowStockNotification(input: { companyId: string; itemId: string }) {
  await prisma.notification.updateMany({
    where: {
      companyId: input.companyId,
      readAt: null,
      meta: {
        path: ["itemId"],
        equals: input.itemId
      }
    },
    data: { readAt: new Date() }
  });
}

async function sendTelegramNotification(input: NotifyInput) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !input.userId) return;

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { telegramChatId: true }
  });

  if (!user?.telegramChatId) return;

  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: user.telegramChatId,
      text: `${input.title}\n${input.body}`
    })
  });
}
