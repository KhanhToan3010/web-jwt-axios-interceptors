import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import auhtorizedAxiosInstance from '~/utils/authorizedAxios'
import { API_ROOT } from '~/utils/constants'
import { useNavigate } from 'react-router-dom'
import { handleLogoutApi } from '~/apis'

function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const res = await auhtorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
      //console.log('Data from API: ', res.data)
      //const userInforFromLocalStorage = localStorage.getItem('userInfo')
      //console.log('Data from LocalStorage: ', JSON.parse(userInforFromLocalStorage))
      setUser(res.data)
    }
    fetchData()
  }, [])
// Mớ useEffect này dùng để test
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const res = await auhtorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
  //     //console.log('Data from API: ', res.data)
  //     //const userInforFromLocalStorage = localStorage.getItem('userInfo')
  //     //console.log('Data from LocalStorage: ', JSON.parse(userInforFromLocalStorage))
  //     setUser(res.data)
  //   }
  //   fetchData()
  // }, [])
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const res = await auhtorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
  //     //console.log('Data from API: ', res.data)
  //     //const userInforFromLocalStorage = localStorage.getItem('userInfo')
  //     //console.log('Data from LocalStorage: ', JSON.parse(userInforFromLocalStorage))
  //     setUser(res.data)
  //   }
  //   fetchData()
  // }, [])
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const res = await auhtorizedAxiosInstance.get(`${API_ROOT}/v1/dashboards/access`)
  //     //console.log('Data from API: ', res.data)
  //     //const userInforFromLocalStorage = localStorage.getItem('userInfo')
  //     //console.log('Data from LocalStorage: ', JSON.parse(userInforFromLocalStorage))
  //     setUser(res.data)
  //   }
  //   fetchData()
  // }, [])

  const handleLogout = async () => {
    await handleLogoutApi()
    setUser(null)
    // Nếu TH2: Dung HttpOnly Cookies -> xoá userInfo trong localStorage
    // localStorage.removeItem('userInfo')
    // Direct to Login page after logout
    navigate('/login')
  }
  if (!user) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: '100vw',
        height: '100vh'
      }}>
        <CircularProgress />
        <Typography>Loading dashboard user...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{
      maxWidth: '1120px',
      marginTop: '1em',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '0 1em'
    }}>
      <Alert severity="info" sx={{ '.MuiAlert-message': { overflow: 'hidden' } }}>
        Đây là trang Dashboard sau khi user:&nbsp;
        <Typography variant="span" sx={{ fontWeight: 'bold', '&:hover': { color: '#fdba26' } }}>{user?.email}</Typography>
        &nbsp; đăng nhập thành công thì mới cho truy cập vào.
      </Alert>

      <Button
        type='button'
        variant='contained'
        color='info'
        size='large'
        sx={{ mt: 2, maxWidth: 'min-content', alignSelf: 'center', marginTop: '1em' }}
        onClick={handleLogout}
      >
          Logout
      </Button>
      <Divider sx={{ my: 2 }} />
    </Box>
  )
}

export default Dashboard
