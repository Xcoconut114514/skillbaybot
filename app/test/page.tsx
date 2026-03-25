"use client";

import React, { useState, useEffect } from "react";
import {
    useAccount,
    useConnect,
    useDisconnect,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import {
    CommodityAssetRegistryAbi,
} from "@/lib/abi/CommodityAssetRegistry";
import {
    REGISTRY_ADDRESS,
    RECEIVABLE_POOL_ADDRESS,
    MOCK_USDT_ADDRESS,
} from "@/lib/contracts";
import { ReceivablePoolAbi } from "@/lib/abi/ReceivablePool";
import { MockUSDTAbi } from "@/lib/abi/MockUSDT";

const jsonWithBigInt = (value: unknown) =>
    JSON.stringify(
        value,
        (_key, val) => (typeof val === "bigint" ? val.toString() : val),
        2
    );

const toBigIntInput = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    return BigInt(trimmed);
};

const toAddress = (val?: string) => {
    if (!val) return null;
    const trimmed = val.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return null;
    return trimmed as `0x${string}`;
};

const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b1224 0%, #0f172a 60%, #0b1224 100%)",
        color: "#e5e7eb",
        padding: 24,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system",
    },
    section: {
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        marginTop: 16,
    },
    card: {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
        backdropFilter: "blur(10px)",
    },
    cardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
    cardDesc: { color: "#9ca3af", fontSize: 13, marginBottom: 12 },
    label: { display: "block", fontSize: 13, color: "#cbd5e1", marginTop: 8 },
    input: {
        width: "100%",
        marginTop: 4,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: "10px 12px",
        color: "#e5e7eb",
    },
    buttonPrimary: {
        marginTop: 10,
        padding: "10px 14px",
        background: "linear-gradient(90deg, #06b6d4, #2563eb)",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        fontWeight: 600,
        cursor: "pointer",
    },
    buttonGhost: {
        marginTop: 10,
        padding: "10px 14px",
        background: "rgba(255,255,255,0.05)",
        color: "#e5e7eb",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        fontWeight: 600,
        cursor: "pointer",
    },
    badge: {
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 12,
        background: "rgba(6,182,212,0.15)",
        color: "#67e8f9",
        fontSize: 12,
        border: "1px solid rgba(6,182,212,0.35)",
    },
} as const;

