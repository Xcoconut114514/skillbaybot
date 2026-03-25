'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { STREAMER_STAKING_POOL_ADDRESS } from '@/lib/contracts/staking';
import StreamerStakingPoolABI from '@/lib/abi/StreamerStakingPool.json';

const STATUS_MAP = {
  0: { label: 'Active', color: 'success' as const },
  1: { label: 'Ended', color: 'warning' as const },
  2: { label: 'Claimed', color: 'primary' as const },
  3: { label: 'Unstaked', color: 'default' as const },
};

export default function MyTasksPage() {
  const { address, isConnected } = useAccount();
  const [selectedTaskId, setSelectedTaskId] = useState<bigint | null>(null);

  // Read streamer tasks
  const { data: taskIds, refetch: refetchTasks } = useReadContract({
    address: STREAMER_STAKING_POOL_ADDRESS,
    abi: StreamerStakingPoolABI,
    functionName: 'getStreamerTasks',
    args: address ? [address] : undefined,
  });

  // Write contracts
  const { writeContract: endTask, data: endTaskHash } = useWriteContract();
  const { writeContract: claimReward, data: claimHash } = useWriteContract();
  const { writeContract: unstake, data: unstakeHash } = useWriteContract();

  // Wait for transactions
  const { isSuccess: isEndSuccess } = useWaitForTransactionReceipt({ hash: endTaskHash });
  const { isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });
  const { isSuccess: isUnstakeSuccess } = useWaitForTransactionReceipt({ hash: unstakeHash });

  // Refetch tasks after successful transactions
  useEffect(() => {
    if (isEndSuccess || isClaimSuccess || isUnstakeSuccess) {
      refetchTasks();
    }
  }, [isEndSuccess, isClaimSuccess, isUnstakeSuccess, refetchTasks]);

  const handleEndTask = (taskId: bigint) => {
    endTask({
      address: STREAMER_STAKING_POOL_ADDRESS,
      abi: StreamerStakingPoolABI,
      functionName: 'endStreamingTask',
      args: [taskId],
    });
  };

  const handleClaimReward = (taskId: bigint) => {
    claimReward({
      address: STREAMER_STAKING_POOL_ADDRESS,
      abi: StreamerStakingPoolABI,
      functionName: 'claimStreamerReward',
      args: [taskId],
    });
  };

  const handleUnstake = (taskId: bigint) => {
    unstake({
      address: STREAMER_STAKING_POOL_ADDRESS,
      abi: StreamerStakingPoolABI,
      functionName: 'unstake',
      args: [taskId],
    });
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600">Please connect your wallet to view your tasks</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const tasks = taskIds as bigint[] | undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Staking Tasks</h1>
        <p className="text-gray-600">Manage your streaming tasks and rewards</p>
      </div>

      {!tasks || tasks.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <p className="text-gray-600 mb-4">You don't have any staking tasks yet</p>
            <Button color="primary" href="/staking">
              Create Your First Task
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((taskId) => (
            <TaskCard
              key={taskId.toString()}
              taskId={taskId}
              onEndTask={handleEndTask}
              onClaimReward={handleClaimReward}
              onUnstake={handleUnstake}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({
  taskId,
  onEndTask,
  onClaimReward,
  onUnstake,
}: {
  taskId: bigint;
  onEndTask: (taskId: bigint) => void;
  onClaimReward: (taskId: bigint) => void;
  onUnstake: (taskId: bigint) => void;
}) {
  const { data: task } = useReadContract({
    address: STREAMER_STAKING_POOL_ADDRESS,
    abi: StreamerStakingPoolABI,
    functionName: 'getTask',
    args: [taskId],
  });

  if (!task) return null;

  const [
    streamer,
    stakedAmount,
    startTime,
    endTime,
    duration,
    rewardRate,
    totalViewers,
    totalPoints,
    streamerReward,
    status,
    unstakeTime,
  ] = task as any[];

  const statusInfo = STATUS_MAP[status as keyof typeof STATUS_MAP];
  const now = Math.floor(Date.now() / 1000);
  const canEnd = status === 0 && now >= Number(endTime);
  const canClaim = status === 1;
  const canUnstake = status === 2 && now >= Number(unstakeTime);

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <h3 className="text-xl font-bold">Task #{taskId.toString()}</h3>
          <p className="text-sm text-gray-600">
            {new Date(Number(startTime) * 1000).toLocaleString()}
          </p>
        </div>
        <Chip color={statusInfo.color} variant="flat">
          {statusInfo.label}
        </Chip>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Staked Amount</p>
            <p className="text-lg font-bold">{formatEther(stakedAmount)} ATT</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reward Rate</p>
            <p className="text-lg font-bold">{Number(rewardRate) / 100}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Viewers</p>
            <p className="text-lg font-bold">{Number(totalViewers)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Points</p>
            <p className="text-lg font-bold">{Number(totalPoints)}</p>
          </div>
        </div>

        {status >= 1 && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600">Streamer Reward</p>
            <p className="text-2xl font-bold">{formatEther(streamerReward)} ATT</p>
          </div>
        )}

        <div className="flex gap-2">
          {canEnd && (
            <Button color="warning" onPress={() => onEndTask(taskId)}>
              End Task
            </Button>
          )}
          {canClaim && (
            <Button color="success" onPress={() => onClaimReward(taskId)}>
              Claim Reward
            </Button>
          )}
          {canUnstake && (
            <Button color="primary" onPress={() => onUnstake(taskId)}>
              Unstake
            </Button>
          )}
          {status === 2 && !canUnstake && (
            <Chip color="warning" variant="flat">
              Cooldown until {new Date(Number(unstakeTime) * 1000).toLocaleString()}
            </Chip>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
