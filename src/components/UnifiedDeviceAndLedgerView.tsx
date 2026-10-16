import React, { useState } from 'react';
import { 
  TrustedDevice, 
  BlockchainBlock, 
  UserProfile 
} from '../types';
import { ZeroTrustDevicesView } from './ZeroTrustDevicesView';
import { BlockchainLedgerView } from './BlockchainLedgerView';
import { 
  ShieldCheck, 
  Layers, 
  Laptop, 
  FileText, 
  Flame, 
  Info, 
  HelpCircle,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface UnifiedDeviceAndLedgerViewProps {
  currentUser: UserProfile;
  devices: TrustedDevice[];
  blocks: BlockchainBlock[];
  onApproveDevice: (deviceId: string) => void;
  onBlockDevice: (deviceId: string) => void;
  onRecordAuditBlock: (block: Partial<BlockchainBlock>) => void;
  onOpenAuthorizeModal: () => void;
  onTamperBlock: (blockIndex: number, newOperator: string, newDetails: string) => void;
  onRestoreOriginalLedger: () => void;
  initialSubSection?: 'devices' | 'ledger';
}

export const UnifiedDeviceAndLedgerView: React.FC<UnifiedDeviceAndLedgerViewProps> = ({
  currentUser,
  devices,
  blocks,
  onApproveDevice,
  onBlockDevice,
  onRecordAuditBlock,
  onOpenAuthorizeModal,
  onTamperBlock,
  onRestoreOriginalLedger,
  initialSubSection = 'devices',
}) => {
  const [subSection, setSubSection] = useState<'devices' | 'ledger'>(initialSubSection);

  React.useEffect(() => {
    if (initialSubSection) {
      setSubSection(initialSubSection);
    }
  }, [initialSubSection]);

  const pendingDevicesCount = devices.filter(d => d.status === 'pending').length;
  const isTampered = blocks.some(b => b.isTampered);

  return (
    <div className="space-y-6">
      
      {/* Friendly Guide Banner for Non-Technical Users */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 font-mono">
                BẢO VỆ 2 LỚP TOÀN DIỆN
              </span>
              <span className="text-xs text-slate-400">
                · Kiểm soát thiết bị vào xem & Sổ lưu trữ không thể tẩy xóa
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Bảo Vệ Thiết Bị & Sổ Ghi Chống Sửa
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Giải pháp kết hợp <strong>Nguyên tắc Zero Trust</strong> (chỉ cho phép thiết bị quen thuộc vào xem) và <strong>Công nghệ Blockchain Mini</strong> (mỗi lần mở camera đều được đóng con dấu điện tử không thể xóa hay sửa chữa để che giấu hành vi).
            </p>
          </div>

          {/* Sub-tabs switcher with friendly non-technical names */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setSubSection('devices')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                subSection === 'devices'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Thiết Bị Tin Cậy</span>
              {pendingDevicesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setSubSection('ledger')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                subSection === 'ledger'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Sổ Nhật Ký Chống Xóa (Blockchain)</span>
              {isTampered && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Intuitive visual explanation for ordinary users */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">1. Lớp cửa ra vào (Zero Trust):</strong> Người lạ dù có biết mật khẩu nhưng dùng điện thoại lạ chưa được Chủ nhà phê duyệt thì vẫn bị chặn bên ngoài.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">2. Lớp sổ ghi niêm phong (Blockchain):</strong> Bất kỳ ai vào xem đều bị đóng dấu kỹ thuật số. Nếu kẻ xấu cố tình vào cơ sở dữ liệu xóa dòng log xem trộm, con dấu sẽ vỡ vụn và hệ thống báo động đỏ!
            </div>
          </div>
        </div>
      </div>

      {/* Render Active Sub-Section */}
      {subSection === 'devices' ? (
        <ZeroTrustDevicesView
          currentUser={currentUser}
          devices={devices}
          onApproveDevice={onApproveDevice}
          onBlockDevice={onBlockDevice}
          onRecordAuditBlock={onRecordAuditBlock}
          onOpenAuthorizeModal={onOpenAuthorizeModal}
        />
      ) : (
        <BlockchainLedgerView
          blocks={blocks}
          onTamperBlock={onTamperBlock}
          onRestoreOriginalLedger={onRestoreOriginalLedger}
        />
      )}

    </div>
  );
};
