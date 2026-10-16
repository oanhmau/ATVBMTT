import React, { useState } from 'react';
import { 
  TrustedDevice, 
  BlockchainBlock,
  UserProfile 
} from '../types';
import { 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  Tablet, 
  HelpCircle, 
  Check, 
  X, 
  Ban, 
  Wifi, 
  Network, 
  Globe, 
  Radio, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  ArrowRight
} from 'lucide-react';

interface ZeroTrustDevicesViewProps {
  currentUser: UserProfile;
  devices: TrustedDevice[];
  onApproveDevice: (deviceId: string) => void;
  onBlockDevice: (deviceId: string) => void;
  onRecordAuditBlock: (block: Partial<BlockchainBlock>) => void;
  onOpenAuthorizeModal: () => void;
}

export const ZeroTrustDevicesView: React.FC<ZeroTrustDevicesViewProps> = ({
  currentUser,
  devices,
  onApproveDevice,
  onBlockDevice,
  onRecordAuditBlock,
  onOpenAuthorizeModal,
}) => {
  const [vlanIsolated, setVlanIsolated] = useState<boolean>(true);
  const [directInternetBlocked, setDirectInternetBlocked] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleApprove = (dev: TrustedDevice) => {
    onApproveDevice(dev.id);
    onRecordAuditBlock({
      action: 'DEVICE_APPROVAL',
      actionLabel: 'Phê duyệt thiết bị tin cậy Zero Trust',
      operator: 'Nguyễn Văn An (Chủ nhà)',
      userId: 'user_owner',
      role: 'owner',
      targetCamera: 'Gateway Zero Trust',
      ipAddress: dev.ip,
      device: dev.name,
      details: `Chủ nhà đã xác nhận và cấp chứng chỉ thiết bị tin cậy cho ${dev.name} (FP: ${dev.fingerprint}).`,
    });
    setActionNotice(`Đã phê duyệt thiết bị "${dev.name}". Thiết bị đã được thêm vào danh sách tin cậy.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleBlock = (dev: TrustedDevice) => {
    onBlockDevice(dev.id);
    onRecordAuditBlock({
      action: 'DEVICE_APPROVAL',
      actionLabel: 'Chặn cưỡng chế thiết bị',
      operator: 'Nguyễn Văn An (Chủ nhà)',
      userId: 'user_owner',
      role: 'owner',
      targetCamera: 'Gateway Zero Trust',
      ipAddress: dev.ip,
      device: dev.name,
      details: `Chủ nhà đã từ chối và chặn vĩnh viễn thiết bị ${dev.name} (IP: ${dev.ip}).`,
    });
    setActionNotice(`Đã chặn truy cập đối với thiết bị "${dev.name}".`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const getDeviceIcon = (type: TrustedDevice['type']) => {
    switch (type) {
      case 'laptop': return <Laptop className="w-4 h-4 text-cyan-400" />;
      case 'mobile': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'tablet': return <Tablet className="w-4 h-4 text-purple-400" />;
      default: return <HelpCircle className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Nguyên Tắc Zero Trust & Quản Lý Thiết Bị</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Không tin tưởng mặc định bất kỳ ai hay thiết bị nào. Mọi kết nối đều phải xác minh thiết bị, vị trí IP và nằm trong mạng VLAN cô lập.
          </p>
        </div>

        {currentUser.role === 'owner' ? (
          <button
            onClick={onOpenAuthorizeModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/40 shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>+ Cấp Quyền Thiết Bị Mới</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 italic">
            Chỉ Chủ nhà mới có quyền cấp phép thiết bị mới
          </div>
        )}
      </div>

      {actionNotice && (
        <div className="p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Network Isolation / Air-Gapped Architecture Architecture Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Kiến Trúc Cô Lập Mạng Camera IoT (VLAN Isolation & No Direct WAN)
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">
            VLAN 10 · Subnet 192.168.10.0/24 · mTLS Handshake
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Phần lớn camera IoT bị hack do cắm trực tiếp vào modem và mở port (UPnP, port forwarding) ra Internet. HomeCam Shield cô lập toàn bộ camera trong phân đoạn mạng riêng biệt không có cổng ra Internet trực tiếp. Mọi luồng xem phải đi qua Gateway bảo vệ có mã hóa đầu cuối.
        </p>

        {/* Visual Pipeline of Zero Trust */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800 w-full md:w-auto">
            <Radio className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-200">Camera IoT Gia Đình</div>
              <div className="text-[10px] text-slate-400 font-mono">Chỉ cấp IP nội bộ VLAN 10</div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <div className="text-[10px] font-mono text-cyan-400 whitespace-nowrap">RTSP mã hóa mTLS</div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>

          <div className="flex items-center gap-3 p-3 bg-cyan-950/40 rounded-lg border border-cyan-500/40 w-full md:w-auto">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="font-bold text-cyan-300">Gateway HomeCam Shield</div>
              <div className="text-[10px] text-slate-300 font-mono">Xác thực 3 lớp + Watermark + AES</div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <div className="text-[10px] font-mono text-cyan-400 whitespace-nowrap">HTTPS/WebRTC</div>
            <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800 w-full md:w-auto">
            <Laptop className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-200">Thiết Bị Tin Cậy Được Duyệt</div>
              <div className="text-[10px] text-slate-400 font-mono">Đã đối chiếu sinh trắc & Fingerprint</div>
            </div>
          </div>

        </div>

        {/* Isolation Policy Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-200">Chặn hoàn toàn Internet trực tiếp ra ngoài (No WAN)</span>
              <p className="text-[11px] text-slate-400">Camera không thể gửi dữ liệu lén về server Trung Quốc / Cloud bên thứ ba</p>
            </div>
            <button
              onClick={() => setDirectInternetBlocked(!directInternetBlocked)}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                directInternetBlocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {directInternetBlocked ? 'Đang bật' : 'Tắt'}
            </button>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-200">Phân đoạn mạng riêng (VLAN 10 Isolation)</span>
              <p className="text-[11px] text-slate-400">Cách ly camera khỏi mạng máy tính làm việc và TV thông minh</p>
            </div>
            <button
              onClick={() => setVlanIsolated(!vlanIsolated)}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                vlanIsolated ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {vlanIsolated ? 'Đang bật' : 'Tắt'}
            </button>
          </div>
        </div>

      </div>

      {/* Section 2: Trusted Device Registry Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Sổ Đăng Ký Thiết Bị Tin Cậy (Device Fingerprint Registry)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Thiết bị mới phải được Chủ nhà duyệt trước khi xem luồng video
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="p-3 font-semibold">Tên Thiết Bị & Loại</th>
                <th className="p-3 font-semibold">Chủ Sở Hữu</th>
                <th className="p-3 font-semibold">Địa Chỉ IP & Vị Trí</th>
                <th className="p-3 font-semibold">Dấu Vân Tay (Fingerprint)</th>
                <th className="p-3 font-semibold">Trạng Thái</th>
                <th className="p-3 font-semibold text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {devices.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(dev.type)}
                      <div>
                        <div className="font-medium text-slate-200 flex items-center gap-1.5">
                          <span>{dev.name}</span>
                          {dev.isCurrent && (
                            <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-1.5 py-0.2 rounded font-mono">
                              Hiện tại
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{dev.lastSeen}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-slate-300">
                    {dev.owner}
                  </td>

                  <td className="p-3 font-mono text-slate-300 text-[11px]">
                    <div>{dev.ip}</div>
                    <div className="text-[10px] text-slate-500">{dev.geo}</div>
                  </td>

                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    {dev.fingerprint}
                  </td>

                  <td className="p-3">
                    {dev.status === 'trusted' ? (
                      <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã tin cậy</span>
                      </span>
                    ) : dev.status === 'pending' ? (
                      <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Chờ duyệt (Lạ)</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                        <Ban className="w-3.5 h-3.5" />
                        <span>Đã chặn</span>
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {dev.status !== 'trusted' && (
                        <button
                          onClick={() => handleApprove(dev)}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                          title="Chủ nhà phê duyệt thiết bị"
                        >
                          <Check className="w-3 h-3" />
                          <span>Duyệt</span>
                        </button>
                      )}

                      {dev.status !== 'blocked' && (
                        <button
                          onClick={() => handleBlock(dev)}
                          className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                          title="Chặn thiết bị này ngay lập tức"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Chặn</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
