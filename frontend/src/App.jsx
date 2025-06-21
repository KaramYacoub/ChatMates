import { Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotificationsPage from "./pages/NotificationsPage";
import CallPage from "./pages/CallPage";
import ChatPage from "./pages/ChatPage";
import FriendsPage from "./pages/FriendsPage";
import ProfilePage from "./pages/ProfilePage";

import PageLoader from "./components/PageLoader";
import useAuthUser from "./hooks/useAuthUser";
import Layout from "./components/Layout";
import { useThemeStore } from "./store/UseThemeStore";

export default function App() {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = !!authUser;
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen" data-theme={theme}>
      <Routes>
        {/* HomePage */}
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={!isOnboarded ? "/onboarding" : "/"} />
            )
          }
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignUpPage />
            ) : (
              <Navigate to={!isOnboarded ? "/onboarding" : "/"} />
            )
          }
        />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            ) : !isAuthenticated ? (
              <Navigate to="/login" />
            ) : (
              <Navigate to="/onboarding" />
            )
          }
        />

        {/* Chat */}
        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            ) : !isAuthenticated ? (
              <Navigate to="/login" />
            ) : (
              <Navigate to="/onboarding" />
            )
          }
        />

        {/* Call */}
        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : !isAuthenticated ? (
              <Navigate to="/login" />
            ) : (
              <Navigate to="/onboarding" />
            )
          }
        />

        {/* Friends */}
        <Route
          path="/friends"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <FriendsPage />
              </Layout>
            ) : !isAuthenticated ? (
              <Navigate to="/login" />
            ) : (
              <Navigate to="/onboarding" />
            )
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <ProfilePage />
              </Layout>
            ) : !isAuthenticated ? (
              <Navigate to="/login" />
            ) : (
              <Navigate to="/onboarding" />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
}
