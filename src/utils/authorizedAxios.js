import axios from 'axios'
import { toast } from 'react-toastify'
import { handleLogoutApi, refreshTokenApi } from '~/apis'

// khởi tạo đối tượng Axios (authorizedAxiosInstance) -> custom và cấu hình chung cho dự án

let authorizedAxiosInstance = axios.create()
// thời gian chờ tối đa của 1 request
authorizedAxiosInstance.defaults.timeout = 10000 * 60 * 10

// withCredentials - cho phép axios tự động đính kèm cookies trong reqq gửi lên BE (trường hợp JWT token theo cơ chế htttOnly Cookie)
authorizedAxiosInstance.defaults.withCredentials = true

// Add a request interceptor: can thiệp vào giữa mọi req API
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Lấy accessToken từ localStorage và đính kem vào header
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    // 'Bearer'- theo tiêu chuẩn 0Auth 2.0 trong việc xđ loại token đang sử dụng (Bearer là token dành cho xác thực và uỷ quyền)
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
}, (error) => {
  // Làm gì đó với lỗi request
  return Promise.reject(error)
})

// Add a response interceptor: can thiệp vào giữa mọi res nhận về từ API
authorizedAxiosInstance.interceptors.response.use((response) => {
  // Bất kì mã trạng thái nào nằm trong tầm 2xx đều khiến hàm này được trigger
  // Làm gì đó với dữ liệu response
  return response
}, (error) => {
  // Bất kì mã trạng thái nào lọt ra ngoài tầm 2xx đều khiến hàm này được trigger\
  // Làm gì đó với lỗi response
/** Khu vực xử lí refresh Token tư động */
if (error.response?.status === 401) {
  handleLogoutApi().then(() => {
    // TH1: Dung localstorage -> chi can xoa thong tin user trong localStorage
    // localStorage.removeItem('userInfo')


      // Direct to Login page after logout, dung JS thuan
      location.href = '/login'
    })
}
  //  Nếu nhận lỗi 410 từ BE -> gọi api refresh token để làm mới lại access token
  // Đầu tiên lấy đuược các request API đang bị lỗi thông qua error.config
  const originalRequest = error.config
  console.log('originalRequest: ', originalRequest)
if (error.response?.status === 410 && !originalRequest._retry) {
  // Gán thêm 1 giá trị _retry = true trong thời gian chờ -> để việc refresh token chỉ gọi 1 lần tại 1 thời điểm 
    originalRequest._retry = true
    // Lấy refresh token từ localStorage - TH dùng localStorage
    const refreshToken = localStorage.getItem('refreshToken')
    // CAll Api Refresh Token
    return refreshTokenApi(refreshToken)
      .then((res) => {
        // Lấy và gán lại accessToken vao localStorage
        const { accessToken } = res.data
        localStorage.setItem('accessToken', accessToken)
        authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`
        // Note: accessToken cũng đa được update lại ở Cookies (cho TH sử dụng cookie)

        // Quan trọng: return lại axios instance của chungs ta kết hợp originalRequest để gọi lại những api ban đầu bị lỗi
        return authorizedAxiosInstance(originalRequest)
      })
      .catch((err) => {
        // Nếu nhận bất cứ lỗi nào từ api refresh token -> logout luôn
        handleLogoutApi().then(() => {
          // TH1: Dung localstorage -> chi can xoa thong tin user trong localStorage
          // localStorage.removeItem('userInfo')

          // Direct to Login page after logout, dung JS thuan
          location.href = '/login'
        })
        return Promise.reject(err)
      })

  // TH1: Dùng localstorage -> chỉ xoá thông tin user trong localstorage phía FE
}
  // xử lí lỗi tập trung hiển thị thông báo lỗi trả về từ mói Api - clean code - viết code 1 lần
  if (error.response?.status !== 410) {
    toast.error(error.response?.data?.message || error?.message)}

  return Promise.reject(error)
})
export default authorizedAxiosInstance