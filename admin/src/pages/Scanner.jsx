
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearVerify,
  verifyQr
} from '../store/slices/bookingsSlice';
import { fetchAdminEvents } from '../store/slices/eventsSlice';

import {
  QrCode,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  Ticket,
  ShieldCheck,
  ScanLine,
  User,
  Mail
} from 'lucide-react';

export default function Scanner() {
  const dispatch = useDispatch();

  const events = useSelector((s) => s.adminEvents.list);
  const { lastVerify, error } = useSelector(
    (s) => s.adminBookings
  );

  const [eventId, setEventId] = useState('');
  const [token, setToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const scanner = useRef(null);
  const isProcessing = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    dispatch(clearVerify());
    dispatch(fetchAdminEvents({ limit: 100 }));

    return () => {
      mounted.current = false;

      if (scanner.current?.isScanning) {
        scanner.current.stop().catch(() => {});
      }
    };
  }, [dispatch]);

  useEffect(() => {
    scanner.current = new Html5Qrcode('qr-reader');

    return () => {
      if (scanner.current?.isScanning) {
        scanner.current.stop().catch(() => {});
      }
    };
  }, []);

  const extractToken = (decoded) => {
    try {
      const parsed = JSON.parse(decoded);
      return parsed.qrToken || decoded;
    } catch {
      return decoded;
    }
  };

  const verifyToken = async (qrToken) => {
    if (!qrToken || isProcessing.current) return;

    isProcessing.current = true;
    setVerifying(true);
    dispatch(clearVerify());

    try {
      await dispatch(
        verifyQr({
          qrToken,
          eventId: eventId || undefined
        })
      );
    } finally {
      isProcessing.current = false;
      if (mounted.current) {
        setVerifying(false);
      }
    }
  };

  const start = async () => {
    dispatch(clearVerify());
    setCamError('');

    try {
      if (!scanner.current) {
        throw new Error('Scanner is not ready. Please try again.');
      }

      await scanner.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1
        },
        (decoded) => {
          if (isProcessing.current) return;

          const qrToken = extractToken(decoded);

          stop();
          verifyToken(qrToken);
        }
      );

      setScanning(true);
    } catch (err) {
      setCamError(
        err?.message ||
        'Camera unavailable. Please use manual verification.'
      );
    }
  };

  const stop = async () => {
    try {
      if (scanner.current?.isScanning) {
        await scanner.current.stop();
      }
    } catch {}

    if (mounted.current) {
      setScanning(false);
    }
  };

  const submitToken = (e) => {
    e.preventDefault();

    if (!token.trim()) return;

    verifyToken(extractToken(token.trim()));
  };

  return (
    <div className="w-full min-w-0 max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <p className="text-sm text-slate-400 mb-1">
          Event ticket management
        </p>

        <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
          <QrCode className="text-purple" size={30} />
          QR Scanner
        </h1>

        <p className="text-sm text-slate-400 mt-2">
          Scan and verify attendee tickets instantly.
        </p>
      </div>

      {/* INFO CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

        <div className="bg-card border border-white/5 rounded-2xl p-4">
          <Camera className="text-purple mb-3" size={22} />
          <p className="text-xs text-slate-400">Scanner</p>
          <p className="font-bold mt-1">
            {scanning ? 'Active' : 'Inactive'}
          </p>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-4">
          <ShieldCheck className="text-emerald-400 mb-3" size={22} />
          <p className="text-xs text-slate-400">Verification</p>
          <p className="font-bold mt-1">Secure</p>
        </div>

        <div className="hidden sm:block bg-card border border-white/5 rounded-2xl p-4">
          <Ticket className="text-blue-400 mb-3" size={22} />
          <p className="text-xs text-slate-400">Available Events</p>
          <p className="font-bold mt-1">{events.length}</p>
        </div>

      </div>

      {/* EVENT SELECT */}
      <div className="bg-card border border-white/5 rounded-2xl p-4">
        <label className="text-sm font-semibold block mb-2">
          Select Event
        </label>

        <select
          className="w-full bg-navySoft border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-purple"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          <option value="">Any event</option>

          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.title}
            </option>
          ))}
        </select>

        <p className="text-xs text-slate-400 mt-2">
          Select an event to verify tickets for that event only.
        </p>
      </div>

      {/* MAIN SCANNER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* CAMERA */}
        <div className="bg-card border border-white/5 rounded-2xl p-4 sm:p-5">

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg">
                Camera Scanner
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Position QR code inside the frame
              </p>
            </div>

            <ScanLine className="text-purple" size={23} />
          </div>

          {/* CAMERA VIEW */}
          <div className="w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center min-h-[260px]">
            <div
              id="qr-reader"
              className="w-full max-w-full overflow-hidden"
            />
          </div>

          {/* CAMERA BUTTONS */}
          <div className="mt-4">
            {!scanning ? (
              <button
                type="button"
                onClick={start}
                disabled={verifying}
                className="w-full flex justify-center items-center gap-2 bg-purple hover:opacity-90 disabled:opacity-50 py-3 rounded-xl font-semibold"
              >
                <Camera size={19} />
                Start Camera
              </button>
            ) : (
              <button
                type="button"
                onClick={stop}
                className="w-full flex justify-center items-center gap-2 bg-rose-500 hover:bg-rose-600 py-3 rounded-xl font-semibold"
              >
                <CameraOff size={19} />
                Stop Camera
              </button>
            )}
          </div>

          {camError && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2">
              <AlertCircle
                size={18}
                className="text-amber-400 shrink-0"
              />

              <p className="text-xs text-amber-400 break-words">
                {camError}
              </p>
            </div>
          )}

        </div>

        {/* MANUAL VERIFICATION */}
        <div className="bg-card border border-white/5 rounded-2xl p-4 sm:p-5">

          <div className="flex items-center gap-3 mb-5">
            <div className="bg-purple/20 p-3 rounded-xl">
              <QrCode size={22} className="text-purple" />
            </div>

            <div>
              <h2 className="font-bold text-lg">
                Manual Verification
              </h2>

              <p className="text-xs text-slate-400">
                Verify using QR token
              </p>
            </div>
          </div>

          <form onSubmit={submitToken} className="space-y-4">

            <div>
              <label className="text-sm text-slate-300 block mb-2">
                QR Token
              </label>

              <textarea
                rows={5}
                className="w-full bg-navySoft border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-purple resize-y"
                placeholder="Paste QR token UUID or scanned JSON..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={verifying || !token.trim()}
              className="w-full bg-purple hover:opacity-90 disabled:opacity-50 py-3 rounded-xl font-semibold flex justify-center items-center gap-2"
            >
              <ShieldCheck size={18} />

              {verifying ? 'Verifying...' : 'Verify Ticket'}
            </button>

          </form>

          <div className="mt-5 bg-navySoft rounded-xl p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={20}
                className="text-emerald-400 shrink-0"
              />

              <div>
                <p className="text-sm font-semibold">
                  Ticket Verification
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Only verified tickets should be accepted at the event entrance.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SUCCESS RESULT */}
      {lastVerify?.message && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">

          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2
              size={27}
              className="text-emerald-400"
            />

            <h2 className="text-lg font-bold text-emerald-400">
              {lastVerify.message}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="flex gap-3">
              <User size={19} className="text-emerald-400 shrink-0" />

              <div>
                <p className="text-xs text-slate-400">Attendee</p>
                <p className="text-sm font-semibold break-words">
                  {lastVerify.data?.attendee?.name || '-'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail size={19} className="text-emerald-400 shrink-0" />

              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm font-semibold break-all">
                  {lastVerify.data?.attendee?.email || '-'}
                </p>
              </div>
            </div>

          </div>

          <div className="border-t border-emerald-500/20 mt-4 pt-4">
            <p className="text-xs text-slate-400 mb-1">
              Ticket Information
            </p>

            <p className="text-sm text-white">
              {lastVerify.data?.attendee?.ticketType || '-'}
              {' × '}
              {lastVerify.data?.attendee?.quantity || 0}
            </p>

            <p className="text-sm text-slate-300 mt-1">
              {lastVerify.data?.attendee?.event || '-'}
            </p>
          </div>

        </div>
      )}

      {/* ERROR RESULT */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle
            size={21}
            className="text-rose-400 shrink-0"
          />

          <div>
            <p className="font-semibold text-rose-400">
              Verification Failed
            </p>

            <p className="text-sm text-slate-300 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
