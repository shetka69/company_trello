import { PrismaClient, Priority, RoleCode, TaskStatus, TaskType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const password = "demo12345";

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);

  const company = await prisma.company.upsert({
    where: { slug: "demo" },
    update: {},
    create: { name: "Азия Мьюзик", slug: "demo" }
  });

  const roleData = [
    [RoleCode.MANAGER, "Руководитель"],
    [RoleCode.DEVELOPER, "Разработчик"],
    [RoleCode.ENGINEER, "Инженер"],
    [RoleCode.ASSEMBLER, "Сборщик"],
    [RoleCode.FOREMAN, "Бригадир"],
    [RoleCode.STOREKEEPER, "Кладовщик"],
    [RoleCode.TECHNOLOGIST, "Технолог"]
  ] as const;

  const roles = new Map<RoleCode, string>();
  for (const [code, name] of roleData) {
    const role = await prisma.role.upsert({
      where: { companyId_code: { companyId: company.id, code } },
      update: { name },
      create: { companyId: company.id, code, name }
    });
    roles.set(code, role.id);
  }

  const production = await prisma.department.upsert({
    where: { id: "demo-production" },
    update: {},
    create: { id: "demo-production", companyId: company.id, name: "Производство" }
  });

  const warehouse = await prisma.department.upsert({
    where: { id: "demo-warehouse" },
    update: {},
    create: { id: "demo-warehouse", companyId: company.id, name: "Склад" }
  });

  const usersData = [
    ["leader@demo.local", "Анна Руководитель", RoleCode.MANAGER, production.id],
    ["dev@demo.local", "Илья Разработчик", RoleCode.DEVELOPER, production.id],
    ["engineer@demo.local", "Олег Инженер", RoleCode.ENGINEER, production.id],
    ["assembler@demo.local", "Максим Сборщик", RoleCode.ASSEMBLER, production.id],
    ["foreman@demo.local", "Виктор Бригадир", RoleCode.FOREMAN, production.id],
    ["keeper@demo.local", "Мария Кладовщик", RoleCode.STOREKEEPER, warehouse.id],
    ["technologist@demo.local", "Елена Технолог", RoleCode.TECHNOLOGIST, production.id]
  ] as const;

  const users = new Map<string, string>();
  for (const [email, name, roleCode, departmentId] of usersData) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, roleId: roles.get(roleCode)!, departmentId },
      create: {
        companyId: company.id,
        departmentId,
        roleId: roles.get(roleCode)!,
        email,
        name,
        passwordHash
      }
    });
    users.set(email, user.id);
  }

  const project = await prisma.project.upsert({
    where: { id: "demo-project-1" },
    update: {},
    create: {
      id: "demo-project-1",
      companyId: company.id,
      name: "Линия сборки A",
      description: "Запуск и обслуживание производственной линии"
    }
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: users.get("engineer@demo.local")! },
      { projectId: project.id, userId: users.get("assembler@demo.local")! },
      { projectId: project.id, userId: users.get("foreman@demo.local")! }
    ],
    skipDuplicates: true
  });

  const cable = await prisma.inventoryItem.upsert({
    where: { id: "demo-item-cable" },
    update: { quantity: 14, minThreshold: 20 },
    create: {
      id: "demo-item-cable",
      companyId: company.id,
      responsibleId: users.get("keeper@demo.local"),
      name: "Кабель силовой 3x2.5",
      category: "Расходники",
      quantity: 14,
      unit: "м",
      minThreshold: 20,
      comments: "Нужен срочный заказ"
    }
  });

  await prisma.inventoryItem.upsert({
    where: { id: "demo-item-sensor" },
    update: { quantity: 42 },
    create: {
      id: "demo-item-sensor",
      companyId: company.id,
      responsibleId: users.get("keeper@demo.local"),
      name: "Датчик положения S-12",
      category: "Комплектующие",
      quantity: 42,
      unit: "шт",
      minThreshold: 10
    }
  });

  await prisma.activityLog.deleteMany({ where: { companyId: company.id } });
  await prisma.notification.deleteMany({ where: { companyId: company.id } });
  await prisma.calendarEvent.deleteMany({ where: { companyId: company.id } });
  await prisma.delivery.deleteMany({ where: { companyId: company.id } });
  await prisma.inventoryTransaction.deleteMany({ where: { item: { companyId: company.id } } });
  await prisma.task.deleteMany({ where: { companyId: company.id } });

  await prisma.task.createMany({
    data: [
      {
        companyId: company.id,
        departmentId: production.id,
        projectId: project.id,
        type: TaskType.PROJECT,
        title: "Проверить узел подачи",
        description: "Осмотреть крепления, датчики и провести тестовый запуск.",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        creatorId: users.get("leader@demo.local")!,
        assigneeId: users.get("engineer@demo.local")!,
        sortOrder: 10
      },
      {
        companyId: company.id,
        departmentId: production.id,
        projectId: project.id,
        inventoryItemId: cable.id,
        type: TaskType.TEAM,
        title: "Подготовить кабель для сборки шкафа",
        description: "Забрать кабель со склада и отметить расход.",
        status: TaskStatus.NEW,
        priority: Priority.CRITICAL,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 6),
        creatorId: users.get("foreman@demo.local")!,
        assigneeId: users.get("assembler@demo.local")!,
        sortOrder: 20
      },
      {
        companyId: company.id,
        departmentId: warehouse.id,
        type: TaskType.DEPARTMENT,
        title: "Сверить остатки по расходникам",
        description: "Проверить позиции ниже минимального порога.",
        status: TaskStatus.REVIEW,
        priority: Priority.NORMAL,
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
        creatorId: users.get("leader@demo.local")!,
        assigneeId: users.get("keeper@demo.local")!,
        sortOrder: 30
      }
    ]
  });

  await prisma.calendarEvent.createMany({
    data: [
      {
        companyId: company.id,
        type: "DEADLINE",
        title: "Дедлайн проверки узла подачи",
        startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
      },
      {
        companyId: company.id,
        type: "DELIVERY",
        title: "Поставка крепежа",
        startsAt: new Date(Date.now() + 1000 * 60 * 60 * 72)
      }
    ]
  });

  await prisma.delivery.create({
    data: {
      companyId: company.id,
      title: "Поставка кабеля и крепежа",
      supplier: "ТехСнаб",
      expectedAt: new Date(Date.now() + 1000 * 60 * 60 * 72)
    }
  });

  await prisma.notification.createMany({
    data: [
      {
        companyId: company.id,
        userId: users.get("leader@demo.local"),
        title: "Критический остаток",
        body: "Кабель силовой 3x2.5 ниже минимального порога.",
        priority: "CRITICAL"
      },
      {
        companyId: company.id,
        userId: users.get("assembler@demo.local"),
        title: "Новая задача",
        body: "Подготовить кабель для сборки шкафа.",
        priority: "IMPORTANT"
      }
    ]
  });

  await prisma.activityLog.createMany({
    data: [
      {
        companyId: company.id,
        actorId: users.get("leader@demo.local"),
        action: "created",
        entity: "task",
        meta: { title: "Проверить узел подачи" }
      },
      {
        companyId: company.id,
        actorId: users.get("keeper@demo.local"),
        action: "stock_low",
        entity: "inventory_item",
        entityId: cable.id,
        meta: { item: cable.name, quantity: 14 }
      }
    ]
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
