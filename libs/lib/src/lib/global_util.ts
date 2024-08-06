import { IAttempt, IPlayerSheet, TEditableEntry } from './models';

export function calculateSelectableEntries(
  attempt: IAttempt,
  sheet: IPlayerSheet
): { key: string; entries: TEditableEntry[] }[] {
  const selectedColors = attempt.values?.map((x) => x.color);
  const sum = attempt.values?.reduce((acc, x) => acc + x.value, 0) as number;
  const ret: { key: string; entries: TEditableEntry[] }[] = [];
  for (const row of sheet.rows) {
    const newEntries = row.entries.map((x) =>
      x === null ? null : { ...x, _selectable: false }
    );
    ret.push({ key: row.key, entries: newEntries });

    if (!selectedColors?.includes(row.key)) {
      // dice isn't selected, cannot assign entry in this row
      continue;
    }

    const values = new Set<number>(
      newEntries.map((x) => x?.value).filter(Boolean) as number[]
    );
    // check if any entries in this row have the same number
    if (values.has(sum)) {
      // number already exists in this row, cannot assign
      continue;
    }

    // get the max of all lower numbers
    const MaxLower = Math.max(...[...values].filter((x) => x < sum));
    const MinUpper = Math.min(...[...values].filter((x) => x > sum));

    const startingIdx =
      MaxLower === -Infinity
        ? 0
        : newEntries.indexOf(
            newEntries.find((x) => x?.value === MaxLower) as TEditableEntry
          ) + 1;
    const endingIdx =
      MinUpper === Infinity
        ? newEntries.length
        : newEntries.indexOf(
            newEntries.find((x) => x?.value === MinUpper) as TEditableEntry
          );

    // all before this are _selectable = false
    for (let i = startingIdx; i < endingIdx; i++) {
      // for each one of these, we need to make sure the column clears

      const normalizedIndex = i + row.offset;
      const colCheck = new Set(
        sheet.rows.map(
          (x) => x.entries[normalizedIndex - x.offset]?.value || -1
        )
      );

      const entry = newEntries[i];
      if (entry) {
        entry._selectable = !colCheck.has(sum);
      }
    }
  }

  return ret;
}
