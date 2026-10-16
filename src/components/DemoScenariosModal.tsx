import React from 'react';
import { 
  X, 
  Play, 
  Flame, 
  ShieldCheck, 
  FileEdit, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface DemoScenariosModalProps {
  onClose: () => void;
  onRunScenario1: () => void;
  onRunScenario2: () => void;
  onRunScenario3: () => void;
  onRunScenario4: () => void;
}

export const DemoScenariosModal: React.FC<DemoScenariosModalProps> = ({
  onClose,
  onRunScenario1,
  onRunScenario2,
  onRunScenario3,
  onRunScenario4,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Kịch Bản Demo Thuyết Trình (Presentation Lab)
              </h3>
              <p className="text-xs text-slate-400">
                4 kịch bản được chuẩn bị sẵn theo đề cương dự án để trình bày trực tiếp cho hội đồng / khách hàng.
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

        {/* 4 Interactive Scenarios */}
        <div className="space-y-3">
          
          {/* Scenario 1: Brute-Force Attack */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded">
                  KỊCH BẢN 1
                </span>
                <span className="font-bold text-slate-200 text-sm">
                  Tấn Công Dò Mật Khẩu (Brute-Force)
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Kẻ tấn công thử mật khẩu liên tục 5 lần → Hệ thống tự động khóa tài khoản, kích hoạt rate limit và bắn cảnh báo khẩn cấp tới Telegram của Chủ nhà.
              </p>
            </div>
            <button
              onClick={() => {
                onRunScenario1();
                onClose();
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Chạy Demo 1</span>
            </button>
          </div>

          {/* Scenario 2: Untrusted Device Login */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                  KỊCH BẢN 2
                </span>
                <span className="font-bold text-slate-200 text-sm">
                  Đăng Nhập Từ Thiết Bị & IP Lạ (Zero Trust)
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Đăng nhập từ máy tính lạ qua proxy Nga → Zero Trust phát hiện vân tay thiết bị chưa đăng ký → Tạm chặn và gửi yêu cầu phê duyệt cho Chủ nhà.
              </p>
            </div>
            <button
              onClick={() => {
                onRunScenario2();
                onClose();
              }}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Chạy Demo 2</span>
            </button>
          </div>

          {/* Scenario 3: Valid Encrypted Streaming */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-slate-700 transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded">
                  KỊCH BẢN 3
                </span>
                <span className="font-bold text-slate-200 text-sm">
                  Xem Hợp Lệ & Watermark Chống Quay Lén
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Chủ nhà xem camera trực tiếp → Video được truyền mã hóa AES-256 + mTLS → Gắn Dynamic Watermark mang tên người xem, IP và đồng hồ thời gian thực.
              </p>
            </div>
            <button
              onClick={() => {
                onRunScenario3();
                onClose();
              }}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Chạy Demo 3</span>
            </button>
          </div>

          {/* Scenario 4: Blockchain Log Tampering (The Highlight!) */}
          <div className="p-4 bg-purple-950/20 border border-purple-500/50 rounded-xl hover:border-purple-500 transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-purple-300 bg-purple-500/30 px-1.5 py-0.5 rounded">
                  KỊCH BẢN 4 (ĐIỂM NHẤN)
                </span>
                <span className="font-bold text-white text-sm">
                  Giả Mạo Nhật Ký & Merkle Tree Báo Đỏ
                </span>
              </div>
              <p className="text-purple-200/80 leading-relaxed">
                Kẻ xấu sửa đổi thủ công một dòng nhật ký trong CSDL → Chạy “Kiểm tra toàn vẹn” → Hệ thống lập tức báo ĐỎ, phát hiện chuỗi SHA-256 bị đứt gãy và rễ cây Merkle bị sai lệch!
              </p>
            </div>
            <button
              onClick={() => {
                onRunScenario4();
                onClose();
              }}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-md shadow-purple-950/40"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Chạy Demo 4</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>Hệ thống bảo vệ hình ảnh camera IoT trong nhà</span>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
