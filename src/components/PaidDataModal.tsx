import React from 'react';
import { ShieldCheck, AlertCircle, DollarSign, XCircle, CheckCircle2 } from 'lucide-react';

interface PaidDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprovePaidData: () => void;
}

export const PaidDataModal: React.FC<PaidDataModalProps> = ({
  isOpen,
  onClose,
  onApprovePaidData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <DollarSign className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white font-mono">
              Market Data Policy & Paid Feed Approval (FR-02)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/40 space-y-1">
            <strong className="text-emerald-300 font-bold block">Current Active Policy: Free Data Priority</strong>
            <p className="text-[11px] leading-relaxed">
              Bot currently free NSE Bhavcopy and delayed feeds (15m delay / simulated ticks) par chal raha hai. Kisi bhi subscription ka koi hidden charge nahi hai.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Optional Low-Latency Real-Time Feeds:</span>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-slate-200">
                <span>NSE Tick-by-Tick Dedicated Websocket</span>
                <span className="text-amber-400 font-bold">~₹2,500 / month</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>AlphaVantage Premium Indian Equities</span>
                <span className="text-amber-400 font-bold">~₹1,800 / month</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            <strong className="text-amber-300">SRS Strict Rule:</strong> Paid data insufficient hone par bot aapko options dikhayega, lekin aapki approval ke bina koi purchase execute nahi karega.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
          >
            Continue with Free 15m Feed
          </button>
          <button
            onClick={() => {
              onApprovePaidData();
              onClose();
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs shadow-md transition"
          >
            Request Upgrade Quote
          </button>
        </div>
      </div>
    </div>
  );
};
