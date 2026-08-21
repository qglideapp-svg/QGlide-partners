import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './styles/portal.css'

export default function App() {
  return <RouterProvider router={router} />
}
