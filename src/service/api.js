import axios from 'axios'

export const api = axios.create({
    baseURL: 'https://fritz-api-rest.fritzvzla.com/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
    }
})