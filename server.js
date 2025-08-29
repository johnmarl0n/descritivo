const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');

const app = express();
app.use(cors());
app.use(express.static('public'));

const modulosLabel = {
  COM: "Compra",
  FAT: "Faturamento",
  FIN: "Financeiro",
  STK: "Estoque",
  NFE: "Nota",
  EFD: "EFD",
  APP: "Mobile",
  API: "API",
  PDV: "PDV"
};

function agruparPorModulo(lista) {
  const agrupado = {};
  lista.forEach(n => {
    const chave = (n.MODULO || 'OUTRO').toUpperCase();
    const modulo = modulosLabel[chave] || 'Válido para todos os módulos';
    agrupado[modulo] = agrupado[modulo] || [];
    agrupado[modulo].push(n);
  });
  return agrupado;
}

app.get('/api/novidades', (req, res) => {
  const filePath = path.join(__dirname, 'dados', 'DADOS.xlsx');
  if (!fs.existsSync(filePath)) return res.status(404).send('Dados não encontrados');

  //	Data e hora da modificação - Sueli
  const stat = fs.statSync(filePath);
  const dataModificacao = stat.mtime.toISOString();

  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const dados = xlsx.utils.sheet_to_json(sheet);

  const v824 = dados.filter(r => (r.VERSAO || '').startsWith('8.24'));
  const v825 = dados.filter(r => (r.VERSAO || '').startsWith('8.25'));

  res.json({
    dataModificacao,
    v824: agruparPorModulo(v824),
    v825: agruparPorModulo(v825)
  });
});

const PORT = 8502;
app.listen(PORT, () => {
  console.log('Servidor rodando em http://localhost:' + PORT);
});
