import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TutorSearchPage from './pages/TutorSearchPage'
import TutorProfilePage from './pages/TutorProfilePage'
import MessagesPage from './pages/MessagesPage'
import TutorOnboardingPage from './pages/TutorOnboardingPage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import SchedulePage from './pages/SchedulePage'
import StudentsPage from './pages/StudentsPage'
import UploadNotesPage from './pages/UploadNotesPage'
import AIAssistantPage from './pages/AIAssistantPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <TutorSearchPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tutor/:id"
                        element={
                            <ProtectedRoute>
                                <TutorProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/messages"
                        element={
                            <ProtectedRoute>
                                <MessagesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tutor-onboarding"
                        element={
                            <ProtectedRoute>
                                <TutorOnboardingPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <ProfileSettingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/schedule"
                        element={
                            <ProtectedRoute>
                                <SchedulePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/students"
                        element={
                            <ProtectedRoute>
                                <StudentsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/upload-notes"
                        element={
                            <ProtectedRoute>
                                <UploadNotesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ai-assistant"
                        element={
                            <ProtectedRoute>
                                <AIAssistantPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
