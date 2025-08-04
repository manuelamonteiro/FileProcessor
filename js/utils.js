export const fieldDictionary = {
  data_registro: ['data', 'data_medicao', 'registro'],
  metrica_a: ['metrica a', 'a', 'valor_a'],
  metrica_b: ['metrica b', 'b', 'valor_b'],
  indicador_x: ['indicador x', 'x', 'ind_x'],
  indicador_y: ['indicador y', 'y', 'ind_y']
}

export function normalizeNumber(raw) {
  if (raw == null || raw === '') return undefined
  if (typeof raw === 'number') return raw

  const sanitized = String(raw).trim().replace(/\./g, '').replace(',', '.')
  const num = Number(sanitized)

  return Number.isNaN(num) ? undefined : num
}

export function canonicalize(header) {
  if (header == null) return ''

  function sanitize(str) {
    return String(str)
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/[^a-z0-9 ]+/g, '')
      .replace(/\s+/g, ' ')
  }

  const normalized = sanitize(header)

  for (const [canonical, aliases] of Object.entries(fieldDictionary)) {
    const canonicalSanitized = sanitize(canonical)
    if (canonicalSanitized === normalized) return canonical

    const matchAlias = aliases.some(alias => sanitize(alias) === normalized)
    if (matchAlias) return canonical
  }

  return normalized.replace(/\s+/g, '_')
}

export function normalizeValue(value) {
  const num = normalizeNumber(value)
  if (num !== undefined) return num

  if (value == null || value === '') return undefined
  return String(value).trim()
}

export function mapAndNormalize(row) {
  const result = {}
  for (const [key, val] of Object.entries(row)) {
    const canonical = canonicalize(key)
    const normalized = normalizeValue(val)
    if (normalized !== undefined) result[canonical] = normalized
  }
  return result
}
