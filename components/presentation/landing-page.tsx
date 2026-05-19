import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HelpCircle,
  LayoutDashboard,
  LockKeyhole,
  QrCode,
  ScanLine,
  Smartphone,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Reveal } from "@/components/presentation/reveal";

const headingFont = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const painPoints = [
  {
    icon: Clock3,
    title: "Время уходит на поиск информации",
    text: "Когда задачи, склад, сроки и ответственные живут в разных местах, каждый простой вопрос превращается в ручной поиск.",
  },
  {
    icon: UsersRound,
    title: "Сложно видеть общую картину",
    text: "Руководителю нужно быстро понимать, где просрочка, где риск по складу, кто занят и что требует внимания сегодня.",
  },
  {
    icon: Boxes,
    title: "Склад требует прозрачности",
    text: "Остатки, поставки, приемка и движение изделий должны быть видны без отдельных таблиц и постоянных уточнений.",
  },
  {
    icon: QrCode,
    title: "История изделия теряется",
    text: "Без цифрового паспорта сложно быстро понять, где была колонка, кому отправлялась, какой у нее статус и гарантия.",
  },
];

const questions = [
  {
    question: "Сколько времени сейчас уходит, чтобы найти актуальный статус задачи, поставки или изделия?",
    answer: "Нужно звонить, узнавать, садиться за ПК и смотреть в 1С.",
  },
  {
    question: "Можно ли с телефона сразу понять, где находится конкретная колонка и кто за нее отвечает?",
    answer: "На данный момент это возможно только через звонок.",
  },
  {
    question: "Что происходит, если срок по заказу уже поджимает, а полной информации под рукой нет?",
    answer: "Начинается поиск всей информации по заказу, и из-за этого могут появляться просрочки заказов.",
  },
  {
    question: "Как быстро покупатель сможет проверить подлинность изделия, гарантию и паспорт без бумажных вложений?",
    answer: "Никак.",
  },
];

const solutionCards = [
  {
    icon: LayoutDashboard,
    title: "Главная панель",
    text: "Руководитель видит задачи, сроки, уведомления, календарь и складские риски в одном рабочем экране.",
  },
  {
    icon: CalendarDays,
    title: "Задачи и календарь",
    text: "Задачи связаны со сроками и отображаются в календаре, чтобы команда понимала, что нужно сделать и когда.",
  },
  {
    icon: Boxes,
    title: "Склад и поставки",
    text: "Позиции, приемка, поставки и остатки ведутся в системе без отдельных таблиц и ручного контроля.",
  },
  {
    icon: LockKeyhole,
    title: "Роли и доступы",
    text: "Сотрудник видит только нужные разделы и действия по своей роли, отделу и ответственности.",
  },
];

const qrBenefits = [
  "Уникальный QR-код можно создать для каждой акустической системы, складской позиции или единицы оборудования.",
  "Сканирование с телефона открывает карточку объекта без ручного поиска по таблицам и перепискам.",
  "Через QR можно фиксировать статус, отправку, складское движение, замечания, ремонт и историю изделия.",
  "Один и тот же QR-код работает для сотрудников и покупателей, но показывает разные данные в зависимости от роли.",
];

const qrContents = [
  "Ссылка на карточку изделия",
  "Ссылка на каталог в ГИСП",
  "Номер и название изделия",
  "Комплектация",
  "Гарантийный талон",
  "История статуса и движения",
];

const deviceCards = [
  { title: "Телефон", text: "Работа на складе, в цехе, на объекте и в дороге." },
  { title: "Планшет", text: "Удобно для приемки, выдачи и быстрых проверок." },
  { title: "Компьютер", text: "Полное управление задачами, складом, QR-кодами и настройками." },
];

const pushItems = [
  "Новая задача или изменение статуса",
  "Скорый срок или просрочка",
  "Низкий остаток на складе",
  "Важная поставка или напоминание",
];

const buyerQrItems = [
  "Паспорт изделия и основные характеристики",
  "Гарантийный талон и актуальный срок гарантии",
  "Проверка подлинности продукта",
  "Быстрая связь с компанией",
  "Статус гарантии при повторной продаже",
  "Отказ от бумажных паспортов",
];

