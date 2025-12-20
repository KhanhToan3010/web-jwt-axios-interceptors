import axios from 'axios'
import { toast } from 'react-toastify'

// khởi tạo đối tượng Axios (authorizedAxiosInstance) -> custom và cấu hình chung cho dự án

let authorizedAxiosInstance = axios.create()
// thời gian chờ tối đa của 1 request
authorizedAxiosInstance.defaults.timeout = 10000 * 60 * 10

// withCredentials - cho phép axios tự động đính kèm cookies trong reqq gửi lên BE (trường hợp JWT token theo cơ chế htttOnly Cookie)
// authorizedAxiosInstance.defaults.withCredentials = true

// Add a request interceptor: can thiệp vào giữa mọi req API
authorizedAxiosInstance.interceptors.request.use((config) => {
  // Làm gì đó trước khi request dược gửi đi
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
}, function (error) {
  // Bất kì mã trạng thái nào lọt ra ngoài tầm 2xx đều khiến hàm này được trigger\
  // Làm gì đó với lỗi response
  console.log(error)
  // xử lí lỗi tập trung hiển thị thông báo lỗi trả về từ mói Api - clean code - viết code 1 lần
  if (error.response?.status !== 410) {
    toast.error(error.response?.data?.message || error?.message)}

  return Promise.reject(error)
})
export default authorizedAxiosInstance