function SectionCard({
    title,
    desc,
    children,
}: {
    title: string;
    desc?: string;
    children: React.ReactNode;
}) {
    return (
        <div style={styles.card}>
            <div>
                <div style={styles.cardTitle}>{title}</div>
                {desc && <div style={styles.cardDesc}>{desc}</div>}
            </div>
            {children}
        </div>
    );
}
// ----------------------------
// RegisterAsset 测试组件（带表单）
// ----------------------------
function RegisterAssetTest() {
    const { address } = useAccount();

    const [issuer, setIssuer] = useState("");
    const [name, setName] = useState("Copper");
    const [metadataURI, setMetadataURI] = useState(
        "https://metadata.example.com/copper/1"
    );
    const [quantity, setQuantity] = useState("1000");
    const [unit, setUnit] = useState("ton");
    const [referenceValue, setReferenceValue] = useState("10000000");
    const [status, setStatus] = useState("0"); // 枚举底层是 uint8，这里先用 0

    // 默认把 issuer 设为当前连接的钱包地址
    useEffect(() => {
        if (address) {
            setIssuer(address);
        }
    }, [address]);

    const {
        data: txHash,
        isPending,
        writeContract,
        error: writeError,
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: confirmError,
    } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const handleRegister = () => {
        const issuerAddr = toAddress(issuer);
        if (!issuerAddr || !name || !quantity || !referenceValue || !unit) {
            alert("请先把必填字段填完整，并提供合法的发行人地址");
            return;
        }

        try {
            writeContract({
                address: RECEIVABLE_POOL_ADDRESS,
                abi: ReceivablePoolAbi,
                functionName: "registerAsset",
                args: [
                    issuerAddr,
                    name,
                    metadataURI,
                    BigInt(quantity),        // uint256
                    unit,
                    BigInt(referenceValue),  // uint256
                    Number(status),          // uint8
                ],
            });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>
                🧪 通过 Pool 注册资产 (Pool → Registry.registerAsset)
            </h2>

            <div
                style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    marginTop: 12,
                }}
            >
                <SectionCard
                    title="资产信息"
                    desc="Pool 作为 Registry owner 调用 registerAsset"
                >
                    <label style={styles.label}>
                        Issuer（发行人地址）
                        <input
                            style={styles.input}
                            value={issuer}
                            onChange={(e) => setIssuer(e.target.value)}
                            placeholder="0x..."
                        />
                    </label>

                    <label style={styles.label}>
                        资产名称 name
                        <input
                            style={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例如：Copper"
                        />
                    </label>

                    <label style={styles.label}>
                        metadataURI（可选）
                        <input
                            style={styles.input}
                            value={metadataURI}
                            onChange={(e) => setMetadataURI(e.target.value)}
                            placeholder="例如：https://..."
                        />
                    </label>

                    <label style={styles.label}>
                        数量 quantity（uint256）
                        <input
                            style={styles.input}
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="例如：1000"
                        />
                    </label>

                    <label style={styles.label}>
                        单位 unit
                        <input
                            style={styles.input}
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            placeholder="例如：ton"
                        />
                    </label>

                    <label style={styles.label}>
                        参考价值 referenceValue（uint256）
                        <input
                            style={styles.input}
                            type="number"
                            value={referenceValue}
                            onChange={(e) => setReferenceValue(e.target.value)}
                            placeholder="例如：10000000"
                        />
                    </label>

                    <label style={styles.label}>
                        状态 status（uint8，枚举值）
                        <input
                            style={styles.input}
                            type="number"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            placeholder="例如：0"
                        />
                    </label>

                    <button
                        style={styles.buttonPrimary}
                        disabled={isPending}
                        onClick={handleRegister}
                    >
                        {isPending ? "⏳ 交易发送中..." : "注册新资产（Pool.registerAsset）"}
                    </button>

                    {txHash && <p style={{ marginTop: 8 }}>📡 交易 Hash：{txHash}</p>}
                    {isConfirming && <p>⏳ 交易确认中...</p>}
                    {isConfirmed && <p>✅ 资产注册成功！</p>}

                    {writeError && (
                        <p style={{ color: "#fca5a5" }}>
                            ❌ 写入错误：{writeError.message}
                        </p>
                    )}
                    {confirmError && (
                        <p style={{ color: "#fca5a5" }}>
                            ⚠️ 确认错误：{confirmError.message}
                        </p>
                    )}
                </SectionCard>
            </div>
        </section>
    );
}

