const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('NBAExpertPicks.xlsx');
const result = {};

workbook.SheetNames.forEach(sheetName => {
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  result[sheetName] = data;
});

fs.writeFileSync('output.json', JSON.stringify(result, null, 2));
console.log('All sheets exported to output.json');