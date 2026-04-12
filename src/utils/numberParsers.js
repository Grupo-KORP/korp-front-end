export function parseFlexibleNumber(value) {
  if (value === null || value === undefined) {
    return Number.NaN
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.NaN
  }

  let input = String(value).trim()
  if (!input) {
    return Number.NaN
  }

  input = input
    .replace(/^R\$/i, '')
    .replace(/\s+/g, '')
    .replace(/[^0-9,.-]/g, '')

  if (!input) {
    return Number.NaN
  }

  const hasComma = input.includes(',')
  const hasDot = input.includes('.')

  if (hasComma && hasDot) {
    const lastComma = input.lastIndexOf(',')
    const lastDot = input.lastIndexOf('.')
    const decimalSeparator = lastComma > lastDot ? ',' : '.'
    const thousandSeparator = decimalSeparator === ',' ? '.' : ','

    input = input.split(thousandSeparator).join('')
    if (decimalSeparator === ',') {
      input = input.replace(',', '.')
    }
  } else if (hasComma) {
    const parts = input.split(',')

    if (parts.length === 2 && parts[1].length <= 2) {
      input = `${parts[0].replace(/\./g, '')}.${parts[1]}`
    } else {
      input = parts.join('')
    }
  } else if (hasDot) {
    const parts = input.split('.')

    if (parts.length === 2 && parts[1].length <= 2) {
      input = parts.join('.')
    } else {
      input = parts.join('')
    }
  }

  input = input.replace(/(?!^)-/g, '')

  const parsed = Number(input)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

export function formatNormalizedNumber(value) {
  if (!Number.isFinite(value)) {
    return ''
  }

  if (Number.isInteger(value)) {
    return String(value)
  }

  return String(Number(value.toFixed(2)))
}