// ----------------------------
// Registry 查询 + 更新状态
// ----------------------------
function RegistryQueries() {
    const [queryAssetId, setQueryAssetId] = useState("");
    const [updateStatusAssetId, setUpdateStatusAssetId] = useState("");
    const [newStatus, setNewStatus] = useState("1");

    const parsedQueryId = toBigIntInput(queryAssetId);
    const parsedUpdateId = toBigIntInput(updateStatusAssetId);

    const { data: statusData, refetch: refetchStatus, isFetching: fetchingStatus } =
        useReadContract({
            address: REGISTRY_ADDRESS,
            abi: CommodityAssetRegistryAbi,
            functionName: "assetStatus",
            args: parsedQueryId ? ([parsedQueryId] as [bigint]) : undefined,
            query: { enabled: Boolean(parsedQueryId) },
        });

    const {
        data: issuerData,
        refetch: refetchIssuer,
        isFetching: fetchingIssuer,
    } = useReadContract({
        address: REGISTRY_ADDRESS,
        abi: CommodityAssetRegistryAbi,
        functionName: "assetIssuer",
        args: parsedQueryId ? ([parsedQueryId] as [bigint]) : undefined,
        query: { enabled: Boolean(parsedQueryId) },
    });

    const {
        data: refValueData,
        refetch: refetchReference,
        isFetching: fetchingRefValue,
    } = useReadContract({
        address: REGISTRY_ADDRESS,
        abi: CommodityAssetRegistryAbi,
        functionName: "assetReferenceValue",
        args: parsedQueryId ? ([parsedQueryId] as [bigint]) : undefined,
        query: { enabled: Boolean(parsedQueryId) },
    });

    const { data: assetData, refetch: refetchAsset, isFetching: fetchingAsset } =
        useReadContract({
            address: REGISTRY_ADDRESS,
            abi: CommodityAssetRegistryAbi,
            functionName: "getAsset",
            args: parsedQueryId ? ([parsedQueryId] as [bigint]) : undefined,
            query: { enabled: Boolean(parsedQueryId) },
        });

    const {
        data: statusTx,
        isPending,
        writeContract,
        error: statusWriteError,
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: confirmError,
    } = useWaitForTransactionReceipt({ hash: statusTx });

    const handleUpdateStatus = () => {
        if (!parsedUpdateId) {
            alert("请填写资产 ID");
            return;
        }

        writeContract({
            address: RECEIVABLE_POOL_ADDRESS,
            abi: ReceivablePoolAbi,
            functionName: "updateAssetStatus",
            args: [parsedUpdateId, Number(newStatus)],
        });
    };

    const handleRefreshAll = async () => {
        await Promise.all([
            refetchStatus(),
            refetchIssuer(),
            refetchReference(),
            refetchAsset(),
        ]);
    };

    return (
        <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>🧪 Registry 读写测试</h2>

            <div style={styles.section}>
                <SectionCard
                    title="更新资产状态（Pool 代理 Registry）"
                    desc="调用 Pool.updateAssetStatus → Registry.updateStatus，需 Pool owner 钱包。"
                >
                    <label style={styles.label}>
                        资产 ID
                        <input
                            style={styles.input}
                            value={updateStatusAssetId}
                            onChange={(e) => setUpdateStatusAssetId(e.target.value)}
                            placeholder="assetId"
                        />
                    </label>

                    <label style={styles.label}>
                        新状态 status（uint8）
                        <input
                            style={styles.input}
                            type="number"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            placeholder="例如：1"
                        />
                    </label>

                    <button
                        style={styles.buttonPrimary}
                        disabled={isPending}
                        onClick={handleUpdateStatus}
                    >
                        {isPending ? "⏳ 发送中..." : "updateStatus"}
                    </button>

                    {statusTx && <p>📡 交易 Hash：{statusTx}</p>}
                    {isConfirming && <p>⏳ 确认中...</p>}
                    {isConfirmed && <p>✅ 状态已更新</p>}

                    {statusWriteError && (
                        <p style={{ color: "#fca5a5" }}>
                            ❌ 写入错误：{statusWriteError.message}
                        </p>
                    )}
                    {confirmError && (
                        <p style={{ color: "#fca5a5" }}>
                            ⚠️ 确认错误：{confirmError.message}
                        </p>
                    )}
                </SectionCard>

                <SectionCard
                    title="资产查询"
                    desc="assetStatus / assetIssuer / assetReferenceValue / getAsset"
                >
                    <label style={styles.label}>
                        资产 ID
                        <input
                            style={styles.input}
                            value={queryAssetId}
                            onChange={(e) => setQueryAssetId(e.target.value)}
                            placeholder="assetId"
                        />
                    </label>
                    <button
                        style={styles.buttonGhost}
                        onClick={handleRefreshAll}
                        disabled={!parsedQueryId}
                    >
                        {fetchingStatus ||
                        fetchingIssuer ||
                        fetchingRefValue ||
                        fetchingAsset
                            ? "⏳ 查询中..."
                            : "刷新查询"}
                    </button>

                    {statusData !== undefined && (
                        <p style={{ marginTop: 8 }}>assetStatus：{String(statusData)}</p>
                    )}
                    {issuerData && <p>assetIssuer：{issuerData}</p>}
                    {refValueData !== undefined && (
                        <p>assetReferenceValue：{String(refValueData)}</p>
                    )}
                    {assetData && (
                        <div style={{ marginTop: 8 }}>
                            <p>getAsset：</p>
                            <pre
                                style={{
                                    background: "rgba(255,255,255,0.06)",
                                    padding: 10,
                                    borderRadius: 10,
                                    whiteSpace: "pre-wrap",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                }}
                            >
                                {jsonWithBigInt(assetData)}
                            </pre>
                        </div>
                    )}
                </SectionCard>
            </div>
        </section>
    );
}

