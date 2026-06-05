export function getLocalDateStamp(reference = new Date()) {
  const year = reference.getFullYear();
  const month = `${reference.getMonth() + 1}`.padStart(2, '0');
  const day = `${reference.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDateStamp(dateStamp: string) {
  const [year, month, day] = dateStamp.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function diffInDays(current: string, previous: string) {
  const currentDate = parseDateStamp(current);
  const previousDate = parseDateStamp(previous);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.round(
    (currentDate.getTime() - previousDate.getTime()) / millisecondsPerDay,
  );
}
