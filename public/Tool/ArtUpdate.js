const fs = require('fs');
let jsonData;

readJsonData();
async function readJsonData(){
    jsonData = await loadJsonFromUrl(`../src/art/data.json`);
    console.log(jsonData);
}

async function loadJsonFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('请求失败');
    const data = await response.json();
    return data;
}