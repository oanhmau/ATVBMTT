import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { UserProfile } from '../types';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  ShieldCheck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  QrCode as QrCodeIcon
} from 'lucide-react';
import { 
  getGoogleAuthenticatorUri, 
  calculateGoogleTotp, 
  verifyGoogleTotp, 
  generateRandomBase32Secret 
} from '../utils/crypto';

interface GoogleAuthSetupModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateSecret: (userId: string, newSecret: string) => void;
}

export const GoogleAuthSetupModal: React.FC<GoogleAuthSetupModalProps> = ({
  user,
  onClose,
  onUpdateSecret,
}) => {
  const [currentSecret, setCurrentSecret] = useState<string>(user.twoFactorSecret);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [userInputOtp, setUserInputOtp] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [liveTotp, setLiveTotp] = useState<{ code: string; secondsRemaining: number }>({ code: '------', secondsRemaining: 30 });
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const issuer = 'HomeCam Shield';
  const account = user.email;
  const otpAuthUri = getGoogleAuthenticatorUri(issuer, account, currentSecret);

  // Generate QR Code data URL when secret changes
  useEffect(() => {
    QRCode.toDataURL(otpAuthUri, {
      width: 220,
      margin: 2,
      color: {
        dark: '#020617', // slate-950
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [otpAuthUri]);

  // Synchronize live TOTP code to match phone Authenticator
  useEffect(() => {
    let isMounted = true;
    const updateCode = async () => {
      const res = await calculateGoogleTotp(currentSecret, 0);
      if (isMounted) {
        setLiveTotp(res);
      }
    };
    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentSecret]);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(currentSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateSecret = () => {
    const newSecret = generateRandomBase32Secret(16);
    setCurrentSecret(newSecret);
    onUpdateSecret(user.id, newSecret);
    setUserInputOtp('');
    setVerificationStatus('idle');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInputOtp.length !== 6) return;

    setIsVerifying(true);
    const isValid = await verifyGoogleTotp(currentSecret, userInputOtp);
    setIsVerifying(false);

    if (isValid) {
      setVerificationStatus('success');
    } else {
      setVerificationStatus('fail');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <QrCodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cài Đặt Xác Minh 2 Lớp (Google Authenticator)
              </h3>
              <p className="text-xs text-slate-400">
                Tài khoản: <span className="text-slate-200 font-semibold">{user.name}</span> ({user.email})
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

        {/* Step-by-Step Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          
          {/* Left: Scannable QR Code */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="p-2 bg-white rounded-xl shadow-lg">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Google Authenticator QR Code"
                  className="w-44 h-44 rounded-lg block"
                />
              ) : (
                <div className="w-44 h-44 bg-slate-200 animate-pulse rounded-lg flex items-center justify-center text-slate-700 text-xs">
                  Đang tạo mã QR...
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center font-medium">
              Quét bằng Google Authenticator / Authy / iOS Passwords
            </div>
          </div>

          {/* Right: Manual Secret & Instructions */}
          <div className="space-y-3 text-xs text-slate-300">
            <div className="space-y-1">
              <span className="font-semibold text-slate-200">1. Hướng dẫn quét:</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Mở ứng dụng <strong>Google Authenticator</strong> trên điện thoại &rarr; chọn dấu <strong>"+"</strong> &rarr; chọn <strong>"Quét mã QR"</strong> và hướng camera vào hình bên trái.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-slate-200">2. Hoặc nhập mã thủ công:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentSecret}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-cyan-300 font-bold text-xs tracking-wider flex-1 select-all"
                />
                <button
                  onClick={handleCopySecret}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 transition-colors"
                  title="Sao chép khóa bí mật"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleRegenerateSecret}
              className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors pt-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Tạo lại khóa bí mật mới</span>
            </button>
          </div>

        </div>

        {/* Live Simulator & Phone Sync Comparison */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 text-[11px]">Mã đang hiển thị trên ứng dụng (Đồng bộ thời gian thực):</span>
              <div className="font-mono text-base font-bold text-cyan-400 tracking-widest mt-0.5">
                {liveTotp.code.slice(0, 3)} {liveTotp.code.slice(3, 6)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div>
              <div className="text-[10px] text-slate-500 font-mono">Làm mới sau</div>
              <div className="font-mono font-bold text-slate-300 text-xs">{liveTotp.secondsRemaining}s</div>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/40 flex items-center justify-center text-[10px] font-mono text-cyan-300">
              {liveTotp.secondsRemaining}
            </div>
          </div>
        </div>

        {/* Verification Section */}
        <form onSubmit={handleVerify} className="space-y-3 pt-1 border-t border-slate-800 text-xs">
          <label className="block font-semibold text-slate-200">
            3. Xác nhận: Nhập mã 6 số từ ứng dụng điện thoại để kiểm tra:
          </label>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={userInputOtp}
              onChange={(e) => {
                setUserInputOtp(e.target.value.replace(/\D/g, ''));
                setVerificationStatus('idle');
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-center tracking-widest text-base w-36 focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={userInputOtp.length !== 6 || isVerifying}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Xác minh kết nối</span>
            </button>
            <button
              type="button"
              onClick={() => setUserInputOtp(liveTotp.code)}
              className="text-[11px] text-slate-400 hover:text-cyan-400 underline underline-offset-2"
            >
              Điền nhanh mã hệ thống
            </button>
          </div>

          {verificationStatus === 'success' && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Liên kết Google Authenticator thành công!</div>
                <div className="text-[11px] text-emerald-200/90 mt-0.5">
                  Mã 6 chữ số từ điện thoại hoàn toàn trùng khớp với Gateway xác thực của HomeCam Shield. Tài khoản của bạn hiện được bảo vệ với 2 lớp bảo mật tối đa.
                </div>
              </div>
            </div>
          )}

          {verificationStatus === 'fail' && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Mã xác thực không chính xác!</div>
                <div className="text-[11px] text-rose-200/90 mt-0.5">
                  Vui lòng kiểm tra lại đồng hồ trên điện thoại hoặc thử nhập mã mới nhất vừa xuất hiện trên Google Authenticator.
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400">
            Hỗ trợ chuẩn RFC 6238 · HMAC-SHA1 · 30 giây
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
