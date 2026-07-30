import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Watch from "./pages/Watch.jsx";
import Upload from "./pages/Upload.jsx";
import Channel from "./pages/Channel.jsx";
import Explore from "./pages/Explore.jsx";
import Search from "./pages/Search.jsx";
import Shorts from "./pages/Shorts.jsx";
import History from "./pages/History.jsx";
import WatchLaterPage from "./pages/WatchLater.jsx";
import Playlists from "./pages/Playlists.jsx";
import PlaylistDetail from "./pages/PlaylistDetail.jsx";
import BrowseCategory from "./pages/BrowseCategory.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="search" element={<Search />} />
        <Route path="shorts" element={<Shorts />} />
        <Route path="history" element={<History />} />
        <Route path="watch-later" element={<WatchLaterPage />} />
        <Route path="playlists" element={<Playlists />} />
        <Route path="playlists/:id" element={<PlaylistDetail />} />
        <Route path="browse" element={<BrowseCategory />} />
        <Route path="browse/:category" element={<BrowseCategory />} />
        <Route path="watch/:id" element={<Watch />} />
        <Route path="upload" element={<Upload />} />
        <Route path="channel/:handle" element={<Channel />} />
      </Route>
    </Routes>
  );
}
