import { useEffect } from 'react';
import './App.css';
import AppToast from './components/common/AppToast.jsx';
import AppRouter from './routes/approuter.jsx';

function App() {
  useEffect(() => {
    console.log(`process.env.OPENAI_API_KEY : ${(process.env.OPENAI_API_KEY) ?? ""}`);
    console.log(`process.env.local.OPENAI_API_KEY : ${(process.env.local.OPENAI_API_KEY) ?? ""}`);
    console.log(`process.env.REACT_APP_OPENAI_API_KEY : ${process.env.REACT_APP_OPENAI_API_KEY}`);
    console.log(`VITE_OPENAI_API_KEY : ${process.env.VITE_OPENAI_API_KEY}`);
  })
  return (<>
    <AppToast />
    <AppRouter />
  </>);
}

export default App;
