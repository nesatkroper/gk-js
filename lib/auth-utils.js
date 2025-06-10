export const runtime = 'nodejs';
import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'


const SECRET_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET || 'your-secret-key-here'
export function storeAuthData(data, expiresInDays = 7) {
  try {
    const dataString = JSON.stringify(data)
    const encryptedData = CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString()

    Cookies.set('auth-data', encryptedData, {
      expires: expiresInDays,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })
  } catch (error) {
    console.error('Error storing auth data:', error)
  }
}

export function getAuthData() {
  try {
    const encryptedData = Cookies.get('auth-data')
    if (!encryptedData) return null

    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8)

    return JSON.parse(decryptedData)
  } catch (error) {
    console.error('Error retrieving auth data:', error)
    return null
  }
}

export function clearAuthData() {
  Cookies.remove('auth-data', { path: '/' })
}