import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Phone,
  Send,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Loader2,
  LogOut,
  QrCode
} from 'lucide-react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
  const [step, setStep] = useState(1); // 1: Connect, 2: Send
  const [loading, setLoading] = useState(true);
  const [destNumber, setDestNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    socket.on('qr', (url) => {
      setLoading(false);
      setQrCodeUrl(url);
    });

    socket.on('ready', () => {
      setLoading(false);
      setQrCodeUrl('');
      setStep(2);
    });

    socket.on('authenticated', () => {
      setLoading(false);
      setQrCodeUrl('');
      setStep(2);
    });

    socket.on('message-sent', () => {
      setLoading(false);
      setSentSuccess(true);
      setMessage('');
      setTimeout(() => setSentSuccess(false), 3000);
    });

    socket.on('error', (msg) => {
      setLoading(false);
      setError(msg);
      setTimeout(() => setError(''), 5000);
    });

    return () => {
      socket.off('qr');
      socket.off('ready');
      socket.off('authenticated');
      socket.off('message-sent');
      socket.off('error');
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!destNumber || !message) return;

    setLoading(true);
    socket.emit('send-message', { number: destNumber, message });
  };

  const handleDisconnect = () => {
    // Ideally we would emit a disconnect event to server, but for now just reload
    window.location.reload();
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="logo-container">
            <MessageSquare className="logo-icon" />
          </div>
          <h1 className="title">WhatsApp Auto</h1>
          <p className="subtitle">
            {step === 1
              ? "Scan QR to connect"
              : "Compose and send your message"}
          </p>
        </div>

        {error && (
          <div className="status-indicator" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
            <span className="status-text" style={{ color: '#ef4444' }}>{error}</span>
          </div>
        )}

        {step === 2 && (
          <div className="status-indicator fade-in">
            <div className="dot"></div>
            <span className="status-text">Connected</span>
          </div>
        )}

        {step === 1 ? (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            {loading && !qrCodeUrl ? (
              <div style={{ padding: '40px' }}>
                <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto', color: 'var(--primary)' }} />
                <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Initializing WhatsApp Client...</p>
              </div>
            ) : qrCodeUrl ? (
              <div className="fade-in">
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  width: 'fit-content',
                  margin: '0 auto 20px',
                  boxShadow: '0 0 20px rgba(0,0,0,0.2)'
                }}>
                  <img src={qrCodeUrl} alt="Scan QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Open WhatsApp on your phone {'>'} Menu {'>'} Linked Devices {'>'} Link a Device
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <form onSubmit={handleSend} className="fade-in">
            <div className="form-group">
              <label className="label">Destination Number</label>
              <div className="input-wrapper">
                <Phone className="input-icon" />
                <input
                  type="tel"
                  className="input"
                  placeholder="e.g. 593987654321"
                  value={destNumber}
                  onChange={(e) => setDestNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Message</label>
              <div className="input-wrapper">
                <textarea
                  className="input textarea"
                  placeholder="Type your automated message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending...
                </>
              ) : (
                <>
                  Send Auto Message
                  <Send size={20} />
                </>
              )}
            </button>

            <button
              type="button"
              className="btn"
              onClick={(e) => {
                e.preventDefault();
                if (!destNumber) return;
                setLoading(true);
                socket.emit('miku-attack', { number: destNumber });
              }}
              disabled={loading}
              style={{ backgroundColor: '#39c5bb', marginTop: '10px' }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  miku miku niiii
                  <span style={{ fontSize: '1.2em' }}>🎵</span>
                </>
              )}
            </button>

            {sentSuccess && (
              <div className="success-message fade-in">
                <CheckCircle size={20} />
                <span>Message sent successfully!</span>
              </div>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDisconnect}
              disabled={loading}
            >
              <LogOut size={18} />
              Disconnect
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
