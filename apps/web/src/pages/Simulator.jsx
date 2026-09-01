import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { chat } from '../api/resources.js';
import { PageHeader, Badge, money } from '../components/ui.jsx';

const CHANNELS = ['instagram', 'whatsapp'];
const SUGGESTIONS = [
  'Hi',
  'I need a black dress for Eid under 6000',
  'Do you have size M?',
  "I'll take the Black Embroidered Maxi in M",
  'House 12, Gulberg, Lahore',
  'confirm',
  'Delivery charges?',
  'Track my order',
];

export default function Simulator() {
  const [channel, setChannel] = useState('instagram');
  const [senderId, setSenderId] = useState(`demo-${Date.now().toString().slice(-5)}`);
  const [messages, setMessages] = useState([]);
  const [insight, setInsight] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendText(value) {
    const message = (value ?? text).trim();
    if (!message || busy) return;
    setText('');
    setMessages((m) => [...m, { from: 'customer', text: message }]);
    setBusy(true);
    try {
      const res = await chat.ingest({ channel, senderId, text: message });
      setMessages((m) => [...m, { from: 'bot', text: res.reply, products: res.products }]);
      setInsight(res);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setSenderId(`demo-${Date.now().toString().slice(-5)}`);
    setMessages([]);
    setInsight(null);
  }

  return (
    <div>
      <PageHeader
        title="Chat Simulator"
        subtitle="Drive the same pipeline that Instagram & WhatsApp webhooks use"
        action={
          <button className="btn-ghost" onClick={reset}>
            New conversation
          </button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card flex h-[70vh] flex-col lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-black/10 px-4 py-2">
            {CHANNELS.map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  channel === c ? 'bg-blush-600 text-white' : 'bg-black/5 text-black/60'
                }`}
              >
                {c}
              </button>
            ))}
            <span className="ml-auto text-xs text-black/40">{senderId}</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-center text-sm text-black/40">Say hello to start.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.from === 'bot' ? 'border border-black/10 bg-white' : 'bg-blush-600 text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.products?.length > 0 && (
                    <div className="mt-2 grid gap-2">
                      {m.products.slice(0, 3).map((p, k) => (
                        <div key={k} className="flex items-center gap-2 rounded-lg bg-black/5 p-1.5">
                          {p.images?.[0] && (
                            <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover" />
                          )}
                          <div className="text-xs">
                            <p className="font-medium">{p.name}</p>
                            <p className="text-black/50">{money(p.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="border-t border-black/10 p-3">
            <div className="mb-2 flex flex-wrap gap-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendText(s)}
                  className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/60 hover:bg-black/10"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendText();
              }}
              className="flex gap-2"
            >
              <input
                className="input"
                placeholder="Type a customer message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="btn-primary" disabled={busy}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="card h-max p-5">
          <p className="mb-3 text-sm font-semibold text-black/60">Live insight</p>
          {!insight ? (
            <p className="text-sm text-black/40">Send a message to see intent, sentiment and state.</p>
          ) : (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-black/40">Intent</dt>
                <dd>
                  <Badge tone="pink">{insight.intent}</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/40">Sentiment</dt>
                <dd>
                  <Badge tone="blue">{insight.sentiment}</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/40">State</dt>
                <dd>{insight.state}</dd>
              </div>
              {insight.orderId && (
                <div className="flex justify-between">
                  <dt className="text-black/40">Order</dt>
                  <dd className="font-medium text-blush-700">{insight.orderId}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
