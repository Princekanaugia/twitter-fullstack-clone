import { Routes, Route } from 'react-router-dom'

//pages
import HomePage from './pages/home/HomePage'
import SignUpPage from './pages/auth/signup/SignUpPage.jsx'
import LoginPage from './pages/auth/login/LoginPage'

import './App.css'


function App() {

  return <>
    
    <div className='flex max-w-6xl mx-auto'>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/signup' element={<SignUpPage />} />
				<Route path='/login' element={<LoginPage />} />
			</Routes>
		</div>
  </>
}

export default App