const roadmap = [
  {
    label: "Сейчас",
    title: "Единая рабочая система",
    text: "Задачи, календарь, склад, поставки, уведомления, роли и права уже собраны в одном интерфейсе.",
  },
  {
    label: "Дальше",
    title: "Push-уведомления",
    text: "Важные события будут приходить сотрудникам автоматически, без постоянной ручной проверки программы.",
  },
  {
    label: "Фокус",
    title: "QR-генератор",
    text: "Система создает цифровые паспорта для оборудования, колонок и складских позиций.",
  },
  {
    label: "Фокус",
    title: "QR-сканер",
    text: "Телефон становится быстрым входом в карточку объекта: статус, выдача, история, гарантия и движение.",
  },
  {
    label: "Будущее",
    title: "Большой архив",
    text: "Чертежи, паспорта, комплектация, версии и история по каждой акустической системе хранятся в единой базе.",
  },
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
                Азия Мьюзик
              </div>
              <h1 className={`${headingFont.className} max-w-5xl text-4xl font-bold leading-[0.96] sm:text-5xl lg:text-7xl`}>
                Система, которая убирает хаос из задач, склада и истории изделий
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/74 sm:text-lg">
                Она помогает быстрее находить ответственных, видеть сроки, контролировать склад
                и постепенно переводить изделия в цифровые QR-паспорта.
              </p>
            </div>

            <div className="animate-[landing-rise_900ms_ease-out_120ms_both]">
              <ProductPreview />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Reveal>
          <section className="rounded-lg border border-white/10 bg-white/[0.035] p-6 sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#7dffdf]">
                Рабочие проблемы
              </div>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-bold sm:text-4xl`}>
                Где компания теряет время и контроль?
              </h2>
              <p className="mt-4 text-base leading-8 text-white/70">
                Если информация разбросана по таблицам, чатам и устным договоренностям, руководителю сложнее принимать решения,
                а сотрудникам сложнее быстро понимать, что делать дальше.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {painPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <Reveal key={point.title} delay={index * 90}>
                    <div className="h-full rounded-lg border border-white/10 bg-[#0b1620] p-5">
                      <div className="mb-5 inline-flex rounded-lg bg-[#0ee4a8]/12 p-3 text-[#88ffe1]">
                        <Icon size={24} />
                      </div>
                      <h3 className={`${headingFont.className} text-xl font-bold`}>{point.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/66">{point.text}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="rounded-lg border border-[#ff8058]/20 bg-[linear-gradient(135deg,rgba(255,128,88,0.14),rgba(14,228,168,0.07))] p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <h2 className={`${headingFont.className} mt-3 text-3xl font-bold sm:text-4xl`}>
                  Эти вопросы показывают, зачем нужна система
                </h2>
                <p className="mt-4 text-base leading-8 text-white/72">
                  Они показывают реальные места, где ручной контроль замедляет работу,
                  требует лишних звонков и мешает быстро принять решение.
                </p>
              </div>

              <div className="grid gap-3">
                {questions.map((item, index) => (
                  <div key={item.question} className="flex gap-4 rounded-lg border border-white/10 bg-[#071018]/70 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ff8058]/14 text-[#ffd0c2]">
                      <HelpCircle size={19} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/38">
                        вопрос {index + 1}
                      </div>
                      <p className="mt-1 text-sm leading-7 text-white/84">{item.question}</p>
                      <div className="mt-3 rounded-lg border border-[#ff8058]/20 bg-[#ff8058]/10 px-3 py-2 text-sm font-semibold leading-6 text-[#ffd8ce]">
                        Ответ: {item.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="rounded-lg border border-[#0ee4a8]/20 bg-[#0ee4a8]/8 p-6 sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#7dffdf]">
                Решение
              </div>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-bold sm:text-4xl`}>
                Вот наше решение этих проблем
              </h2>
              <p className="mt-4 text-base leading-8 text-white/70">
                Это единое рабочее место, где задачи, склад, календарь, доступы
                и QR-паспорта связаны между собой.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {solutionCards.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Reveal key={feature.title} delay={index * 90}>
                    <div className="h-full rounded-lg border border-white/10 bg-[#0b1620] p-5">
                      <div className="mb-5 inline-flex rounded-lg bg-[#0ee4a8]/12 p-3 text-[#88ffe1]">
                        <Icon size={24} />
                      </div>
                      <h3 className={`${headingFont.className} text-xl font-bold`}>{feature.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/66">{feature.text}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section id="qr" className="rounded-lg border border-[#0ee4a8]/20 bg-[linear-gradient(135deg,rgba(14,228,168,0.16),rgba(255,128,88,0.11))] p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-sm font-semibold text-[#b7ffed]">
                  <QrCode size={18} />
                  Главное направление развития
                </div>
                <h2 className={`${headingFont.className} mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl`}>
                  QR-генератор и QR-сканер превратят каждую колонку в цифровой объект
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/76">
                  Это следующий большой шаг: один код на изделии открывает актуальную карточку,
                  а данные внутри можно обновлять без замены гравировки на корпусе.
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
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#7dffdf]">
                Что будет внутри QR
              </div>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-bold sm:text-4xl`}>
                Один код связывает физическое изделие со всеми данными
              </h2>
              <p className="mt-4 text-base leading-8 text-white/70">
                QR-код будет вести не на статичную картинку, а на живую карточку изделия:
                для сотрудника это рабочая информация, для покупателя официальный паспорт.
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
                      <div
                        key={index}
                        className={`rounded-[2px] ${
                          index % 2 === 0 || index % 5 === 0 || index % 11 === 0
                            ? "bg-[#92ffe4]"
                            : "bg-[#12312b]"
                        }`}
                      />
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
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#7dffdf]">
                  QR для покупателя
                </div>
                <h2 className={`${headingFont.className} mt-3 text-3xl font-bold leading-tight sm:text-4xl`}>
                  Покупатель сможет проверить колонку без бумажных паспортов
                </h2>
                <p className="mt-5 text-base leading-8 text-white/72">
                  После сканирования покупатель увидит паспорт изделия, гарантийный талон,
                  подлинность продукта и удобный способ связаться с компанией.
                </p>
                <p className="mt-4 text-base leading-8 text-white/72">
                  При перепродаже новый владелец тоже увидит реальный статус гарантии,
                  а компания сможет понимать историю обращения по конкретному изделию.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {buyerQrItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0b1620] px-4 py-3 text-sm font-semibold leading-6 text-white/80"
                  >
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
              <h2 className={`${headingFont.className} mt-5 text-3xl font-bold`}>
                Ничего не нужно скачивать
              </h2>
              <p className="mt-4 text-base leading-8 text-white/72">
                Программа работает в браузере. Ее можно открыть на телефоне, планшете или компьютере
                и сразу перейти к задачам, складу, календарю или QR-кодам.
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
                В будущем система сможет сама сообщать сотрудникам о важных событиях.
                Это снижает риск пропустить задачу, срок или проблему на складе.
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
              <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#7dffdf]">
                Дорожная карта
              </div>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-bold sm:text-4xl`}>
                Путь развития программы
              </h2>
              <p className="mt-4 text-base leading-8 text-white/70">
                Система уже закрывает рабочую базу. Дальше акцент идет на мобильность,
                QR-инструменты, push-уведомления и большой архив данных по оборудованию.
              </p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-5">
              {roadmap.map((item, index) => (
                <div key={item.title} className="rounded-lg border border-white/10 bg-[#0b1620] p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="rounded-lg border border-[#0ee4a8]/25 bg-[#0ee4a8]/10 px-3 py-1 text-xs font-bold text-[#9effe6]">
                      {item.label}
                    </span>
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
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-[#7dffdf]">
                  Открыт к предложениям
                </div>
                <h2 className={`${headingFont.className} mt-3 text-3xl font-bold sm:text-4xl`}>
                  Систему можно развивать вместе с командой
                </h2>
              </div>
              <p className="text-base leading-8 text-white/74">
                Если в работе есть процессы, которые можно упростить, ускорить или сделать прозрачнее,
                их можно постепенно добавлять в систему и адаптировать под реальные задачи компании.
              </p>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="rounded-lg border border-white/12 bg-[linear-gradient(135deg,#f8fffc,#d7fff3)] p-7 text-[#071018] sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-[#071018]/8 px-3 py-2 text-sm font-bold text-[#071018]">
                  <TrendingUp size={17} />
                  Итог презентации
                </div>
                <h2 className={`${headingFont.className} mt-4 max-w-4xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl`}>
                  Программа закрывает текущие проблемы и готовит компанию к цифровой истории каждого изделия
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-[#29434f]">
                  Сейчас это единый центр задач, склада и контроля. Следующий этап — QR-паспорта,
                  мобильное сканирование, push-уведомления и большой архив данных по оборудованию.
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
                <div className="text-sm font-bold">Календарь задач</div>
                <div className="text-xs text-white/45">сроки и контроль</div>
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
                    <div
                      key={index}
                      className={`rounded-[3px] ${index % 2 === 0 || index % 7 === 0 ? "bg-[#94ffe7]" : "bg-[#073c33]"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-white/10 bg-[#07141d] p-3">
                <div className="text-sm font-bold">Колонка - BB 28</div>
                <div className="mt-1 text-xs leading-5 text-white/55">
                  Сканирование откроет карточку, историю, гарантию и движение по складу.
                </div>
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
    <div
      className={`grid items-center gap-3 ${side === "left" ? "grid-cols-[1fr_56px]" : "grid-cols-[56px_1fr]"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {side === "left" && (
        <div className="rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold leading-6 text-white/82">
          {label}
        </div>
      )}
      <div className="relative h-px bg-[#0ee4a8]/45">
        <div className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#0ee4a8] ${side === "left" ? "right-0" : "left-0"}`} />
      </div>
      {side === "right" && (
        <div className="rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold leading-6 text-white/82">
          {label}
        </div>
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
