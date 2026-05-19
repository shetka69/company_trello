import Link from "next/link";
import {
  Archive,
  Boxes,
  CheckCircle2,
  Cloud,
  Code2,
  Cpu,
  Database,
  HardDrive,
  Layers3,
  LockKeyhole,
  MonitorSmartphone,
  Network,
  QrCode,
  Rocket,
  Server,
  ShieldCheck,
  Smartphone,
  Workflow,
} from "lucide-react";
import { Manrope, Space_Grotesk } from "next/font/google";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

const stackItems = [
  {
    title: "Next.js",
    label: "Основа приложения",
    text: "Next.js отвечает за страницы, серверные маршруты и сборку приложения в одном проекте.",
    icon: Layers3,
  },
  {
    title: "React",
    label: "Интерфейс",
    text: "React отвечает за интерактивный интерфейс, формы, кнопки и обновление элементов без перезагрузки.",
    icon: MonitorSmartphone,
  },
  {
    title: "TypeScript",
    label: "Надежность кода",
    text: "TypeScript снижает риск ошибок за счет строгой проверки данных во время разработки.",
    icon: Code2,
  },
  {
    title: "Tailwind CSS",
    label: "Внешний вид",
    text: "Tailwind CSS используется для быстрой и единообразной стилизации всех экранов программы.",
    icon: Boxes,
  },
  {
    title: "PostgreSQL",
    label: "База данных",
    text: "PostgreSQL хранит пользователей, задачи, склад, календарь, уведомления и QR-паспорта изделий.",
    icon: Database,
  },
  {
    title: "Prisma",
    label: "Работа с базой",
    text: "Prisma связывает приложение с PostgreSQL и делает запросы к базе более безопасными и предсказуемыми.",
    icon: Workflow,
  },
  {
    title: "bcrypt",
    label: "Пароли",
    text: "bcrypt защищает пароли сотрудников, сохраняя в базе не сам пароль, а его защищенный отпечаток.",
    icon: LockKeyhole,
  },
  {
    title: "JWT-сессии",
    label: "Авторизация",
    text: "JWT-сессии помогают приложению понимать, кто вошел в систему и какие разделы ему разрешены.",
    icon: ShieldCheck,
  },
  {
    title: "QR-модуль",
    label: "Паспорта изделий",
    text: "QR-модуль создает цифровой паспорт изделия и позволяет быстро открыть его с телефона.",
    icon: QrCode,
  },
  {
    title: "Nginx",
    label: "Входной сервер",
    text: "Nginx принимает внешние запросы, подключает HTTPS и передает трафик внутрь приложения.",
    icon: Network,
  },
  {
    title: "PM2 или systemd",
    label: "Запуск",
    text: "PM2 или systemd удерживает приложение запущенным после сбоев, обновлений и перезагрузок сервера.",
    icon: Rocket,
  },
  {
    title: "S3 или MinIO",
    label: "Будущий архив",
    text: "S3 или MinIO лучше использовать для большого архива чертежей, фото, паспортов и документов.",
    icon: Archive,
  },
];

const serverProfiles = [
  {
    title: "Пилотный запуск",
    users: "до 20 сотрудников",
    cpu: "2 ядра CPU",
    ram: "4 ГБ RAM",
    disk: "40-80 ГБ SSD",
    note: "Подходит для презентации, тестирования и первых рабочих отделов.",
  },
  {
    title: "Рабочая эксплуатация",
    users: "20-100 сотрудников",
    cpu: "4 ядра CPU",
    ram: "8-16 ГБ RAM",
    disk: "150-300 ГБ NVMe",
    note: "Подходит для ежедневной работы с задачами, складом, календарем и QR-паспортами.",
  },
  {
    title: "Большой архив",
    users: "100+ сотрудников",
    cpu: "6-8 ядер CPU",
    ram: "16-32 ГБ RAM",
    disk: "500 ГБ-1 ТБ NVMe + отдельное хранилище",
    note: "Нужен для роста базы, архива чертежей, фотографий изделий и долгого хранения документов.",
  },
];

const backendParts = [
  "API routes принимают действия пользователя и выполняют серверную логику внутри Next.js.",
  "Prisma проверяет структуру данных и отправляет запросы в PostgreSQL.",
  "PostgreSQL хранит рабочую информацию компании в связанной и расширяемой базе.",
  "Система ролей ограничивает доступ к разделам и действиям внутри программы.",
];

const frontendParts = [
  "Интерфейс открывается в браузере на компьютере, планшете или телефоне.",
  "Карточки, формы, календарь, склад и QR-раздел работают как единая рабочая панель.",
  "Адаптивная верстка подстраивает экраны под мобильные устройства без установки приложения.",
  "Загрузочные заглушки показывают пользователю структуру страницы до получения данных.",
];

