import React, { useState, useEffect, useRef } from 'react';
import {
    collection, addDoc, onSnapshot, query,
    orderBy, serverTimestamp, doc, setDoc, getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function ChatModal({ booking, onClose }) {
    const { currentUser, userProfile } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Stable chat ID (sorted so both sides get the same doc)
    const chatId = [booking.owner_id, booking.caregiver_id].sort().join('_') + '_' + booking.id;

    // Determine the other party's name
    const isOwner = currentUser.uid === booking.owner_id;
    const otherName = isOwner
        ? (booking.caregiver_name || 'Prestador')
        : (booking.owner_name || 'Cliente');
    const otherInitial = otherName[0]?.toUpperCase() ?? '?';

    // ── Ensure chat doc exists ──────────────────────────────────────────────
    useEffect(() => {
        const initChat = async () => {
            const chatRef = doc(db, 'chats', chatId);
            const snap = await getDoc(chatRef);
            if (!snap.exists()) {
                await setDoc(chatRef, {
                    bookingId: booking.id,
                    participants: [booking.owner_id, booking.caregiver_id],
                    serviceTitle: booking.service_title,
                    createdAt: serverTimestamp(),
                });
            }
        };
        initChat();
    }, [chatId]);

    // ── Real-time listener ──────────────────────────────────────────────────
    useEffect(() => {
        const q = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'asc'),
        );
        const unsub = onSnapshot(q, snap => {
            setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, err => {
            console.error('Chat error:', err);
            setLoading(false);
        });
        return unsub;
    }, [chatId]);

    // ── Auto-scroll ─────────────────────────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Focus input on open ─────────────────────────────────────────────────
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;
        setSending(true);
        setText('');
        try {
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                senderId: currentUser.uid,
                senderName: userProfile?.displayName || 'Eu',
                text: trimmed,
                createdAt: serverTimestamp(),
            });
        } catch (err) {
            console.error('Send error:', err);
            setText(trimmed); // restore on fail
        } finally {
            setSending(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (ts) => {
        if (!ts?.toDate) return '';
        const d = ts.toDate();
        return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (ts) => {
        if (!ts?.toDate) return '';
        const d = ts.toDate();
        const now = new Date();
        if (d.toDateString() === now.toDateString()) return 'Hoje';
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
        return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
    };

    // Group messages by date for date separators
    const grouped = messages.reduce((acc, msg) => {
        const label = formatDate(msg.createdAt);
        if (!acc.length || acc[acc.length - 1].label !== label) {
            acc.push({ label, items: [msg] });
        } else {
            acc[acc.length - 1].items.push(msg);
        }
        return acc;
    }, []);

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(45,58,40,0.5)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 700, padding: 16,
            }}
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div style={{
                background: 'var(--white)',
                borderRadius: 'var(--radius-xl)',
                width: '100%', maxWidth: 480,
                height: '80vh', maxHeight: 620,
                display: 'flex', flexDirection: 'column',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
            }}>

                {/* ── Header ─────────────────────────────────────────────────────── */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--green-soft), var(--sky-soft))',
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    borderBottom: '1px solid var(--border)',
                    flexShrink: 0,
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--yellow), var(--green-mid))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 700, color: 'var(--text)',
                        flexShrink: 0, border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(45,58,40,0.12)',
                    }}>
                        {otherInitial}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                            fontSize: 15, fontWeight: 700,
                            color: 'var(--text)', margin: 0,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                            {otherName}
                        </h3>
                        <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0 }}>
                            ✅ {booking.service_title}
                        </p>
                    </div>

                    {/* Online dot */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontSize: 12, color: 'var(--text-3)',
                    }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: 'var(--success)',
                            boxShadow: '0 0 0 3px rgba(125,191,106,0.25)',
                        }} />
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.7)', border: 'none',
                            borderRadius: '50%', width: 30, height: 30,
                            fontSize: 16, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text)', transition: 'background var(--ease)',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.95)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'}
                    >×</button>
                </div>

                {/* ── Messages area ───────────────────────────────────────────────── */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: 'var(--bg)',
                }}>

                    {loading ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="spinner spinner-dark" style={{ display: 'inline-block' }} />
                        </div>
                    ) : messages.length === 0 ? (
                        <div style={{
                            flex: 1, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            textAlign: 'center', padding: '0 24px',
                        }}>
                            <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
                            <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                                Começa a conversa
                            </p>
                            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>
                                Coordena os detalhes do serviço com {otherName}.
                            </p>
                        </div>
                    ) : (
                        grouped.map((group, gi) => (
                            <div key={gi}>
                                {/* Date separator */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    margin: '12px 0 8px',
                                }}>
                                    <div style={{ flex: 1, height: 1, background: 'var(--border-mid)' }} />
                                    <span style={{
                                        fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                                        padding: '2px 10px', background: 'var(--bg)',
                                        borderRadius: 20, border: '1px solid var(--border-mid)',
                                        whiteSpace: 'nowrap',
                                    }}>{group.label}</span>
                                    <div style={{ flex: 1, height: 1, background: 'var(--border-mid)' }} />
                                </div>

                                {/* Messages in group */}
                                {group.items.map((msg, mi) => {
                                    const isMine = msg.senderId === currentUser.uid;
                                    const prevMsg = mi > 0 ? group.items[mi - 1] : null;
                                    const sameSender = prevMsg?.senderId === msg.senderId;

                                    return (
                                        <div
                                            key={msg.id}
                                            style={{
                                                display: 'flex',
                                                flexDirection: isMine ? 'row-reverse' : 'row',
                                                alignItems: 'flex-end',
                                                gap: 6,
                                                marginTop: sameSender ? 2 : 10,
                                            }}
                                        >
                                            {/* Avatar — only for first in group from other */}
                                            {!isMine && (
                                                <div style={{
                                                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                                    background: sameSender
                                                        ? 'transparent'
                                                        : 'linear-gradient(135deg, var(--yellow), var(--green-mid))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 11, fontWeight: 700, color: 'var(--text)',
                                                }}>
                                                    {!sameSender && otherInitial}
                                                </div>
                                            )}

                                            {/* Bubble */}
                                            <div style={{ maxWidth: '72%' }}>
                                                <div style={{
                                                    padding: '9px 13px',
                                                    borderRadius: isMine
                                                        ? '18px 18px 4px 18px'
                                                        : '18px 18px 18px 4px',
                                                    background: isMine ? 'var(--primary)' : 'var(--white)',
                                                    color: isMine ? '#fff' : 'var(--text)',
                                                    fontSize: 14, lineHeight: 1.5,
                                                    boxShadow: isMine
                                                        ? '0 2px 8px rgba(163,191,138,0.4)'
                                                        : '0 1px 4px rgba(45,58,40,0.08)',
                                                    border: isMine ? 'none' : '1px solid var(--border-mid)',
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'pre-wrap',
                                                }}>
                                                    {msg.text}
                                                </div>
                                                <div style={{
                                                    fontSize: 10, color: 'var(--text-3)',
                                                    marginTop: 3,
                                                    textAlign: isMine ? 'right' : 'left',
                                                    paddingLeft: isMine ? 0 : 4,
                                                    paddingRight: isMine ? 4 : 0,
                                                }}>
                                                    {formatTime(msg.createdAt)}
                                                    {isMine && ' ✓'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* ── Input bar ───────────────────────────────────────────────────── */}
                <div style={{
                    padding: '12px 16px',
                    borderTop: '1.5px solid var(--border-mid)',
                    display: 'flex', gap: 10, alignItems: 'flex-end',
                    background: 'var(--white)',
                    flexShrink: 0,
                }}>
                    <textarea
                        ref={inputRef}
                        rows={1}
                        placeholder="Escreve uma mensagem…"
                        value={text}
                        onChange={e => {
                            setText(e.target.value);
                            // auto-grow
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={handleKey}
                        style={{
                            flex: 1, resize: 'none', overflow: 'hidden',
                            padding: '10px 14px', border: '1.5px solid var(--border-mid)',
                            borderRadius: 'var(--radius)',
                            fontSize: 14, color: 'var(--text)',
                            background: 'var(--bg-alt)', outline: 'none',
                            fontFamily: 'var(--font-body)',
                            lineHeight: 1.5, minHeight: 40, maxHeight: 120,
                            transition: 'border-color var(--ease)',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!text.trim() || sending}
                        style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: text.trim() ? 'var(--primary)' : 'var(--border-mid)',
                            border: 'none', cursor: text.trim() ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, flexShrink: 0,
                            transition: 'background var(--ease), transform var(--ease)',
                            boxShadow: text.trim() ? '0 3px 12px rgba(163,191,138,0.4)' : 'none',
                        }}
                        onMouseEnter={e => text.trim() && (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {sending ? (
                            <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}