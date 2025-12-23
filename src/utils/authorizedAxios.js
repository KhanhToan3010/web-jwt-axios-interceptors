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

// Khởi tạo 1 promise cho việc call api refresh_token -> để khi nhận y/c refreshToken đầu tiên thì hold lại việc call API refresh_token
// đến khi xong rồi mới retry lại các API lỗi trước đó thay vì gọi lại refreshTokenAPI liên tục mỗi khi req lỗi 
let refreshTokenPromise = null
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
if (error.response?.status === 410 && originalRequest) {
    if (!refreshTokenPromise) {
      // Lấy refresh token từ localStorage - TH dùng localStorage
      const refreshToken = localStorage.getItem('refreshToken')
      // CAll Api Refresh Token
      refreshTokenPromise = refreshTokenApi(refreshToken)
        .then((res) => {
        // Lấy và gán lại accessToken vao localStorage
          const { accessToken } = res.data
          localStorage.setItem('accessToken', accessToken)
          authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`
          // Note: accessToken cũng đa được update lại ở Cookies (cho TH sử dụng cookie)
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
        .finally(() => {
          refreshTokenPromise = null
        })
    }
    // Cuối cùng return cái refreshTokenPromise trong TH success ở đây
    return refreshTokenPromise.then(() => {
      // Return lại axios instance của chúng ta kết hợp cái originalRequest để gọi lại những api ban đầu bị lỗi
      return authorizedAxiosInstance(originalRequest)
    })
  // TH1: Dùng localstorage -> chỉ xoá thông tin user trong localstorage phía FE
  }
  // xử lí lỗi tập trung hiển thị thông báo lỗi trả về từ mói Api - clean code - viết code 1 lần
  if (error.response?.status !== 410) {
    toast.error(error.response?.data?.message || error?.message)}

  return Promise.reject(error)
})
export default authorizedAxiosInstance