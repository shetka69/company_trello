export function companyDisplayName(name: string) {
  if (name === "Demo Manufacturing" || name === "???? ??????" || name === "В разработке.....") {
    return "Азия Мьюзик";
  }

  return name;
}
