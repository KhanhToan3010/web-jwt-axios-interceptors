import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from '~/pages/Login'
import Dashboard from '~/pages/Dashboard'

// ProtectedRoute - xác định route nào cần đăng nhập mới được truy cập
// Sử dung <Outlet /> để render các route con bên trong Routes
// Nếu chưa đăng nhập thì redirect về trang /login
const ProtectedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  if (!user) return <Navigate to="/login" replace={true} />
  return <Outlet />
}

const UnauthorizedRoutes = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  if (user) return <Navigate to="/dashboard" replace={true} />
  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path='/' element={
        <Navigate to="/login" replace={true} />
      } />


      <Route element={<ProtectedRoutes />}>
        {/*  cac routes can login mới cho truy câp vao thi bao ngoai ProtectedRoute */}
        <Route path='/dashboard' element={<Dashboard />} />
      </Route>

      <Route element={<UnauthorizedRoutes />}>
        {/*  cac routes da truy cập dashboard không được truy cập vào login */}
        <Route path='/login' element={<Login />} />
      </Route>

    </Routes>
  )
}

export default App
