import React, { useState } from 'react';
import { 
  BlockchainBlock, 
  AuditVerificationResult 
} from '../types';
import { 
  ShieldCheck, 
  AlertOctagon, 
  RefreshCw, 
  FileEdit, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Hash, 
  GitCommit, 
  Network, 
  Key, 
  Cpu, 
  Lock, 
  ArrowDown, 
  Layers,
  ChevronDown,
  ChevronUp,
  FileCode
} from 'lucide-react';
import { 
  calculateBlockHash, 
  buildMerkleTree, 
  verifySignatureECDSA 
} from '../utils/crypto';
import { SYSTEM_SIGNING_SECRET } from '../data/initialData';

interface BlockchainLedgerViewProps {
  blocks: BlockchainBlock[];
  onTamperBlock: (blockIndex: number, newOperator: string, newDetails: string) => void;
  onRestoreOriginalLedger: () => void;
}

export const BlockchainLedgerView: React.FC<BlockchainLedgerViewProps> = ({
  blocks,
  onTamperBlock,
  onRestoreOriginalLedger,
}) => {
  const [selectedBlockForMerkle, setSelectedBlockForMerkle] = useState<BlockchainBlock>(blocks[blocks.length - 1] || blocks[0]);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<AuditVerificationResult | null>(null);
  
  // Tamper modal state
  const [tamperTargetIndex, setTamperTargetIndex] = useState<number>(3);
  const [tamperNewOperator, setTamperNewOperator] = useState<string>('Khách Vô Danh (Đã Xóa)');
  const [tamperNewDetails, setTamperNewDetails] = useState<string>('Đã sửa log: Không có hành vi xem camera nhạy cảm');
  const [showTamperModal, setShowTamperModal] = useState<boolean>(false);
  const [expandedBlockIndex, setExpandedBlockIndex] = useState<number | null>(null);

  // Perform full cryptographic verification on the blockchain
  const runIntegrityAudit = () => {
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      let isChainValid = true;
      let tamperedIdx: number | null = null;
      let brokenPrevIdx: number | null = null;
      let brokenMerkleIdx: number | null = null;
      let brokenSigIdx: number | null = null;
      let errorMsg: string | undefined = undefined;

      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];

        // 1. Check Previous Hash Link (for index > 0)
        if (i > 0) {
          const prevBlock = blocks[i - 1];
          if (b.previousHash !== prevBlock.hash) {
            isChainValid = false;
            brokenPrevIdx = i;
            errorMsg = `Gãy chuỗi liên kết tại Khối #${i}: previousHash (${b.previousHash.slice(0, 10)}...) không khớp với mã băm của Khối #${i - 1} (${prevBlock.hash.slice(0, 10)}...)`;
            break;
          }
        }

        // 2. Re-compute Merkle Root
        const merkleItems = [
          b.timestamp,
          b.action,
          b.operator,
          b.targetCamera,
          b.ipAddress,
          b.details,
        ];
        const recomputedMerkle = buildMerkleTree(merkleItems);
        if (recomputedMerkle.root !== b.merkleRoot) {
          isChainValid = false;
          brokenMerkleIdx = i;
          tamperedIdx = i;
          errorMsg = `Rễ cây Merkle bị sai lệch tại Khối #${i}: Dữ liệu giao dịch bên trong đã bị thay đổi! (Gốc lưu: ${b.merkleRoot.slice(0, 10)}... | Tính lại: ${recomputedMerkle.root.slice(0, 10)}...)`;
          break;
        }

        // 3. Re-calculate SHA-256 Block Hash
        const calculatedHash = calculateBlockHash(
          b.index,
          b.timestamp,
          b.action,
          b.operator,
          b.targetCamera,
          b.ipAddress,
          b.details,
          b.previousHash,
          b.merkleRoot,
          b.nonce
        );

        if (calculatedHash !== b.hash) {
          isChainValid = false;
          tamperedIdx = i;
          errorMsg = `Hàm băm SHA-256 bị sai tại Khối #${i}: Nội dung khối đã bị chỉnh sửa bất hợp pháp! (Hash lưu: ${b.hash.slice(0, 10)}... | Hash tính lại: ${calculatedHash.slice(0, 10)}...)`;
          break;
        }

        // 4. Verify ECDSA signature
        const isSigValid = verifySignatureECDSA(b.hash, b.signature, SYSTEM_SIGNING_SECRET);
        if (!isSigValid) {
          isChainValid = false;
          brokenSigIdx = i;
          tamperedIdx = i;
          errorMsg = `Chữ ký số ECDSA không hợp lệ tại Khối #${i}: Khối không do Gateway tin cậy ký phát hành!`;
          break;
        }
      }

      setVerificationResult({
        isValid: isChainValid,
        checkedBlocksCount: blocks.length,
        tamperedBlockIndex: tamperedIdx,
        brokenPreviousHashIndex: brokenPrevIdx,
        brokenMerkleRootIndex: brokenMerkleIdx,
        signatureMismatchIndex: brokenSigIdx,
        errorMessage: errorMsg,
        verifiedAt: new Date().toLocaleTimeString('vi-VN'),
      });

      setIsVerifying(false);
    }, 450);
  };

  const handleApplyTamper = () => {
    onTamperBlock(tamperTargetIndex, tamperNewOperator, tamperNewDetails);
    setShowTamperModal(false);
    // Auto run audit to immediately show the red flag
    setTimeout(() => {
      runIntegrityAudit();
    }, 100);
  };

  const hasAnyTamperedBlock = blocks.some((b) => b.isTampered);

  // Merkle tree visualization items for selected block
  const selectedMerkleItems = [
    { label: 'Thời gian', val: selectedBlockForMerkle.timestamp },
    { label: 'Hành động', val: selectedBlockForMerkle.action },
    { label: 'Người thực hiện', val: selectedBlockForMerkle.operator },
    { label: 'Thiết bị mục tiêu', val: selectedBlockForMerkle.targetCamera },
    { label: 'Địa chỉ IP', val: selectedBlockForMerkle.ipAddress },
    { label: 'Nội dung chi tiết', val: selectedBlockForMerkle.details },
  ];
  const selectedBlockMerkleTree = buildMerkleTree(selectedMerkleItems.map(i => i.val));

  return (
    <div className="space-y-6">
      
      {/* Top Ledger Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Nhật Ký Truy Cập Chống Chối Bỏ (Mini Blockchain)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mỗi lần xem, tải hay chụp ảnh camera được đóng thành một khối mật mã liên kết bằng hàm băm SHA-256, Merkle Tree và chữ ký số ECDSA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Integrity Audit Trigger */}
          <button
            onClick={runIntegrityAudit}
            disabled={isVerifying}
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-cyan-950/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Đang kiểm tra mật mã...' : 'Kiểm Tra Toàn Vẹn Chuỗi'}</span>
          </button>

          {/* Tamper Simulation Button (Demo Feature) */}
          <button
            onClick={() => setShowTamperModal(true)}
            className="px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Thử nghiệm kịch bản tấn công sửa log database"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Giả lập sửa đổi log</span>
          </button>

          {hasAnyTamperedBlock && (
            <button
              onClick={() => {
                onRestoreOriginalLedger();
                setVerificationResult(null);
              }}
              className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Khôi phục nguyên vẹn chuỗi khối từ bản lưu bảo mật"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục gốc</span>
            </button>
          )}
        </div>
      </div>

      {/* Verification Status Alert Banner */}
      {verificationResult && (
        <div className={`p-4 rounded-xl border transition-all ${
          verificationResult.isValid
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/50 border-rose-500/60 text-rose-200'
        }`}>
          <div className="flex items-start gap-3">
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            )}
            <div className="flex-1 text-xs">
              <div className="font-bold text-sm flex items-center gap-2">
                <span>{verificationResult.isValid ? 'CHUỖI TOÀN VẸN 100% · HỢP LỆ' : 'CẢNH BÁO NGUY HIỂM: PHÁT HIỆN DỮ LIỆU ĐÃ BỊ SỬA ĐỔI'}</span>
                <span className="text-[11px] font-mono text-slate-400">· Kiểm tra lúc {verificationResult.verifiedAt}</span>
              </div>
              <p className="mt-1 leading-relaxed">
                {verificationResult.isValid ? (
                  <>
                    Đã kiểm tra qua <strong>{verificationResult.checkedBlocksCount} khối</strong>. Toàn bộ hàm băm SHA-256 của khối trước (Previous Hash), gốc cây Merkle và chữ ký điện tử ECDSA đều trùng khớp chính xác. Không phát hiện dấu hiệu tẩy xóa hay chèn mã giả mạo.
                  </>
                ) : (
                  <>
                    {verificationResult.errorMessage}
                    <span className="block mt-1 font-mono text-rose-300">
                      Nguyên nhân: Một dòng log đã bị kẻ xấu chỉnh sửa trực tiếp trong CSDL mà không có khóa bí mật ECDSA của hệ thống!
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic Architecture Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-cyan-400" />
            <span>Thuật toán Băm</span>
          </div>
          <div className="font-mono font-bold text-slate-200 mt-1">SHA-256 (256-bit)</div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-purple-400" />
            <span>Cấu trúc Merkle</span>
          </div>
          <div className="font-mono font-bold text-slate-200 mt-1">Binary Merkle Tree</div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Chữ ký số Gateway</span>
          </div>
          <div className="font-mono font-bold text-slate-200 mt-1">ECDSA (SECP256R1)</div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tổng số Khối</span>
          </div>
          <div className="font-mono font-bold text-slate-200 mt-1 tabular-nums">{blocks.length} Blocks liên kết</div>
        </div>
      </div>

      {/* Main 2-Column Split: Blocks Timeline (Left) + Merkle Tree Inspector (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2 Cols): Sequential Blockchain Blocks */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-slate-200">Dòng thời gian các khối (Chống chối bỏ)</span>
            <span>Mỗi khối chứa hash của khối liền trước</span>
          </div>

          <div className="space-y-3">
            {blocks.map((block, idx) => {
              const isSelected = selectedBlockForMerkle.index === block.index;
              const isExpanded = expandedBlockIndex === block.index;
              const isTamperedThis = block.isTampered;

              return (
                <div
                  key={block.index}
                  className={`border rounded-xl p-4 transition-all ${
                    isTamperedThis
                      ? 'bg-rose-950/20 border-rose-500/80 shadow-md shadow-rose-950/30'
                      : isSelected
                      ? 'bg-slate-900 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Block Header Line */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        isTamperedThis
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-cyan-300 border border-slate-700'
                      }`}>
                        KHỐI #{block.index}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{block.actionLabel}</span>
                      {isTamperedThis && (
                        <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded">
                          ĐÃ BỊ CAN THIỆP
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-mono text-[11px] tabular-nums">{block.timestamp}</span>
                      <button
                        onClick={() => setSelectedBlockForMerkle(block)}
                        className={`px-2 py-1 rounded text-[11px] transition-colors ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        Soi Merkle Tree
                      </button>
                    </div>
                  </div>

                  {/* Block Core Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px]">Người thực hiện:</span>
                      <div className={`font-medium ${isTamperedThis ? 'text-rose-300 font-bold' : 'text-slate-200'}`}>
                        {block.operator}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px]">Đối tượng camera:</span>
                      <div className="text-slate-200 font-medium truncate">{block.targetCamera}</div>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[11px]">Địa chỉ IP & Thiết bị:</span>
                      <div className="text-slate-300 font-mono text-[11px] truncate">
                        {block.ipAddress}
                      </div>
                    </div>
                  </div>

                  {/* Block Description */}
                  <div className="mt-2 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    <span className="text-slate-500 font-medium">Chi tiết: </span>
                    <span className={isTamperedThis ? 'text-rose-300 font-semibold' : ''}>{block.details}</span>
                  </div>

                  {/* Hashes & Merkle Root */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-slate-500">Hash Khối trước (Prev):</span>
                      <span className="text-slate-400 truncate max-w-[280px]" title={block.previousHash}>
                        {block.previousHash.slice(0, 16)}...{block.previousHash.slice(-8)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400/80">Hash Khối này (SHA-256):</span>
                      <span className={`truncate max-w-[280px] font-bold ${isTamperedThis ? 'text-rose-400' : 'text-cyan-300'}`} title={block.hash}>
                        {block.hash.slice(0, 16)}...{block.hash.slice(-8)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-purple-400/80">Gốc Merkle (Root):</span>
                      <span className="text-purple-300 truncate max-w-[280px]" title={block.merkleRoot}>
                        {block.merkleRoot.slice(0, 16)}...{block.merkleRoot.slice(-8)}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Detailed Cryptographic Signatures */}
                  <button
                    onClick={() => setExpandedBlockIndex(isExpanded ? null : block.index)}
                    className="mt-2 text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <span>{isExpanded ? 'Ẩn chữ ký số ECDSA' : 'Xem chữ ký số ECDSA & Nonce'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-2.5 bg-black/40 rounded border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
                      <div>
                        <span className="text-amber-400/80">Chữ ký ECDSA (DER): </span>
                        <span className="text-amber-300/90 break-all">{block.signature}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Nonce: </span>
                        <span className="text-slate-300">{block.nonce}</span>
                      </div>
                    </div>
                  )}

                  {/* Visual Chain Connector */}
                  {idx < blocks.length - 1 && (
                    <div className="flex justify-center -mb-5 mt-2 relative z-10">
                      <div className="bg-slate-800 p-1 rounded-full border border-slate-700 text-cyan-400">
                        <ArrowDown className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Merkle Tree Inspector */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sticky top-20 shadow-md">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Cây Merkle (Khối #{selectedBlockForMerkle.index})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedBlockForMerkle.action}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Cây Merkle cho phép xác minh tính toàn vẹn của tập dữ liệu giao dịch trong nháy mắt. Nếu bất kỳ trường dữ liệu nào bị thay đổi dù chỉ 1 ký tự, toàn bộ nhánh băm và Merkle Root sẽ lập tức thay đổi hoàn toàn!
            </p>

            {/* Merkle Root Node */}
            <div className="mt-4 p-3 bg-purple-950/30 border border-purple-500/40 rounded-lg">
              <div className="flex items-center justify-between text-[11px] text-purple-300 font-semibold mb-1">
                <span>Gốc Merkle (Merkle Root)</span>
                <span className="text-[10px] text-purple-400 font-mono">TOP ROOT</span>
              </div>
              <div className="font-mono text-[10px] text-purple-200 break-all bg-black/40 p-1.5 rounded border border-purple-900/50">
                {selectedBlockMerkleTree.root}
              </div>
            </div>

            {/* Tree Branch Visual Connector */}
            <div className="flex justify-center my-2">
              <div className="w-0.5 h-4 bg-purple-500/40" />
            </div>

            {/* Intermediate Hashes / Leaves */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-300">
                Lá giao dịch (Leaf Nodes - SHA-256):
              </div>

              {selectedMerkleItems.map((item, i) => (
                <div key={i} className="p-2 bg-slate-950/70 border border-slate-800/80 rounded text-xs space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-medium text-slate-300">Lá #{i + 1}: {item.label}</span>
                  </div>
                  <div className="text-slate-200 text-[11px] truncate">
                    {item.val}
                  </div>
                </div>
              ))}
            </div>

            {/* Cryptographic Principle Explanation */}
            <div className="mt-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
              <div className="text-cyan-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tại sao không thể sửa log?</span>
              </div>
              <p className="leading-relaxed">
                Để sửa đổi 1 hành động trong quá khứ, kẻ tấn công phải tìm ra một bản ghi khác có cùng hàm băm SHA-256 (bất khả thi về mặt toán học), hoặc phải tính toán lại toàn bộ các khối phía sau và giả mạo chữ ký số ECDSA của server mà không có khóa bí mật HSM.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* MODAL: TAMPER SIMULATION (Demo Highlight 4) */}
      {showTamperModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <FileEdit className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">
                Thử Nghiệm Tấn Công Sửa Dữ Liệu Nhật Ký (Tamper Lab)
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Kịch bản: Một kẻ xấu xâm nhập được vào cơ sở dữ liệu và muốn <strong>tẩy xóa bằng chứng</strong> đã xem hoặc tải trộm video nhạy cảm. Thử can thiệp một trường thông tin để xem hệ thống Blockchain phát hiện ra sao.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Chọn Khối muốn can thiệp:</label>
                <select
                  value={tamperTargetIndex}
                  onChange={(e) => setTamperTargetIndex(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                >
                  {blocks.map((b) => (
                    <option key={b.index} value={b.index}>
                      Khối #{b.index} - {b.actionLabel} ({b.operator})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Sửa tên Người thực hiện thành:</label>
                <input
                  type="text"
                  value={tamperNewOperator}
                  onChange={(e) => setTamperNewOperator(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Sửa nội dung chi tiết log thành:</label>
                <textarea
                  rows={2}
                  value={tamperNewDetails}
                  onChange={(e) => setTamperNewDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowTamperModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleApplyTamper}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors"
              >
                Tiến Hành Can Thiệp & Kiểm Tra Toàn Vẹn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
