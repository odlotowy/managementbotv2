export function parseAndValidateDate(
  dateStr: string,
  expectedDay: number,
): Date | null {
  const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = dateStr.match(regex);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);

  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  if (date.getDay() !== expectedDay) {
    return null;
  }

  return date;
}
