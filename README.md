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

## ➕ Como adicionar novos formatos de arquivo

A aplicação foi projetada para ser **extensível**. Se você precisa processar um novo tipo de arquivo (por exemplo, `.tsv`, `.yaml`, etc.), basta seguir estes passos:

1. Abra `js/parse-file.js`.
2. Dentro do `switch (extension)` adicione um novo `case` com a extensão desejada.
3. Converta o conteúdo bruto em um array de objetos (`rawRows`). Use o parser que preferir (PapaParse, DOMParser, YAML, etc.).
4. Preencha `rawRows` e dê `break` para que o pipeline de normalização continue funcionando.
---

## 📚 Criando ou editando o dicionário de campos

Para unificar cabeçalhos que têm o mesmo significado utilizamos o objeto
`fieldDictionary` em `js/utils.js`. Cada chave canônica contém um array com seus
sinônimos:

```js
export const fieldDictionary = {
  data_registro: ['data', 'data_medicao', 'registro'],
  metrica_a: ['metrica a', 'a', 'valor_a'],
  ...
}
```

Se a coluna de entrada não corresponder a nenhuma chave ou sinônimo, o nome será
"sanitizado" e usado como está. Portanto, manter o dicionário atualizado garante
que os dados caiam na coluna correta da tabela e no JSON exportado.


