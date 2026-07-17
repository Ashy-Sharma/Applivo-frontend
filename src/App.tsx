import { Route, Routes } from 'react-router-dom';

import Login from '@/pages/Login';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from "@/auth/ProtectedRoute.tsx";
import Discover from "@/pages/Discover.tsx";
import AppDetails from "@/pages/AppDetails.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import Upload from '@/pages/Upload';
import NotFound from "@/pages/NotFound.tsx";

export default function App() {
  return (
      <div className="min-h-screen flex flex-col bg-background font-sans">
        <Header />
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8">
          <Routes>
              <Route path="/login" element={<Login />}/>
              <Route path="/" element={<Discover />} />
              <Route path="/apps/:id" element={<AppDetails />} />

              <Route
                  path="/dashboard"
                  element={
                      <ProtectedRoute allowedRoles={['DEVELOPER', 'ADMIN']}>
                          <Dashboard />
                      </ProtectedRoute>
                  }
              />
              <Route
                  path="/dashboard/new"
                  element={
                      <ProtectedRoute allowedRoles={['DEVELOPER', 'ADMIN']}>
                          <Upload />
                      </ProtectedRoute>
                  }
              />
              <Route
                  path="/dashboard/:appId/upload"
                  element={
                      <ProtectedRoute allowedRoles={['DEVELOPER', 'ADMIN']}>
                          <Upload />
                      </ProtectedRoute>
                  }
              />

              <Route path="*" element={<NotFound />} />


          </Routes>
        </main>
        <Footer />
      </div>
  );
}