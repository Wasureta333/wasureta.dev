// App.tsx
import './App.css'
import HomePage from './pages/homepage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="w-full flex flex-col items-center">
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
