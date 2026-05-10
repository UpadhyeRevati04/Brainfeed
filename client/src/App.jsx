import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";
import { Spinner } from "./components/UI.jsx";
import Layout        from "./components/Layout.jsx";
import Login         from "./pages/Login.jsx";
import Register      from "./pages/Register.jsx";
import Dashboard     from "./pages/Dashboard.jsx";
import Library       from "./pages/Library.jsx";
import AddBook       from "./pages/AddBook.jsx";
import BookDetail    from "./pages/BookDetail.jsx";
import EditBook      from "./pages/EditBook.jsx";
import Podcasts      from "./pages/Podcasts.jsx";
import AddPodcast    from "./pages/AddPodcast.jsx";
import PodcastDetail from "./pages/PodcastDetail.jsx";
import MediaList     from "./pages/MediaList.jsx";
import AddMedia      from "./pages/AddMedia.jsx";
import MediaDetail   from "./pages/MediaDetail.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Spinner size={36} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Public><Login /></Public>} />
      <Route path="/register" element={<Public><Register /></Public>} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<Dashboard />} />
        <Route path="library"        element={<Library />} />
        <Route path="add-book"       element={<AddBook />} />
        <Route path="books/:id"      element={<BookDetail />} />
        <Route path="books/:id/edit" element={<EditBook />} />
        <Route path="podcasts"       element={<Podcasts />} />
        <Route path="add-podcast"    element={<AddPodcast />} />
        <Route path="podcasts/:id"   element={<PodcastDetail />} />
        <Route path="media"          element={<MediaList />} />
        <Route path="add-media"      element={<AddMedia />} />
        <Route path="media/:id"      element={<MediaDetail />} />
        <Route path="*"              element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}