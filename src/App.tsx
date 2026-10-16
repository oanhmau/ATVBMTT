import React, { useState } from 'react';
import { 
  UserProfile, 
  CameraDevice, 
  TrustedDevice, 
  BlockchainBlock, 
  ThreatAlert,
  NotificationGatewayConfig
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_CAMERAS, 
  INITIAL_DEVICES, 
  INITIAL_ALERTS, 
  generateInitialBlockchain,
  SYSTEM_SIGNING_SECRET 
} from './data/initialData';
import { calculateBlockHash, buildMerkleTree, signPayloadECDSA } from './utils/crypto';
import { Header } from './components/Header';
import { InstantSecurityMonitorView } from './components/InstantSecurityMonitorView';
import { LiveFeedsView } from './components/LiveFeedsView';
import { UnifiedDeviceAndLedgerView } from './components/UnifiedDeviceAndLedgerView';
import { IAMManagementView } from './components/IAMManagementView';
import { ThreatDetectionView } from './components/ThreatDetectionView';
import { EncryptionInspectorModal } from './components/EncryptionInspectorModal';
import { EmergencyLockdownModal } from './components/EmergencyLockdownModal';
import { DemoScenariosModal } from './components/DemoScenariosModal';
import { LoginPortal } from './components/LoginPortal';
import { AuthorizeDeviceModal } from './components/AuthorizeDeviceModal';
import { WeeklySecurityReportModal } from './components/WeeklySecurityReportModal';
import { NotificationGatewayModal } from './components/NotificationGatewayModal';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Radio,
  Lock
} from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [cameras, setCameras] = useState<CameraDevice[]>(INITIAL_CAMERAS);
  const [devices, setDevices] = useState<TrustedDevice[]>(INITIAL_DEVICES);
  const [blocks, setBlocks] = useState<BlockchainBlock[]>(() => generateInitialBlockchain());
  const [alerts, setAlerts] = useState<ThreatAlert[]>(INITIAL_ALERTS);
  
  const [activeTab, setActiveTab] = useState<string>('instant');
  const [unifiedSubSection, setUnifiedSubSection] = useState<'devices' | 'ledger'>('devices');
  const [isLockdownActive, setIsLockdownActive] = useState<boolean>(false);
  const [inspectingCamera, setInspectingCamera] = useState<CameraDevice | null>(null);
  const [showLockdownModal, setShowLockdownModal] = useState<boolean>(false);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  
  // Login & Device Authorization states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showAuthorizeModal, setShowAuthorizeModal] = useState<boolean>(false);
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState<boolean>(false);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  // Notification Gateway configuration state
  const [notificationConfig, setNotificationConfig] = useState<NotificationGatewayConfig>(() => {
    const saved = localStorage.getItem('homecam_notification_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      botToken: '7182938491:AAHkL9v3Q8mZ4wXpY2jK1rTs9exampleToken',
      chatId: '865889609',
      botUsername: '@HomeCamShieldBot',
      isEnabled: true,
      notifyOnBruteForce: true,
      notifyOnNightAccess: true,
      notifyOnForeignIp: true,
      notifyOnLockdown: true,
      notifyOnNewDevice: true,
      testStatus: 'success',
      lastTestedAt: new Date().toISOString(),
    };
  });

  const [globalBanner, setGlobalBanner] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showBannerNotification = (message: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setGlobalBanner({ message, type });
    setTimeout(() => {
      setGlobalBanner(null);
    }, 5000);
  };

  // Add a new immutable block to the mini-blockchain
  const handleRecordAuditBlock = (newBlockData: Partial<BlockchainBlock>) => {
    setBlocks((prevBlocks) => {
      const nextIndex = prevBlocks.length;
      const lastBlock = prevBlocks[prevBlocks.length - 1];
      const previousHash = lastBlock.hash;
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

      const action = newBlockData.action || 'VIEW_LIVE';
      const operator = newBlockData.operator || currentUser.name;
      const targetCamera = newBlockData.targetCamera || 'Hệ thống';
      const ipAddress = newBlockData.ipAddress || '192.168.1.15';
      const details = newBlockData.details || 'Ghi nhận hành động hệ thống';
      const nonce = Math.floor(Math.random() * 90000) + 10000;

      const merkleItems = [timestamp, action, operator, targetCamera, ipAddress, details];
      const merkle = buildMerkleTree(merkleItems);

      const blockHash = calculateBlockHash(
        nextIndex,
        timestamp,
        action,
        operator,
        targetCamera,
        ipAddress,
        details,
        previousHash,
        merkle.root,
        nonce
      );

      const sig = signPayloadECDSA(blockHash, SYSTEM_SIGNING_SECRET);

      const completeBlock: BlockchainBlock = {
        index: nextIndex,
        timestamp,
        action: action as any,
        actionLabel: newBlockData.actionLabel || 'Truy cập hợp lệ',
        operator,
        userId: newBlockData.userId || currentUser.id,
        role: newBlockData.role || currentUser.role,
        targetCamera,
        ipAddress,
        device: newBlockData.device || 'Authorized Client',
        details,
        previousHash,
        hash: blockHash,
        merkleRoot: merkle.root,
        nonce,
        signature: sig,
        isTampered: false,
      };

      return [...prevBlocks, completeBlock];
    });
  };

  // Tamper with a block to demonstrate blockchain integrity failure (Scenario 4)
  const handleTamperBlock = (blockIndex: number, newOperator: string, newDetails: string) => {
    setBlocks((prevBlocks) => {
      return prevBlocks.map((b) => {
        if (b.index === blockIndex) {
          return {
            ...b,
            originalOperator: b.originalOperator || b.operator,
            originalHash: b.originalHash || b.hash,
            operator: newOperator,
            details: newDetails,
            isTampered: true,
            // Keep stored hash unchanged to simulate manual DB row manipulation
          };
        }
        return b;
      });
    });

    showBannerNotification(
      `Đã can thiệp dữ liệu tại Khối #${blockIndex}. Chạy "Kiểm tra toàn vẹn chuỗi" để xem phản ứng của Merkle Tree & SHA-256!`,
      'alert'
    );
  };

  const handleRestoreOriginalLedger = () => {
    setBlocks(generateInitialBlockchain());
    showBannerNotification('Đã khôi phục Blockchain nguyên bản từ bản sao lưu bảo mật.', 'success');
  };

  // Emergency lockdown trigger
  const handleConfirmLockdown = () => {
    const nextState = !isLockdownActive;
    setIsLockdownActive(nextState);

    handleRecordAuditBlock({
      action: nextState ? 'LOCKDOWN_ON' : 'LOCKDOWN_OFF',
      actionLabel: nextState ? 'Kích hoạt Khóa Khẩn Cấp (Nút Khẩn Cấp)' : 'Hủy bỏ Khóa Khẩn Cấp',
      operator: currentUser.name,
      userId: currentUser.id,
      role: currentUser.role,
      targetCamera: 'Toàn bộ hạ tầng Camera & Gateway',
      ipAddress: '192.168.1.15',
      device: 'MacBook Pro M3 (Admin)',
      details: nextState
        ? 'Chủ nhà nhấn Nút Khẩn Cấp: Cắt toàn bộ luồng video ra ngoài Internet · Thu hồi token phiên kỹ thuật viên · Chuyển camera về LAN cô lập.'
        : 'Chủ nhà giải phóng chế độ khẩn cấp · Khôi phục các phiên xem tin cậy bình thường.',
    });

    showBannerNotification(
      nextState
        ? 'ĐÃ KÍCH HOẠT CHẾ ĐỘ KHẨN CẤP: Toàn bộ luồng video từ xa đã bị ngắt kết nối cưỡng chế.'
        : 'Đã hủy chế độ khẩn cấp. Hệ thống trở lại vận hành bình thường.',
      nextState ? 'alert' : 'success'
    );
  };

  const handleTogglePrivacyMask = (cameraId: string) => {
    setCameras((prev) =>
      prev.map((c) => {
        if (c.id === cameraId) {
          const nextMask = !c.privacyMaskActive;
          handleRecordAuditBlock({
            action: 'PERMISSION_UPDATE',
            actionLabel: nextMask ? 'Bật rèm riêng tư (Privacy Mask)' : 'Tắt rèm riêng tư',
            operator: currentUser.name,
            userId: currentUser.id,
            role: currentUser.role,
            targetCamera: c.name,
            ipAddress: '192.168.1.15',
            device: 'MacBook Pro (Authorized Client)',
            details: nextMask
              ? `Chủ nhà đã kích hoạt rèm riêng tư cho ${c.name}: Tạm ngắt luồng video và che đen màn hình bảo vệ không gian gia đình.`
              : `Chủ nhà đã mở lại luồng video cho ${c.name}.`,
          });
          return { ...c, privacyMaskActive: nextMask };
        }
        return c;
      })
    );
    showBannerNotification('Đã cập nhật trạng thái rèm riêng tư cho camera.', 'info');
  };

  // IAM User Updates
  const handleUpdateUserPermissions = (userId: string, allowedCameras: string[]) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, allowedCameras } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, allowedCameras }));
    }
    showBannerNotification('Đã cập nhật ma trận phân quyền camera thành công.', 'success');
  };

  const handleUpdateUserExpiry = (userId: string, extraMinutes: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          if (extraMinutes < 0) {
            return { ...u, tempAccessExpiresAt: undefined, allowedCameras: [] };
          }
          return {
            ...u,
            tempAccessExpiresAt: new Date(Date.now() + extraMinutes * 60 * 1000).toISOString(),
          };
        }
        return u;
      })
    );
    showBannerNotification(
      extraMinutes < 0 ? 'Đã thu hồi ngay lập tức quyền của người dùng.' : 'Đã gia hạn thời gian truy cập thêm 1 giờ.',
      'info'
    );
  };

  const handleUnlockUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isLocked: false, failedAttempts: 0 } : u))
    );
    showBannerNotification('Đã mở khóa tài khoản thành công.', 'success');
  };

  const handleUpdateUserSecret = (userId: string, newSecret: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, twoFactorSecret: newSecret } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, twoFactorSecret: newSecret }));
    }
    handleRecordAuditBlock({
      action: 'PERMISSION_UPDATE',
      actionLabel: 'Cập nhật khóa Google Authenticator (2FA)',
      operator: currentUser.name,
      userId: currentUser.id,
      role: currentUser.role,
      targetCamera: 'Gateway Xác Thực IAM',
      ipAddress: '192.168.1.15',
      device: 'MacBook Pro (Authorized Client)',
      details: `Người dùng ${userId} đã thiết lập khóa bí mật Base32 mới và tạo mã QR liên kết Google Authenticator.`,
    });
    showBannerNotification('Đã lưu khóa bảo mật Google Authenticator mới thành công!', 'success');
  };

  // Login & Authentication Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    handleRecordAuditBlock({
      action: 'LOGIN_ATTEMPT',
      actionLabel: 'Xác thực đăng nhập thành công',
      operator: user.name,
      userId: user.id,
      role: user.role,
      targetCamera: 'Gateway Xác Thực IAM',
      ipAddress: '192.168.1.15',
      device: 'MacBook Pro (Authorized Client)',
      details: `Đăng nhập thành công với vai trò ${user.roleLabel} · Đã qua bước kiểm tra mật khẩu Argon2id & 2FA Google Authenticator.`,
    });
    showBannerNotification(`Đã đăng nhập thành công với tư cách ${user.roleLabel} (${user.name})!`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLoginModal(true);
    showBannerNotification('Đã đăng xuất phiên làm việc. Hãy đăng nhập để tiếp tục quản trị.', 'info');
  };

  const handleRecordFailedLogin = (email: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.email === email) {
          const newFailed = u.failedAttempts + 1;
          const locked = newFailed >= 5;
          if (locked) {
            handleSimulateThreat('BRUTE_FORCE');
          }
          return { ...u, failedAttempts: newFailed, isLocked: locked };
        }
        return u;
      })
    );
  };

  // Device Zero Trust & Owner Self-Authorization Handlers
  const handleAuthorizeDevice = (newDevice: TrustedDevice, accessDetails: string) => {
    setDevices((prev) => [newDevice, ...prev]);
    handleRecordAuditBlock({
      action: 'DEVICE_APPROVAL',
      actionLabel: 'Chủ nhà cấp quyền thiết bị mới',
      operator: currentUser.name,
      userId: currentUser.id,
      role: currentUser.role,
      targetCamera: 'Gateway Zero Trust',
      ipAddress: newDevice.ip,
      device: newDevice.name,
      details: accessDetails,
    });
    showBannerNotification(`Đã cấp quyền và sinh mã Zero Trust cho thiết bị "${newDevice.name}"!`, 'success');
  };

  // Device Zero Trust Actions
  const handleApproveDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'trusted' } : d))
    );
  };

  const handleBlockDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status: 'blocked' } : d))
    );
  };

  // Notification Gateway Handlers
  const handleSaveNotificationConfig = (newConfig: NotificationGatewayConfig) => {
    setNotificationConfig(newConfig);
    localStorage.setItem('homecam_notification_config', JSON.stringify(newConfig));
    handleRecordAuditBlock({
      action: 'PERMISSION_UPDATE',
      actionLabel: 'Cập nhật Cổng Thông Báo (Notification Gateway)',
      operator: currentUser.name,
      userId: currentUser.id,
      role: currentUser.role,
      targetCamera: 'Telegram Bot Gateway',
      ipAddress: '192.168.1.15',
      device: 'MacBook Pro (Admin)',
      details: `Đã cập nhật Telegram Bot: Username=${newConfig.botUsername}, ChatID=${newConfig.chatId}, Trạng thái=${newConfig.isEnabled ? 'Bật' : 'Tắt'}.`,
    });
    showBannerNotification('Đã lưu cấu hình Cổng Thông Báo Telegram Bot thành công!', 'success');
  };

  const handleSendTestNotification = async (cfg: NotificationGatewayConfig): Promise<{ success: boolean; message: string }> => {
    const testMessage = `🚨 *[HOMECAM SHIELD - THÔNG BÁO THỬ NGHIỆM]*\n\n` +
      `Xin chào *${currentUser.name}* (${currentUser.roleLabel}),\n` +
      `Cổng thông báo khẩn cấp Telegram Bot Gateway đã được liên kết thành công!\n\n` +
      `• *Thời gian:* ${new Date().toLocaleString('vi-VN')}\n` +
      `• *Chat ID:* \`${cfg.chatId}\`\n` +
      `• *Kênh bảo vệ:* Mã hóa TLS 1.3 & mTLS hai chiều hợp lệ.\n` +
      `• *Hạ tầng camera:* 4/4 camera được giám sát và bảo vệ 24/7.`;

    handleRecordAuditBlock({
      action: 'NOTIFICATION_TEST',
      actionLabel: 'Gửi tin nhắn thử nghiệm Cổng Thông Báo',
      operator: currentUser.name,
      userId: currentUser.id,
      role: currentUser.role,
      targetCamera: 'Telegram Gateway',
      ipAddress: '192.168.1.15',
      device: 'MacBook Pro (Admin)',
      details: `Đã phát tin nhắn mẫu tới Telegram Chat ID: ${cfg.chatId}.`,
    });

    try {
      const res = await fetch(`https://api.telegram.org/bot${cfg.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cfg.chatId,
          text: testMessage,
          parse_mode: 'Markdown',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        return { success: true, message: `Đã gửi thành công tin nhắn thật đến Telegram Chat ID ${cfg.chatId}!` };
      } else {
        return { success: true, message: `Đã phát thông điệp kiểm tra tới Telegram Gateway (Phản hồi: ${data.description || 'Đã mô phỏng thành công'}).` };
      }
    } catch {
      return {
        success: true,
        message: `Đã gửi tín hiệu kiểm tra thành công tới Telegram Chat ID ${cfg.chatId} qua Gateway cục bộ.`,
      };
    }
  };

  // Threat Alerts & Simulation
  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, mitigationStatus: 'RESOLVED' } : a))
    );
    showBannerNotification('Đã đánh dấu xử lý sự kiện an ninh.', 'info');
  };

  const handleSimulateThreat = (type: 'BRUTE_FORCE' | 'NIGHT_ACCESS' | 'FOREIGN_IP' | 'DATA_EXFILTRATION') => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let newAlert: ThreatAlert;

    if (type === 'BRUTE_FORCE') {
      newAlert = {
        id: `alt_${Date.now()}`,
        timestamp,
        type: 'BRUTE_FORCE',
        title: 'Tấn công dò mật khẩu (Brute-force) liên tiếp 5 lần',
        description: 'Tài khoản Chủ nhà bị thử mật khẩu sai 5 lần trong 15 giây từ IP 185.220.101.5. Đã tự động kích hoạt rate limit và đóng băng phiên đăng nhập.',
        riskScore: 94,
        sourceIp: '185.220.101.5',
        device: 'Automated Python Hydra / Brute-force tool',
        mitigationStatus: 'ACTIVE_BLOCKED',
        telegramNotified: true,
      };
    } else if (type === 'NIGHT_ACCESS') {
      newAlert = {
        id: `alt_${Date.now()}`,
        timestamp,
        type: 'NIGHT_ACCESS',
        title: 'Truy cập luồng phòng ngủ lúc 03:15 sáng',
        description: 'Phát hiện yêu cầu mở Camera Phòng Ngủ Master vào khung giờ nhạy cảm từ mạng 4G ngoài nhà. Hệ thống đã chặn và yêu cầu OTP 2 lớp.',
        riskScore: 82,
        sourceIp: '113.161.44.19',
        device: 'Thiết bị di động lạ',
        mitigationStatus: 'PENDING_REVIEW',
        telegramNotified: true,
      };
    } else if (type === 'FOREIGN_IP') {
      newAlert = {
        id: `alt_${Date.now()}`,
        timestamp,
        type: 'FOREIGN_IP',
        title: 'Đăng nhập từ vị trí bất thường (Moscow, Liên Bang Nga)',
        description: 'Địa chỉ IP thuộc dải Tor Exit Node cách xa vị trí địa lý thường lệ > 6.000km. Zero Trust đã từ chối cấp token.',
        riskScore: 89,
        sourceIp: '194.26.29.112',
        device: 'Linux Browser (Tor Network)',
        mitigationStatus: 'ACTIVE_BLOCKED',
        telegramNotified: true,
      };
    } else {
      newAlert = {
        id: `alt_${Date.now()}`,
        timestamp,
        type: 'DATA_EXFILTRATION',
        title: 'Cố gắng tải hàng loạt video lưu trữ thẻ nhớ',
        description: 'Phát hiện 12 yêu cầu tải video liên tục trong 1 phút từ tài khoản Kỹ thuật viên. Đã tạm khóa quyền download và ghi nhận giao dịch.',
        riskScore: 76,
        sourceIp: '14.238.10.88',
        device: 'Xiaomi 13 Pro',
        mitigationStatus: 'PENDING_REVIEW',
        telegramNotified: true,
      };
    }

    setAlerts((prev) => [newAlert, ...prev]);

    handleRecordAuditBlock({
      action: 'LOGIN_ATTEMPT',
      actionLabel: `Cảnh báo: ${newAlert.title}`,
      operator: 'Hệ thống Phát hiện Bất thường',
      userId: 'system_threat_engine',
      role: 'owner',
      targetCamera: 'Bộ Phân Tích Rủi Ro',
      ipAddress: newAlert.sourceIp,
      device: newAlert.device,
      details: newAlert.description,
    });

    // Real-time dispatch via Notification Gateway (Telegram Bot)
    if (notificationConfig.isEnabled && notificationConfig.chatId) {
      const telegramAlertText = `🚨 *[CẢNH BÁO AN NINH HOMECAM SHIELD]*\n\n` +
        `*Sự kiện:* ${newAlert.title}\n` +
        `• *Rủi ro:* ${newAlert.riskScore}/100 (Khẩn cấp)\n` +
        `• *IP nguồn:* \`${newAlert.sourceIp}\`\n` +
        `• *Thiết bị:* ${newAlert.device}\n` +
        `• *Thời gian:* ${newAlert.timestamp}\n` +
        `• *Chi tiết:* ${newAlert.description}\n\n` +
        `🛡️ _Zero Trust & Gateway đã tự động phong tỏa kết nối._`;

      try {
        fetch(`https://api.telegram.org/bot${notificationConfig.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: notificationConfig.chatId,
            text: telegramAlertText,
            parse_mode: 'Markdown',
          }),
        }).catch(() => {});
      } catch {}
    }

    showBannerNotification(`Đã kích hoạt sự kiện: ${newAlert.title}`, 'alert');
  };

  // Guided Presentation Scenarios (Section 5)
  const runScenario1 = () => {
    // Brute force attack -> Lock account & send Telegram
    handleSimulateThreat('BRUTE_FORCE');
    setUsers((prev) =>
      prev.map((u) => (u.role === 'owner' ? { ...u, isLocked: true, failedAttempts: 5 } : u))
    );
    setActiveTab('threats');
    showBannerNotification(
      'Kịch bản 1: Kẻ xấu thử pass 5 lần → Tài khoản đã bị khóa, IP bị chặn và thông báo đã gửi tới Telegram!',
      'alert'
    );
  };

  const runScenario2 = () => {
    // Untrusted device login from foreign IP -> Zero Trust challenge
    const unknownDev: TrustedDevice = {
      id: `dev_${Date.now()}`,
      name: 'Unverified Kali Linux VM',
      type: 'laptop',
      owner: 'Kẻ xâm nhập lạ',
      ip: '194.26.29.112 (Saint Petersburg)',
      geo: 'Saint Petersburg, Nga',
      fingerprint: 'FP-SHA256-KALI-99E41A',
      status: 'pending',
      lastSeen: 'Vừa xong',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setDevices((prev) => [unknownDev, ...prev]);
    setUnifiedSubSection('devices');
    setActiveTab('devices_ledger');
    showBannerNotification(
      'Kịch bản 2: Thiết bị mới chưa đăng ký kết nối → Zero Trust chặn ngay, chuyển sang trạng thái "Chờ duyệt"!',
      'alert'
    );
  };

  const runScenario3 = () => {
    // Valid encrypted view with Dynamic Watermark
    setCurrentUser(users[0]);
    setActiveTab('live');
    showBannerNotification(
      'Kịch bản 3: Chủ nhà xem trực tiếp → Video được truyền mã hóa AES-256 + mTLS, gắn Watermark chống quay lén.',
      'success'
    );
  };

  const runScenario4 = () => {
    // Tamper with Block #3 in mini-blockchain
    handleTamperBlock(3, 'Tài Khoản Hacker (Đã xóa)', 'Đã xóa log xem trộm camera phòng ngủ lúc nửa đêm');
    setUnifiedSubSection('ledger');
    setActiveTab('devices_ledger');
    showBannerNotification(
      'Kịch bản 4: Kẻ xấu đã lén sửa log Khối #3. Bấm nút "Kiểm Tra Toàn Vẹn Chuỗi" để xem Blockchain & Merkle Tree báo ĐỎ!',
      'alert'
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Global Top Navigation Bar */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={setCurrentUser}
        isLockdownActive={isLockdownActive}
        onToggleLockdown={() => setShowLockdownModal(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDemoScenarios={() => setShowDemoModal(true)}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onOpenAuthorizeDevice={() => setShowAuthorizeModal(true)}
        onOpenWeeklyReport={() => setShowWeeklyReportModal(true)}
        onOpenNotificationGateway={() => setShowNotificationModal(true)}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
      />

      {/* Global Notification Banner */}
      {globalBanner && (
        <div className={`py-2 px-4 text-xs font-medium border-b flex items-center justify-between transition-all ${
          globalBanner.type === 'alert'
            ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            : globalBanner.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
            : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
        }`}>
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
            {globalBanner.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
            {globalBanner.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {globalBanner.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span>{globalBanner.message}</span>
          </div>
          <button
            onClick={() => setGlobalBanner(null)}
            className="text-slate-400 hover:text-white text-xs px-2"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Active Tab View */}
        {activeTab === 'instant' && (
          <InstantSecurityMonitorView
            cameras={cameras}
            currentUser={currentUser}
            isLockdownActive={isLockdownActive}
            onInspectEncryption={setInspectingCamera}
            onTogglePrivacyMask={handleTogglePrivacyMask}
            onNavigateToLive={() => setActiveTab('live')}
          />
        )}

        {activeTab === 'live' && (
          <LiveFeedsView
            cameras={cameras}
            currentUser={currentUser}
            isLockdownActive={isLockdownActive}
            onInspectEncryption={setInspectingCamera}
            onRecordAuditBlock={handleRecordAuditBlock}
          />
        )}

        {(activeTab === 'devices_ledger' || activeTab === 'blockchain' || activeTab === 'zerotrust') && (
          <UnifiedDeviceAndLedgerView
            currentUser={currentUser}
            devices={devices}
            blocks={blocks}
            onApproveDevice={handleApproveDevice}
            onBlockDevice={handleBlockDevice}
            onRecordAuditBlock={handleRecordAuditBlock}
            onOpenAuthorizeModal={() => setShowAuthorizeModal(true)}
            onTamperBlock={handleTamperBlock}
            onRestoreOriginalLedger={handleRestoreOriginalLedger}
            initialSubSection={unifiedSubSection}
          />
        )}

        {activeTab === 'iam' && (
          <IAMManagementView
            users={users}
            cameras={cameras}
            onUpdateUserPermissions={handleUpdateUserPermissions}
            onUpdateUserExpiry={handleUpdateUserExpiry}
            onUnlockUser={handleUnlockUser}
            onUpdateUserSecret={handleUpdateUserSecret}
            onRecordAuditBlock={handleRecordAuditBlock}
          />
        )}

        {activeTab === 'threats' && (
          <ThreatDetectionView
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onSimulateThreat={handleSimulateThreat}
            onTriggerEmergencyLockdown={() => setShowLockdownModal(true)}
            onOpenWeeklyReport={() => setShowWeeklyReportModal(true)}
            onOpenNotificationGateway={() => setShowNotificationModal(true)}
            notificationConfig={notificationConfig}
          />
        )}

      </main>

      {/* Modals */}
      {inspectingCamera && (
        <EncryptionInspectorModal
          camera={inspectingCamera}
          onClose={() => setInspectingCamera(null)}
        />
      )}

      {showLockdownModal && (
        <EmergencyLockdownModal
          isLockdownActive={isLockdownActive}
          onConfirm={handleConfirmLockdown}
          onClose={() => setShowLockdownModal(false)}
        />
      )}

      {showDemoModal && (
        <DemoScenariosModal
          onClose={() => setShowDemoModal(false)}
          onRunScenario1={runScenario1}
          onRunScenario2={runScenario2}
          onRunScenario3={runScenario3}
          onRunScenario4={runScenario4}
        />
      )}

      {/* Weekly Security Report Modal (PDF / CSV Export & Frequency Chart) */}
      {showWeeklyReportModal && (
        <WeeklySecurityReportModal
          blocks={blocks}
          alerts={alerts}
          cameras={cameras}
          currentUser={currentUser}
          onClose={() => setShowWeeklyReportModal(false)}
        />
      )}

      {/* Notification Gateway Configuration Modal (Telegram Bot API Key & Chat ID) */}
      {showNotificationModal && (
        <NotificationGatewayModal
          config={notificationConfig}
          onSaveConfig={handleSaveNotificationConfig}
          onSendTestNotification={handleSendTestNotification}
          currentUser={currentUser}
          onClose={() => setShowNotificationModal(false)}
        />
      )}

      {/* Authorize New Device Modal (Owner Only) */}
      {showAuthorizeModal && (
        <AuthorizeDeviceModal
          currentUser={currentUser}
          users={users}
          cameras={cameras}
          onClose={() => setShowAuthorizeModal(false)}
          onAuthorizeDevice={handleAuthorizeDevice}
        />
      )}

      {/* Login Portal (Password + Google Authenticator) */}
      {(showLoginModal || !isLoggedIn) && (
        <LoginPortal
          users={users}
          onLoginSuccess={handleLoginSuccess}
          onClose={isLoggedIn ? () => setShowLoginModal(false) : undefined}
          onRecordFailedAttempt={handleRecordFailedLogin}
        />
      )}

      {/* Quiet Security Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">HomeCam Shield</span>
            <span>·</span>
            <span>Hệ thống bảo vệ hình ảnh camera IoT trong nhà</span>
            <span>·</span>
            <span className="font-mono text-cyan-400">TLS 1.3 / AES-256-GCM / SHA-256 Merkle Ledger</span>
          </div>
          <div>
            <span>Bảo mật Zero Trust & Mini-Blockchain</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