// ----------------------------
// ReceivablePool 测试
// ----------------------------
function ReceivablePoolTest() {
    const { address } = useAccount();
    const [assetId, setAssetId] = useState("");
    const [dealId, setDealId] = useState("");
    const [borrower, setBorrower] = useState("");
    const [payer, setPayer] = useState("");
    const [interestRateBps, setInterestRateBps] = useState("800");
    const [tenorDays, setTenorDays] = useState("30");
    const [drawdownAmount, setDrawdownAmount] = useState("0");
    const [depositAmount, setDepositAmount] = useState("0");
    const [lpAddress, setLpAddress] = useState("");

    const parsedAssetId = toBigIntInput(assetId);
    const parsedDealId = toBigIntInput(dealId);

    useEffect(() => {
        if (address) {
            setBorrower((prev) => prev || address);
            setPayer((prev) => prev || address);
            setLpAddress((prev) => prev || address);
        }
    }, [address]);

    const {
        data: poolTx,
        isPending,
        writeContract,
        error: writeError,
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: poolConfirmError,
    } = useWaitForTransactionReceipt({ hash: poolTx });

    const { data: lpBalance, refetch: refetchLpBalance, isFetching: fetchingLp } =
        useReadContract({
            address: RECEIVABLE_POOL_ADDRESS,
            abi: ReceivablePoolAbi,
            functionName: "lpBalanceOf",
            args:
                parsedAssetId && lpAddress
                    ? ([parsedAssetId, lpAddress] as [bigint, `0x${string}`])
                    : undefined,
            query: { enabled: Boolean(parsedAssetId && lpAddress) },
        });

    const { data: poolDeposits, refetch: refetchPoolDeposits } = useReadContract({
        address: RECEIVABLE_POOL_ADDRESS,
        abi: ReceivablePoolAbi,
        functionName: "poolTotalDeposits",
        args: parsedAssetId ? ([parsedAssetId] as [bigint]) : undefined,
        query: { enabled: Boolean(parsedAssetId) },
    });

    const { data: liquidity, refetch: refetchLiquidity } = useReadContract({
        address: RECEIVABLE_POOL_ADDRESS,
        abi: ReceivablePoolAbi,
        functionName: "availableLiquidity",
        args: parsedAssetId ? ([parsedAssetId] as [bigint]) : undefined,
        query: { enabled: Boolean(parsedAssetId) },
    });

    const { data: reserved, refetch: refetchReserved } = useReadContract({
        address: RECEIVABLE_POOL_ADDRESS,
        abi: ReceivablePoolAbi,
        functionName: "reservedInterest",
        args: parsedAssetId ? ([parsedAssetId] as [bigint]) : undefined,
        query: { enabled: Boolean(parsedAssetId) },
    });

    const { data: payoff, refetch: refetchPayoff } = useReadContract({
        address: RECEIVABLE_POOL_ADDRESS,
        abi: ReceivablePoolAbi,
        functionName: "payoffAmount",
        args: parsedDealId ? ([parsedDealId] as [bigint]) : undefined,
        query: { enabled: Boolean(parsedDealId) },
    });

    const handleCreateDeal = () => {
        const borrowerAddr = toAddress(borrower);
        const payerAddr = toAddress(payer);
        if (!parsedAssetId || !borrowerAddr || !payerAddr) {
            alert("请填写 assetId / borrower / payer (有效地址)");
            return;
        }

        writeContract({
            address: RECEIVABLE_POOL_ADDRESS,
            abi: ReceivablePoolAbi,
            functionName: "createFinancingDeal",
            args: [
                parsedAssetId,
                borrowerAddr,
                payerAddr,
                Number(interestRateBps),
                BigInt(tenorDays),
            ],
        });
    };

    const handleDrawdown = () => {
        if (!parsedDealId || !drawdownAmount) {
            alert("请填写 dealId / amount");
            return;
        }

        writeContract({
            address: RECEIVABLE_POOL_ADDRESS,
            abi: ReceivablePoolAbi,
            functionName: "drawdown",
            args: [parsedDealId, BigInt(drawdownAmount)],
        });
    };

    const handleRepay = () => {
        if (!parsedDealId) {
            alert("请填写 dealId");
            return;
        }

        writeContract({
            address: RECEIVABLE_POOL_ADDRESS,
            abi: ReceivablePoolAbi,
            functionName: "repay",
            args: [parsedDealId],
        });
    };

    const handleDeposit = () => {
        if (!parsedAssetId || !depositAmount) {
            alert("请填写 assetId / amount");
            return;
        }

        writeContract({
            address: RECEIVABLE_POOL_ADDRESS,
            abi: ReceivablePoolAbi,
            functionName: "deposit",
            args: [parsedAssetId, BigInt(depositAmount)],
        });
    };

    const handleWithdraw = () => {
        if (!parsedAssetId) {
            alert("请填写 assetId");
            return;
        }

        writeContract({
            address: RECEIVABLE_POOL_ADDRESS,
            abi: ReceivablePoolAbi,
            functionName: "withdraw",
            args: [parsedAssetId],
        });
    };

    const handleRefreshPoolViews = async () => {
        await Promise.all([
            refetchLpBalance(),
            refetchPoolDeposits(),
            refetchLiquidity(),
            refetchReserved(),
            refetchPayoff(),
        ]);
    };

    return (
        <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>🧪 ReceivablePool 融资 & LP 测试</h2>
            <div style={styles.section}>
                <SectionCard
                    title="1) createFinancingDeal（owner）"
                    desc="绑定资产、借款人、代扣方及利率/期限"
                >
                    <label style={styles.label}>
                        assetId
                        <input
                            style={styles.input}
                            value={assetId}
                            onChange={(e) => setAssetId(e.target.value)}
                        />
                    </label>
                    <label style={styles.label}>
                        borrower
                        <input
                            style={styles.input}
                            value={borrower}
                            onChange={(e) => setBorrower(e.target.value)}
                            placeholder="0x..."
                        />
                    </label>
                    <label style={styles.label}>
                        payer
                        <input
                            style={styles.input}
                            value={payer}
                            onChange={(e) => setPayer(e.target.value)}
                            placeholder="0x..."
                        />
                    </label>
                    <label style={styles.label}>
                        利率 bps
                        <input
                            style={styles.input}
                            type="number"
                            value={interestRateBps}
                            onChange={(e) => setInterestRateBps(e.target.value)}
                        />
                    </label>
                    <label style={styles.label}>
                        期限 tenorDays
                        <input
                            style={styles.input}
                            type="number"
                            value={tenorDays}
                            onChange={(e) => setTenorDays(e.target.value)}
                        />
                    </label>
                    <button
                        style={styles.buttonPrimary}
                        disabled={isPending}
                        onClick={handleCreateDeal}
                    >
                        {isPending ? "⏳ 发送中..." : "createFinancingDeal"}
                    </button>
                </SectionCard>

                <SectionCard
                    title="2) drawdown / 3) repay"
                    desc="借款提取与还款"
                >
                    <label style={styles.label}>
                        dealId
                        <input
                            style={styles.input}
                            value={dealId}
                            onChange={(e) => setDealId(e.target.value)}
                        />
                    </label>
                    <label style={styles.label}>
                        提取金额 amount
                        <input
                            style={styles.input}
                            type="number"
                            value={drawdownAmount}
                            onChange={(e) => setDrawdownAmount(e.target.value)}
                        />
                    </label>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button style={styles.buttonGhost} disabled={isPending} onClick={handleDrawdown}>
                            {isPending ? "⏳" : "drawdown"}
                        </button>
                        <button style={styles.buttonGhost} disabled={isPending} onClick={handleRepay}>
                            {isPending ? "⏳" : "repay"}
                        </button>
                    </div>
                </SectionCard>

                <SectionCard
                    title="4) deposit / 5) withdraw"
                    desc="LP 存取款，记得先 approve Pool"
                >
                    <label style={styles.label}>
                        assetId
                        <input
                            style={styles.input}
                            value={assetId}
                            onChange={(e) => setAssetId(e.target.value)}
                        />
                    </label>
                    <label style={styles.label}>
                        存入 amount
                        <input
                            style={styles.input}
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                        />
                    </label>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button style={styles.buttonGhost} disabled={isPending} onClick={handleDeposit}>
                            {isPending ? "⏳" : "deposit"}
                        </button>
                        <button style={styles.buttonGhost} disabled={isPending} onClick={handleWithdraw}>
                            {isPending ? "⏳" : "withdraw"}
                        </button>
                    </div>
                    <p style={{ marginTop: 8, color: "#cbd5e1", fontSize: 13 }}>
                        提示：deposit 前需在 MockUSDT approve 给 Pool 地址。
                    </p>
                </SectionCard>

                <SectionCard title="6-10) 数据查询" desc="lpBalance / poolTotalDeposits / availableLiquidity / reservedInterest / payoffAmount">
                    <label style={styles.label}>
                        LP 地址
                        <input
                            style={styles.input}
                            value={lpAddress}
                            onChange={(e) => setLpAddress(e.target.value)}
                            placeholder="0x..."
                        />
                    </label>
                    <button
                        style={styles.buttonPrimary}
                        disabled={!parsedAssetId && !parsedDealId}
                        onClick={handleRefreshPoolViews}
                    >
                        刷新查询
                    </button>

                    {lpBalance !== undefined && (
                        <p style={{ marginTop: 8 }}>
                            lpBalanceOf：{String(lpBalance)}
                            {fetchingLp ? "（刷新中...）" : ""}
                        </p>
                    )}
                    {poolDeposits !== undefined && (
                        <p>poolTotalDeposits：{String(poolDeposits)}</p>
                    )}
                    {liquidity !== undefined && (
                        <p>availableLiquidity：{String(liquidity)}</p>
                    )}
                    {reserved !== undefined && (
                        <p>reservedInterest：{String(reserved)}</p>
                    )}
                    {payoff !== undefined && <p>payoffAmount：{String(payoff)}</p>}
                </SectionCard>
            </div>

            {poolTx && <p style={{ marginTop: 8 }}>📡 交易 Hash：{poolTx}</p>}
            {isConfirming && <p>⏳ 交易确认中...</p>}
            {isConfirmed && <p>✅ 交易执行成功</p>}

            {writeError && (
                <p style={{ color: "#fca5a5" }}>❌ 写入错误：{writeError.message}</p>
            )}
            {poolConfirmError && (
                <p style={{ color: "#fca5a5" }}>⚠️ 确认错误：{poolConfirmError.message}</p>
            )}
        </section>
    );
}

