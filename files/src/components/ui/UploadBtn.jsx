import React, { useRef, useState } from "react";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../src/firebase"; // check firebase import path
import Avatar from "./Avatar";

export default function UploadBtn({ photoURL, name, size = 80, onUploaded, folder = "avatars" }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const handle = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const r = storageRef(storage, `${folder}/${Date.now()}_${file.name}`);
      await uploadBytes(r, file);
      onUploaded(await getDownloadURL(r));
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
  };
  return (
    <div style={{ position: "relative", display: "inline-block", cursor: "pointer" }} onClick={() => ref.current?.click()}>
      <Avatar name={name} photoURL={photoURL} size={size} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: "var(--forest)", border: `2px solid var(--white)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
        {busy ? "⏳" : "📷"}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handle} />
    </div>
  );
}
