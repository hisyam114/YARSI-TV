// Test script to fetch Articles data using gviz format
const https = require('https');

const SHEET_ID = '1ZXfS1FQJqBidwg4kuJ7ODQ4HkdUZhInJpmis3bDCDw4';
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Articles`;

console.log('Testing Articles sheet with gviz format:');
console.log('URL:', url);
console.log('---\n');

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const lines = data.split('\n');
    console.log('Total lines:', lines.length);
    console.log('\nFirst 5 lines:');
    lines.slice(0, 5).forEach((line, i) => {
      console.log(`Line ${i + 1}:`, line);
    });
    
    if (lines[0].includes('Article') || lines[0].includes('Title')) {
      console.log('\n*** SUCCESS! Found Articles data ***');
    } else if (lines[0].includes('<')) {
      console.log('\n*** ERROR: Got HTML response ***');
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
