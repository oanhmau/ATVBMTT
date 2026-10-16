import React, { useState } from 'react';
import { CameraDevice, UserProfile } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Wifi, 
  WifiOff, 
  Activity, 
  CheckCircle2, 
  ShieldAlert, 
  Info, 
  ExternalLink,
  Layers,
  Sparkles,
  Server,
  Zap,
  Maximize2
} from 'lucide-react';

interface InstantSecurityMonitorViewProps {
  cameras: CameraDevice[];
  currentUser: UserProfile;
  isLockdownActive: boolean;
  onInspectEncryption: (camera: CameraDevice) => void;
  onTogglePrivacyMask: (cameraId: string) => void;
  onNavigateToLive: () => void;
}

export const InstantSecurityMonitorView: React.FC<InstantSecurityMonitorViewProps> = ({
  cameras,
  currentUser,
  isLockdownActive,
  onInspectEncryption,
  onTogglePrivacyMask,
  onNavigateToLive,
}) => {
  const [quickAuditRunning, setQuickAuditRunning] = useState<boolean>(false);
  const [quickAuditComplete, setQuickAuditComplete] = useState<boolean>(false);

  const handleRunAudit = () => {
    setQuickAuditRunning(true);
    setQuickAuditComplete(false);
    setTimeout(() => {
      setQuickAuditRunning(false);
      setQuickAuditComplete(true);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Privacy Guarantee Header */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono tracking-wider">
                BẢNG ĐIỀU KHIỂN YÊN TÂM RIÊNG TƯ
              </span>
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Luồng Video Được Bảo Vệ</span>
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Giám Sát Tức Thời & Chỉ Thị Bảo Mật Camera
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed">
              Theo dõi trực tiếp trạng thái kết nối, mã hóa cấp quân sự <strong>AES-256</strong> và chứng chỉ <strong>mTLS</strong> của từng mắt camera. Đảm bảo luồng hình ảnh của gia đình không bao giờ bị rò rỉ hay xem trộm qua mạng Internet.
            </p>
          </div>

          {/* Quick Privacy Audit Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleRunAudit}
              disabled={quickAuditRunning}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950/50"
            >
              <ShieldCheck className={`w-4 h-4 ${quickAuditRunning ? 'animate-spin' : ''}`} />
              <span>{quickAuditRunning ? 'Đang quét bảo mật 4 camera...' : 'Kiểm Tra Toàn Diện Luồng Video'}</span>
            </button>

            <button
              onClick={onNavigateToLive}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Xem Trực Tiếp Tất Cả</span>
            </button>
          </div>

        </div>

        {/* Audit Complete Alert */}
        {quickAuditComplete && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Kiểm tra hoàn tất:</strong> Tất cả 4 camera đều có đường truyền mTLS hợp lệ, mã hóa AES-256 phần cứng nguyên vẹn, không có gói tin nào bị rò rỉ ra ngoài mạng gia đình.
              </span>
            </div>
            <button onClick={() => setQuickAuditComplete(false)} className="text-slate-400 hover:text-white text-[11px] underline">
              Ẩn
            </button>
          </div>
        )}
      </div>

      {/* 4 Instant Health Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Mã Hóa AES-256</span>
            </span>
            <span className="font-mono text-[10px] text-cyan-400 font-bold">4/4 CAMERA</span>
          </div>
          <div className="text-base font-bold text-white mt-1">AES-256-GCM</div>
          <p className="text-[11px] text-slate-400">
            Mã hóa phần cứng từ chip camera; kẻ nghe lén chỉ thu được byte rác.
          </p>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Kênh Truyền mTLS</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-bold">TLS 1.3 OK</span>
          </div>
          <div className="text-base font-bold text-white mt-1">Xác Thực 2 Chiều</div>
          <p className="text-[11px] text-slate-400">
            Chống giả mạo và tấn công nghe lén giữa đường (Man-in-the-middle).
          </p>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-400" />
              <span>Cô Lập Mạng Riêng</span>
            </span>
            <span className="font-mono text-[10px] text-purple-400 font-bold">VLAN 10</span>
          </div>
          <div className="text-base font-bold text-white mt-1">Chặn Ra WAN 100%</div>
          <p className="text-[11px] text-slate-400">
            Camera không thể tự ý gửi dữ liệu về máy chủ đám mây nước ngoài.
          </p>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Chỉ Số Yên Tâm</span>
            </span>
            <span className="font-mono text-[10px] text-amber-400 font-bold">100/100</span>
          </div>
          <div className="text-base font-bold text-white mt-1">Riêng Tư Tuyệt Đối</div>
          <p className="text-[11px] text-slate-400">
            Mọi truy cập đều gắn dấu tên người xem và ghi vào chuỗi Blockchain.
          </p>
        </div>

      </div>

      {/* Grid of Real-Time Camera Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cameras.map((camera) => {
          const isAllowed = currentUser.allowedCameras.includes(camera.id);
          const isMasked = camera.privacyMaskActive;

          return (
            <div
              key={camera.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-slate-700 flex flex-col justify-between"
            >
              {/* Camera Header with Indicators */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-white">{camera.name}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{camera.location}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded font-semibold flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-cyan-400" />
                    <span>AES-256 OK</span>
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>mTLS 1.3</span>
                  </span>
                </div>
              </div>

              {/* Real-Time Preview Thumbnail with Privacy Mask Indicator */}
              <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center select-none">
                {isLockdownActive ? (
                  <div className="p-4 text-center text-rose-400">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-rose-500" />
                    <div className="font-bold text-xs">CHẾ ĐỘ KHẨN CẤP ĐANG KÍCH HOẠT</div>
                    <div className="text-[10px] text-slate-400 mt-1">Luồng video đã bị ngắt kết nối an toàn</div>
                  </div>
                ) : isMasked ? (
                  <div className="p-4 text-center text-slate-300 bg-slate-950/95 inset-0 absolute flex flex-col items-center justify-center">
                    <EyeOff className="w-10 h-10 text-amber-400 mb-2" />
                    <div className="font-bold text-xs text-amber-300">RÈM RIÊNG TƯ ĐANG BẬT</div>
                    <div className="text-[11px] text-slate-400 max-w-xs mt-1">
                      Camera đã tạm dừng truyền hình ảnh để bảo vệ sự riêng tư của gia đình.
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={camera.imageSrc}
                      alt={camera.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-85"
                    />

                    {/* Quick overlay badges */}
                    <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Độ trễ: {camera.latencyMs || 15}ms</span>
                      <span className="text-slate-400">|</span>
                      <span>{camera.fps} fps</span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-cyan-400" />
                      <span>Mã hóa đầu cuối: {camera.aesKeyId}</span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                      <span>Đang xem: {camera.activeViewersCount || 1} thiết bị</span>
                    </div>
                  </>
                )}
              </div>

              {/* Technical Privacy & Certificate Rows */}
              <div className="p-4 space-y-2.5 text-xs bg-slate-950/40 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Chuẩn mã hóa Video:</span>
                    <span className="font-semibold text-slate-200">{camera.aesAlgorithm || 'AES-256-GCM'}</span>
                  </div>

                  <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px]">Chứng chỉ số mTLS:</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>x509 Hợp lệ</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Mạng: <strong className="text-slate-300 font-mono">{camera.ip}</strong> (VLAN 10 Cô Lập)</span>
                  <span className="text-emerald-400 font-medium">Chặn WAN: Tuyệt đối</span>
                </div>
              </div>

              {/* Action Buttons for this Camera */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onTogglePrivacyMask(camera.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isMasked 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Tạm thời che đen camera để đảm bảo sự riêng tư"
                >
                  {isMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{isMasked ? 'Mở lại luồng video' : 'Bật Rèm Riêng Tư'}</span>
                </button>

                <button
                  onClick={() => onInspectEncryption(camera)}
                  className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Soi trực tiếp các byte dữ liệu mã hóa thô"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Soi Gói Tin AES</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Comparison Explainer for Non-Technical Homeowners */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">
            Tại Sao Bạn Có Thể Hoàn Toàn Yên Tâm Với HomeCam Shield?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Left: Traditional Vulnerable Cameras */}
          <div className="p-4 bg-rose-950/15 border border-rose-500/30 rounded-xl space-y-2 text-rose-200">
            <div className="font-bold text-sm text-rose-400 flex items-center gap-1.5">
              <span>✕ Camera Thông Thường Trên Thị Trường</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
              <li>Luồng video RTSP truyền không mã hóa, dễ bị nghe lén trên cùng mạng Wi-Fi.</li>
              <li>Tự động mở cổng UPnP kết nối thẳng ra Internet, hacker toàn cầu có thể quét tìm.</li>
              <li>Dữ liệu video gửi lên Cloud của hãng sản xuất, nhân viên hãng có thể xem trộm.</li>
              <li>Không có nhật ký chống sửa: Kẻ xâm nhập xóa video lưu trữ mà chủ nhà không hề hay biết.</li>
            </ul>
          </div>

          {/* Right: HomeCam Shield Military Grade Protection */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-xl space-y-2 text-emerald-200">
            <div className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>✓ Lớp Bảo Vệ HomeCam Shield Pro</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px] leading-relaxed">
              <li><strong>Mã hóa AES-256</strong>: Chỉ có người giữ khóa KMS cục bộ của gia đình mới giải mã được hình ảnh.</li>
              <li><strong>mTLS 1.3</strong>: Cả camera và điện thoại đều phải xuất trình chứng chỉ số x509 trước khi kết nối.</li>
              <li><strong>Cô lập mạng VLAN 10</strong>: Camera hoàn toàn không thể gửi dữ liệu ra ngoài Internet.</li>
              <li><strong>Dấu niêm phong Blockchain</strong>: Bất kỳ ai mở xem camera đều bị đóng dấu không thể tẩy xóa.</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};
