import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  CameraDevice, 
  BlockchainBlock 
} from '../types';
import { 
  ShieldCheck, 
  Users, 
  KeyRound, 
  Clock, 
  Lock, 
  Check, 
  X, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { generateTOTP, calculateGoogleTotp, verifyGoogleTotp } from '../utils/crypto';
import { GoogleAuthSetupModal } from './GoogleAuthSetupModal';

interface IAMManagementViewProps {
  users: UserProfile[];
  cameras: CameraDevice[];
  onUpdateUserPermissions: (userId: string, allowedCameras: string[]) => void;
  onUpdateUserExpiry: (userId: string, extraMinutes: number) => void;
  onUnlockUser: (userId: string) => void;
  onUpdateUserSecret: (userId: string, newSecret: string) => void;
  onRecordAuditBlock: (block: Partial<BlockchainBlock>) => void;
}

export const IAMManagementView: React.FC<IAMManagementViewProps> = ({
  users,
  cameras,
  onUpdateUserPermissions,
  onUpdateUserExpiry,
  onUnlockUser,
  onUpdateUserSecret,
  onRecordAuditBlock,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile>(users[0]);
  const [otpInfo, setOtpInfo] = useState<{ code: string; secondsRemaining: number }>({ code: '------', secondsRemaining: 30 });
  const [testOtpInput, setTestOtpInput] = useState<string>('');
  const [otpTestResult, setOtpTestResult] = useState<'success' | 'fail' | null>(null);
  const [userToSetup2FA, setUserToSetup2FA] = useState<UserProfile | null>(null);

  // Live TOTP countdown clock synchronized with Google Authenticator
  useEffect(() => {
    let isMounted = true;
    const updateOtp = async () => {
      const res = await calculateGoogleTotp(selectedUser.twoFactorSecret, 0);
      if (isMounted) {
        setOtpInfo(res);
      }
    };
    updateOtp();
    const interval = setInterval(updateOtp, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedUser]);

  const handleToggleCameraPerm = (userId: string, cameraId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    let updatedList: string[];
    if (targetUser.allowedCameras.includes(cameraId)) {
      updatedList = targetUser.allowedCameras.filter(id => id !== cameraId);
    } else {
      updatedList = [...targetUser.allowedCameras, cameraId];
    }

    onUpdateUserPermissions(userId, updatedList);

    const cameraObj = cameras.find(c => c.id === cameraId);
    onRecordAuditBlock({
      action: 'PERMISSION_UPDATE',
      actionLabel: 'Cập nhật ma trận phân quyền',
      operator: 'Nguyễn Văn An (Chủ nhà)',
      userId: 'user_owner',
      role: 'owner',
      targetCamera: cameraObj?.name || cameraId,
      ipAddress: '192.168.1.15',
      device: 'MacBook Pro (Authorized Admin)',
      details: `Thay đổi quyền truy cập camera ${cameraObj?.name} cho người dùng ${targetUser.name}: ${targetUser.allowedCameras.includes(cameraId) ? 'Thu hồi quyền' : 'Cấp quyền truy cập'}`,
    });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testOtpInput.length !== 6) return;
    const isValid = await verifyGoogleTotp(selectedUser.twoFactorSecret, testOtpInput);
    if (isValid) {
      setOtpTestResult('success');
    } else {
      setOtpTestResult('fail');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Xác Thực Mạnh & Quản Lý Phân Quyền (IAM)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Xác thực 2 lớp (TOTP/Google Authenticator), phân vai trò Chủ nhà / Thành viên / Kỹ thuật viên và ma trận kiểm soát truy cập từng mắt camera.
          </p>
        </div>

        <button
          onClick={() => setUserToSetup2FA(selectedUser)}
          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-cyan-950/40"
        >
          <QrCode className="w-4 h-4" />
          <span>Quét Mã QR Google Authenticator</span>
        </button>
      </div>

      {/* Top 3 Metric Cards for IAM Policies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Chuẩn Mật Khẩu & 2FA</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">Argon2id + Google Authenticator</div>
          <p className="text-[11px] text-slate-400">
            Mật khẩu băm với salt 128-bit, mã OTP 6 số làm mới mỗi 30 giây chống nghe lén qua chuẩn RFC 6238.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">Chống Tấn Công Dò Pass</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">Khóa sau 5 lần sai liên tiếp</div>
          <p className="text-[11px] text-slate-400">
            Kích hoạt rate limit và đóng băng phiên 15 phút, gửi thông báo khẩn cấp tới Chủ nhà.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-slate-300">Quyền Tạm Thời Khách / Kỹ Thuật</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">Tự động hủy khi hết hạn</div>
          <p className="text-[11px] text-slate-400">
            Kỹ thuật viên chỉ được xem đúng camera được chỉ định, token tự thu hồi sau thời gian định sẵn.
          </p>
        </div>
      </div>

      {/* Section 1: Per-Camera Permission Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Ma Trận Phân Quyền Camera Theo Người Dùng (Access Matrix)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Nhấp vào ô để cấp / thu hồi quyền tức thì
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="p-3 font-semibold">Người Dùng & Vai Trò</th>
                <th className="p-3 font-semibold text-center">Bảo mật 2FA QR</th>
                {cameras.map((c) => (
                  <th key={c.id} className="p-3 font-semibold text-center whitespace-nowrap">
                    <div>{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{c.location.split('·')[0]}</div>
                  </th>
                ))}
                <th className="p-3 font-semibold text-right">Trạng thái Truy cập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3">
                    <div className="font-medium text-slate-200">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.roleLabel}</div>
                    {u.tempAccessExpiresAt && (
                      <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                        Hết hạn sau: 1h 45m
                      </div>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => setUserToSetup2FA(u)}
                      className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                      title="Mở mã QR để quét bằng Google Authenticator"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Quét QR</span>
                    </button>
                  </td>

                  {cameras.map((cam) => {
                    const hasAccess = u.allowedCameras.includes(cam.id);

                    return (
                      <td key={cam.id} className="p-3 text-center">
                        <button
                          disabled={u.role === 'owner'} // Owner always has master access
                          onClick={() => handleToggleCameraPerm(u.id, cam.id)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            hasAccess
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                          } ${u.role === 'owner' ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                          title={
                            u.role === 'owner'
                              ? 'Chủ nhà có toàn quyền mặc định'
                              : hasAccess
                              ? 'Đang có quyền xem. Bấm để thu hồi'
                              : 'Đang bị chặn. Bấm để cấp quyền'
                          }
                        >
                          {hasAccess ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    );
                  })}

                  <td className="p-3 text-right">
                    {u.isLocked ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[11px] text-rose-400 font-medium">Bị khóa tạm thời</span>
                        <button
                          onClick={() => onUnlockUser(u.id)}
                          className="px-2 py-1 bg-rose-500/20 text-rose-300 rounded text-[11px] hover:bg-rose-500/30"
                        >
                          Mở khóa
                        </button>
                      </div>
                    ) : u.tempAccessExpiresAt ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onUpdateUserExpiry(u.id, 60)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                        >
                          +1 giờ
                        </button>
                        <button
                          onClick={() => onUpdateUserExpiry(u.id, -9999)}
                          className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded text-[11px]"
                        >
                          Thu hồi ngay
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-400">Hoạt động bình thường</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Interactive 2FA TOTP Authenticator Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Interactive TOTP Code Generator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Tích Hợp Google Authenticator (Mã OTP 2 Lớp)
              </h3>
            </div>
            <select
              value={selectedUser.id}
              onChange={(e) => {
                const found = users.find(u => u.id === e.target.value);
                if (found) setSelectedUser(found);
              }}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
            <span>Đồng bộ theo chuẩn quốc tế RFC 6238 HMAC-SHA1 với Google Authenticator trên điện thoại.</span>
            <button
              onClick={() => setUserToSetup2FA(selectedUser)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Xem / Quét mã QR</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Tài khoản: {selectedUser.email}</div>
              <div className="text-3xl font-mono font-bold tracking-widest text-cyan-400 mt-1 tabular-nums">
                {otpInfo.code.slice(0, 3)} {otpInfo.code.slice(3, 6)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Khóa Base32: {selectedUser.twoFactorSecret}
              </div>
            </div>

            {/* Countdown circular timer */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-500/40 flex items-center justify-center font-mono font-bold text-sm text-cyan-300">
                {otpInfo.secondsRemaining}s
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Thời hạn</span>
            </div>
          </div>

          {/* Test TOTP Verification Input */}
          <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2">
            <label className="block text-xs font-medium text-slate-300">
              Kiểm tra xác thực OTP (Nhập 6 số từ ứng dụng Google Authenticator trên điện thoại hoặc mã mô phỏng ở trên):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Nhập 6 số..."
                value={testOtpInput}
                onChange={(e) => {
                  setTestOtpInput(e.target.value.replace(/\D/g, ''));
                  setOtpTestResult(null);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-center tracking-widest text-sm w-40"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Xác thực mã
              </button>
              <button
                type="button"
                onClick={() => setTestOtpInput(otpInfo.code)}
                className="text-xs text-cyan-400 hover:underline"
              >
                Tự điền mã đúng
              </button>
            </div>

            {otpTestResult === 'success' && (
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Mã xác thực Google Authenticator chính xác 100%! Cấp Token phiên có chữ ký số.</span>
              </div>
            )}
            {otpTestResult === 'fail' && (
              <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 rounded text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Mã OTP sai hoặc đã hết hạn! Vui lòng đối chiếu với mã trên Google Authenticator.</span>
              </div>
            )}
          </form>

        </div>

        {/* Right: Security Safeguards & Brute Force Lockout */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Cơ Chế Khóa Tài Khoản & Chống Tấn Công Dò Quét
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
              <span className="font-semibold text-slate-200">1. Giới hạn tốc độ đăng nhập (Rate Limiter)</span>
              <p className="text-slate-400 leading-relaxed">
                Tối đa 5 lần thử mật khẩu/OTP trong vòng 60 giây từ 1 địa chỉ IP. Vượt ngưỡng sẽ tự động kích hoạt Cloudflare/Nginx rate limit 429 Too Many Requests.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
              <span className="font-semibold text-slate-200">2. Khóa tài khoản cưỡng chế (Account Lockout)</span>
              <p className="text-slate-400 leading-relaxed">
                Nếu phát hiện 5 lần thất bại liên tiếp, tài khoản bị đóng băng ngay lập tức. Để mở khóa, bắt buộc phải dùng khóa khôi phục ngoại tuyến hoặc Chủ nhà phê duyệt bằng chữ ký số.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-1">
              <span className="font-semibold text-slate-200">3. Báo động tự động tới Telegram</span>
              <p className="text-slate-400 leading-relaxed">
                Kèm theo địa chỉ IP nguồn, vị trí địa lý Geolocation, loại thiết bị và ảnh chụp từ camera chuông cửa nếu có nghi vấn kẻ đứng trước nhà.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Google Authenticator QR Code Modal */}
      {userToSetup2FA && (
        <GoogleAuthSetupModal
          user={userToSetup2FA}
          onClose={() => setUserToSetup2FA(null)}
          onUpdateSecret={onUpdateUserSecret}
        />
      )}

    </div>
  );
};
