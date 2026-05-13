"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { roleLabels } from "@/lib/permissions";

type RoleCode = keyof typeof roleLabels;

type DepartmentOption = {
  id: string;
  name: string;
};

type RoleOption = {
  id: string;
  code: RoleCode;
  name: string;
};

type Employee = {
  id: string;
  name: string;
  email: string;
  departmentId: string | null;
  telegramChatId: string | null;
  isActive: boolean;
  role: { code: RoleCode };
};

export function UserCreateForm({ roles, departments }: { roles: RoleOption[]; departments: DepartmentOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo12345");
  const [roleCode, setRoleCode] = useState<RoleCode>("ENGINEER");
  const [departmentId, setDepartmentId] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => name.trim().length >= 2 && email.includes("@") && password.length >= 8 && !loading, [name, email, password, loading]);

  function reset() {
    setName("");
    setEmail("");
    setPassword("demo12345");
    setRoleCode("ENGINEER");
    setDepartmentId("");
    setTelegramChatId("");
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const response = await fetch("/api/settings/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
        roleCode,
        departmentId: departmentId || null,
        telegramChatId: telegramChatId.trim() || null
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError(response.status === 409 ? "Пользователь с таким email уже существует." : "Не удалось создать сотрудника.");
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-semibold text-surface transition hover:bg-emerald-300"
      >
        <Plus size={18} />
        Новый сотрудник
      </button>
    );
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <FormHeader title="Новый сотрудник" onClose={() => { reset(); setOpen(false); }} />
        <div className="grid gap-3 md:grid-cols-2">
          <TextField label="Имя" value={name} onChange={setName} />
          <TextField label="Email" value={email} onChange={setEmail} type="email" />
          <TextField label="Пароль" value={password} onChange={setPassword} type="password" />
          <RoleSelect value={roleCode} onChange={setRoleCode} roles={roles} />
          <DepartmentSelect value={departmentId} onChange={setDepartmentId} departments={departments} />
          <TextField label="Telegram chat id" value={telegramChatId} onChange={setTelegramChatId} />
        </div>
        {error && <div className="text-sm text-danger">{error}</div>}
        <div className="flex justify-end gap-2">
          <SecondaryButton onClick={() => { reset(); setOpen(false); }}>Отмена</SecondaryButton>
          <Button disabled={!canSubmit}>{loading ? "Создание..." : "Создать"}</Button>
        </div>
      </form>
    </Card>
  );
}

