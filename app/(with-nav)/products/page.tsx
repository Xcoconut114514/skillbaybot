'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Chip } from '@heroui/chip';
import { useDisclosure } from '@heroui/modal';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Spinner } from '@heroui/spinner';
import { Select, SelectItem } from '@heroui/select';
import Image from 'next/image';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  usePublicClient,
} from 'wagmi';
import { CommodityAssetRegistryAbi } from '@/lib/abi/CommodityAssetRegistry';
import { ReceivablePoolAbi } from '@/lib/abi/ReceivablePool';
import { REGISTRY_ADDRESS, RECEIVABLE_POOL_ADDRESS } from '@/lib/contracts';

type OnChainAsset = {
  id: bigint;
  name: string;
  quantity: bigint;
  unit: string;
  referenceValue: bigint;
  issuer: string;
  status: number;
  metadataURI: string;
};

const toBigIntInput = (val: string) => {
  const trimmed = val.trim();
  if (!trimmed) return undefined;
  try {
    return BigInt(trimmed);
  } catch {
    return undefined;
  }
};

const toAddress = (val?: string) => {
  if (!val) return null;
  const trimmed = val.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return null;
  return trimmed as `0x${string}`;
};

const statusLabel = (status: number) => {
  const map: Record<number, string> = {
    0: 'Registered',
    1: 'InTransit',
    2: 'Collateralized',
    3: 'Cleared',
  };
  return map[status] ?? `#${status}`;
};

const statusOptions = [
  { value: '0', label: 'Registered' },
  { value: '1', label: 'InTransit' },
  { value: '2', label: 'Collateralized' },
  { value: '3', label: 'Cleared' },
];

