import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadVideo } from "../api.js";

const CATEGORIES = ["General", "Film", "Music", "Tech", "Art", "Live", "Gaming", "Education"];

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [channelName, setChannelName] = useState("You");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");

  function pickFile(f) {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError("Choose a video file first.");
      return;
    }
    setBusy(true);
    setError("");
    setProgress(0);

    const fd = new FormData();
    fd.append("video", file);
    fd.append("title", title || file.name);
    fd.append("description", description);
    fd.append("category", category);
    fd.append("channelName", channelName);

    try {
      const res = await uploadVideo(fd, setProgress);
      navigate(`/watch/${res.video.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="page upload-page">
      <div className="page-hero">
        <div>
          <h1>Upload to Eyebox</h1>
          <p>
            Drop an MP4, WebM, or MOV. The free streaming server stores it locally
            and serves it with HTTP Range requests.
          </p>
        </div>
      </div>

      <form className="upload-form" onSubmit={onSubmit}>
        <div
          className={`dropzone ${drag ? "drag" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            pickFile(e.dataTransfer.files?.[0]);
          }}
        >
          <strong>{file ? file.name : "Drag & drop your video"}</strong>
          <p>{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "or click to browse — up to 2 GB"}</p>
          <div style={{ marginTop: "1rem" }}>
            <label className="btn btn-ghost">
              Choose file
              <input
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell viewers what this is about"
          />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Channel name
          <input value={channelName} onChange={(e) => setChannelName(e.target.value)} />
        </label>

        {busy && (
          <div className="progress" aria-label="Upload progress">
            <span style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <div className="error">{error}</div>}

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? `Uploading ${progress}%…` : "Publish"}
        </button>
      </form>
    </main>
  );
}
