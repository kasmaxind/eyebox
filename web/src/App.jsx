import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Watch from "./pages/Watch.jsx";
import Upload from "./pages/Upload.jsx";
import Channel from "./pages/Channel.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="watch/:id" element={<Watch />} />
        <Route path="upload" element={<Upload />} />
        <Route path="channel/:handle" element={<Channel />} />
      </Route>
    </Routes>
  );
}
