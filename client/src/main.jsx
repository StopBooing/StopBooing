import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// 전역 스타일 주입
const style = document.createElement('style');
style.innerHTML = `
  body, html {
    margin: 0;
    padding: 0;
    overflow: hidden; /* 스크롤바 비활성화 */
  }
`;
document.head.appendChild(style);


createRoot(document.getElementById('root')).render(
    <App />,
)
