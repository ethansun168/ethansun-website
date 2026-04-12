import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar';
import { ThemeProvider } from './components/theme-provider';
import { ROUTES } from './constants';
import { useUser } from './hooks/query';

function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { data: user, isLoading } = useUser()
  if (isLoading) return "Logging in...";
  if (!user) return <Navigate to="/login" replace />
  return element;
}

function App() {
  return (
    <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
      <Navbar />
      <Routes>
        {
          ROUTES.map(({ path, element, protected: isProtected }) => (
            <Route key={path} path={path} element={isProtected ? <ProtectedRoute element={element} /> : element} />
          ))
        }
      </Routes>
    </ThemeProvider>
  )
}

export default App
