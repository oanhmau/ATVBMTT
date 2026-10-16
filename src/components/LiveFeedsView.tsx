import React, { useState, useEffect, useRef } from 'react';
import { 
  CameraDevice, 
  UserProfile, 
  BlockchainBlock 
} from '../types';
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Camera as CameraIcon, 
  Maximize2, 
  EyeOff, 
  Video, 
  Radio, 
  Fingerprint,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { simulateAES256Encrypt } from '../utils/crypto';

interface LiveFeedsViewProps {
  cameras: CameraDevice[];
  currentUser: UserProfile;
  isLockdownActive: boolean;
  onInspectEncryption: (camera: CameraDevice) => void;
  onRecordAuditBlock: (newBlockData: Partial<BlockchainBlock>) => void;
}

export const LiveFeedsView: React.FC<LiveFeedsViewProps> = ({
  cameras,
  currentUser,
  isLockdownActive,
  onInspectEncryption,
  onRecordAuditBlock,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'floor1' | 'floor2' | 'outdoor'>('all');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.75);
  const [liveClock, setLiveClock] = useState<string>('');
  const [snapshotSuccessMsg, setSnapshotSuccessMsg] = useState<string | null>(null);
  
  // Real webcam state
  const [useRealWebcam, setUseRealWebcam] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Live real-time clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClock(now.toISOString().replace('T', ' ').substring(0, 19));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle real webcam feed
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (useRealWebcam) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
          setWebcamError(null);
        })
        .catch((err) => {
          console.warn('Webcam access error:', err);
          setWebcamError('Không thể mở webcam (cần cấp quyền truy cập trình duyệt). Đang dùng luồng giả lập.');
          setUseRealWebcam(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [useRealWebcam]);

  const filteredCameras = cameras.filter((cam) => {
    if (selectedFilter === 'floor1') return cam.id === 'cam_living_room';
    if (selectedFilter === 'floor2') return cam.id === 'cam_master_bedroom' || cam.id === 'cam_baby_nursery';
    if (selectedFilter === 'outdoor') return cam.id === 'cam_front_door';
    return true;
  });

  const handleCaptureSnapshot = (cam: CameraDevice) => {
    const payload = `SNAPSHOT_${cam.id}_${Date.now()}_USER_${currentUser.id}`;
    const encrypted = simulateAES256Encrypt(payload, cam.aesKeyId);

    // Record this snapshot to the immutable blockchain
    onRecordAuditBlock({
      action: 'SNAPSHOT_SECURE',
      actionLabel: 'Chụp ảnh & mã hóa lưu trữ AES-256',
      operator: currentUser.name,
      userId: currentUser.id,
      role: currentUser.role,
      targetCamera: cam.name,
      ipAddress: '192.168.1.15',
      device: 'MacBook Pro (Authorized Client)',
      details: `Ảnh chụp tại ${cam.name} được mã hóa AES-256-GCM (IV: ${encrypted.ivHex.slice(0, 8)}..., Tag: ${encrypted.authTag.slice(0, 8)}...). Đã lưu an toàn vào Vault.`,
    });

    setSnapshotSuccessMsg(`Đã chụp và mã hóa thành công khung hình từ ${cam.name}. Giao dịch đã được ghi vào Blockchain!`);
    setTimeout(() => setSnapshotSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Security Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Giám Sát Trực Tiếp Camera</span>
            <span className="text-xs text-slate-400 font-normal">
              · TLS 1.3 / mTLS · Mã hóa lưu trữ AES-256 · Chống quay lén Dynamic Watermark
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mỗi khung hình hiển thị được giám sát theo nguyên tắc Zero Trust: Xác minh người dùng, thiết bị và gắn watermark định danh.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Webcam Toggle */}
          <button
            onClick={() => setUseRealWebcam(!useRealWebcam)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              useRealWebcam
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{useRealWebcam ? 'Tắt Webcam thật' : 'Dùng Webcam máy tính của bạn'}</span>
          </button>

          {/* Watermark opacity slider */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs text-slate-300">
            <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
            <span className="whitespace-nowrap">Độ nét Watermark:</span>
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={watermarkOpacity}
              onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
              className="w-20 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {webcamError && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{webcamError}</span>
        </div>
      )}

      {snapshotSuccessMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{snapshotSuccessMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-lg w-fit">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            selectedFilter === 'all'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tất cả Camera (4)
        </button>
        <button
          onClick={() => setSelectedFilter('floor1')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            selectedFilter === 'floor1'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tầng 1 (Phòng Khách)
        </button>
        <button
          onClick={() => setSelectedFilter('floor2')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            selectedFilter === 'floor2'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tầng 2 (Phòng Ngủ & Trẻ Em)
        </button>
        <button
          onClick={() => setSelectedFilter('outdoor')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            selectedFilter === 'outdoor'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ngoại Thất (Chuông Cửa)
        </button>
      </div>

      {/* Camera Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCameras.map((camera, idx) => {
          const isAllowed = currentUser.allowedCameras.includes(camera.id);
          const isStrictPrivacyBed = camera.id === 'cam_master_bedroom';

          return (
            <div
              key={camera.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col transition-all hover:border-slate-700 shadow-md"
            >
              {/* Camera Header Bar */}
              <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isLockdownActive ? 'bg-rose-500' : isAllowed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="font-semibold text-slate-200">{camera.name}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400 font-mono text-[11px]">{camera.ip}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {camera.resolution} · {camera.fps} fps
                  </span>
                  <button
                    onClick={() => onInspectEncryption(camera)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[11px] flex items-center gap-1 transition-colors"
                    title="Kiểm tra gói tin mã hóa AES & Chứng chỉ TLS"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Mã hóa AES</span>
                  </button>
                </div>
              </div>

              {/* Video Viewport with Dynamic Watermark */}
              <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center select-none">
                
                {/* STATE 1: System Emergency Lockdown */}
                {isLockdownActive ? (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-20">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
                    <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wide">
                      CHẾ ĐỘ KHẨN CẤP ĐANG KÍCH HOẠT
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Toàn bộ luồng truyền video từ xa đã bị ngắt kết nối cưỡng chế. Chỉ có thể truy cập qua cáp mạng cục bộ LAN có xác thực vật lý.
                    </p>
                  </div>
                ) : !isAllowed ? (
                  /* STATE 2: Access Denied via IAM Matrix (Zero Trust) */
                  <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-20">
                    <Lock className="w-12 h-12 text-amber-400/80 mb-3" />
                    <h3 className="text-sm font-bold text-amber-300">
                      QUYỀN TRUY CẬP BỊ TỪ CHỐI (IAM Policy)
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Vai trò hiện tại (<span className="text-slate-200 font-medium">{currentUser.roleLabel}</span>) không được cấp phép xem luồng hình ảnh này.
                    </p>
                    {isStrictPrivacyBed && (
                      <span className="mt-2 text-[11px] text-rose-400 font-mono bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20">
                        Chính sách riêng tư: Chỉ tài khoản Chủ nhà được phép xem phòng ngủ
                      </span>
                    )}
                  </div>
                ) : (
                  /* STATE 3: Authorized Live Stream */
                  <>
                    {/* Live Video Media: Real Webcam for Camera 1 (if active) OR High-Def Realistic Domestic Feed */}
                    {useRealWebcam && idx === 0 ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={camera.imageSrc}
                        alt={camera.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Camera Technical Overlay (Timecode, Live Tag, Bitrate) */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] text-white font-mono flex items-center gap-2 z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <span>LIVE</span>
                      <span className="text-slate-400">|</span>
                      <span>{liveClock}</span>
                    </div>

                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-cyan-300 font-mono flex items-center gap-1.5 z-10">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AES-256-GCM OK</span>
                    </div>

                    {/* DYNAMIC FORENSIC WATERMARK OVERLAY (Section 3.b Anti-Leak & Viewer Attribution) */}
                    <div 
                      className="absolute inset-0 pointer-events-none z-15 flex flex-col justify-between p-4"
                      style={{ opacity: watermarkOpacity }}
                    >
                      {/* Subtle diagonal repeating watermark grid across entire frame */}
                      <div className="absolute inset-0 flex flex-wrap items-center justify-around opacity-25 -rotate-12 select-none overflow-hidden text-[11px] font-mono text-white/40 leading-loose">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="p-3 whitespace-nowrap">
                            HOMECAM SHIELD · {currentUser.name} · {currentUser.id} · 192.168.1.15
                          </div>
                        ))}
                      </div>

                      {/* Prominent Bottom Forensic Tag with Live Timestamp */}
                      <div className="mt-auto w-full flex items-center justify-between text-[11px] font-mono text-cyan-200/90 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded border border-cyan-500/20">
                        <div className="flex items-center gap-2">
                          <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                          <span>NGƯỜI XEM: {currentUser.name} ({currentUser.roleLabel})</span>
                          <span className="text-slate-400">·</span>
                          <span>IP: 192.168.1.15</span>
                        </div>
                        <div className="text-right text-[10px] text-slate-300">
                          <span>{liveClock}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Camera Footer & Action Bar */}
              <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>VLAN: {camera.vlan}</span>
                  <span>·</span>
                  <span>Key: {camera.aesKeyId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={!isAllowed || isLockdownActive}
                    onClick={() => handleCaptureSnapshot(camera)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded text-xs flex items-center gap-1.5 transition-colors"
                    title="Chụp ảnh và lưu vào kho lưu trữ mã hóa AES-256"
                  >
                    <CameraIcon className="w-3.5 h-3.5 text-slate-300" />
                    <span>Chụp ảnh mã hóa</span>
                  </button>

                  <button
                    onClick={() => onInspectEncryption(camera)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="Chi tiết luồng và giải mã"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
