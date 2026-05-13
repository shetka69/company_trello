# Company Workspace

Корпоративное веб-приложение для управления задачами, календарем, складскими ресурсами, ролями, сотрудниками и уведомлениями.

## 1. Выбор стека

Выбран стек `Next.js + React + TypeScript + PostgreSQL + Prisma + Tailwind CSS`.

- `Next.js App Router` дает frontend и backend в одном проекте: страницы, серверные компоненты, API routes, middleware и простой деплой.
- `TypeScript` снижает риск ошибок в бизнес-логике ролей, задач, склада и уведомлений.
- `PostgreSQL` подходит для корпоративных данных, связей, аудита, multi-tenant модели и аналитики.
- `Prisma` дает строгую схему, миграции, seed-данные и удобную работу с отношениями.
- `Tailwind CSS` позволяет быстро собрать адаптивный темный интерфейс без тяжелой UI-зависимости.
- Собственная cookie/JWT авторизация в MVP проще NextAuth для контроля ролей, middleware и будущей интеграции с Telegram/Web Push.
- `@dnd-kit` выбран для drag-and-drop канбан-доски.

## 2. Архитектура проекта

```text
app/
  api/                  backend API routes
  app/                  защищенная область продукта
  login/                публичная страница входа
components/
  layout/               оболочка приложения, меню, верхняя панель
  tasks/                канбан и карточки задач
  ui/                   переиспользуемые UI-компоненты
lib/
  auth.ts               проверка сессии и прав доступа
  permissions.ts        RBAC-матрица
  prisma.ts             Prisma singleton
  session.ts            JWT cookie session
  utils.ts              общие утилиты
prisma/
  schema.prisma         модель данных
  seed.ts               демо-компания, роли, пользователи и данные
```

Основной принцип: каждая бизнес-сущность привязана к `companyId`. Это упрощает MVP для одной компании и оставляет готовую основу для multi-tenant режима.

## 3. Сущности базы данных

- `Company`: компания/tenant.
- `Department`: отдел внутри компании.
- `Role`: роль сотрудника и уровень доступа.
- `User`: сотрудник, профиль, Telegram chat id, роль, отдел.
- `Project`: проект с участниками и задачами.
- `Task`: задача личная, командная, отделовая или проектная.
- `TaskComment`: комментарии.
- `TaskChecklistItem`: чеклист.
- `TaskAttachment`: вложения и ссылки на файлы.
- `TaskHistory`: история изменений задачи.
- `CalendarEvent`: события, дедлайны, поставки и напоминания.
- `InventoryItem`: складской ресурс.
- `InventoryTransaction`: поступления, списания, выдачи, корректировки.
- `Delivery`: поставка.
- `Notification`: внутренние, Telegram и Push уведомления.
- `ActivityLog`: корпоративный журнал действий.

## 4. Roadmap MVP

1. Базовая инфраструктура: Next.js, Prisma, PostgreSQL, Tailwind, middleware, seed.
2. Авторизация: login/logout, cookie session, защита маршрутов.
3. RBAC: роли и видимость разделов для руководителя, кладовщика, бригадира, исполнителей и разработчика.
4. Dashboard: задачи на сегодня, просрочки, события, критические уведомления, складские остатки, активность.
5. Задачи: канбан с drag-and-drop, список, базовая смена статуса, комментарии/чеклист в модели.
6. Календарь: день/неделя/месяц как интерфейсная основа, события и дедлайны.
7. Склад: ресурсы, остатки, минимальный порог, движения ресурсов.
8. Уведомления: внутренний центр, приоритеты, поля под Telegram/Web Push.
9. Аудит: запись ключевых действий в `ActivityLog`.
10. Следующий этап: формы CRUD, загрузка файлов, реальные Web Push service worker, Telegram webhook, расширенная аналитика.

## Запуск

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env` по примеру:

```bash
cp .env.example .env
```

3. Поднять PostgreSQL и указать `DATABASE_URL`.

Можно поднять локальную базу через Docker:

```bash
docker compose up -d
```

4. Применить миграции и заполнить демо-данные:

```bash
npm run prisma:migrate
npm run db:seed
```

5. Запустить сервер:

```bash
npm run dev
```

Открыть `http://localhost:3000`.

## Demo-аккаунты

Пароль для всех аккаунтов: `demo12345`

- `leader@demo.local` - Руководитель
- `dev@demo.local` - Разработчик
- `engineer@demo.local` - Инженер
- `assembler@demo.local` - Сборщик
- `foreman@demo.local` - Бригадир
- `keeper@demo.local` - Кладовщик
- `technologist@demo.local` - Технолог
