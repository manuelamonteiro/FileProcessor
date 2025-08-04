# 📊 Desafio – Processamento e Visualização de Dados

Aplicação **100 % front-end** em HTML, JavaScript _vanilla_ e Tailwind CSS para **ingestão, padronização e visualização de dados provenientes de arquivos CSV, JSON, XML ou TXT**.

1. recebe arquivos de dados (`.csv`, `.json`, `.xml`, `.txt`)
2. normaliza números e campos
3. exibe tudo em uma tabela interativa
4. permite baixar o resultado em JSON

## 🚀 Como executar

### 1. Modo rápido

```bash
npm install        
npm run dev        
```

Abra `http://localhost:8000` no navegador, carregue um arquivo e clique em **Processar**.

### 2. Abrir direto

Se preferir, basta abrir `index.html` (duplo-clique). 

## 🛠️ Funcionalidades principais

- Upload por arraste-e-solte ou _file picker_
- Parsing automático (CSV, JSON, XML, TXT)
- Conversão de formatos numéricos ("4.433.000" → 4433000)
- Mapeamento de sinônimos de campos para chaves canônicas
- Tabela com ordenação e filtro em tempo real
- Download do JSON padronizado

## 📁 Estrutura

```
📁 raiz/
├── index.html         # Interface principal
├── js/
    ├── parse-file.js  # Detecta formato e gera rawRows
    ├── main.js        # Orquestra parsing → normalização → UI
    ├── table.js       # Renderiza a tabela
    └── utils.js       # Funções auxiliares
```

