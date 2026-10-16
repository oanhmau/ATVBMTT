import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  Shield, 
  Lock, 
  KeyRound, 
  Smartphone, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Sparkles,
  QrCode,
  UserCheck
} from 'lucide-react';
import { calculateGoogleTotp, verifyGoogleTotp } from '../utils/crypto';

interface LoginPortalProps {
  users: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onClose?: () => void;
  onRecordFailedAttempt?: (email: string) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  users,
  onLoginSuccess,
  onClose,
  onRecordFailedAttempt,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile>(users[0]); // Default to Chủ nhà
  const [password, setPassword] = useState<string>('HomeCam@2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [step, setStep] = useState<'password' | 'totp'>('password');
  
  // 2FA state
  const [totpInput, setTotpInput] = useState<string>('');
  const [totpError, setTotpError] = useState<string | null>(null);
  const [liveTotp, setLiveTotp] = useState<{ code: string; secondsRemaining: number }>({ code: '------', secondsRemaining: 30 });
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  
  // Password error & lockout tracking
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync real-time TOTP for the selected user
  useEffect(() => {
    let isMounted = true;
    const updateOtp = async () => {
      const res = await calculateGoogleTotp(selectedUser.twoFactorSecret, 0);
      if (isMounted) {
        setLiveTotp(res);
      }
    };
    updateOtp();
    const interval = setInterval(updateOtp, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedUser]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (selectedUser.isLocked) {
      setPasswordError('Tài khoản này đang bị khóa tạm thời do nhập sai quá 5 lần. Vui lòng nhờ Chủ nhà mở khóa.');
      return;
    }

    if (password !== (selectedUser.password || 'HomeCam@2026')) {
      const remaining = 5 - (selectedUser.failedAttempts + 1);
      setPasswordError(`Mật khẩu không chính xác! Còn ${Math.max(0, remaining)} lần thử trước khi khóa.`);
      if (onRecordFailedAttempt) {
        onRecordFailedAttempt(selectedUser.email);
      }
      return;
    }

    // Pass password step -> Move to 2FA Google Authenticator step
    if (selectedUser.twoFactorEnabled) {
      setStep('totp');
    } else {
      onLoginSuccess(selectedUser);
    }
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpError(null);

    if (totpInput.length !== 6) {
      setTotpError('Mã xác thực Google Authenticator phải có đúng 6 chữ số.');
      return;
    }

    setIsVerifying(true);
    const isValid = await verifyGoogleTotp(selectedUser.twoFactorSecret, totpInput);
    setIsVerifying(false);

    if (isValid) {
      onLoginSuccess(selectedUser);
    } else {
      setTotpError('Mã OTP không hợp lệ hoặc đã hết hạn! Vui lòng đối chiếu với ứng dụng Google Authenticator trên điện thoại.');
    }
  };

  const handleQuickLoginAsOwner = () => {
    const ownerUser = users.find(u => u.role === 'owner') || users[0];
    onLoginSuccess(ownerUser);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-1.5 pb-3 border-b border-slate-800">
          <div className="mx-auto w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Cổng Đăng Nhập HomeCam Shield
          </h2>
          <p className="text-xs text-slate-400">
            Xác thực 2 lớp bảo vệ hình ảnh camera IoT · Zero Trust Gateway
          </p>
        </div>

        {/* User Role Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Chọn tài khoản đăng nhập:
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedUser(u);
                  setStep('password');
                  setPasswordError(null);
                  setTotpError(null);
                }}
                className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all text-center truncate ${
                  selectedUser.id === u.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {u.role === 'owner' ? 'Chủ nhà' : u.role === 'member' ? 'Thành viên' : 'Kỹ thuật'}
              </button>
            ))}
          </div>

          <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-center gap-2.5 text-xs">
            <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-slate-200">{selectedUser.name}</span>
              <span className="text-slate-500 text-[11px] block truncate">{selectedUser.email}</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Password Input */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">Mật khẩu tài khoản (Argon2id):</label>
                <span className="text-[10px] text-slate-500">Mặc định: HomeCam@2026</span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-3 pr-10 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40"
            >
              <span>Tiếp Tục Xác Thực 2FA (Bước 2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Google Authenticator 2FA Verification */}
        {step === 'totp' && (
          <form onSubmit={handleTotpSubmit} className="space-y-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Mã Google Authenticator (6 số):</span>
                </label>
                <button
                  type="button"
                  onClick={() => setStep('password')}
                  className="text-[11px] text-slate-400 hover:text-white underline"
                >
                  Quay lại
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Mã Google Authenticator hiện tại:</div>
                  <div className="font-mono text-xl font-bold tracking-widest text-cyan-400 mt-0.5 tabular-nums">
                    {liveTotp.code.slice(0, 3)} {liveTotp.code.slice(3, 6)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-right">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-500/40 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                    {liveTotp.secondsRemaining}s
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={totpInput}
                  onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 text-white font-mono text-center tracking-widest text-lg focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setTotpInput(liveTotp.code)}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg font-medium whitespace-nowrap transition-colors"
                  title="Tự động điền mã TOTP hiện tại"
                >
                  Tự điền
                </button>
              </div>
            </div>

            {totpError && (
              <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{totpError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={totpInput.length !== 6 || isVerifying}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40"
            >
              {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Xác Nhận & Đăng Nhập Hệ Thống</span>
            </button>
          </form>
        )}

        {/* Quick Demo Login Option */}
        <div className="pt-2 border-t border-slate-800 space-y-2 text-center text-xs">
          <button
            type="button"
            onClick={handleQuickLoginAsOwner}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Đăng Nhập Nhanh với Tư Cách Chủ Nhà (Demo 1-Click)</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-[11px] underline pt-1 block mx-auto"
            >
              Tiếp tục với phiên khách hiện tại
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
