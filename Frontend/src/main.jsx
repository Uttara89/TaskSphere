import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { UserProvider } from './context/UserContext.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Dashboard from './Pages/Dashboard.jsx'
import Tasks from './Pages/Tasks.jsx'
import Calendar from './Pages/Calendar.jsx'
import Connect from './Pages/Connect.jsx'
import Projects from './Pages/Projects.jsx'


// Access environment variables using import.meta.env
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

console.log('Clerk Publishable Key:', PUBLISHABLE_KEY);

const BrowserRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,

    children: [
      {
        path: "tasks",
        element: <Tasks />,
      },
      {
        path: "calendar",
        element: <Calendar />,
      },
      {
        path: "connect",
        element: <Connect />,
      },
      {
        path: "projects",
        element: <Projects />,
      }

    ],
  },
  
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/" signInUrl="/dashboard/tasks">
      <UserProvider>
        <RouterProvider router={BrowserRouter} />
      </UserProvider>
    </ClerkProvider>
  </StrictMode>,
)