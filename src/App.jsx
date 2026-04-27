import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateTopic from './pages/CreateTopic'
import TopicDetail from './pages/TopicDetail'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

export default function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/topic/:id" element={<TopicDetail />} />
          <Route path="/create-topic" element={
            <ProtectedRoute><CreateTopic /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute><Admin /></ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
      Website sedang maintenance 🚧
    </div>
  )
}
