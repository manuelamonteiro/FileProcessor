let currentSort = { key: null, asc: true }
let currentFilter = ''
let originalRows = []

export function resetState() {
  currentSort = { key: null, asc: true }
  currentFilter = ''
  originalRows = []
}

export function setOriginalRows(rows) {
  originalRows = [...rows]
}

export function getOriginalRows() {
  return originalRows
}

export function renderTable(rows) {
  const container = document.getElementById('tableContainer')
  container.innerHTML = ''

  if (!rows || !rows.length) {
    container.textContent = 'Nenhum dado válido encontrado.'
    return
  }

  createFilterInput(container)

  let rowsToRender = rows
  if (currentFilter.trim()) {
    const term = currentFilter.toLowerCase()
    rowsToRender = rows.filter(row =>
      Object.values(row).some(val =>
        String(val ?? '').toLowerCase().includes(term)
      )
    )
  }

  const table = document.createElement('table')
  table.className = 'min-w-full border bg-white shadow-sm rounded-lg overflow-hidden'

  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')

  const allKeys = Array.from(new Set(rows.flatMap(Object.keys)))

  allKeys.forEach(key => {
    const th = document.createElement('th')
    th.className = 'px-4 py-2 border cursor-pointer select-none transition-colors duration-200'

    if (currentSort.key === key) {
      th.className += ' bg-blue-100 text-blue-800 font-semibold'
    } else {
      th.className += ' bg-gray-100 hover:bg-gray-200'
    }

    const content = document.createElement('div')
    content.className = 'flex items-center justify-between gap-2'

    const text = document.createElement('span')
    text.textContent = key

    const icon = document.createElement('span')
    icon.className = 'text-gray-400'

    const isActive = currentSort.key === key
    const type = detectColumnType(key)
    if (isActive) {
      icon.textContent = currentSort.asc ? '▲' : '▼'
      icon.className = 'text-blue-600'
    } else if (type) {
      icon.textContent = '⇅'
      icon.className = 'text-gray-400 opacity-50'
    } else {
      icon.textContent = ''
    }

    content.appendChild(text)
    content.appendChild(icon)
    th.appendChild(content)

    th.addEventListener('click', () => sortTableByKey(rows, key))
    headerRow.appendChild(th)
  })

  thead.appendChild(headerRow)
  table.appendChild(thead)

  const tbody = document.createElement('tbody')
  rowsToRender.forEach((row, index) => {
    const tr = document.createElement('tr')
    tr.className = index % 2 === 0 ? 'bg-gray-50' : 'bg-white hover:bg-blue-50'
    allKeys.forEach(key => {
      const td = document.createElement('td')
      td.className = 'px-4 py-2 border-b text-sm'
      const value = row[key]
      td.textContent = value === undefined || value === null || value === '' ? 'x' : value
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  })
  table.appendChild(tbody)

  container.appendChild(table)

  const info = document.createElement('div')
  info.className = 'mt-2 text-sm text-gray-600'
  info.textContent = `Exibindo ${rowsToRender.length} de ${rows.length} registros`
  container.appendChild(info)
}

function createFilterInput(container) {
  const filterDiv = document.createElement('div')
  filterDiv.className = 'mb-4 flex gap-2 items-center'

  const filterInput = document.createElement('input')
  filterInput.type = 'text'
  filterInput.placeholder = 'Filtrar dados...'
  filterInput.className = 'px-3 py-2 border rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
  filterInput.value = currentFilter

  const filterBtn = document.createElement('button')
  filterBtn.textContent = 'Filtrar'
  filterBtn.className = 'px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm'

  const clearBtn = document.createElement('button')
  clearBtn.textContent = 'Limpar'
  clearBtn.className = 'px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm'

  filterBtn.addEventListener('click', () => {
    currentFilter = filterInput.value
    renderTable(originalRows)
  })

  clearBtn.addEventListener('click', () => {
    filterInput.value = ''
    currentFilter = ''
    renderTable(originalRows)
  })

  filterDiv.appendChild(filterInput)
  filterDiv.appendChild(filterBtn)
  filterDiv.appendChild(clearBtn)
  container.appendChild(filterDiv)
}

function sortTableByKey(rows, key) {
  const columnType = detectColumnType(key)
  if (!columnType) return

  if (currentSort.key === key) {
    currentSort.asc = !currentSort.asc
  } else {
    currentSort.key = key
    currentSort.asc = true
  }

  originalRows.sort((a, b) => {
    const compA = toComparable(a[key], columnType)
    const compB = toComparable(b[key], columnType)

    if (compA == null && compB == null) return 0
    if (compA == null) return 1
    if (compB == null) return -1

    return currentSort.asc ? compA - compB : compB - compA
  })

  renderTable(originalRows)
}

function detectColumnType(key) {
  for (const row of originalRows) {
    const val = row[key]
    if (val == null || val === '') continue
    if (typeof val === 'number') return 'number'

    if (typeof val === 'string') {
      const str = val.trim()
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return 'date'
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return 'date'
      const d = Date.parse(str)
      if (!Number.isNaN(d)) return 'date'
    }
  }
  return null
}

function toComparable(val, type) {
  if (val == null || val === '') return null
  if (type === 'number') {
    return typeof val === 'number' ? val : Number(val)
  }
  if (type === 'date') {
    if (val instanceof Date) return val.getTime()
    const str = String(val).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str + 'T00:00:00').getTime()
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
      const [d, m, y] = str.split('/')
      return new Date(Number(y), Number(m) - 1, Number(d)).getTime()
    }
    const t = Date.parse(str)
    return Number.isNaN(t) ? null : t
  }
  return null
}
