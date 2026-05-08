import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard    from "./pages/Dashboard.jsx";
import Library      from "./pages/Library.jsx";
import AddBook      from "./pages/AddBook.jsx";
import BookDetail   from "./pages/BookDetail.jsx";
import EditBook     from "./pages/EditBook.jsx";
import Podcasts     from "./pages/Podcasts.jsx";
import AddPodcast   from "./pages/AddPodcast.jsx";
import PodcastDetail from "./pages/PodcastDetail.jsx";
import MediaList    from "./pages/MediaList.jsx";
import AddMedia     from "./pages/AddMedia.jsx";
import MediaDetail  from "./pages/MediaDetail.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="library"      element={<Library />} />
        <Route path="add-book"     element={<AddBook />} />
        <Route path="books/:id"    element={<BookDetail />} />
        <Route path="books/:id/edit" element={<EditBook />} />
        <Route path="podcasts"     element={<Podcasts />} />
        <Route path="add-podcast"  element={<AddPodcast />} />
        <Route path="podcasts/:id" element={<PodcastDetail />} />
        <Route path="media"        element={<MediaList />} />
        <Route path="add-media"    element={<AddMedia />} />
        <Route path="media/:id"    element={<MediaDetail />} />
        <Route path="*"            element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
