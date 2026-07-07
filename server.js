const express = require('express');
var fs = require('fs')
const app = express();
const port = 3000;

// 将当前目录下的 public 文件夹作为静态资源目录
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`访问 http://localhost:${port}`);
});