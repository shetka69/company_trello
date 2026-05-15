import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Boxes,
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  LockKeyhole,
  QrCode,
  ScanLine,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Reveal } from "@/components/presentation/reveal";

const headingFont = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"]
});

const bodyFont = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"]
});

const features = [
  {
    icon: LayoutDashboard,
    title: "Главная панель",
    text: "Руководитель сразу видит задачи, просрочки, уведомления, календарь и складские риски."
  },
  {
    icon: CalendarDays,
    title: "Задачи и календарь",
    text: "Задачи связаны со сроками и отображаются в календаре. Команда видит, что нужно сделать и когда."
  },
  {
    icon: Boxes,
    title: "Склад и поставки",
    text: "Учет позиций, приходов, остатков и новых поставок без отдельных таблиц и ручного поиска."
  },
  {
    icon: LockKeyhole,
    title: "Роли и доступы",
    text: "Каждый сотрудник видит нужные разделы и задачи по своей роли, отделу и ответственности."
  }
];

const qrBenefits = [
  "Генератор QR-кодов для каждой акустической системы, складской позиции или единицы оборудования.",
  "Сканирование с телефона открывает карточку объекта без ручного поиска.",
  "Через QR можно быстро фиксировать выдачу, возврат, проверку, замечания и брак.",
  "История изделия становится прозрачной: где было, кто работал, что менялось и какие были проблемы."
];

const qrContents = [
  "Ссылка на карточку изделия в системе",
  "Ссылка на каталог в ГИСП",
  "История выдачи и возврата",
  "Технические характеристики",
  "Данные по браку и ремонту",
  "Комплектация"
];

const deviceCards = [
  { title: "Телефон", text: "Работа на складе, в цехе, на объекте и в дороге." },
  { title: "Планшет", text: "Удобно для приемки, выдачи и быстрых проверок." },
  { title: "Компьютер", text: "Полное управление задачами, складом и настройками." }
];

const pushItems = [
  "Новая задача или изменение статуса",
  "Скорый срок или просрочка",
  "Низкий остаток на складе",
  "Важная поставка или напоминание"
];

const buyerQrItems = [
  "Паспорт изделия и основные характеристики",
  "Гарантийный талон и актуальный срок гарантии",
  "Проверка подлинности продукта",
  "Быстрая связь с компанией",
  "История статуса при повторной продаже",
  "Отказ от бумажных паспортов"
];

const roadmap = [
  {
    label: "Сейчас",
    title: "Рабочая система",
    text: "Задачи, календарь, склад, поставки, уведомления, роли и права уже собраны в одном интерфейсе."
  },
  {
    label: "Дальше",
    title: "Push-уведомления",
    text: "Важные события будут приходить сотрудникам автоматически, без постоянной ручной проверки."
  },
  {
    label: "Фокус",
    title: "QR-генератор",
    text: "Система сможет создавать цифровые паспорта для оборудования, колонок и складских позиций."
  },
  {
    label: "Фокус",
    title: "QR-сканер",
    text: "Телефон станет быстрым входом в карточку объекта: выдача, возврат, история, брак и движение."
  },
  {
    label: "Будущее",
    title: "Большой архив",
    text: "Чертежи, паспорта, комплектация, версии и вся история по каждой акустической системе."
  }
];

