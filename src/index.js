// Filename: src/index.js (或者 index.jsx)

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; // 导入你的 App 组件
import './index.css'; // 如果你有CSS文件的话

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
