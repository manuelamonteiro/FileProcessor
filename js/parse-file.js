import { mapAndNormalize } from './utils.js'

export async function parseFile(file) {
  if (!file) throw new Error('Nenhum arquivo fornecido')
  if (file.size === 0) throw new Error('Arquivo está vazio')
  if (file.size > 10 * 1024 * 1024) throw new Error('Arquivo muito grande (máximo 10MB)')

  const extension = file.name.split('.').pop().toLowerCase()
  const validExtensions = ['csv', 'txt', 'json', 'xml']
  if (!validExtensions.includes(extension)) {
    throw new Error(`Formato não suportado: .${extension}. Use ${validExtensions.join(', ')}`)
  }

  let text
  try {
    text = await file.text()
  } catch {
    throw new Error('Erro ao ler o arquivo. Verifique se o arquivo não está corrompido.')
  }
  if (!text.trim()) throw new Error('Arquivo não contém dados válidos')

  let rawRows = []

  try {
    switch (extension) {
      case 'csv':
      case 'txt': {
        const parseResult = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          delimiter: extension === 'csv' ? ',' : '\t'
        })
        if (parseResult.errors.length > 0) console.warn('Avisos no parsing CSV:', parseResult.errors)
        rawRows = parseResult.data
        if (!rawRows.length) throw new Error('Nenhuma linha de dados encontrada no arquivo CSV/TXT')
        break
      }
      case 'json': {
        const jsonData = JSON.parse(text)
        rawRows = Array.isArray(jsonData) ? jsonData : [jsonData]
        break
      }
      case 'xml': {
        const sanitized = text.replace(/<\/?([A-Za-z0-9_]+)\s+([A-Za-z0-9_]+)>/g,
          (match, p1, p2) => match.startsWith('</') ? `</${p1}_${p2}>` : `<${p1}_${p2}>`)

        const dom = new DOMParser().parseFromString(sanitized, 'application/xml')
        if (dom.querySelector('parsererror')) throw new Error('XML mal formatado')

        let rowsNodeList = dom.getElementsByTagName('row')
        if (rowsNodeList.length === 0) rowsNodeList = dom.getElementsByTagName('record')
        if (rowsNodeList.length === 0) rowsNodeList = dom.getElementsByTagName('item')
        if (rowsNodeList.length === 0) rowsNodeList = dom.getElementsByTagName('data')

        if (rowsNodeList.length === 0) throw new Error('Nenhum nó de dados encontrado no XML')

        rawRows = Array.from(rowsNodeList).map(node => {
          const obj = {}
          Array.from(node.children).forEach(child => {
            obj[child.tagName] = child.textContent.trim()
          })
          return obj
        })

        if (!rawRows.length) throw new Error('Nenhum dado foi encontrado no XML')
        break
      }
    }
  } catch (error) {
    if (error.message && error.message.includes('inválido')) throw error
    throw new Error(`Erro ao processar arquivo ${extension.toUpperCase()}: ${error.message}`)
  }

  if (!rawRows.length) throw new Error('Nenhum dado foi encontrado no arquivo')

  const mapped = rawRows.map(mapAndNormalize).filter(r => Object.keys(r).length > 0)
  if (mapped.length === 0) throw new Error('Nenhum dado válido foi encontrado após o processamento')

  return mapped
}
