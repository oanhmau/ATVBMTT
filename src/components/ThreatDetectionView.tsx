import React, { useState } from 'react';
import { ThreatAlert, BlockchainBlock, NotificationGatewayConfig } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Bell, 
  Send, 
  CheckCircle2, 
  Ban, 
  ExternalLink, 
  Activity, 
  Flame, 
  Clock, 
  Globe, 
  DownloadCloud, 
  KeyRound,
  RotateCcw,
  BarChart3,
  FileSpreadsheet,
  Radio,
  Settings
} from 'lucide-react';

interface ThreatDetectionViewProps {
  alerts: ThreatAlert[];
  onResolveAlert: (alertId: string) => void;
  onSimulateThreat: (threatType: 'BRUTE_FORCE' | 'NIGHT_ACCESS' | 'FOREIGN_IP' | 'DATA_EXFILTRATION') => void;
  onTriggerEmergencyLockdown: () => void;
  onOpenWeeklyReport?: () => void;
  onOpenNotificationGateway?: () => void;
  notificationConfig?: NotificationGatewayConfig;
}

export const ThreatDetectionView: React.FC<ThreatDetectionViewProps> = ({
  alerts,
  onResolveAlert,
  onSimulateThreat,
  onTriggerEmergencyLockdown,
  onOpenWeeklyReport,
  onOpenNotificationGateway,
  notificationConfig,
}) => {
  const [selectedThreatToSimulate, setSelectedThreatToSimulate] = useState<'BRUTE_FORCE' | 'NIGHT_ACCESS' | 'FOREIGN_IP' | 'DATA_EXFILTRATION'>('BRUTE_FORCE');
  const [telegramFeedTab, setTelegramFeedTab] = useState<'all' | 'unresolved'>('all');

  // Compute average risk score
  const activeAlerts = alerts.filter(a => a.mitigationStatus !== 'RESOLVED');
  const maxRiskScore = alerts.length > 0 ? Math.max(...alerts.map(a => a.riskScore)) : 0;

  const getSeverityBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
          RẤT CAO ({score}/100)
        </span>
      );
    }
    if (score >= 50) {
      return (
        <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
          TRUNG BÌNH ({score}/100)
        </span>
      );
    }
    return (
      <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
        THẤP ({score}/100)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Phát Hiện Bất Thường & Báo Cáo An Ninh</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Động cơ phân tích rủi ro theo luật: Giám sát khung giờ 2–4h sáng, phát hiện tải video hàng loạt, IP nước ngoài và tấn công brute-force.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenNotificationGateway && (
            <button
              onClick={onOpenNotificationGateway}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-950/40"
              title="Cài đặt Telegram Bot Token & Chat ID để nhận cảnh báo trên điện thoại"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Cấu Hình Telegram Gateway</span>
            </button>
          )}

          {onOpenWeeklyReport && (
            <button
              onClick={onOpenWeeklyReport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/40"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Báo Cáo Tuần & Xuất CSV/PDF</span>
            </button>
          )}

          {/* Action button to test anomaly rules */}
          <div className="flex items-center gap-2">
            <select
              value={selectedThreatToSimulate}
              onChange={(e) => setSelectedThreatToSimulate(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg p-2"
            >
              <option value="BRUTE_FORCE">Dò mật khẩu 5 lần (Brute-force)</option>
              <option value="NIGHT_ACCESS">Xem phòng ngủ lúc 03:15 sáng</option>
              <option value="FOREIGN_IP">Đăng nhập từ IP Nga (Tor Proxy)</option>
              <option value="DATA_EXFILTRATION">Tải hàng loạt 10 video cùng lúc</option>
            </select>
            <button
              onClick={() => onSimulateThreat(selectedThreatToSimulate)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-rose-950/40"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Kích hoạt sự kiện thử nghiệm</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Threat Detection Rules Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-rose-400" />
              <span>Dò Mật Khẩu</span>
            </span>
            <span className="font-mono text-[10px] text-rose-400">Ngưỡng: 5 lần</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Tự động khóa tài khoản tạm thời 15 phút và chặn địa chỉ IP nguồn.
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Khung Giờ 02–04 AM</span>
            </span>
            <span className="font-mono text-[10px] text-amber-400">Nhạy cảm</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Xem phòng ngủ ban đêm ngoài dải IP nhà bắt buộc xác minh sinh trắc học và OTP.
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>IP / Quốc Gia Lạ</span>
            </span>
            <span className="font-mono text-[10px] text-purple-400">Tor/VPN</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Đăng nhập từ vị trí cách xa hơn 500km cần Chủ nhà phê duyệt thiết bị trên Telegram.
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <DownloadCloud className="w-4 h-4 text-cyan-400" />
              <span>Tải Hàng Loạt Video</span>
            </span>
            <span className="font-mono text-[10px] text-cyan-400">&gt; 5 file/phút</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Phát hiện hành vi đánh cắp dữ liệu video thẻ nhớ, tạm khóa quyền tải video.
          </div>
        </div>

      </div>

      {/* 2-Column Split: Active Threats Table (Left) + Telegram Bot Simulator (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left: Active Incidents List (2 Cols) */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Danh Sách Sự Kiện Đã Được Ghi Nhận ({alerts.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Điểm rủi ro cao nhất: <strong className="text-rose-400 font-mono">{maxRiskScore}/100</strong>
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all text-xs space-y-2 ${
                  alert.mitigationStatus === 'ACTIVE_BLOCKED'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : alert.mitigationStatus === 'PENDING_REVIEW'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{alert.title}</span>
                    {getSeverityBadge(alert.riskScore)}
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {alert.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span>IP: <strong className="font-mono text-slate-300">{alert.sourceIp}</strong></span>
                    <span>Thiết bị: <strong className="text-slate-300">{alert.device}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.mitigationStatus !== 'RESOLVED' ? (
                      <>
                        <button
                          onClick={onTriggerEmergencyLockdown}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Ban className="w-3 h-3" />
                          <span>Khóa khẩn cấp</span>
                        </button>
                        <button
                          onClick={() => onResolveAlert(alert.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition-colors"
                        >
                          Đánh dấu đã xử lý
                        </button>
                      </>
                    ) : (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Đã ngăn chặn an toàn</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Telegram Bot Notification Simulator (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 sticky top-20 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Cảnh Báo Telegram Bot Di Động
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{notificationConfig?.botUsername || '@HomeCamShieldBot'}</span>
              </span>
              {onOpenNotificationGateway && (
                <button
                  onClick={onOpenNotificationGateway}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-cyan-300 transition-colors text-[10px] font-semibold flex items-center gap-1 border border-slate-700"
                  title="Thay đổi Telegram Bot Token và Chat ID"
                >
                  <Settings className="w-3 h-3 text-cyan-400" />
                  <span>Cấu hình</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            {notificationConfig?.isEnabled
              ? `Cổng thông báo đang hoạt động. Cảnh báo sẽ được đẩy tới Chat ID: ${notificationConfig?.chatId || '865889609'}.`
              : 'Cổng thông báo đang tắt. Bấm "Cấu hình" để bật lại.'}
          </p>

          {/* Telegram Phone Screen Simulator */}
          <div className="bg-[#17212b] rounded-xl p-3 border border-[#2b3947] text-white text-xs space-y-3 font-sans shadow-inner">
            
            <div className="text-[10px] text-center text-[#708499] pb-1 border-b border-[#242f3d] flex items-center justify-between px-1">
              <span>Hôm nay, 19:14</span>
              <span className="text-cyan-400 font-mono">Chat ID: {notificationConfig?.chatId || '865889609'}</span>
              <span>Kênh Khẩn Cấp</span>
            </div>

            {alerts.slice(0, 3).map((a, i) => (
              <div key={i} className="bg-[#242f3d] p-3 rounded-lg space-y-2 border border-[#2b3947]">
                <div className="flex items-center justify-between text-rose-400 font-bold text-[11px]">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>[CẢNH BÁO BẢO MẬT]</span>
                  </span>
                  <span className="text-[10px] text-[#708499] font-mono">{a.timestamp.slice(11, 16)}</span>
                </div>

                <div className="text-[11px] text-slate-200">
                  Phát hiện bất thường: <strong>{a.title}</strong>
                </div>

                <div className="text-[10px] text-slate-300 font-mono bg-[#17212b] p-2 rounded border border-[#242f3d]">
                  <div>IP Nguồn: {a.sourceIp}</div>
                  <div>Điểm rủi ro: {a.riskScore}/100</div>
                  <div>Thiết bị: {a.device}</div>
                </div>

                {/* Telegram Inline Keyboard Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={onTriggerEmergencyLockdown}
                    className="p-1.5 bg-rose-600/80 hover:bg-rose-600 rounded text-[10px] font-bold text-white text-center transition-colors"
                  >
                    Ngắt camera ngay
                  </button>
                  <button
                    onClick={() => onResolveAlert(a.id)}
                    className="p-1.5 bg-[#2b3947] hover:bg-[#344658] rounded text-[10px] text-slate-200 text-center transition-colors"
                  >
                    Bỏ qua & Xem lại
                  </button>
                </div>
              </div>
            ))}

          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold text-cyan-400">Tích hợp thực tế:</span> Sử dụng Telegram Bot API webhook hoặc SMTP gửi email khi sản phẩm triển khai trên gateway Raspberry Pi / Mini PC tại gia đình.
          </div>

        </div>

      </div>

    </div>
  );
};
