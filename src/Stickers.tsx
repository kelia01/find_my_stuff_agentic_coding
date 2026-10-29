import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { spotUrl } from "./spots";

function Qr({ text }: { text: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(text, { margin: 1, width: 200 }).then(setSrc);
  }, [text]);
  return src ? <img src={src} alt={text} width={160} height={160} /> : null;
}

export default function Stickers({
  spots,
  onAdd,
  onRemove,
  onClose,
}: {
  spots: string[];
  onAdd: (spot: string) => void;
  onRemove: (spot: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  return (
    <div>
      <header className="no-print stickers-head">
        <h1>🏷️ Spot stickers</h1>
        <div className="row">
          <button className="primary" onClick={() => window.print()}>
            Print
          </button>
          <button className="ghost" onClick={onClose}>
            Back
          </button>
        </div>
      </header>
      <form
        className="row no-print"
        style={{ margin: "16px 0" }}
        onSubmit={(e) => {
          e.preventDefault();
          const s = name.trim();
          if (s && !spots.includes(s)) onAdd(s);
          setName("");
        }}
      >
        <input placeholder="New spot (e.g. Desk drawer)" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="primary" disabled={!name.trim()}>
          Add
        </button>
      </form>
      <div className="stickers">
        {spots.map((spot) => (
          <div key={spot} className="sticker">
            <Qr text={spotUrl(window.location.origin, spot)} />
            <b>{spot}</b>
            <button className="ghost no-print" onClick={() => onRemove(spot)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
