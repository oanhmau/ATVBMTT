import { 
  Shield, 
  ShieldAlert, 
  UserCheck, 
  AlertTriangle, 
  LogOut, 
  LogIn, 
  PlusCircle, 
  Zap, 
  Radio,
  BarChart3 
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  isLockdownActive: boolean;
  onToggleLockdown: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDemoScenarios: () => void;
  onOpenLoginModal: () => void;
  onOpenAuthorizeDevice: () => void;
  onOpenWeeklyReport?: () => void;
  onOpenNotificationGateway?: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  isLockdownActive,
  onToggleLockdown,
  activeTab,
  onSelectTab,
  onOpenDemoScenarios,
  onOpenLoginModal,
  onOpenAuthorizeDevice,
  onOpenWeeklyReport,
  onOpenNotificationGateway,
  onLogout,
  isLoggedIn,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-40">
      {/* Row 1: Brand Wordmark (Left) and Action Buttons / Account Controls (Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Zone 1: Brand / Logo and Subtitle */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`p-2 rounded-lg transition-colors ${
              isLockdownActive 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
            }`}>
              {isLockdownActive ? <ShieldAlert className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div className="flex flex-col">
              <a href="#" className="text-base font-bold tracking-tight text-white whitespace-nowrap hover:text-cyan-400 transition-colors">
                HomeCam Shield
              </a>
              <span className="text-[11px] text-slate-400 whitespace-nowrap hidden sm:inline">
                Lớp bảo vệ hình ảnh IoT · Mã hóa AES & Sổ ghi chống sửa
              </span>
            </div>
          </div>

          {/* Zone 2: Primary Action & Role Switcher (Always visible, never clipped) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Demo Script Button */}
            <button
              onClick={onOpenDemoScenarios}
              className="px-2.5 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors whitespace-nowrap flex items-center gap-1.5"
              title="Mở 4 kịch bản demo thuyết trình"
            >
              <span className="font-mono text-[10px] px-1 py-0.2 bg-amber-400/20 rounded">DEMO</span>
              <span className="hidden sm:inline">Kịch bản</span>
            </button>

            {/* Operator Switcher (to test roles easily) */}
            <div className="relative group">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs cursor-pointer hover:border-slate-700 transition-colors">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-slate-200 whitespace-nowrap leading-tight truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {currentUser.role === 'owner' ? 'Chủ nhà' : currentUser.role === 'member' ? 'Thành viên' : 'Kỹ thuật viên'}
                  </span>
                </div>
              </div>

              {/* Dropdown to switch user or log out */}
              <div className="absolute right-0 mt-1 w-64 p-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800/80 mb-1">
                  Chuyển đổi vai trò người xem (IAM Test)
                </div>
                {allUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => onSelectUser(user)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.id === user.id
                        ? 'bg-cyan-500/15 text-cyan-300 font-medium'
                        : 'text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-[10px] text-slate-400">{user.roleLabel}</div>
                    </div>
                    {user.tempAccessExpiresAt && (
                      <span className="text-[10px] text-amber-400 font-mono">Tạm thời</span>
                    )}
                  </button>
                ))}

                <div className="mt-1 pt-1 border-t border-slate-800 space-y-1">
                  {currentUser.role === 'owner' && (
                    <>
                      <button
                        onClick={onOpenAuthorizeDevice}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-emerald-300 hover:bg-emerald-500/10 flex items-center gap-1.5 transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Cấp quyền cho thiết bị khác</span>
                      </button>
                      {onOpenNotificationGateway && (
                        <button
                          onClick={onOpenNotificationGateway}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-cyan-300 hover:bg-cyan-500/10 flex items-center gap-1.5 transition-colors"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Cấu hình Cổng Thông Báo (Telegram)</span>
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={onOpenLoginModal}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-cyan-300 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Mở cổng đăng nhập xác thực 2FA</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-300 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất phiên làm việc</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Emergency Lockdown Action Button */}
            <button
              onClick={onToggleLockdown}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isLockdownActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isLockdownActive ? 'HỦY KHẨN CẤP' : 'NÚT KHẨN CẤP'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Row 2: Dedicated Navigation Bar (Matching Image 2) */}
      <div className="border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 sm:gap-3 py-2 overflow-x-auto scrollbar-none text-sm font-medium">
            <button
              onClick={() => onSelectTab('instant')}
              className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm flex items-center gap-1.5 ${
                activeTab === 'instant'
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-200" />
              <span>Giám sát tức thời</span>
            </button>
            <button
              onClick={() => onSelectTab('live')}
              className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
                activeTab === 'live'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Xem trực tiếp
            </button>
            <button
              onClick={() => onSelectTab('devices_ledger')}
              className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
                activeTab === 'devices_ledger' || activeTab === 'blockchain' || activeTab === 'zerotrust'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Thiết bị & Sổ ghi
            </button>
            <button
              onClick={() => onSelectTab('iam')}
              className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
                activeTab === 'iam'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Phân quyền IAM
            </button>
            <button
              onClick={() => onSelectTab('threats')}
              className={`px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
                activeTab === 'threats'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Cảnh báo
            </button>
            {onOpenWeeklyReport && (
              <button
                onClick={onOpenWeeklyReport}
                className="px-3.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm text-cyan-300 hover:text-white hover:bg-cyan-950/70 border border-cyan-500/30 flex items-center gap-1.5"
                title="Báo cáo an ninh tuần & Xuất file CSV / PDF"
              >
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Báo cáo</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
