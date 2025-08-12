import './App.css';
import AppRouter from './routes/AppRouter.jsx';
import AppToast from './components/common/AppToast.jsx';

function App() {
  return (<>
    <AppToast />
    <AppRouter />
  </>);
}

export default App;