export default function TechOverviewPage() {
  return (
    <main
      className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen overflow-hidden bg-[#080c10] text-white`}
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[460px] w-[460px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-emerald-400 text-slate-950">
              <Server className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Asia Music Workspace</p>
              <p className="text-xs text-slate-400">техническая страница проекта</p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-300/70 hover:text-emerald-200"
          >
            На главную
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              <CheckCircle2 className="size-4" />
              Стек, сервер и принцип работы
            </div>
            <h1 className="max-w-4xl font-[var(--font-space)] text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Из чего состоит программа и где она должна работать
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Эта страница коротко объясняет фронт, бэк, базу данных и требования к серверу:
              каждая часть стека описана одним понятным предложением.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-emerald-400/20 via-cyan-400/10 to-transparent blur-2xl" />
            <div className="relative rounded-[32px] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-2">
                <SummaryCard
                  icon={MonitorSmartphone}
                  title="Фронт"
                  text="То, что видит сотрудник: страницы, карточки, формы, календарь, склад и QR-раздел."
                />
                <SummaryCard
                  icon={Server}
                  title="Бэк"
                  text="То, что обрабатывает действия: вход, права, задачи, уведомления и запросы к базе."
                />
                <SummaryCard
                  icon={Database}
                  title="База"
                  text="Центральное хранилище пользователей, задач, склада, календаря и QR-паспортов."
                />
                <SummaryCard
                  icon={Cloud}
                  title="Сервер"
                  text="Место, где постоянно запущены приложение, база данных, HTTPS и резервные копии."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-2 lg:px-10">
        <InfoPanel title="Фронтенд" icon={Smartphone} items={frontendParts} accent="from-cyan-400/20" />
        <InfoPanel title="Бэкенд" icon={Server} items={backendParts} accent="from-emerald-400/20" />
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-emerald-300">Стек проекта</p>
            <h2 className="mt-3 font-[var(--font-space)] text-4xl font-bold tracking-tight sm:text-5xl">
              Каждая часть простым предложением
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Такой стек выбран потому, что он подходит для веб-приложения с ролями, складом,
            задачами, QR-паспортами и будущим архивом данных.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stackItems.map((item) => (
            <article
              key={item.title}
              className="group rounded-[26px] border border-white/10 bg-white/[0.045] p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-white/[0.07]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="grid size-12 place-items-center rounded-2xl bg-white/[0.08] text-emerald-200 ring-1 ring-white/10 transition group-hover:bg-emerald-300 group-hover:text-slate-950">
                  <item.icon className="size-5" />
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-400">
                  {item.label}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <div className="rounded-[34px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] p-5 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-emerald-300">
                Серверы
              </p>
              <h2 className="mt-3 font-[var(--font-space)] text-4xl font-bold tracking-tight sm:text-5xl">
                Какие характеристики нужны
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              Для старта сервер может быть небольшим, но под большой архив лучше сразу
              закладывать быстрый диск, резервные копии и отдельное хранилище файлов.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {serverProfiles.map((profile, index) => (
              <article
                key={profile.title}
                className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5"
              >
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold">{profile.title}</h3>
                  <span className="grid size-9 place-items-center rounded-full bg-emerald-300 text-sm font-black text-slate-950">
                    {index + 1}
                  </span>
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  <SpecLine icon={Cpu} label={profile.cpu} />
                  <SpecLine icon={HardDrive} label={profile.ram} />
                  <SpecLine icon={Database} label={profile.disk} />
                  <SpecLine icon={MonitorSmartphone} label={profile.users} />
                </div>
                <p className="mt-5 border-t border-white/10 pt-5 text-sm leading-6 text-slate-400">
                  {profile.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 lg:px-10">
        <div className="grid gap-6 rounded-[34px] border border-emerald-300/20 bg-emerald-300/[0.06] p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-emerald-300">
              Поток данных
            </p>
            <h2 className="mt-3 font-[var(--font-space)] text-4xl font-bold tracking-tight">
              Как запрос проходит через систему
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Сотрудник открывает страницу, интерфейс отправляет запрос на сервер,
              сервер проверяет права, Prisma обращается к PostgreSQL, а результат
              возвращается обратно в интерфейс.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-5">
            {["Пользователь", "Фронт", "API", "Prisma", "PostgreSQL"].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-center"
              >
                <div className="mx-auto mb-3 grid size-9 place-items-center rounded-full bg-white/[0.08] text-sm font-black text-emerald-200">
                  {index + 1}
                </div>
                <p className="text-sm font-bold text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Server;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5">
      <div className="mb-4 grid size-11 place-items-center rounded-2xl bg-emerald-300/15 text-emerald-200">
        <Icon className="size-5" />
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}

function InfoPanel({
  icon: Icon,
  title,
  items,
  accent,
}: {
  icon: typeof Server;
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-black/20`}
    >
      <div className={`absolute right-0 top-0 h-48 w-48 bg-gradient-to-br ${accent} to-transparent blur-3xl`} />
      <div className="relative">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-white/[0.08] text-emerald-200">
            <Icon className="size-5" />
          </div>
          <h2 className="font-[var(--font-space)] text-3xl font-bold">{title}</h2>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-300" />
              <p className="text-sm leading-6 text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function SpecLine({ icon: Icon, label }: { icon: typeof Server; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.045] px-4 py-3">
      <Icon className="size-4 text-emerald-300" />
      <span>{label}</span>
    </div>
  );
}
