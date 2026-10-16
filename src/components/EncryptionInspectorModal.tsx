import React, { useState, useEffect } from 'react';
import { CameraDevice } from '../types';
import { 
  KeyRound, 
  ShieldCheck, 
  X, 
  Lock, 
  Unlock, 
  Terminal, 
  CheckCircle2, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';
import { simulateAES256Encrypt } from '../utils/crypto';

interface EncryptionInspectorModalProps {
  camera: CameraDevice;
  onClose: () => void;
}

export const EncryptionInspectorModal: React.FC<EncryptionInspectorModalProps> = ({
  camera,
  onClose,
}) => {
  const [showDecrypted, setShowDecrypted] = useState<boolean>(true);
  const [hexPackets, setHexPackets] = useState<string[]>([]);
  const [simulatedData, setSimulatedData] = useState(() => 
    simulateAES256Encrypt(`H265_FRAME_${camera.id}_${Date.now()}`, camera.aesKeyId)
  );

  // Generate scrolling simulated ciphertext stream
  useEffect(() => {
    const generateHex = () => {
      const bytes: string[] = [];
      for (let i = 0; i < 4; i++) {
        const row = Array.from({ length: 16 }, () => 
          Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
        ).join(' ');
        bytes.push(row);
      }
      setHexPackets(bytes);
    };
    generateHex();
    const interval = setInterval(generateHex, 800);
    return () => clearInterval(interval);
  }, [camera]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Kiểm Tra Luồng Mã Hóa AES-256-GCM & Kênh Truyền
              </h3>
              <p className="text-[11px] text-slate-400">
                Camera: <span className="text-slate-200 font-semibold">{camera.name}</span> ({camera.ip})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Parameters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-slate-400 text-[10px]">Chuẩn mã hóa:</span>
            <div className="font-mono font-bold text-cyan-300 mt-0.5">AES-256-GCM</div>
          </div>

          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-slate-400 text-[10px]">Giao thức kênh:</span>
            <div className="font-mono font-bold text-emerald-300 mt-0.5">TLS 1.3 (mTLS)</div>
          </div>

          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-slate-400 text-[10px]">Khóa Quản Lý KMS:</span>
            <div className="font-mono font-bold text-amber-300 mt-0.5 truncate">{camera.aesKeyId}</div>
          </div>

          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-slate-400 text-[10px]">Tính toàn vẹn Tag:</span>
            <div className="font-mono font-bold text-purple-300 mt-0.5">128-bit Auth Tag</div>
          </div>
        </div>

        {/* Live Hex Stream Console */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Gói tin mã hóa thực tế trên đường truyền (Ciphertext Raw Hex):</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Cập nhật mỗi 800ms</span>
          </div>

          <div className="p-3 bg-black/80 rounded-xl border border-slate-800 font-mono text-xs text-cyan-400/90 space-y-1 overflow-x-auto">
            {hexPackets.map((line, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-slate-600 select-none">0x{((idx + 1) * 16).toString(16).padStart(4, '0')}:</span>
                <span className="tracking-widest">{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Encryption Inspection Mode Switch */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Chế độ giải mã Client (Viewer Decryption State):
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800">
              <button
                onClick={() => setShowDecrypted(true)}
                className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                  showDecrypted ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
                }`}
              >
                <Unlock className="w-3 h-3" />
                <span>Giải mã xem hình</span>
              </button>
              <button
                onClick={() => setShowDecrypted(false)}
                className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                  !showDecrypted ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>Xem bản mã Hex thô</span>
              </button>
            </div>
          </div>

          {showDecrypted ? (
            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black">
              <img
                src={camera.imageSrc}
                alt={camera.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-cyan-300 font-mono">
                Đã giải mã thành công bằng khóa KMS cục bộ
              </div>
            </div>
          ) : (
            <div className="aspect-video rounded-lg bg-black p-4 flex flex-col items-center justify-center text-center font-mono text-xs text-rose-400 border border-slate-800 space-y-2">
              <Lock className="w-8 h-8 text-rose-500 animate-pulse" />
              <div>BẢN MÃ HÓA AES-256 (DỮ LIỆU ĐANG ĐƯỢC BẢO VỆ)</div>
              <p className="text-[11px] text-slate-400 max-w-md font-sans">
                Kẻ nghe lén (Man-in-the-middle / Sniffing) trên đường mạng chỉ thu được các khối byte ngẫu nhiên này. Nếu không có chứng chỉ mTLS và khóa KMS hợp lệ, không thể xem được hình ảnh trong nhà.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Đóng bảng kiểm tra
          </button>
        </div>

      </div>
    </div>
  );
};
