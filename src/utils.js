export function compact(values) {
  const newValues = {}
  Object.entries(values).forEach((e) => {
    const [k, v] = e
    if (v !== null && typeof v !== 'undefined' && v !== '') newValues[k] = v
  })
  return newValues
}