export function UserEditForm({ employee, roles, departments }: { employee: Employee; roles: RoleOption[]; departments: DepartmentOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email);
  const [password, setPassword] = useState("");
  const [roleCode, setRoleCode] = useState<RoleCode>(employee.role.code);
  const [departmentId, setDepartmentId] = useState(employee.departmentId ?? "");
  const [telegramChatId, setTelegramChatId] = useState(employee.telegramChatId ?? "");
  const [isActive, setIsActive] = useState(employee.isActive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => name.trim().length >= 2 && email.includes("@") && (!password || password.length >= 8) && !loading, [name, email, password, loading]);

  function reset() {
    setName(employee.name);
    setEmail(employee.email);
    setPassword("");
    setRoleCode(employee.role.code);
    setDepartmentId(employee.departmentId ?? "");
    setTelegramChatId(employee.telegramChatId ?? "");
    setIsActive(employee.isActive);
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/settings/users/${employee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password: password || undefined,
        roleCode,
        departmentId: departmentId || null,
        telegramChatId: telegramChatId.trim() || null,
        isActive
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError(response.status === 409 ? "Email уже используется." : "Не удалось сохранить сотрудника.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-stroke px-3 text-sm font-medium text-muted transition hover:text-text"
      >
        <Pencil size={16} />
        Изменить
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4 rounded-md border border-stroke bg-panelSoft p-3">
      <FormHeader title="Редактирование" onClose={() => { reset(); setOpen(false); }} />
      <div className="grid gap-3 md:grid-cols-2">
        <TextField label="Имя" value={name} onChange={setName} />
        <TextField label="Email" value={email} onChange={setEmail} type="email" />
        <TextField label="Новый пароль" value={password} onChange={setPassword} type="password" placeholder="Оставьте пустым без смены" />
        <RoleSelect value={roleCode} onChange={setRoleCode} roles={roles} />
        <DepartmentSelect value={departmentId} onChange={setDepartmentId} departments={departments} />
        <TextField label="Telegram chat id" value={telegramChatId} onChange={setTelegramChatId} />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 accent-emerald-400" />
        Активен
      </label>
      {error && <div className="text-sm text-danger">{error}</div>}
      <div className="flex justify-end gap-2">
        <SecondaryButton onClick={() => { reset(); setOpen(false); }}>Отмена</SecondaryButton>
        <Button disabled={!canSubmit}>{loading ? "Сохранение..." : "Сохранить"}</Button>
      </div>
    </form>
  );
}

export function DepartmentCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2 || loading) return;

    setLoading(true);
    setError("");

    const response = await fetch("/api/settings/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось создать отдел.");
      return;
    }

    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="h-10 min-w-0 flex-1 rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        placeholder="Новый отдел"
      />
      <Button disabled={name.trim().length < 2 || loading}>{loading ? "..." : "Создать"}</Button>
      {error && <div className="self-center text-sm text-danger">{error}</div>}
    </form>
  );
}

export function DepartmentEditForm({ department }: { department: DepartmentOption }) {
  const router = useRouter();
  const [name, setName] = useState(department.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    const trimmed = name.trim();
    if (trimmed.length < 2 || loading) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/settings/departments/${department.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed })
    });

    setLoading(false);

    if (!response.ok) {
      setError("Не удалось сохранить отдел.");
      return;
    }

    router.refresh();
  }

  async function remove() {
    if (loading) return;
    const confirmed = window.confirm(`Удалить отдел "${department.name}"? Можно удалить только пустой отдел.`);
    if (!confirmed) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/settings/departments/${department.id}`, {
      method: "DELETE"
    });

    setLoading(false);

    if (!response.ok) {
      setError(response.status === 409 ? "В отделе есть сотрудники или задачи." : "Не удалось удалить отдел.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-md bg-surface p-3">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-10 min-w-0 flex-1 rounded-md border border-stroke bg-panel px-3 text-sm outline-none transition focus:border-brand"
        />
        <button
          type="button"
          onClick={save}
          disabled={loading || name.trim().length < 2}
          className="h-10 rounded-md border border-stroke px-3 text-sm font-medium text-muted transition hover:text-text disabled:opacity-60"
        >
          Сохранить
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={loading}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-rose-300/25 text-rose-100 transition hover:bg-rose-300/10 disabled:opacity-60"
          aria-label="Удалить отдел"
        >
          <Trash2 size={16} />
        </button>
      </div>
      {error && <div className="mt-2 text-sm text-danger">{error}</div>}
    </div>
  );
}

function RoleSelect({ value, onChange, roles }: { value: RoleCode; onChange: (value: RoleCode) => void; roles: RoleOption[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">Роль</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as RoleCode)}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
      >
        {roles.map((role) => (
          <option key={role.id} value={role.code}>
            {roleLabels[role.code]}
          </option>
        ))}
      </select>
    </label>
  );
}

function DepartmentSelect({ value, onChange, departments }: { value: string; onChange: (value: string) => void; departments: DepartmentOption[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">Отдел</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
      >
        <option value="">Без отдела</option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-stroke bg-surface px-3 text-sm outline-none transition focus:border-brand"
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

function FormHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-stroke text-muted transition hover:text-text"
        aria-label="Закрыть"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 rounded-md border border-stroke px-4 text-sm font-medium text-muted transition hover:text-text"
    >
      {children}
    </button>
  );
}