// ----------------------------
// MockUSDT 测试
// ----------------------------
function MockUSDTTest() {
    const { address } = useAccount();
    const [mintTo, setMintTo] = useState("");
    const [mintAmount, setMintAmount] = useState("1000000"); // 1 USDT (6 decimals)
    const [balanceAddress, setBalanceAddress] = useState("");

    useEffect(() => {
        if (address) {
            setMintTo((prev) => prev || address);
            setBalanceAddress((prev) => prev || address);
        }
    }, [address]);

    const { data: tokenName } = useReadContract({
        address: MOCK_USDT_ADDRESS,
        abi: MockUSDTAbi,
        functionName: "name",
    });

    const { data: tokenSymbol } = useReadContract({
        address: MOCK_USDT_ADDRESS,
        abi: MockUSDTAbi,
        functionName: "symbol",
    });

    const { data: tokenDecimals } = useReadContract({
        address: MOCK_USDT_ADDRESS,
        abi: MockUSDTAbi,
        functionName: "decimals",
    });

    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: MOCK_USDT_ADDRESS,
        abi: MockUSDTAbi,
        functionName: "balanceOf",
        args: balanceAddress
            ? ([balanceAddress] as [`0x${string}`])
            : undefined,
        query: { enabled: Boolean(balanceAddress) },
    });

    const {
        data: mintTx,
        isPending,
        writeContract,
        error: mintError,
    } = useWriteContract();

    const {
        isLoading: mintConfirming,
        isSuccess: mintConfirmed,
        error: mintConfirmError,
    } = useWaitForTransactionReceipt({ hash: mintTx });

    const handleMint = () => {
        const mintAddr = toAddress(mintTo);
        if (!mintAddr || !mintAmount) {
            alert("请填写合法的 mint 地址和数量");
            return;
        }

        writeContract({
            address: MOCK_USDT_ADDRESS,
            abi: MockUSDTAbi,
            functionName: "mint",
            args: [mintAddr, BigInt(mintAmount)],
        });
    };

    return (
        <section style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>🧪 MockUSDT 测试</h2>
            <div style={styles.section}>
                <SectionCard
                    title="代币信息"
                    desc="constructor: Mock Tether USD (mUSDT)"
                >
                    <p>
                        name {tokenName} / symbol {tokenSymbol} / decimals{" "}
                        {tokenDecimals !== undefined ? Number(tokenDecimals) : "-"}
                    </p>
                </SectionCard>

                <SectionCard title="mint" desc="铸造给指定地址（6 位小数）">
                    <label style={styles.label}>
                        接收地址
                        <input
                            style={styles.input}
                            value={mintTo}
                            onChange={(e) => setMintTo(e.target.value)}
                            placeholder="0x..."
                        />
                    </label>
                    <label style={styles.label}>
                        数量（最小单位，默认 1 USDT = 1,000,000）
                        <input
                            style={styles.input}
                            type="number"
                            value={mintAmount}
                            onChange={(e) => setMintAmount(e.target.value)}
                        />
                    </label>
                    <button
                        style={styles.buttonPrimary}
                        disabled={isPending}
                        onClick={handleMint}
                    >
                        {isPending ? "⏳ 铸造中..." : "mint"}
                    </button>
                    {mintTx && <p style={{ marginTop: 8 }}>📡 交易 Hash：{mintTx}</p>}
                    {mintConfirming && <p>⏳ 确认中...</p>}
                    {mintConfirmed && <p>✅ mint 成功</p>}
                    {mintError && (
                        <p style={{ color: "#fca5a5" }}>❌ 写入错误：{mintError.message}</p>
                    )}
                    {mintConfirmError && (
                        <p style={{ color: "#fca5a5" }}>
                            ⚠️ 确认错误：{mintConfirmError.message}
                        </p>
                    )}
                </SectionCard>

                <SectionCard title="balanceOf" desc="查询任意地址余额">
                    <label style={styles.label}>
                        地址
                        <input
                            style={styles.input}
                            value={balanceAddress}
                            onChange={(e) => setBalanceAddress(e.target.value)}
                            placeholder="0x..."
                        />
                    </label>
                    <button
                        style={styles.buttonGhost}
                        onClick={() => balanceAddress && refetchBalance()}
                        disabled={!balanceAddress}
                    >
                        查询余额
                    </button>
                    {balance !== undefined && (
                        <p style={{ marginTop: 8 }}>余额：{String(balance)}</p>
                    )}
                </SectionCard>
            </div>
        </section>
    );
}