const formatPrice = (value: bigint) => {
  const str = value.toString();
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const Pill = ({ text, className }: { text: string; className: string }) => (
  <div
    className={`px-3 py-1 rounded-full text-xs font-semibold border ${className}`}
  >
    {text}
  </div>
);

export default function ProductsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();

  const [assets, setAssets] = useState<OnChainAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formName, setFormName] = useState('Copper');
  const [formUnit, setFormUnit] = useState('ton');
  const [formQuantity, setFormQuantity] = useState('1000');
  const [formRefValue, setFormRefValue] = useState('10000000');
  const [formMetadata, setFormMetadata] = useState('https://metadata.example.com/copper/1');
  const [formStatus, setFormStatus] = useState('0');
  const [formIssuer, setFormIssuer] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (address) setFormIssuer((prev) => prev || address);
  }, [address]);

  const { data: nextAssetId, refetch: refetchNextAssetId } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: CommodityAssetRegistryAbi,
    functionName: 'nextAssetId',
  });

  const {
    data: registerHash,
    writeContract: writeRegister,
    isPending: registering,
    error: registerError,
  } = useWriteContract();
  const { isSuccess: registerSuccess, isLoading: registerConfirming } = useWaitForTransactionReceipt({
    hash: registerHash,
  });

  const parsedQuantity = useMemo(() => toBigIntInput(formQuantity), [formQuantity]);
  const parsedRefValue = useMemo(() => toBigIntInput(formRefValue), [formRefValue]);
  const parsedStatus = useMemo(() => Number(formStatus || '0'), [formStatus]);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!publicClient || nextAssetId === undefined) return;
      setIsLoadingAssets(true);
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

        const result = await publicClient.multicall({
          allowFailure: true,
          contracts: calls,
        });

        const parsed: OnChainAsset[] = [];
        result.forEach((res, idx) => {
          if (res.status === 'success') {
            const asset = res.result as any;
            parsed.push({
              id: BigInt(idx),
              name: asset.name,
              metadataURI: asset.metadataURI,
              quantity: BigInt(asset.quantity),
              unit: asset.unit,
              referenceValue: BigInt(asset.referenceValue),
              issuer: asset.issuer,
              status: Number(asset.status),
            });
          }
        });
        setAssets(parsed);
      } catch (err: any) {
        setLoadError(err?.message || 'Loading failed');
      } finally {
        setIsLoadingAssets(false);
      }
    };
    fetchAssets();
  }, [publicClient, nextAssetId, reloadKey]);

  const handleRegister = () => {
    const issuerAddr = toAddress(formIssuer);
    if (!issuerAddr || !formName || !parsedQuantity || !parsedRefValue || !formUnit) {
      alert('Please fill in all required fields and a valid issuer address');
      return;
    }
    writeRegister({
      address: RECEIVABLE_POOL_ADDRESS,
      abi: ReceivablePoolAbi,
      functionName: 'registerAsset',
      args: [
        issuerAddr,
        formName,
        formMetadata,
        parsedQuantity,
        formUnit,
        parsedRefValue,
        parsedStatus,
      ],
    });
  };

  useEffect(() => {
    if (registerSuccess) {
      onClose();
      setReloadKey((k) => k + 1);
      refetchNextAssetId();
    }
  }, [registerSuccess, onClose, refetchNextAssetId]);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <Image
          src="/background.png"
          alt="background"
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-[#FFA500] mb-2">On-chain Assets</h1>
            <p className="text-gray-500">Read real asset data directly from Registry / Pool</p>
          </div>
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">
                <p>Address: {address}</p>
              </div>
              <Button
                onPress={() => disconnect()}
                className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 border border-zinc-700"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              {connectors.map((connector) => (
                <Button
                  key={connector.uid}
                  onPress={() => connect({ connector })}
                  isDisabled={isConnecting}
                  className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 border border-zinc-700"
                >
                  {connector.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-8 text-sm">
          <Pill
            text={`Registry: ${REGISTRY_ADDRESS}`}
            className="bg-amber-400 text-black border-amber-300/80 shadow-sm"
          />
          <Pill
            text={`Pool: ${RECEIVABLE_POOL_ADDRESS}`}
            className="bg-sky-300 text-black border-sky-200/80 shadow-sm"
          />
          <Pill
            text={`nextAssetId: ${nextAssetId !== undefined ? String(nextAssetId) : '-'}`}
            className="bg-emerald-300 text-black border-emerald-200/80 shadow-sm"
          />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            Asset list from on-chain: Registry.getAsset(0..nextAssetId-1)
          </div>
          <Button
            onPress={onOpen}
            className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 border border-zinc-700"
          >
            Register New Asset (Pool owner)
          </Button>
        </div>

        <Card className="bg-[#141414] border border-zinc-800">
          <CardHeader className="border-b border-zinc-800 p-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-300">Registered Assets</h2>
            {isLoadingAssets && <Spinner size="sm" color="warning" />}
          </CardHeader>
          <CardBody className="p-6">
            {loadError && <p className="text-red-400 mb-3 text-sm">Loading failed: {loadError}</p>}
            <Table
              aria-label="asset list"
              selectionMode="single"
              selectedKeys={selectedRows}
              onSelectionChange={(keys) => setSelectedRows(keys as Set<string>)}
              classNames={{
                wrapper: 'bg-transparent shadow-none',
                th: 'bg-transparent text-gray-500 font-medium text-xs uppercase',
                td: 'text-gray-300 border-b border-zinc-800/50',
              }}
            >
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>QTY</TableColumn>
                <TableColumn>UNIT</TableColumn>
                <TableColumn>PRICE (USDT)</TableColumn>
                <TableColumn>ISSUER</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>METADATA</TableColumn>
              </TableHeader>
              <TableBody
                emptyContent={
                  isLoadingAssets ? 'Loading...' : 'No on-chain assets'
                }
              >
                {assets.map((asset) => (
                  <TableRow key={asset.id.toString()} className="hover:bg-zinc-900/30 transition-colors">
                    <TableCell className="font-mono text-xs text-gray-400">
                      {asset.id.toString()}
                    </TableCell>
                    <TableCell className="font-medium text-gray-200">{asset.name}</TableCell>
                    <TableCell>{asset.quantity.toString()}</TableCell>
                    <TableCell>{asset.unit}</TableCell>
                    <TableCell>${formatPrice(asset.referenceValue)}</TableCell>
                    <TableCell className="text-xs text-gray-400 break-all">{asset.issuer}</TableCell>
                    <TableCell>
                      <Chip size="sm" className="bg-transparent border border-zinc-700 text-gray-300">
                        {statusLabel(asset.status)}
                      </Chip>
                    </TableCell>
                    <TableCell className="text-xs text-gray-400 break-all">
                      {asset.metadataURI || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {selectedRows.size > 0 && (
              <p className="mt-3 text-xs text-gray-400">
                Selected Asset ID: {Array.from(selectedRows).join(', ')}
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl" className="bg-[#141414] border border-zinc-800">
        <ModalContent>
          <ModalHeader className="border-b border-zinc-800 text-gray-300">
            Register New Asset (Pool.registerAsset)
          </ModalHeader>
          <ModalBody className="py-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Issuer"
                value={formIssuer}
                onChange={(e) => setFormIssuer(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-zinc-800 border border-zinc-600 text-gray-100',
                  label: 'text-gray-200',
                  input: 'text-gray-50',
                }}
              />
              <Input
                label="Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-zinc-800 border border-zinc-600 text-gray-100',
                  label: 'text-gray-200',
                  input: 'text-gray-50',
                }}
              />
            </div>
            <Input
              label="metadataURI"
              value={formMetadata}
              onChange={(e) => setFormMetadata(e.target.value)}
              classNames={{
                inputWrapper: 'bg-zinc-800 border border-zinc-600 text-gray-100',
                label: 'text-gray-200',
                input: 'text-gray-50',
              }}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="quantity (uint256)"
                type="number"
                value={formQuantity}
                onChange={(e) => setFormQuantity(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-zinc-800 border border-zinc-600 text-gray-100',
                  label: 'text-gray-200',
                  input: 'text-gray-50',
                }}
              />
              <Input
                label="unit"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-zinc-800 border border-zinc-600 text-gray-100',
                  label: 'text-gray-200',
                  input: 'text-gray-50',
                }}
              />
              <Input
                label="Reference Value / Price (uint256)"
                type="number"
                value={formRefValue}
                onChange={(e) => setFormRefValue(e.target.value)}
                classNames={{
                  inputWrapper: 'bg-zinc-800 border border-zinc-600 text-gray-100',
                  label: 'text-gray-200',
                  input: 'text-gray-50',
                }}
              />
            </div>
            <Select
              label="Status"
              placeholder="Select asset status"
              selectedKeys={new Set([formStatus])}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as string;
                setFormStatus(v);
              }}
              classNames={{
                trigger: 'bg-zinc-800 border border-zinc-600 text-gray-100',
                label: 'text-gray-200',
                listbox: 'bg-[#141414]',
              }}
            >
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
            {registerError && (
              <p className="text-sm text-red-400">Error: {registerError.message}</p>
            )}
          </ModalBody>
          <ModalFooter className="border-t border-zinc-800">
            <Button variant="light" onPress={onClose} className="text-gray-500">
              Cancel
            </Button>
            <Button
              onPress={handleRegister}
              isLoading={registering || registerConfirming}
              className="bg-zinc-800 hover:bg-zinc-700 text-gray-300 border border-zinc-700"
            >
              Submit
            </Button>
            {registerHash && (
              <span className="text-xs text-gray-400">
                tx: {registerHash.slice(0, 10)}...{registerHash.slice(-6)}
              </span>
            )}
            {registerSuccess && <span className="text-xs text-emerald-400">On-chain</span>}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
