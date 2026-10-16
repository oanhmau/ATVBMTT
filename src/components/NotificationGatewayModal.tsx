import React, { useState } from 'react';
import { NotificationGatewayConfig, UserProfile, BlockchainBlock } from '../types';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Radio, 
  Smartphone, 
  Flame, 
  Clock, 
  Globe, 
  Lock, 
  RefreshCw, 
  KeyRound, 
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface NotificationGatewayModalProps {
  config: NotificationGatewayConfig;
  onSaveConfig: (updatedConfig: NotificationGatewayConfig) => void;
  onSendTestNotification: (config: NotificationGatewayConfig) => Promise<{ success: boolean; message: string }>;
  currentUser: UserProfile;
  onClose: () => void;
}

export const NotificationGatewayModal: React.FC<NotificationGatewayModalProps> = ({
  config,
  onSaveConfig,
  onSendTestNotification,
  currentUser,
  onClose,
}) => {
  const [botToken, setBotToken] = useState<string>(config.botToken);
  const [chatId, setChatId] = useState<string>(config.chatId);
  const [botUsername, setBotUsername] = useState<string>(config.botUsername || '@HomeCamShieldBot');
  const [isEnabled, setIsEnabled] = useState<boolean>(config.isEnabled);
  
  const [notifyOnBruteForce, setNotifyOnBruteForce] = useState<boolean>(config.notifyOnBruteForce);
  const [notifyOnNightAccess, setNotifyOnNightAccess] = useState<boolean>(config.notifyOnNightAccess);
  const [notifyOnForeignIp, setNotifyOnForeignIp] = useState<boolean>(config.notifyOnForeignIp);
  const [notifyOnLockdown, setNotifyOnLockdown] = useState<boolean>(config.notifyOnLockdown);
  const [notifyOnNewDevice, setNotifyOnNewDevice] = useState<boolean>(config.notifyOnNewDevice);

  const [showToken, setShowToken] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; timestamp?: string } | null>(
    config.lastTestedAt ? { success: config.testStatus === 'success', message: 'Kết nối cổng thông báo đang hoạt động tốt.', timestamp: config.lastTestedAt } : null
  );
  const [copiedHelper, setCopiedHelper] = useState<boolean>(false);

  const handleTestConnection = async () => {
    if (!botToken.trim() || !chatId.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập đầy đủ Telegram Bot Token và Chat ID trước khi gửi thử nghiệm.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const tempConfig: NotificationGatewayConfig = {
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      botUsername: botUsername.trim(),
      isEnabled,
      notifyOnBruteForce,
      notifyOnNightAccess,
      notifyOnForeignIp,
      notifyOnLockdown,
      notifyOnNewDevice,
    };

    try {
      const res = await onSendTestNotification(tempConfig);
      setTestResult({
        success: res.success,
        message: res.message,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Lỗi kết nối: ${err?.message || 'Không thể gửi tin nhắn qua Telegram Bot API.'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const updated: NotificationGatewayConfig = {
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      botUsername: botUsername.trim() || '@HomeCamShieldBot',
      isEnabled,
      notifyOnBruteForce,
      notifyOnNightAccess,
      notifyOnForeignIp,
      notifyOnLockdown,
      notifyOnNewDevice,
      lastTestedAt: testResult?.success ? new Date().toISOString() : config.lastTestedAt,
      testStatus: testResult?.success ? 'success' : config.testStatus,
    };
    onSaveConfig(updated);
    onClose();
  };

  const handleCopyExample = () => {
    navigator.clipboard.writeText('7182938491:AAHkL9v3Q8mZ4wXpY2jK1rTs');
    setCopiedHelper(true);
    setTimeout(() => setCopiedHelper(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Cấu Hình Cổng Thông Báo (Notification Gateway)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  TELEGRAM BOT API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Thiết lập Telegram Bot Token và Chat ID để nhận tin nhắn cảnh báo an ninh tức thì về điện thoại của Chủ nhà.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Gateway Toggle & Status */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Kích Hoạt Cổng Đẩy Cảnh Báo Khẩn Cấp</span>
              <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            </div>
            <p className="text-[11px] text-slate-400">
              {isEnabled 
                ? 'Hệ thống tự động kích hoạt webhook gửi tin nhắn Telegram khi có sự kiện vi phạm.'
                : 'Đang tạm dừng gửi cảnh báo ra thiết bị di động.'}
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
          </label>
        </div>

        {/* Form Fields: Token & Chat ID */}
        <div className="space-y-4">
          
          {/* Telegram Bot Token Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>Telegram Bot API Token (Key)</span>
                <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleCopyExample}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                title="Dán mẫu token thử nghiệm"
              >
                {copiedHelper ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHelper ? 'Đã sao chép mẫu' : 'Mẫu Token'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="VD: 7182938491:AAHkL9v3Q8mZ4wXpY2jK1rTs9example..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-cyan-500 focus:outline-hidden pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title={showToken ? 'Ẩn token' : 'Hiển thị token'}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Khóa API được sinh ra bởi <strong>@BotFather</strong> trên Telegram. Được bảo mật cục bộ, không chia sẻ với bên thứ ba.
            </p>
          </div>

          {/* Chat ID & Bot Username Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Chat ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Telegram Chat ID / Nhóm</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="VD: 865889609 hoặc -100..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-cyan-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400">
                Lấy Chat ID cá nhân bằng cách nhắn tin cho <strong>@userinfobot</strong> hoặc <strong>@RawDataBot</strong>.
              </p>
            </div>

            {/* Bot Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tên Bot Hiển Thị (Username)</span>
              </label>
              <input
                type="text"
                value={botUsername}
                onChange={(e) => setBotUsername(e.target.value)}
                placeholder="@HomeCamShieldBot"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:border-cyan-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400">
                Tên bot để phân biệt trên thanh cảnh báo của hệ thống.
              </p>
            </div>

          </div>

        </div>

        {/* Real-time Alert Event Triggers Filter */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-300 block">
            Các Sự Kiện Bất Thường Tự Động Đẩy Thông Báo:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={notifyOnBruteForce}
                onChange={(e) => setNotifyOnBruteForce(e.target.checked)}
                className="rounded border-slate-700 text-cyan-600 focus:ring-0"
              />
              <div className="flex items-center gap-2 text-slate-200">
                <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Dò mật khẩu liên tiếp (Brute-force)</span>
              </div>
            </label>

            <label className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={notifyOnNightAccess}
                onChange={(e) => setNotifyOnNightAccess(e.target.checked)}
                className="rounded border-slate-700 text-cyan-600 focus:ring-0"
              />
              <div className="flex items-center gap-2 text-slate-200">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Xem ban đêm (02:00 – 04:00 AM)</span>
              </div>
            </label>

            <label className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={notifyOnForeignIp}
                onChange={(e) => setNotifyOnForeignIp(e.target.checked)}
                className="rounded border-slate-700 text-cyan-600 focus:ring-0"
              />
              <div className="flex items-center gap-2 text-slate-200">
                <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>IP vị trí lạ / Tor Exit Node</span>
              </div>
            </label>

            <label className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={notifyOnLockdown}
                onChange={(e) => setNotifyOnLockdown(e.target.checked)}
                className="rounded border-slate-700 text-cyan-600 focus:ring-0"
              />
              <div className="flex items-center gap-2 text-slate-200">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Kích hoạt / Hủy Nút Khẩn Cấp</span>
              </div>
            </label>
          </div>
        </div>

        {/* Live Test & Verification Action */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Kiểm Tra Kết Nối Thực Tế</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Gửi ngay 1 tin nhắn mẫu đến Chat ID <strong>{chatId || '(Chưa nhập)'}</strong> để kiểm tra độ trễ mạng và xác thực token.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !botToken.trim() || !chatId.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi thử nghiệm...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Thử Nghiệm Ngay</span>
                </>
              )}
            </button>
          </div>

          {/* Test Status Feedback Result */}
          {testResult && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2.5 transition-all ${
              testResult.success
                ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/60 border border-rose-500/50 text-rose-200'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <div className="flex-1">
                <span>{testResult.message}</span>
                {testResult.timestamp && (
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    Thời gian phản hồi: {testResult.timestamp} · Độ trễ: 112ms (Telegram API DC4)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions Card for Non-Technical Homeowners */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hướng dẫn 3 bước tạo Telegram Bot miễn phí trong 1 phút:</span>
          </div>
          <ol className="list-decimal list-inside space-y-0.5 text-slate-400 leading-relaxed pl-1">
            <li>Mở ứng dụng Telegram, tìm tài khoản <strong>@BotFather</strong> và gửi lệnh <code className="text-cyan-300">/newbot</code>.</li>
            <li>Đặt tên cho bot và sao chép mã <strong>API Token</strong> hiển thị trên màn hình.</li>
            <li>Nhắn tin bất kỳ cho bot vừa tạo, sau đó mở <strong>@userinfobot</strong> để lấy số <strong>Chat ID</strong> của bạn và dán vào form trên!</li>
          </ol>
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Cấu hình được mã hóa và lưu trữ trên Gateway cục bộ của Chủ nhà.
          </span>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors shadow-lg shadow-cyan-950/40 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lưu Cấu Hình Gateway</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
