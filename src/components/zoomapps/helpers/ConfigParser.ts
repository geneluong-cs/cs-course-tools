import { Groups, type ClassConfig } from "./ClassConfig";

const idColumnName = 'id';
const finalNameColumnName = 'finalname';
const potentialNameColumnName = 'potentialnames';
const groupColumnName = 'group';

export function parseConfig(rawConfig: string): [string | undefined, ClassConfig[]] {
  if (rawConfig === '') {
    return [undefined, []];
  }

  const parsedInputs = rawConfig.split('\n').filter(r => r !== '').map(r => r.split('\t'));

  const headings = parsedInputs.shift();

  if (headings === undefined) {
    return [undefined, []];
  }

  const idIndex = headings.findIndex(el => el.toLocaleLowerCase() === idColumnName);
  const finalNameIndex = headings.findIndex(el => el.toLocaleLowerCase() === finalNameColumnName);
  const potentialNameIndex = headings.findIndex(el => el.toLocaleLowerCase() === potentialNameColumnName);
  const groupIndex = headings.findIndex(el => el.toLocaleLowerCase() === groupColumnName);

  if (idIndex < 0) {
    return [`${idColumnName} column is not specified`, []];
  }
  if (finalNameIndex < 0) {
    return [`${finalNameColumnName} column is not specifiec`, []];
  }
  if (potentialNameIndex < 0) {
    return [`${potentialNameColumnName} column is not specified`, []];
  }
  if (groupIndex < 0) {
    return [`${groupColumnName} column is not specified`, []];
  }

  return [undefined, parsedInputs.map(row => {
    const potName = row[potentialNameIndex];
    return {
      id: row[idIndex],
      finalName: row[finalNameIndex],
      potentialNames: potName === '' || !potName ? [] : potName.split('$'),
      group: row[groupIndex],
    } as ClassConfig
  })];
}

export function validateClassConfig(classConfigs: ClassConfig[]): string[] {
  const res = [];
  const nameCache = new Set<string>();
  const idCache = new Set<string>();
  const duplicateNameCache = new Set<string>();

  for (const cc of classConfigs) {
    if (cc.group === Groups.Unknown) {
      res.push(`Do not classify a group as ${Groups.Unknown}`);
    }

    if (nameCache.has(cc.finalName)) {
      duplicateNameCache.add(cc.finalName);
    } else {
      nameCache.add(cc.finalName);
    }

    for (const pn of cc.potentialNames) {
      if (nameCache.has(pn)) {
        duplicateNameCache.add(pn);
      } else {
        nameCache.add(pn);
      }
    }

    if (idCache.has(cc.id)) {
      res.push(`Duplicate value found in column '${idColumnName}': ${cc.id}`);
    } else {
      idCache.add(cc.id);
    }

    if (cc.id === undefined || cc.id === '') {
      res.push(`${idColumnName} column value cannot be left blank`);
    }
    if (cc.finalName === undefined || cc.finalName === '') {
      res.push(`${finalNameColumnName} column value cannot be left blank`);
    }
  }

  for (const dupeName of duplicateNameCache) {
    res.push(`Duplicate name identified ${dupeName}. Ensure '${finalNameColumnName}' and '${potentialNameColumnName}' have unique values`);
  }

  return res;
}