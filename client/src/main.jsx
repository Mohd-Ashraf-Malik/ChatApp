import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { ChatProvider } from '../context/ChatContext'
import { GroupChatProvider } from '../context/GroupContext'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ChatProvider>
        <GroupChatProvider>
          <App />
        </GroupChatProvider>
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>,
)
