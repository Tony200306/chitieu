import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDZIAdzaesTvPKGZrGnd0mka5zTZ_HVJpE',
  authDomain: 'chitieu-3bd87.firebaseapp.com',
  projectId: 'chitieu-3bd87',
  storageBucket: 'chitieu-3bd87.firebasestorage.app',
  messagingSenderId: '56793062855',
  appId: '1:56793062855:web:59d1bbda0b5678abd90de2',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
