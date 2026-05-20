export function deletedUserLabel(name: string | null | undefined) {
  return name ? `${name} (удален)` : "Удаленный сотрудник";
}
