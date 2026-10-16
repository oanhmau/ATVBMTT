import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  X, 
  WifiOff, 
  Lock, 
  RotateCcw, 
  CheckCircle2 
} from 'lucide-react';

interface EmergencyLockdownModalProps {
  isLockdownActive: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const EmergencyLockdownModal: React.FC<EmergencyLockdownModalProps> = ({
  isLockdownActive,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className={`bg-slate-900 border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl ${
        isLockdownActive ? 'border-emerald-500/50' : 'border-rose-500/60'
      }`}>
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isLockdownActive 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isLockdownActive ? 'Hủy Bỏ Chế Độ Khẩn Cấp' : 'Kích Hoạt NÚT KHẨN CẤP'}
              </h3>
              <span className="text-[11px] text-slate-400">
                Lệnh cô lập toàn hệ thống chỉ với một cú nhấp
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Details */}
        <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
          {isLockdownActive ? (
            <p>
              Hệ thống sẽ <strong>khôi phục lại các luồng truyền video</strong> và mở lại quyền truy cập cho các thiết bị tin cậy đã đăng ký. Một khối giao dịch khôi phục sẽ được ghi vào Blockchain.
            </p>
          ) : (
            <>
              <p>
                Khi kích hoạt, HomeCam Shield sẽ ngay lập tức thực hiện chuỗi hành động bảo vệ sau:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-rose-300">
                  <WifiOff className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Ngắt toàn bộ đường truyền video từ xa ra ngoài Internet.</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300">
                  <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Hủy ngay lập tức mọi phiên truy cập tạm thời của Kỹ thuật viên & Khách.</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>Đóng băng quyền xem camera phòng ngủ và các khu vực nhạy cảm.</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Đóng
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-md ${
              isLockdownActive
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
            }`}
          >
            {isLockdownActive ? 'Xác Nhận Khôi Phục Bình Thường' : 'XÁC NHẬN KHÓA KHẨN CẤP NGAY'}
          </button>
        </div>

      </div>
    </div>
  );
};
