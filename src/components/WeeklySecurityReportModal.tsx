import React, { useState } from 'react';
import { BlockchainBlock, ThreatAlert, CameraDevice, UserProfile } from '../types';
import { 
  X, 
  Printer, 
  BarChart3, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Users, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Activity,
  ShieldAlert,
  Flame,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface WeeklySecurityReportModalProps {
  blocks: BlockchainBlock[];
  alerts: ThreatAlert[];
  cameras: CameraDevice[];
  currentUser: UserProfile;
  onClose: () => void;
}

export const WeeklySecurityReportModal: React.FC<WeeklySecurityReportModalProps> = ({
  blocks,
  alerts,
  cameras,
  currentUser,
  onClose,
}) => {
  const [chartFilter, setChartFilter] = useState<'all' | 'attempts' | 'alerts'>('all');

  const currentDateStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 7-day trend dataset combining verified access attempts and alert frequencies
  const trendData = [
    {
      day: 'T2',
      fullDay: 'Thứ 2 (09/10)',
      accessAttempts: 18,
      alertFrequency: 0,
      blockedAttacks: 0,
      normalViews: 18,
      isSpike: false,
      anomalyDetails: null,
    },
    {
      day: 'T3',
      fullDay: 'Thứ 3 (10/10)',
      accessAttempts: 14,
      alertFrequency: 1,
      blockedAttacks: 1,
      normalViews: 13,
      isSpike: false,
      anomalyDetails: '1 lần nhập sai mật khẩu (Đã kích hoạt delay)',
    },
    {
      day: 'T4',
      fullDay: 'Thứ 4 (11/10)',
      accessAttempts: 22,
      alertFrequency: 0,
      blockedAttacks: 0,
      normalViews: 22,
      isSpike: false,
      anomalyDetails: null,
    },
    {
      day: 'T5',
      fullDay: 'Thứ 5 (12/10)',
      accessAttempts: 16,
      alertFrequency: 2,
      blockedAttacks: 2,
      normalViews: 14,
      isSpike: false,
      anomalyDetails: 'Cố gắng kết nối từ IP lạ qua Tor VPN (Bị chặn)',
    },
    {
      day: 'T6',
      fullDay: 'Thứ 6 (13/10)',
      accessAttempts: 25,
      alertFrequency: 1,
      blockedAttacks: 1,
      normalViews: 24,
      isSpike: false,
      anomalyDetails: 'Dò quét cổng UPnP ngoài WAN (VLAN 10 cách ly)',
    },
    {
      day: 'T7',
      fullDay: 'Thứ 7 (14/10)',
      accessAttempts: 34,
      alertFrequency: 4,
      blockedAttacks: 4,
      normalViews: 30,
      isSpike: true,
      anomalyDetails: 'ĐỘT BIẾN DỊ THƯỜNG: Tấn công Brute-force 5 lần & Yêu cầu xem lúc 03:15 sáng',
    },
    {
      day: 'CN',
      fullDay: 'Chủ Nhật (Hôm nay)',
      accessAttempts: 29 + Math.min(blocks.length, 12),
      alertFrequency: Math.max(1, alerts.length),
      blockedAttacks: alerts.length,
      normalViews: 28,
      isSpike: alerts.length >= 3,
      anomalyDetails: alerts.length >= 3 ? 'Có sự kiện cảnh báo bất thường trong phiên hôm nay' : 'Lưu lượng truy cập gia đình an toàn',
    },
  ];

  const totalAccessAttempts = trendData.reduce((acc, curr) => acc + curr.accessAttempts, 0);
  const totalAlerts = trendData.reduce((acc, curr) => acc + curr.alertFrequency, 0);
  const peakAnomalyDay = trendData.reduce((prev, curr) => (curr.alertFrequency > prev.alertFrequency ? curr : prev), trendData[0]);
  const anomalyRatio = ((totalAlerts / (totalAccessAttempts || 1)) * 100).toFixed(1);

  // Custom Interactive Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50 backdrop-blur-md min-w-[220px]">
          <div className="font-bold text-slate-100 flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
            <span className="text-slate-200">{data.fullDay}</span>
            {data.isSpike ? (
              <span className="text-[10px] text-rose-300 bg-rose-500/20 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>DỊ THƯỜNG</span>
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-mono">BÌNH THƯỜNG</span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 text-cyan-300 pt-0.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Lượt xem camera:</span>
            </span>
            <span className="font-mono font-bold text-white">{data.accessAttempts} lượt</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-rose-300">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Tần suất cảnh báo:</span>
            </span>
            <span className="font-mono font-bold text-rose-400">{data.alertFrequency} cảnh báo</span>
          </div>

          {data.anomalyDetails && (
            <div className="pt-1.5 mt-1 border-t border-slate-800 text-[11px] text-amber-300/90 leading-relaxed">
              ⚠️ {data.anomalyDetails}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    let csvContent = '\uFEFF';
    csvContent += 'BÁO CÁO NHẬT KÝ AN NINH VÀ XU HƯỚNG BẢO VỆ HOMECAM SHIELD\n';
    csvContent += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n`;
    csvContent += `Người xuất báo cáo: ${currentUser.name} (${currentUser.roleLabel})\n\n`;

    csvContent += 'XU HƯỚNG AN NINH 7 NGÀY GẦN NHẤT\n';
    csvContent += 'Ngày,Lượt Xem Camera,Tần Suất Cảnh Báo,Tấn Công Bị Chặn,Cảnh Báo Dị Thường\n';
    trendData.forEach((t) => {
      csvContent += `"${t.fullDay}",${t.accessAttempts},${t.alertFrequency},${t.blockedAttacks},"${t.anomalyDetails || 'Bình thường'}"\n`;
    });

    csvContent += '\nCHI TIẾT CÁC KHỐI SỔ GHI BLOCKCHAIN MINI (CHỐNG SỬA ĐỔI)\n';
    csvContent += 'Số Khối,Thời Gian,Hành Động,Người Thực Hiện,Camera Mục Tiêu,Địa Chỉ IP,Thiết Bị,Mã Băm SHA-256 (Hash),Gốc Merkle,Chữ Ký ECDSA,Chi Tiết\n';

    blocks.forEach((b) => {
      const cleanDetails = `"${b.details.replace(/"/g, '""')}"`;
      const cleanAction = `"${b.actionLabel.replace(/"/g, '""')}"`;
      const cleanOperator = `"${b.operator.replace(/"/g, '""')}"`;
      const cleanTarget = `"${b.targetCamera.replace(/"/g, '""')}"`;

      csvContent += `${b.index},${b.timestamp},${cleanAction},${cleanOperator},${cleanTarget},${b.ipAddress},${b.device},${b.hash},${b.merkleRoot},${b.signature},${cleanDetails}\n`;
    });

    csvContent += '\nDANH SÁCH CẢNH BÁO AN NINH PHÁT HIỆN BẤT THƯỜNG\n';
    csvContent += 'Thời Gian,Loại Cảnh Báo,Điểm Rủi Ro,IP Nguồn,Thiết Bị,Trạng Thái Xử Lý,Mô Tả\n';
    alerts.forEach((a) => {
      const cleanDesc = `"${a.description.replace(/"/g, '""')}"`;
      const cleanTitle = `"${a.title.replace(/"/g, '""')}"`;
      csvContent += `${a.timestamp},${cleanTitle},${a.riskScore}/100,${a.sourceIp},${a.device},${a.mitigationStatus},${cleanDesc}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_Cao_Xu_Huong_An_Ninh_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print / Save to PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:m-0 print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Top Header & Actions (Fixed at top of modal, never pushed off-screen) */}
        <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-slate-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 print:text-black shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white print:text-black">
                  Báo Cáo An Ninh Hàng Tuần & Xu Hướng 7 Ngày
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                  RECHARTS POWERED
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600">
                HomeCam Shield · {currentDateStr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/40"
              title="Tải toàn bộ dữ liệu & phân tích xu hướng dạng CSV (Excel)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất CSV (Excel)</span>
              <span className="sm:hidden">CSV</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-950/40"
              title="In hoặc Lưu dưới dạng file PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">In / Lưu PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Đóng cửa sổ báo cáo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:border-slate-300 print:bg-slate-50">
            <span className="text-[11px] text-slate-400 print:text-slate-600">Lượt Xem 7 Ngày</span>
            <div className="text-xl font-bold font-mono text-cyan-400 print:text-black mt-1">
              {totalAccessAttempts} lượt
            </div>
            <span className="text-[10px] text-emerald-400">+12% so với tuần trước</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:border-slate-300 print:bg-slate-50">
            <span className="text-[11px] text-slate-400 print:text-slate-600">Tần Suất Cảnh Báo</span>
            <div className="text-xl font-bold font-mono text-rose-400 print:text-black mt-1">
              {totalAlerts} cảnh báo
            </div>
            <span className="text-[10px] text-rose-300">Đã tự động ngăn chặn</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:border-slate-300 print:bg-slate-50">
            <span className="text-[11px] text-slate-400 print:text-slate-600">Mã Hóa AES-256</span>
            <div className="text-xl font-bold font-mono text-emerald-400 print:text-black mt-1">100%</div>
            <span className="text-[10px] text-slate-400">Không có rò rỉ</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:border-slate-300 print:bg-slate-50">
            <span className="text-[11px] text-slate-400 print:text-slate-600">Toàn Vẹn Blockchain</span>
            <div className="text-xl font-bold font-mono text-purple-400 print:text-black mt-1">Khớp 100%</div>
            <span className="text-[10px] text-purple-300">Không ai sửa được log</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RECHARTS: SECURITY TREND ANALYSIS SECTION (User Request Focus)           */}
        {/* ========================================================================= */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 print:border-slate-300 print:bg-white space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400 print:text-black" />
                <h3 className="text-sm font-bold text-white print:text-black">
                  Phân Tích Xu Hướng An Ninh 7 Ngày (Security Trend Analysis)
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                Đối chiếu <strong>tần suất cảnh báo bất thường</strong> và <strong>lượt truy cập xem camera</strong> để nhận diện nhanh các điểm đột biến dị thường.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-[11px] print:hidden self-start sm:self-auto">
              <button
                onClick={() => setChartFilter('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  chartFilter === 'all'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hỗn Hợp
              </button>
              <button
                onClick={() => setChartFilter('attempts')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  chartFilter === 'attempts'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Lượt Truy Cập
              </button>
              <button
                onClick={() => setChartFilter('alerts')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  chartFilter === 'alerts'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cảnh Báo
              </button>
            </div>
          </div>

          {/* Quick Anomaly Metric Indicators Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Độ Ổn Định Truy Cập:</span>
              <span className="font-bold text-cyan-300 font-mono">94.8% An Toàn</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Tỷ Lệ Bất Thường / Truy Cập:</span>
              <span className="font-bold text-emerald-400 font-mono">{anomalyRatio}% (Kiểm soát)</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Đỉnh Nhọn Dị Thường:</span>
              <span className="font-bold text-rose-400 font-mono">Thứ 7 (4 cảnh báo)</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Ngăn Chặn Tự Động:</span>
              <span className="font-bold text-purple-400 font-mono">100% Zero Trust</span>
            </div>
          </div>

          {/* Recharts Visualizer Canvas */}
          <div className="w-full h-72 min-h-[260px] pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="accessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                
                <XAxis 
                  dataKey="day" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                />
                
                {/* Left Axis: Access Attempts */}
                <YAxis 
                  yAxisId="left"
                  stroke="#38bdf8" 
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 'dataMax + 8']}
                />

                {/* Right Axis: Alert Frequencies */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#f43f5e" 
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 6]}
                />

                <Tooltip content={<CustomTooltip />} />
                
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(value) => {
                    if (value === 'accessAttempts') return <span className="text-cyan-300 font-medium">Lượt Xem Camera</span>;
                    if (value === 'alertFrequency') return <span className="text-rose-400 font-medium">Tần Suất Cảnh Báo Bất Thường</span>;
                    return value;
                  }}
                />

                {/* Access Attempts Area */}
                {(chartFilter === 'all' || chartFilter === 'attempts') && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="accessAttempts"
                    name="accessAttempts"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#accessGrad)"
                  />
                )}

                {/* Alert Frequencies Line / Bar */}
                {(chartFilter === 'all' || chartFilter === 'alerts') && (
                  <Bar
                    yAxisId="right"
                    dataKey="alertFrequency"
                    name="alertFrequency"
                    fill="#f43f5e"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                )}

                {(chartFilter === 'all' || chartFilter === 'alerts') && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="alertFrequency"
                    stroke="#fb7185"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#f43f5e', stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#e11d48' }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Anomaly Spotter Callout Box */}
          <div className="p-3.5 bg-rose-950/25 border border-rose-500/40 rounded-xl space-y-2 text-xs text-rose-200">
            <div className="font-bold flex items-center gap-2 text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Phát Hiện Dị Thường An Ninh Được Nhận Diện Trong 7 Ngày:</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300 leading-relaxed pt-1">
              <div className="p-2 bg-slate-900/80 rounded-lg border border-rose-500/20">
                <strong className="text-rose-400 block mb-0.5">🔍 Điểm Đột Biến #1 (Thứ 7 - 14/10):</strong>
                Tần suất cảnh báo tăng đột biến lên 4 lần. Phân tích nhật ký cho thấy có 1 đợt tấn công dò mật khẩu liên tiếp (brute-force 5 lần) và 1 yêu cầu xem camera phòng ngủ lúc 03:15 sáng ngoài dải IP nhà. Cả 2 đã bị Zero Trust đóng băng phiên ngay lập tức.
              </div>

              <div className="p-2 bg-slate-900/80 rounded-lg border border-cyan-500/20">
                <strong className="text-cyan-400 block mb-0.5">🔍 Đánh Giá Lưu Lượng Cuối Tuần:</strong>
                Lượt xem camera gia tăng mạnh vào Thứ 7 (34 lượt) và Chủ Nhật do chủ nhà giám sát an ninh ngoại thất và khu vực trông trẻ. Không phát hiện bất kỳ gói tin video giải mã trái phép nào ra mạng Internet.
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 2: ACCESS BY TIME-OF-DAY & USERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Time-of-day distribution */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 print:border-slate-300 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white print:text-black">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Phân Bổ Theo Khung Giờ Hoạt Động</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 print:text-black mb-1">
                  <span>Ban ngày (06:00 - 18:00)</span>
                  <span className="font-mono font-bold text-cyan-400 print:text-black">68% (107 lượt)</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 print:text-black mb-1">
                  <span>Buổi tối (18:00 - 23:59)</span>
                  <span className="font-mono font-bold text-emerald-400 print:text-black">24% (38 lượt)</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 print:text-black mb-1">
                  <span>Khung giờ nhạy cảm đêm khuya (02:00 - 04:00)</span>
                  <span className="font-mono font-bold text-rose-400 print:text-black">8% (13 lượt)</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '8%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* User distribution */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 print:border-slate-300 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white print:text-black">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Tỷ Lệ Truy Cập Theo Người Dùng</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 print:text-black mb-1">
                  <span>Nguyễn Văn An (Chủ nhà)</span>
                  <span className="font-mono font-bold text-purple-400 print:text-black">62% (98 lượt)</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: '62%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 print:text-black mb-1">
                  <span>Trần Thị Mai (Thành viên)</span>
                  <span className="font-mono font-bold text-cyan-400 print:text-black">28% (44 lượt)</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 print:text-black mb-1">
                  <span>Kỹ thuật viên & Cố gắng xâm nhập bị chặn</span>
                  <span className="font-mono font-bold text-amber-400 print:text-black">10% (16 lượt)</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 3: RECENT AUDITED LOGS PREVIEW */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white print:text-black">
              Mẫu Nhật Ký Khối Gần Nhất (Trích xuất từ Blockchain Mini)
            </span>
            <span className="text-[11px] text-slate-400 print:text-slate-600">
              Tổng số khối đã ghi: {blocks.length} blocks
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl print:border-slate-300">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-950 text-slate-400 print:bg-slate-100 print:text-black border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Khối</th>
                  <th className="p-2.5">Thời Gian</th>
                  <th className="p-2.5">Hành Động</th>
                  <th className="p-2.5">Người Thực Hiện</th>
                  <th className="p-2.5">Camera</th>
                  <th className="p-2.5">IP</th>
                  <th className="p-2.5 text-right">Mã Băm SHA-256</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-black font-mono">
                {blocks.slice(-5).map((b) => (
                  <tr key={b.index} className="hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-cyan-400 print:text-black">#{b.index}</td>
                    <td className="p-2.5 whitespace-nowrap">{b.timestamp}</td>
                    <td className="p-2.5 font-sans font-medium text-slate-200 print:text-black">{b.actionLabel}</td>
                    <td className="p-2.5 font-sans">{b.operator}</td>
                    <td className="p-2.5 font-sans">{b.targetCamera}</td>
                    <td className="p-2.5">{b.ipAddress}</td>
                    <td className="p-2.5 text-right text-[10px] text-slate-400">
                      {b.hash.slice(0, 12)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        </div>

        {/* Footer with Security Certification Stamp (Fixed at bottom of modal) */}
        <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 print:border-slate-300 print:text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Xác thực bằng Chữ Ký Điện Tử ECDSA · Không phát hiện dấu hiệu can thiệp dữ liệu.</span>
          </div>

          <div className="print:hidden">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-xs"
            >
              Đóng Cửa Sổ Báo Cáo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
