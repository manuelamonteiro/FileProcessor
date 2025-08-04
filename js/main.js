import { parseFile } from './parse-file.js'
import { renderTable, resetState, setOriginalRows } from './table.js'

const fileInput = document.getElementById('fileInput')
const processBtn = document.getElementById('processBtn')
const exportBtn = document.getElementById('exportBtn')
const viewJsonBtn = document.getElementById('viewJsonBtn')
const clearFileBtn = document.getElementById('clearFileBtn')
const messageEl = document.getElementById('message')
const processIcon = document.getElementById('processIcon')
const processText = document.getElementById('processText')

let loadedRows = []

fileInput.addEventListener('change', handleFileChange)

function resetUI() {
  console.log('resetUI chamado - limpando interface')
  
  fileInput.value = ''
  
  loadedRows = []
  
  processBtn.disabled = true
  clearFileBtn.classList.add('hidden')
  exportBtn.classList.add('hidden')
  viewJsonBtn.classList.add('hidden')
  
  document.getElementById('tableContainer').innerHTML = ''
  
  showMessage('')
  
  resetState()
  
  console.log('Estado limpo - fileInput.value:', fileInput.value, 'files.length:', fileInput.files.length)
}

window.addEventListener('load', resetUI)
window.addEventListener('pageshow', resetUI)

window.addEventListener('focus', () => {
  if (fileInput.files.length === 0 && fileInput.value !== '') {
    resetUI()
  }
})

processBtn.addEventListener('click', handleProcess)
exportBtn.addEventListener('click', handleExport)
viewJsonBtn.addEventListener('click', handleViewJson)
clearFileBtn.addEventListener('click', handleClearFile)

document.getElementById('closeJsonModal').addEventListener('click', () => {
  const jsonModal = document.getElementById('jsonModal')
  jsonModal.classList.add('hidden')
  jsonModal.classList.remove('flex')
})

document.getElementById('jsonModal').addEventListener('click', e => {
  if (e.target.id === 'jsonModal') {
    const jsonModal = document.getElementById('jsonModal')
    jsonModal.classList.add('hidden')
    jsonModal.classList.remove('flex')
  }
})

function handleFileChange() {
  const hasFile = fileInput.files.length > 0
  console.log('handleFileChange - hasFile:', hasFile, 'files.length:', fileInput.files.length)
  
  processBtn.disabled = !hasFile
  clearFileBtn.classList.toggle('hidden', !hasFile)
  
  if (hasFile) {
    const file = fileInput.files[0]
    const validFormats = ['csv', 'json', 'xml', 'txt']
    const extension = file.name.split('.').pop().toLowerCase()

    console.log('Arquivo selecionado:', file.name, 'extensão:', extension)

    if (!validFormats.includes(extension)) {
      showMessage(`Formato não suportado: .${extension}. Use CSV, JSON, XML ou TXT.`, 'error')
      processBtn.disabled = true
      console.log('Formato inválido - botão desabilitado')
      return
    }

    showMessage(`Arquivo selecionado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'info')
    console.log('Botão processar habilitado - disabled:', processBtn.disabled)
  } else {
    showMessage('')
    console.log('Nenhum arquivo - botão desabilitado')
  }

  exportBtn.classList.add('hidden')
  viewJsonBtn.classList.add('hidden')
  document.getElementById('tableContainer').innerHTML = ''
  resetState()
  loadedRows = []
}

async function handleProcess() {
  const file = fileInput.files[0]
  if (!file) return

  processIcon.textContent = '⏳'
  processText.textContent = 'Processando...'
  processBtn.disabled = true
  showMessage('Processando arquivo...', 'info')

  try {
    const rows = await parseFile(file)
    loadedRows = [...rows]
    setOriginalRows(rows)
    renderTable(rows)

    exportBtn.classList.remove('hidden')
    exportBtn.disabled = false
    viewJsonBtn.classList.remove('hidden')
    viewJsonBtn.disabled = false

    showMessage(`✅ Arquivo processado com sucesso! ${rows.length} registros encontrados.`, 'success')
  } catch (err) {
    console.error(err)
    loadedRows = []
    resetState()
    document.getElementById('tableContainer').innerHTML = ''
    exportBtn.classList.add('hidden')
    viewJsonBtn.classList.add('hidden')
    showMessage(`❌ ${err.message || 'Erro ao processar arquivo.'}`, 'error')
  } finally {
    processIcon.textContent = '📊'
    processText.textContent = 'Processar Arquivo'
    processBtn.disabled = false
  }
}

function handleExport() {
  if (loadedRows.length === 0) return
  const dataStr = JSON.stringify(loadedRows, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'dados_processados.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showMessage('📁 Arquivo JSON exportado com sucesso!', 'success')
  setTimeout(() => {
    showMessage(`✅ ${loadedRows.length} registros carregados.`, 'success')
  }, 2000)
}

function handleViewJson() {
  if (loadedRows.length === 0) return
  const jsonModal = document.getElementById('jsonModal')
  document.getElementById('jsonContent').textContent = JSON.stringify(loadedRows, null, 2)
  jsonModal.classList.remove('hidden')
  jsonModal.classList.add('flex')
}


function handleClearFile() {
  fileInput.value = ''
  clearFileBtn.classList.add('hidden')
  handleFileChange()
}

function showMessage(text, type = 'info') {
  messageEl.textContent = text
  switch (type) {
    case 'success':
      messageEl.className = 'text-sm text-green-600'
      break
    case 'error':
      messageEl.className = 'text-sm text-red-600'
      break
    default:
      messageEl.className = 'text-sm text-gray-600'
  }
}
