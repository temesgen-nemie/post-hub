import axios from 'axios'


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'


const api = axios.create({
baseURL: API_BASE,
withCredentials: true, // send cookies for auth flows
headers: {
'Content-Type': 'application/json',
},
})


export default api