import { Archive, Barcode, CheckCircle2, Clock3, QrCode, ScanLine, ShieldAlert, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requirePermission, requireUser } from "@/lib/auth";

const roadmapItems = [
  {
    title: "QR-паспорт акустической системы",
    status: "Приоритет",
    icon: QrCode,
    description:
      "Создание QR-кода для каждой акустической системы. По коду можно открыть карточку изделия, посмотреть комплектацию, текущий статус, историю выдачи и ответственных.",
    points: ["Уникальный QR для изделия", "Гравировка QR-кода", "Быстрый переход в карточку", "История движения"]
  },
  {
    title: "Сканер QR-кода",
    status: "Следующий шаг",
    icon: ScanLine,
    description:
      "Сканирование QR-кода с телефона или камеры, чтобы быстро добавить изделие в базу выдачи, отметить передачу, возврат или проверку.",
    points: ["Сканирование с телефона", "Выдача без ручного поиска", "Быстрый возврат", "Отметка ответственного"]
  },
  {
    title: "Большой архив колонок и чертежей",
    status: "База знаний",
    icon: Archive,
    description:
      "Единый архив всех акустических систем: карточки колонок, чертежи, паспорта, фото, спецификации, измерения, комплектующие и история изменений по каждой модели.",
    points: ["Чертежи и версии", "Паспорта изделий", "Данные по комплектующим", "История изменений"]
  },
  {
    title: "Учет брака и замечаний",
    status: "Полезно для контроля",
    icon: ShieldAlert,
    description:
      "Фиксация брака, дефектов и замечаний после проверки с привязкой к конкретной акустической системе.",
    points: ["Тип брака", "Фото дефекта", "Кто обнаружил", "Статус исправления"]
  },
  {
    title: "Жизненный цикл изделия",
    status: "Расширение",
    icon: Clock3,
    description:
      "Полная история от сборки до выдачи: склад, производство, проверка, выдача, возврат, ремонт или списание.",
    points: ["Сборка", "Проверка", "Выдача", "Возврат или ремонт"]
  },
  {
    title: "Связка со складом",
    status: "Интеграция",
    icon: Barcode,
    description:
      "Автоматическое списание комплектующих при создании акустической системы и контроль остатков по связанным позициям склада.",
    points: ["Комплектация", "Списание деталей", "Контроль остатков", "Сигналы по нехватке"]
  },
  {
    title: "Выдача и поставки",
    status: "Процесс",
    icon: Truck,
    description:
      "Разделение складских поставок, выдачи готовых систем и возвратов, чтобы видеть движение изделий без ручных таблиц.",
    points: ["Кому выдано", "Дата выдачи", "Основание", "Возврат"]
  }
];

export default async function RoadmapPage() {
  const user = await requireUser();
  requirePermission(user, "roadmap:read");

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">План развития</h1>
          <p className="mt-1 text-sm text-muted">Идеи, которые можно добавить в систему после базовой презентации.</p>
        </div>
        <Badge variant="green">Для руководителя и разработчика</Badge>
      </div>

      <Card className="border-brand/30 bg-brand/5">
        <div className="grid gap-4 lg:grid-cols-[56px_1fr]">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand text-surface">
            <QrCode size={30} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">Главная идея: QR-коды для акустических систем</h2>
              <Badge variant="green">Высокая ценность</Badge>
            </div>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
              На каждую акустическую систему можно создавать отдельный QR-код. После сканирования открывается карточка изделия: где оно находится, кому выдано,
              какие комплектующие использованы, были ли замечания, брак, ремонт или возврат. Это убирает ручной поиск и дает прозрачную историю по каждому изделию.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {roadmapItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-panelSoft text-brand">
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">{item.title}</h2>
                    <Badge>{item.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {item.points.map((point) => (
                      <div key={point} className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-sm">
                        <CheckCircle2 size={16} className="shrink-0 text-brand" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
