import { Routes, Route } from 'react-router-dom'

// CSS files
import './App.css'

//pages
import HomePage from './pages/home/HomePage'
import SignUpPage from './pages/auth/signup/SignUpPage.jsx'
import LoginPage from './pages/auth/login/LoginPage'
import NotificationPage from './pages/notification/NotificationPage.jsx'
import ProfilePage from './pages/profile/ProfilePage.jsx'


// components
import Sidebar from './components/common/Sidebar.jsx'
import RightPanel from './components/common/RightPanel.jsx'


function App() {

  return <>
    	<div className='flex max-w-6xl mx-auto'>
			<Sidebar />
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/signup' element={<SignUpPage />} />
				<Route path='/login' element={<LoginPage />} />
				<Route path='/notifications' element={<NotificationPage />} />
				<Route path='/profile/:username' element={<ProfilePage />} />
			</Routes>
			<RightPanel />
		</div>
  </>
}

export default App
