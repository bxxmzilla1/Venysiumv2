import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { SectionPage } from './pages/SectionPage'
import { ApiKeyProvider } from './context/ApiKeyContext'

export default function App() {
  return (
    <ApiKeyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/system" replace />} />
            <Route path=":sectionId" element={<SectionPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ApiKeyProvider>
  )
}
