import React, { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, orderBy, serverTimestamp, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import Avatar from "../components/ui/Avatar";

export default function ChatScreen({ user, appData }) {
  const { users } = appData;
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "conversations"), where("participants", "array-contains", user.id));
    const unsub = onSnapshot(q, snap => {
      const convs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      convs.sort((a, b) => (b.lastMessageAt?.seconds || 0) - (a.lastMessageAt?.seconds || 0));
      setConversations(convs);
    });
    return unsub;
  }, [user.id]);

  useEffect(() => {
    if (!selectedConv) return;
    const q = query(collection(db, "conversations", selectedConv.id, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return unsub;
  }, [selectedConv?.id]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedConv || sending) return;
    setSending(true);
    const text = newMsg.trim();
    setNewMsg("");
    await addDoc(collection(db, "conversations", selectedConv.id, "messages"), {
      text, senderId: user.id, createdAt: serverTimestamp()
    });
    await updateDoc(doc(db, "conversations", selectedConv.id), {
      lastMessage: text, lastMessageAt: serverTimestamp(), lastSenderId: user.id
    });
    setSending(false);
  };

  const startConversation = async (otherUser) => {
    const existing = conversations.find(c => c.participants.includes(otherUser.id));
    if (existing) { setSelectedConv(existing); setShowNewChat(false); return; }
    const convRef = await addDoc(collection(db, "conversations"), {
      participants: [user.id, otherUser.id],
      participantNames: { [user.id]: user.name, [otherUser.id]: otherUser.name },
      participantPhotos: { [user.id]: user.photoURL || null, [otherUser.id]: otherUser.photoURL || null },
      lastMessage: "", lastMessageAt: serverTimestamp(), lastSenderId: null,
    });
    const newConv = { id: convRef.id, participants: [user.id, otherUser.id], participantNames: { [user.id]: user.name, [otherUser.id]: otherUser.name }, participantPhotos: {}, lastMessage: "" };
    setSelectedConv(newConv);
    setShowNewChat(false);
  };

  const getOtherUser = (conv) => {
    const otherId = conv.participants.find(p => p !== user.id);
    return { id: otherId, name: conv.participantNames?.[otherId] || "Utilizador", photoURL: conv.participantPhotos?.[otherId] || null };
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return d.toLocaleTimeString("pt", { hour: "2-digit", minute: "2-digit" });
  };

  const searchableUsers = users.filter(u => u.id !== user.id && (u.role === "empresa" || u.role === "cuidador" || conversations.some(c => c.participants.includes(u.id))));
  const filtered = searchableUsers.filter(u => u.name.toLowerCase().includes(newChatSearch.toLowerCase()));

  if (selectedConv) {
    const other = getOtherUser(selectedConv);
    const otherFull = users.find(u => u.id === other.id);
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", maxHeight: 680 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--white)", borderRadius: "18px 18px 0 0", border: `1px solid var(--border)`, borderBottom: `1px solid var(--border)` }}>
          <button onClick={() => setSelectedConv(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--muted)" }}>←</button>
          <Avatar name={other.name} photoURL={other.photoURL} size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{other.name}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "capitalize" }}>{otherFull?.role || "utilizador"}</div>
          </div>
          {otherFull?.phone && <a href={`tel:${otherFull.phone}`} className="btn btn-filled" style={{ padding: "6px 14px", fontSize: 12, textDecoration: "none" }}>📞 Ligar</a>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, background: "var(--cream)", display: "flex", flexDirection: "column", gap: 8 }}>
          {messages.length === 0 && <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, marginTop: 40 }}>Inicia a conversa com {other.name}</div>}
          {messages.map(m => {
            const isMine = m.senderId === user.id;
            return (
              <div key={m.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "72%", background: isMine ? "var(--forest)" : "var(--white)", color: isMine ? "var(--white)" : "var(--text)", borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,.07)" }}>
                  <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.text}</div>
                  <div style={{ fontSize: 10, opacity: .6, marginTop: 4, textAlign: "right" }}>{formatTime(m.createdAt)}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ display: "flex", gap: 10, padding: "12px 16px", background: "var(--white)", borderRadius: "0 0 18px 18px", border: `1px solid var(--border)`, borderTop: `1px solid var(--border)` }}>
          <input className="input" style={{ flex: 1 }} placeholder="Escreve uma mensagem…" value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} autoFocus />
          <button onClick={sendMessage} disabled={!newMsg.trim() || sending} className="btn btn-filled" style={{ padding: "0 18px", opacity: (!newMsg.trim() || sending) ? .5 : 1 }}>→</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "var(--font-fraunces)" }}>Mensagens</h2><p style={{ color: "var(--muted)", fontSize: 13, margin: "2px 0 0" }}>{conversations.length} conversa{conversations.length !== 1 ? "s" : ""}</p></div>
        <button onClick={() => setShowNewChat(!showNewChat)} className="btn btn-filled" style={{ padding: "8px 16px", fontSize: 13 }}>✏️ Nova conversa</button>
      </div>
      {showNewChat && (
        <div className="card">
          <label className="label">Pesquisar prestador ou empresa</label>
          <input className="input" style={{ marginBottom: 12 }} placeholder="Nome…" value={newChatSearch} onChange={e => setNewChatSearch(e.target.value)} autoFocus />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.slice(0, 6).map(u => (
              <div key={u.id} onClick={() => startConversation(u)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--pale)", borderRadius: 12, cursor: "pointer" }}>
                <Avatar name={u.name} photoURL={u.photoURL} size={36} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div><div style={{ fontSize: 11, color: "var(--muted)", textTransform: "capitalize" }}>{u.role}</div></div>
                <span style={{ color: "var(--moss)", fontSize: 13, fontWeight: 600 }}>Iniciar →</span>
              </div>
            ))}
            {filtered.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center" }}>Nenhum resultado</p>}
          </div>
        </div>
      )}
      {conversations.length === 0 && !showNewChat && (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Sem conversas ainda</div>
          <p style={{ fontSize: 13, marginTop: 8 }}>Inicia uma conversa com um prestador de serviços</p>
          <button onClick={() => setShowNewChat(true)} className="btn btn-filled" style={{ marginTop: 16, padding: "10px 22px" }}>Nova conversa</button>
        </div>
      )}
      {conversations.map(conv => {
        const other = getOtherUser(conv);
        return (
          <div key={conv.id} onClick={() => setSelectedConv(conv)} className="card" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <Avatar name={other.name} photoURL={other.photoURL} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{other.name}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{conv.lastMessage || "Sem mensagens"}</div>
            </div>
            <span style={{ color: "var(--muted)", fontSize: 11, flexShrink: 0 }}>{formatTime(conv.lastMessageAt)}</span>
          </div>
        );
      })}
    </div>
  );
}