export function LandingPage() {
  return (
    <div className={`${bodyFont.className} min-h-screen bg-[#071018] text-white`}>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(14,228,168,0.18),transparent_32%),linear-gradient(240deg,rgba(255,128,88,0.14),transparent_36%),linear-gradient(180deg,#071018_0%,#0b1822_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 pb-14 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20 lg:pt-16">
            <div className="animate-[landing-rise_700ms_ease-out_both]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#0ee4a8]/25 bg-[#0ee4a8]/10 px-3 py-2 text-sm font-semibold text-[#9effe6]">
                <Sparkles size={16} />
                Система, которая растет вместе с процессами компании
              </div>
              <h1 className={`${headingFont.className} max-w-5xl text-4xl font-bold leading-[0.96] sm:text-5xl lg:text-7xl`}>
                Единый центр задач, склада и контроля для Азия Мьюзик
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/74 sm:text-lg">
                Программа объединяет задачи, календарь, склад, поставки, уведомления и доступы сотрудников. Ее не нужно скачивать: достаточно открыть ссылку с телефона,
                планшета или компьютера.
              </p>
              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                <Metric value="Web" label="открывается с любого устройства по ссылке" />
                <Metric value="QR" label="главное направление будущего развития" />
              </div>
            </div>

            <div className="animate-[landing-rise_900ms_ease-out_120ms_both]">
              <ProductPreview />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 90}>
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                  <div className="mb-5 inline-flex rounded-lg bg-[#0ee4a8]/12 p-3 text-[#88ffe1]">
                    <Icon size={24} />
                  </div>
                  <h2 className={`${headingFont.className} text-xl font-bold`}>{feature.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/66">{feature.text}</p>
                </div>
              </Reveal>
            );
          })}
        </section>

        <Reveal>
          <section id="qr" className="rounded-lg border border-[#0ee4a8]/20 bg-[linear-gradient(135deg,rgba(14,228,168,0.16),rgba(255,128,88,0.11))] p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-sm font-semibold text-[#b7ffed]">
                  <QrCode size={18} />
                  Самая важная часть развития
                </div>
                <h2 className={`${headingFont.className} mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl`}>
                  QR-генератор и QR-сканер ускорят работу со складом, оборудованием и акустическими системами
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/76">
                  Следующий большой шаг — превратить каждую единицу оборудования в понятную цифровую карточку. Сотрудник сканирует QR-код и сразу видит нужную информацию:
                  статус, историю, выдачу, возврат, замечания и данные по браку.
                </p>
              </div>

              <div className="grid gap-3">
                {qrBenefits.map((point) => (
                  <div key={point} className="flex gap-3 rounded-lg border border-white/10 bg-[#071018]/72 p-4">
                    <ScanLine size={20} className="mt-0.5 shrink-0 text-[#84ffe1]" />
                    <p className="text-sm leading-7 text-white/82">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="overflow-hidden rounded-lg border border-white/10 bg-[#0b1620] p-6 sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#7dffdf]">Что будет внутри QR</div>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-bold sm:text-4xl`}>Один код связывает физическое изделие со всеми данными</h2>
              <p className="mt-4 text-base leading-8 text-white/70">
                QR-код будет вести не на статичную картинку, а на живую карточку объекта. Данные можно обновлять в системе, а гравировку на изделии менять не придется.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_260px_1fr] lg:items-center">
              <div className="grid gap-4">
                {qrContents.slice(0, 3).map((item, index) => (
                  <QrLine key={item} label={item} side="left" delay={index * 80} />
                ))}
              </div>

              <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[#0ee4a8]/25 bg-[#0ee4a8]/8 animate-[qr-pulse_2.8s_ease-in-out_infinite]" />
                <div className="relative rounded-2xl border border-[#0ee4a8]/35 bg-[#d9fff4] p-5 shadow-[0_24px_80px_rgba(14,228,168,0.18)]">
                  <div className="grid h-44 w-44 grid-cols-7 gap-1 rounded-lg bg-[#071018] p-3">
                    {Array.from({ length: 49 }).map((_, index) => (
                      <div key={index} className={`rounded-[2px] ${index % 2 === 0 || index % 5 === 0 || index % 11 === 0 ? "bg-[#92ffe4]" : "bg-[#12312b]"}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {qrContents.slice(3).map((item, index) => (
                  <QrLine key={item} label={item} side="right" delay={index * 80} />
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="rounded-lg border border-white/10 bg-white/[0.045] p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#7dffdf]">QR для покупателя</div>
                <h2 className={`${headingFont.className} mt-3 text-3xl font-bold leading-tight sm:text-4xl`}>
                  Клиент тоже сможет сканировать QR-код и получать официальные данные о колонке
                </h2>
                <p className="mt-5 text-base leading-8 text-white/72">
                  QR-код может работать не только внутри компании. Покупатель сможет открыть паспорт изделия, проверить подлинность, увидеть гарантийный талон,
                  связаться с нами и получить актуальные данные без бумажных вложений.
                </p>
                <p className="mt-4 text-base leading-8 text-white/72">
                  При повторной продаже такая карточка тоже полезна: новый владелец увидит, действует ли гарантия. Если он обратится в компанию, будет понятно,
                  что устройство уже перешло к другому владельцу.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {buyerQrItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0b1620] px-4 py-3 text-sm font-semibold leading-6 text-white/80">
                    <CheckCircle2 size={18} className="shrink-0 text-[#7dffdf]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 sm:p-8">
              <Smartphone className="text-[#ffb097]" size={30} />
              <h2 className={`${headingFont.className} mt-5 text-3xl font-bold`}>Ничего не нужно скачивать</h2>
              <p className="mt-4 text-base leading-8 text-white/72">
                Программа работает в браузере. Можно открыть ее на телефоне, планшете или компьютере и сразу перейти к задачам, складу или календарю.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {deviceCards.map((card) => (
                  <div key={card.title} className="rounded-lg border border-white/10 bg-[#0b1620] p-4">
                    <div className="font-bold">{card.title}</div>
                    <div className="mt-2 text-sm leading-6 text-white/60">{card.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 sm:p-8">
              <BellRing className="text-[#7dffdf]" size={30} />
              <h2 className={`${headingFont.className} mt-5 text-3xl font-bold`}>Push-уведомления</h2>
              <p className="mt-4 text-base leading-8 text-white/72">
                В будущем система сможет сама сообщать сотрудникам о важных событиях. Это снижает риск пропустить задачу, срок или проблему на складе.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {pushItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0b1620] px-4 py-3 text-sm text-white/78">
                    <CheckCircle2 size={18} className="shrink-0 text-[#7dffdf]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <Reveal>
          <section id="roadmap" className="rounded-lg border border-white/10 bg-white/[0.035] p-6 sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#7dffdf]">Дорожная карта</div>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-bold sm:text-4xl`}>Путь развития программы</h2>
              <p className="mt-4 text-base leading-8 text-white/70">
                Система уже закрывает рабочую базу. Дальше акцент идет на мобильность, QR-инструменты, push-уведомления и большой архив данных по оборудованию.
              </p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-5">
              {roadmap.map((item, index) => (
                <div key={item.title} className="rounded-lg border border-white/10 bg-[#0b1620] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="rounded-lg border border-[#0ee4a8]/25 bg-[#0ee4a8]/10 px-3 py-1 text-xs font-bold text-[#9effe6]">{item.label}</span>
                    <span className="text-sm text-white/35">0{index + 1}</span>
                  </div>
                  <h3 className={`${headingFont.className} text-xl font-bold leading-tight`}>{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="rounded-lg border border-[#0ee4a8]/20 bg-[#0ee4a8]/8 p-6 sm:p-8 lg:p-10">
            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#7dffdf]">Открыт к предложениям</div>
                <h2 className={`${headingFont.className} mt-3 text-3xl font-bold sm:text-4xl`}>Систему можно развивать вместе с командой</h2>
              </div>
              <p className="text-base leading-8 text-white/74">
                Я открыт к предложениям, замечаниям и идеям по развитию программы. Если в работе есть процессы, которые можно упростить, ускорить или сделать прозрачнее,
                их можно постепенно добавить в систему и адаптировать под реальные задачи компании.
              </p>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="rounded-lg border border-white/12 bg-[linear-gradient(135deg,#f8fffc,#d7fff3)] p-7 text-[#071018] sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h2 className={`${headingFont.className} mt-3 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl`}>
                  Это не просто список задач, а база для современной цифровой работы компании
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-[#29434f]">
                  Сейчас программа помогает управлять текущими процессами. Дальше она может стать инструментом быстрого учета через QR, мобильной работы и прозрачной истории каждого изделия.
                </p>
              </div>
              <Link href="/app" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#071018] px-6 text-sm font-bold text-white transition hover:bg-[#123044]">
                Открыть программу
                <ArrowRight size={17} />
              </Link>
            </div>
          </section>
        </Reveal>
      </main>

      <footer className="border-t border-white/8 px-4 py-10 text-center text-sm text-white/56 sm:px-6 lg:px-8">
        <div>by Shetka</div>
        <div className="mt-2">создано для компании Азия Мьюзик</div>
      </footer>
      <style>{`
        @keyframes landing-rise {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes qr-pulse {
          0%, 100% {
            transform: scale(0.96);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.04);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className={`${headingFont.className} text-2xl font-bold text-white`}>{value}</div>
      <div className="mt-2 text-sm leading-6 text-white/58">{label}</div>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="rounded-lg border border-white/12 bg-[#0d1822]/92 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="rounded-lg border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.035))] p-4">
        <div className="rounded-lg border border-white/10 bg-[#132230] px-4 py-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#7dffdf]">Рабочая панель</div>
            <div className="mt-1 text-lg font-bold">Компания под контролем</div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <MockMetric title="Задачи на сегодня" value="18" accent="bg-[#0ee4a8]" />
              <MockMetric title="Просрочено" value="3" accent="bg-[#ff8058]" />
            </div>
            <div className="rounded-lg border border-white/10 bg-[#101d29] p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-bold">Живой календарь задач</div>
                <div className="text-xs text-white/45">без обновления страницы</div>
              </div>
              <div className="mt-4 grid gap-3 text-sm">
                <MockDay day="15" title="Поставка крепежа" tone="border-[#0ee4a8]/40 bg-[#0ee4a8]/10 text-[#9effe6]" />
                <MockDay day="16" title="Контроль качества" tone="border-[#ff8058]/40 bg-[#ff8058]/10 text-[#ffd0c2]" />
                <MockDay day="17" title="Складская приемка" tone="border-white/10 bg-white/5 text-white/80" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#101d29] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#0ee4a8]/12 p-3 text-[#97ffe7]">
                <QrCode size={26} />
              </div>
              <div>
                <div className="text-sm font-bold">QR-развитие</div>
                <div className="text-xs text-white/45">ключевая точка роста</div>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-[#0ee4a8]/35 bg-[#0ee4a8]/8 p-4">
              <div className="aspect-square rounded-lg bg-[linear-gradient(135deg,#0ee4a8,#6affd6)] p-4">
                <div className="grid h-full grid-cols-5 gap-2 rounded-lg bg-[#031512] p-3">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <div key={index} className={`rounded-[3px] ${index % 2 === 0 || index % 7 === 0 ? "bg-[#94ffe7]" : "bg-[#073c33]"}`} />
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-white/10 bg-[#07141d] p-3">
                <div className="text-sm font-bold">Колонка - BB 28</div>
                <div className="mt-1 text-xs leading-5 text-white/55">Сканирование откроет карточку, историю, замечания и движение по складу.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QrLine({ label, side, delay }: { label: string; side: "left" | "right"; delay: number }) {
  return (
    <div className={`grid items-center gap-3 ${side === "left" ? "grid-cols-[1fr_56px]" : "grid-cols-[56px_1fr]"}`} style={{ animationDelay: `${delay}ms` }}>
      {side === "left" && (
        <div className="rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold leading-6 text-white/82">{label}</div>
      )}
      <div className="relative h-px bg-[#0ee4a8]/45">
        <div className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#0ee4a8] ${side === "left" ? "right-0" : "left-0"}`} />
      </div>
      {side === "right" && (
        <div className="rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold leading-6 text-white/82">{label}</div>
      )}
    </div>
  );
}

function MockMetric({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#101d29] p-4">
      <div className={`h-1.5 w-14 rounded-full ${accent}`} />
      <div className="mt-4 text-sm text-white/55">{title}</div>
      <div className={`${headingFont.className} mt-2 text-4xl font-bold text-white`}>{value}</div>
    </div>
  );
}

function MockDay({ day, title, tone }: { day: string; title: string; tone: string }) {
  return (
    <div className={`min-w-0 rounded-lg border p-2.5 ${tone}`}>
      <div className="grid grid-cols-[44px_1fr] items-center gap-3">
        <div className="flex h-11 w-11 flex-col items-center justify-center rounded-md bg-black/18">
          <span className="text-[10px] uppercase leading-none opacity-75">май</span>
          <span className="mt-1 text-xl font-bold leading-none">{day}</span>
        </div>
        <div className="min-w-0 overflow-hidden text-xs font-semibold leading-5">
          <span className="block truncate">{title}</span>
        </div>
      </div>
    </div>
  );
}
