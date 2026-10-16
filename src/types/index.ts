export type UserRole = 'owner' | 'member' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  email: string;
  avatar: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  allowedCameras: string[];
  tempAccessExpiresAt?: string;
  isLocked?: boolean;
  failedAttempts: number;
  password?: string;
}

export interface CameraDevice {
  id: string;
  name: string;
  location: string;
  imageSrc: string;
  ip: string;
  mac: string;
  vlan: string;
  resolution: string;
  fps: number;
  status: 'online' | 'encrypted' | 'offline' | 'lockdown';
  allowedRoles: UserRole[];
  requiresExtraAuth: boolean;
  bitrate: string;
  aesKeyId: string;
  tlsVersion: string;
  latencyMs?: number;
  privacyMaskActive?: boolean;
  activeViewersCount?: number;
  mTLSStatus?: 'VALID' | 'ROTATING' | 'RENEWED';
  mTLSCertExpiry?: string;
  aesAlgorithm?: string;
  isolationStatus?: string;
}

export type ActionType = 
  | 'VIEW_LIVE'
  | 'DOWNLOAD_CLIP'
  | 'SNAPSHOT_SECURE'
  | 'PERMISSION_UPDATE'
  | 'LOCKDOWN_ON'
  | 'LOCKDOWN_OFF'
  | 'DEVICE_APPROVAL'
  | 'LOGIN_ATTEMPT'
  | 'TAMPER_TEST'
  | 'NOTIFICATION_TEST';

export interface NotificationGatewayConfig {
  botToken: string;
  chatId: string;
  botUsername: string;
  isEnabled: boolean;
  notifyOnBruteForce: boolean;
  notifyOnNightAccess: boolean;
  notifyOnForeignIp: boolean;
  notifyOnLockdown: boolean;
  notifyOnNewDevice: boolean;
  lastTestedAt?: string;
  testStatus?: 'idle' | 'testing' | 'success' | 'failed';
  lastError?: string;
}

export interface BlockchainBlock {
  index: number;
  timestamp: string;
  action: ActionType;
  actionLabel: string;
  operator: string;
  userId: string;
  role: UserRole;
  targetCamera: string;
  ipAddress: string;
  device: string;
  details: string;
  previousHash: string;
  hash: string;
  merkleRoot: string;
  nonce: number;
  signature: string;
  isTampered?: boolean;
  originalHash?: string;
  originalAction?: string;
  originalOperator?: string;
}

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
  level?: number;
}

export interface TrustedDevice {
  id: string;
  name: string;
  type: 'laptop' | 'mobile' | 'tablet' | 'unknown';
  owner: string;
  ip: string;
  geo: string;
  fingerprint: string;
  status: 'trusted' | 'pending' | 'blocked';
  lastSeen: string;
  isCurrent?: boolean;
  registeredAt: string;
  accessScope?: string;
  temporaryExpiresAt?: string;
}

export interface ThreatAlert {
  id: string;
  timestamp: string;
  type: 'BRUTE_FORCE' | 'NIGHT_ACCESS' | 'FOREIGN_IP' | 'DATA_EXFILTRATION' | 'UNTRUSTED_DEVICE';
  title: string;
  description: string;
  riskScore: number;
  sourceIp: string;
  device: string;
  mitigationStatus: 'ACTIVE_BLOCKED' | 'PENDING_REVIEW' | 'RESOLVED';
  telegramNotified: boolean;
}

export interface AuditVerificationResult {
  isValid: boolean;
  checkedBlocksCount: number;
  tamperedBlockIndex: number | null;
  brokenPreviousHashIndex: number | null;
  brokenMerkleRootIndex: number | null;
  signatureMismatchIndex: number | null;
  errorMessage?: string;
  verifiedAt: string;
}
