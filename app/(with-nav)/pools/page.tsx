'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Spinner } from '@heroui/spinner';
import { Select, SelectItem } from '@heroui/select';
import { useAccount, useConnect, useDisconnect, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { CommodityAssetRegistryAbi } from '@/lib/abi/CommodityAssetRegistry';
import { ReceivablePoolAbi } from '@/lib/abi/ReceivablePool';
import { REGISTRY_ADDRESS, RECEIVABLE_POOL_ADDRESS, MOCK_USDT_ADDRESS } from '@/lib/contracts';
import { MockUSDTAbi } from '@/lib/abi/MockUSDT';

type Asset = {
  id: bigint;
  name: string;
  unit: string;
  quantity: bigint;
  referenceValue: bigint;
  status: number;
};

const statusLabel = (s: number) => {
  const map: Record<number, string> = {
    0: 'Registered',
    1: 'InTransit',
    2: 'Collateralized',
    3: 'Cleared',
  };
  return map[s] ?? `#${s}`;
};

const toBigIntInput = (val?: string) => {
  if (!val) return undefined;
  try {
    return BigInt(val.trim());
  } catch {
    return undefined;
  }
};

const formatNum = (v?: bigint) =>
  v === undefined ? '-' : v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const toAddress = (val?: string) => {
  if (!val) return null;
  const trimmed = val.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return null;
  return trimmed as `0x${string}`;
};

export default function PoolsPage() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [statusAssetId, setStatusAssetId] = useState('');
  const [newStatus, setNewStatus] = useState('1');
  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('1000000'); // 1 USDT
  const [approveAmount, setApproveAmount] = useState('100000000'); // 默认 100 USDT

  const parsedDepositAmount = useMemo(() => toBigIntInput(depositAmount), [depositAmount]);
  const parsedSelectedAssetId = useMemo(() => toBigIntInput(selectedAssetId), [selectedAssetId]);
  const parsedStatusAssetId = useMemo(() => toBigIntInput(statusAssetId), [statusAssetId]);
  const parsedMintAmount = useMemo(() => toBigIntInput(mintAmount), [mintAmount]);
  const parsedApproveAmount = useMemo(() => toBigIntInput(approveAmount), [approveAmount]);

  useEffect(() => {
    if (address) {
      setMintTo((prev) => prev || address);
    }
  }, [address]);

  const { data: nextAssetId } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: CommodityAssetRegistryAbi,
    functionName: 'nextAssetId',
  });

  const {
    data: txHash,
    writeContract,
    isPending,
    error: writeError,
  } = useWriteContract();
  const { isLoading: confirming, isSuccess: success } = useWaitForTransactionReceipt({ hash: txHash });

  const {
    data: statusTx,
    writeContract: writeStatus,
    isPending: statusPending,
    error: statusError,
  } = useWriteContract();
  const { isLoading: statusConfirming, isSuccess: statusSuccess } = useWaitForTransactionReceipt({
    hash: statusTx,
  });

  const {
    data: tokenTx,
    writeContract: writeToken,
    isPending: tokenPending,
    error: tokenError,
  } = useWriteContract();
  const { isLoading: tokenConfirming, isSuccess: tokenSuccess } = useWaitForTransactionReceipt({
    hash: tokenTx,
  });

  const { data: poolDeposits } = useReadContract({
    address: RECEIVABLE_POOL_ADDRESS,
    abi: ReceivablePoolAbi,
    functionName: 'poolTotalDeposits',
    args: parsedSelectedAssetId ? [parsedSelectedAssetId] : undefined,
    query: { enabled: Boolean(parsedSelectedAssetId) },
  });

  const { data: liquidity } = useReadContract({
    address: RECEIVABLE_POOL_ADDRESS,
    abi: ReceivablePoolAbi,
    functionName: 'availableLiquidity',
    args: parsedSelectedAssetId ? [parsedSelectedAssetId] : undefined,
    query: { enabled: Boolean(parsedSelectedAssetId) },
  });

  const { data: reservedInterest } = useReadContract({
    address: RECEIVABLE_POOL_ADDRESS,
    abi: ReceivablePoolAbi,
    functionName: 'reservedInterest',
    args: parsedSelectedAssetId ? [parsedSelectedAssetId] : undefined,
    query: { enabled: Boolean(parsedSelectedAssetId) },
  });

  const { data: lpBalance } = useReadContract({
    address: RECEIVABLE_POOL_ADDRESS,
    abi: ReceivablePoolAbi,
    functionName: 'lpBalanceOf',
    args: parsedSelectedAssetId && address ? [parsedSelectedAssetId, address] : undefined,
    query: { enabled: Boolean(parsedSelectedAssetId && address) },
  });

  // 读取链上资产列表
  useEffect(() => {
    const fetchAssets = async () => {
      if (!publicClient || nextAssetId === undefined) return;
      setLoadingAssets(true);
      setLoadError(null);
      try {
        const total = Number(nextAssetId);
        if (total === 0) {
          setAssets([]);
          return;
        }
        const calls = Array.from({ length: total }, (_v, i) => ({
          address: REGISTRY_ADDRESS,
          abi: CommodityAssetRegistryAbi,
          functionName: 'getAsset' as const,
          args: [BigInt(i)],
        }));
        const result = await publicClient.multicall({ allowFailure: true, contracts: calls });
        const parsed: Asset[] = [];
        result.forEach((res, idx) => {
          if (res.status === 'success') {
            const asset: any = res.result;
            parsed.push({
              id: BigInt(idx),
              name: asset.name,
              unit: asset.unit,
              quantity: BigInt(asset.quantity),
              referenceValue: BigInt(asset.referenceValue),
              status: Number(asset.status),
            });
          }
        });
        setAssets(parsed);
        if (!selectedAssetId && parsed.length > 0) setSelectedAssetId(parsed[0].id.toString());
      } catch (err: any) {
        setLoadError(err?.message || 'Failed to load assets');
      } finally {
        setLoadingAssets(false);
      }
    };
    fetchAssets();
  }, [publicClient, nextAssetId, selectedAssetId]);

  const handleDeposit = () => {
    if (!parsedSelectedAssetId || !parsedDepositAmount) {
      alert('Please select asset and enter deposit amount');
      return;
    }
    writeContract({
      address: RECEIVABLE_POOL_ADDRESS,
      abi: ReceivablePoolAbi,
      functionName: 'deposit',
      args: [parsedSelectedAssetId, parsedDepositAmount],
    });
  };

  const handleWithdraw = () => {
    if (!parsedSelectedAssetId) {
      alert('Please select asset');
      return;
    }
    writeContract({
      address: RECEIVABLE_POOL_ADDRESS,
      abi: ReceivablePoolAbi,
      functionName: 'withdraw',
      args: [parsedSelectedAssetId],
    });
  };

  const handleUpdateStatus = () => {
    if (!parsedStatusAssetId) {
      alert('Please fill in asset ID');
      return;
    }
    writeStatus({
      address: RECEIVABLE_POOL_ADDRESS,
      abi: ReceivablePoolAbi,
      functionName: 'updateAssetStatus',
      args: [parsedStatusAssetId, Number(newStatus)],
    });
  };

  const handleMint = () => {
    const mintToAddr = toAddress(mintTo);
    if (!mintToAddr || !parsedMintAmount) {
      alert('Please fill in a valid mint address and amount');
      return;
    }
    writeToken({
      address: MOCK_USDT_ADDRESS,
      abi: MockUSDTAbi,
      functionName: 'mint',
      args: [mintToAddr, parsedMintAmount],
    });
  };

  const handleApprove = () => {
    if (!approveAmount) {
      alert('Please enter approval amount');
      return;
    }
    writeToken({
      address: MOCK_USDT_ADDRESS,
      abi: MockUSDTAbi,
      functionName: 'approve',
      args: [RECEIVABLE_POOL_ADDRESS, parsedApproveAmount ?? 0n],
    });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* 标题与背景 */}
      <div className="relative mb-12">
        <h1 className="text-4xl font-bold text-white">Financing Pools</h1>
        <p className="text-gray-400 mt-2">
          Real on-chain financing pool (ReceivablePool) · LP deposit/withdrawal · Available liquidity query
        </p>
        <Image
          src="/ship.png"
          alt="bg"
          width={900}
          height={500}
          className="opacity-20 absolute -right-6 -top-24 pointer-events-none select-none"
        />
      </div>

      {/* 钱包区域 */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {isConnected ? (
          <>
            <Chip className="bg-emerald-400 text-black font-semibold border border-emerald-300/70">
              Connected: {address}
            </Chip>
            <Button
              size="sm"
              className="bg-zinc-800 text-gray-200 border border-zinc-700"
              onPress={() => disconnect()}
            >
              Disconnect
            </Button>
          </>
        ) : (
          connectors.map((c) => (
            <Button
              key={c.uid}
              size="sm"
              isDisabled={isConnecting}
              className="bg-zinc-800 text-gray-200 border border-zinc-700"
              onPress={() => connect({ connector: c })}
            >
              Connect {c.name}
            </Button>
          ))
        )}
      </div>

      {/* 合约信息 */}
      <div className="flex flex-wrap gap-2 mb-8 text-xs">
        <Chip className="bg-amber-400 text-black font-semibold border border-amber-300/80">
          Pool: {RECEIVABLE_POOL_ADDRESS}
        </Chip>
        <Chip className="bg-sky-300 text-black font-semibold border border-sky-200/80">
          Registry: {REGISTRY_ADDRESS}
        </Chip>
        <Chip className="bg-purple-300 text-black font-semibold border border-purple-200/80">
          nextAssetId: {nextAssetId !== undefined ? String(nextAssetId) : '-'}
        </Chip>
      </div>

      {/* 主内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-3 md:gap-x-4 gap-y-0.5 md:gap-y-1">
        {/* 左侧：池子卡片 */}
        <Card className="bg-[#141414]/90 border border-zinc-800 lg:col-span-2">
          <CardHeader className="border-b border-zinc-800 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-100">Pool Assets</h2>
              <p className="text-sm text-gray-500">Real assets from the Registry</p>
            </div>
            {loadingAssets && <Spinner size="sm" color="warning" />}
          </CardHeader>
          <CardBody className="p-6 grid grid-cols-1 md:grid-cols-3 gap-x-3 md:gap-x-4 gap-y-0.5 md:gap-y-1">
            {loadError && (
              <div className="md:col-span-3 text-sm text-red-400">Loading failed: {loadError}</div>
            )}
            {assets.map((asset) => (
              <div
                key={asset.id.toString()}
                className={`rounded-xl border ${
                  selectedAssetId === asset.id.toString()
                    ? 'border-amber-400/80'
                    : 'border-zinc-800'
                } bg-gradient-to-br from-[#111827] to-[#0b0f1a] p-3 shadow-md transition-all hover:-translate-y-1 hover:border-amber-300/60 aspect-[1/2] flex flex-col justify-between cursor-pointer`}
                onClick={() => setSelectedAssetId(asset.id.toString())}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Chip size="sm" className="bg-amber-400 text-black font-semibold">
                      #{asset.id.toString()}
                    </Chip>
                    <Chip size="sm" className="bg-transparent border border-zinc-700 text-gray-200">
                      {statusLabel(asset.status)}
                    </Chip>
                  </div>
                  <h3 className="text-base font-semibold text-white">{asset.name}</h3>
                  <p className="text-xs text-gray-400">
                    Qty {asset.quantity.toString()} {asset.unit}
                  </p>
                </div>
                <p className="text-sm text-amber-200 font-semibold">
                  Ref Value ${formatNum(asset.referenceValue)}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* 右侧：操作与数据 */}
        <div className="space-y-4">
          <Card className="bg-[#141414]/90 border border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <div>
                <p className="text-sm text-emerald-300">MockUSDT</p>
                <h3 className="text-lg font-semibold text-white">Mint & Approve</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <Input
                label="Mint Recipient Address"
                value={mintTo}
                onChange={(e) => setMintTo(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-black border border-white/15 text-white',
                  label: 'text-gray-300',
                  input: 'text-white placeholder:text-gray-500',
                }}
              />
              <Input
                label="Mint Amount (smallest unit, 6 decimals)"
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-black border border-white/15 text-white',
                  label: 'text-gray-300',
                  input: 'text-white placeholder:text-gray-500',
                }}
              />
              <Button
                color="primary"
                onPress={handleMint}
                isLoading={tokenPending || tokenConfirming}
                className="bg-emerald-500 text-black font-semibold"
              >
                mint
              </Button>

              <Input
                label="Approve Amount (authorize to Pool)"
                type="number"
                value={approveAmount}
                onChange={(e) => setApproveAmount(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-black border border-white/15 text-white',
                  label: 'text-gray-300',
                  input: 'text-white placeholder:text-gray-500',
                }}
              />
              <Button
                variant="bordered"
                onPress={handleApprove}
                isLoading={tokenPending || tokenConfirming}
                className="border-emerald-300 text-emerald-200"
              >
                approve Pool
              </Button>

              {tokenTx && (
                <p className="text-xs text-gray-400">
                  tx: {tokenTx.slice(0, 10)}...{tokenTx.slice(-6)}{' '}
                  {tokenSuccess && <span className="text-emerald-400 ml-1">已确认</span>}
                </p>
              )}
              {tokenError && <p className="text-sm text-red-400">错误：{tokenError.message}</p>}
            </CardBody>
          </Card>

          <Card className="bg-[#141414]/90 border border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <div>
                <p className="text-sm text-amber-300">LP Deposit & Withdraw</p>
                <h3 className="text-lg font-semibold text-white">For Selected Asset ID</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <Select
                label="资产 ID"
                placeholder="选择资产"
                selectedKeys={selectedAssetId ? new Set([selectedAssetId]) : new Set()}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0] as string | undefined;
                  setSelectedAssetId(v ?? '');
                }}
                classNames={{
                  trigger: 'bg-black border border-white/15 text-white',
                  label: 'text-gray-300',
                  listbox: 'bg-[#141414] text-white',
                }}
              >
                {assets.map((asset) => (
                  <SelectItem key={asset.id.toString()}>
                    #{asset.id.toString()} · {asset.name}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label="Deposit Amount (MockUSDT)"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-black border border-white/15 text-white',
                  label: 'text-gray-300',
                  input: 'text-white placeholder:text-gray-500',
                }}
              />
              <div className="flex gap-2">
                <Button
                  color="primary"
                  onPress={handleDeposit}
                  isLoading={isPending || confirming}
                  className="bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20"
                >
                  deposit
                </Button>
                <Button
                  variant="bordered"
                  onPress={handleWithdraw}
                  isLoading={isPending || confirming}
                  className="border-amber-300 text-amber-200"
                >
                  withdraw
                </Button>
              </div>
              {txHash && (
                <p className="text-xs text-gray-400">
                  tx: {txHash.slice(0, 10)}...{txHash.slice(-6)}{' '}
                  {success && <span className="text-emerald-400 ml-1">已确认</span>}
                </p>
              )}
              {writeError && <p className="text-sm text-red-400">错误：{writeError.message}</p>}
            </CardBody>
          </Card>

          <Card className="bg-[#141414]/90 border border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <div>
                <p className="text-sm text-sky-300">Pool Data</p>
                <h3 className="text-lg font-semibold text-white">Real-Time Liquidity</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-2 text-sm text-gray-300">
              <p>Current Asset ID: {selectedAssetId || '-'}</p>
              <p>poolTotalDeposits: {formatNum(poolDeposits as bigint)}</p>
              <p>availableLiquidity: {formatNum(liquidity as bigint)}</p>
              <p>reservedInterest: {formatNum(reservedInterest as bigint)}</p>
              <p>My LP Balance: {formatNum(lpBalance as bigint)}</p>
              <p className="text-xs text-gray-500">
                Note: Before deposit, need to approve MockUSDT to Pool address; drawdown requires sufficient available liquidity.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-[#141414]/90 border border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <div>
                <p className="text-sm text-amber-300">Asset Status (Pool.updateAssetStatus)</p>
                <h3 className="text-lg font-semibold text-white">Set Asset Status</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              <Input
                label="Asset ID (Pool owner only)"
                value={statusAssetId}
                onChange={(e) => setStatusAssetId(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-black border border-white/15 text-white',
                  label: 'text-gray-300',
                  input: 'text-white placeholder:text-gray-500',
                }}
              />
              <Select
                label="Status"
                placeholder="Select Asset Status"
                selectedKeys={newStatus ? new Set([newStatus]) : new Set()}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0] as string | undefined;
                  setNewStatus(v ?? '1');
                }}
                classNames={{
                  trigger: 'bg-black border border-white/15 text-white',
                  label: 'text-gray-300',
                  listbox: 'bg-[#141414] text-white',
                }}
              >
                <SelectItem key="0">
                  0 - Registered
                </SelectItem>
                <SelectItem key="1">
                  1 - InTransit
                </SelectItem>
                <SelectItem key="2">
                  2 - Collateralized
                </SelectItem>
                <SelectItem key="3">
                  3 - Cleared
                </SelectItem>
              </Select>
              <Button
                color="primary"
                onPress={handleUpdateStatus}
                isLoading={statusPending || statusConfirming}
                className="bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20"
              >
                Update Status
              </Button>
              {statusTx && (
                <p className="text-xs text-gray-400">
                  tx: {statusTx.slice(0, 10)}...{statusTx.slice(-6)}{' '}
                  {statusSuccess && <span className="text-emerald-400 ml-1">Confirmed</span>}
                </p>
              )}
              {statusError && <p className="text-sm text-red-400">Error: {statusError.message}</p>}
              <p className="text-xs text-gray-500">
                Requires Pool owner wallet signature; can only create deal and drawdown after setting to Active/InTransit.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