// ----------------------------
// 页面主体
// ----------------------------
export default function TestPage() {
    const { address, chainId, isConnected } = useAccount();

    const { connectors, connect, error, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    // 读取 Registry.owner()
    const { data: owner } = useReadContract({
        address: REGISTRY_ADDRESS,
        abi: CommodityAssetRegistryAbi,
        functionName: "owner",
    });

    return (
        <main style={styles.page}>
            <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 800 }}>
                    🔍 BSC Testnet 合约交互台
                </div>
                <div style={{ color: "#94a3b8" }}>
                    Wallet → Pool → Registry 流程测试，含融资、LP、MockUSDT。
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={styles.badge}>Pool: {RECEIVABLE_POOL_ADDRESS}</span>
                    <span style={styles.badge}>Registry: {REGISTRY_ADDRESS}</span>
                    <span style={styles.badge}>MockUSDT: {MOCK_USDT_ADDRESS}</span>
                </div>
            </header>

            <section style={{ marginTop: 24 }}>
                <div style={styles.section}>
                    <SectionCard title="钱包连接" desc="先连接再操作">
                        {isConnected ? (
                            <>
                                <p>✅ 已连接</p>
                                <p>地址：{address}</p>
                                <p>链 ID：{chainId}</p>

                                <button style={styles.buttonGhost} onClick={() => disconnect()}>
                                    断开连接
                                </button>
                            </>
                        ) : (
                            <>
                                <p>当前未连接钱包</p>

                                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                    {connectors.map((connector) => (
                                        <button
                                            key={connector.uid}
                                            style={styles.buttonPrimary}
                                            disabled={isPending}
                                            onClick={() => connect({ connector })}
                                        >
                                            {connector.name}
                                            {isPending ? " 连接中..." : ""}
                                        </button>
                                    ))}
                                </div>

                                {error && (
                                    <p style={{ color: "#fca5a5", marginTop: 8 }}>
                                        错误：{error.message}
                                    </p>
                                )}
                            </>
                        )}
                    </SectionCard>

                    <SectionCard title="Registry.owner()" desc="应为 Pool 地址">
                        <p>Owner: {String(owner)}</p>
                    </SectionCard>
                </div>
            </section>

            <RegisterAssetTest />
            <RegistryQueries />
            <ReceivablePoolTest />
            <MockUSDTTest />
        </main>
    );
}
