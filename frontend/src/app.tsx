import { Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar';
import { ThemeProvider } from './components/theme-provider';
import { ROUTES } from './constants';

function App() {
  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <Navbar />
      <Routes>
        {
          ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))
        }
      </Routes>
    </ThemeProvider>
  )
}

export default App
