import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { TrustedDevice, UserProfile, CameraDevice } from '../types';
import { 
  X, 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  Tablet, 
  HelpCircle, 
  Key, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Sparkles,
  Fingerprint
} from 'lucide-react';
import { calculateSHA256 } from '../utils/crypto';

interface AuthorizeDeviceModalProps {
  currentUser: UserProfile;
  users: UserProfile[];
  cameras: CameraDevice[];
  onClose: () => void;
  onAuthorizeDevice: (device: TrustedDevice, accessDetails: string) => void;
}

export const AuthorizeDeviceModal: React.FC<AuthorizeDeviceModalProps> = ({
  currentUser,
  users,
  cameras,
  onClose,
  onAuthorizeDevice,
}) => {
  const [deviceName, setDeviceName] = useState<string>('iPad Pro của bé (Màn hình phòng khách)');
  const [deviceType, setDeviceType] = useState<TrustedDevice['type']>('tablet');
  const [assignedUser, setAssignedUser] = useState<string>(users[0].name);
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.35');
  const [geoLocation, setGeoLocation] = useState<string>('Hà Nội, Việt Nam (Wi-Fi Nhà)');
  const [accessScope, setAccessScope] = useState<'all' | 'family' | 'door_only'>('family');
  const [duration, setDuration] = useState<'permanent' | '2h' | '24h'>('permanent');
  
  // Pairing QR state
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [pairingToken, setPairingToken] = useState<string>(() => 
    `PAIR-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`
  );
  const [fingerprint, setFingerprint] = useState<string>(() => 
    `FP-SHA256-${Math.random().toString(16).substring(2, 8).toUpperCase()}`
  );

  // Generate QR code for device pairing
  useEffect(() => {
    const payload = `homecam-shield://pair?token=${pairingToken}&dev=${encodeURIComponent(deviceName)}&fp=${fingerprint}&scope=${accessScope}`;
    QRCode.toDataURL(payload, {
      width: 180,
      margin: 2,
      color: {
        dark: '#020617',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate pairing QR:', err));
  }, [pairingToken, deviceName, fingerprint, accessScope]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newDevice: TrustedDevice = {
      id: `dev_${Date.now()}`,
      name: deviceName.trim(),
      type: deviceType,
      owner: assignedUser,
      ip: ipAddress.trim(),
      geo: geoLocation.trim(),
      fingerprint,
      status: 'trusted',
      lastSeen: 'Vừa kích hoạt',
      isCurrent: false,
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      accessScope: accessScope === 'all' ? 'Toàn bộ camera' : accessScope === 'family' ? 'Khu vực sinh hoạt chung' : 'Chỉ chuông cửa',
      temporaryExpiresAt: duration === '2h' 
        ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        : duration === '24h' 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    };

    const scopeText = accessScope === 'all' 
      ? 'Toàn bộ Camera (bao gồm cả phòng ngủ)' 
      : accessScope === 'family' 
      ? 'Khu vực sinh hoạt chung (Phòng khách, Trẻ em, Chuông cửa)' 
      : 'Chỉ camera Chuông Cửa';

    const durationText = duration === 'permanent' 
      ? 'Vĩnh viễn (Thiết bị tin cậy gia đình)' 
      : duration === '2h' 
      ? 'Tạm thời 2 giờ' 
      : 'Tạm thời 24 giờ';

    const accessDetails = `Chủ nhà (${currentUser.name}) đã cấp quyền tin cậy cho thiết bị "${deviceName}" (${deviceType.toUpperCase()} · ${ipAddress}) gán cho ${assignedUser} với phạm vi: ${scopeText} · Thời hạn: ${durationText}.`;

    onAuthorizeDevice(newDevice, accessDetails);
    onClose();
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'laptop': return <Laptop className="w-4 h-4 text-cyan-400" />;
      case 'mobile': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'tablet': return <Tablet className="w-4 h-4 text-purple-400" />;
      default: return <HelpCircle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cấp Quyền Truy Cập Thiết Bị Mới (Zero Trust)
              </h3>
              <p className="text-xs text-slate-400">
                Thực hiện bởi: <span className="text-emerald-400 font-semibold">{currentUser.name}</span> (Chủ nhà · Toàn quyền)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Device Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block font-semibold text-slate-200">
                Tên thiết bị nhận quyền:
              </label>
              <input
                type="text"
                required
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Ví dụ: iPad Pro phòng ngủ..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-200">
                Loại thiết bị:
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                <option value="tablet">Máy tính bảng (Tablet)</option>
                <option value="mobile">Điện thoại (Mobile)</option>
                <option value="laptop">Máy tính xách tay (Laptop)</option>
                <option value="unknown">Khác / Màn hình phụ</option>
              </select>
            </div>
          </div>

          {/* Assigned User & IP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-200">
                Gán cho người dùng:
              </label>
              <select
                value={assignedUser}
                onChange={(e) => setAssignedUser(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                {users.map(u => (
                  <option key={u.id} value={u.name}>{u.name} ({u.roleLabel})</option>
                ))}
                <option value="Khách gia đình">Khách gia đình (Tạm thời)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-200">
                Địa chỉ IP gán trong mạng:
              </label>
              <input
                type="text"
                required
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>

          {/* Access Scope Options */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-200">
              Phạm vi quyền xem hình ảnh (Access Scope):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAccessScope('family')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  accessScope === 'family'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">Sinh Hoạt Chung</div>
                <div className="text-[10px] text-slate-400 mt-1">Phòng khách, Trẻ em, Chuông cửa (Trừ phòng ngủ)</div>
              </button>

              <button
                type="button"
                onClick={() => setAccessScope('all')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  accessScope === 'all'
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">Toàn Bộ Camera</div>
                <div className="text-[10px] text-slate-400 mt-1">Bao gồm cả Phòng Ngủ Master (Chỉ dành cho Chủ nhà)</div>
              </button>

              <button
                type="button"
                onClick={() => setAccessScope('door_only')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  accessScope === 'door_only'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs">Chuông Cửa Ngoài Sân</div>
                <div className="text-[10px] text-slate-400 mt-1">Chỉ camera ngoài sân (Cho shipper/thợ sửa)</div>
              </button>
            </div>
          </div>

          {/* Duration Options */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-200">
              Thời hạn ủy quyền:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDuration('permanent')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  duration === 'permanent'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Vĩnh viễn (Tin cậy)
              </button>
              <button
                type="button"
                onClick={() => setDuration('2h')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  duration === '2h'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Tạm thời 2 giờ
              </button>
              <button
                type="button"
                onClick={() => setDuration('24h')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  duration === '24h'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Tạm thời 24 giờ
              </button>
            </div>
          </div>

          {/* QR Pairing Code & Fingerprint Preview */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-1.5 bg-white rounded-lg shrink-0">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Device Pairing QR" className="w-24 h-24 block" />
              ) : (
                <div className="w-24 h-24 bg-slate-200 animate-pulse rounded" />
              )}
            </div>

            <div className="space-y-1 text-[11px] text-slate-300 flex-1">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mã ghép đôi thiết bị:</span>
                <span className="font-mono text-cyan-300">{pairingToken}</span>
              </div>
              <div className="font-mono text-[10px] text-slate-400 break-all">
                Dấu vân tay (SHA-256): {fingerprint}
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Quét mã QR từ camera của thiết bị mới để thiết lập chứng chỉ kết nối TLS 1.3 và lưu token ủy quyền.
              </p>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Cấp Quyền & Ký Số Blockchain</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
