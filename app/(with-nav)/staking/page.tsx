'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Tabs, Tab } from '@heroui/tabs';
import { Chip } from '@heroui/chip';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { 
  ATTENTION_TOKEN_ADDRESS, 
  STREAMER_STAKING_POOL_ADDRESS,
  VIEWER_REWARD_POOL_ADDRESS,
  STAKING_CONFIG 
} from '@/lib/contracts/staking';
import AttentionTokenABI from '@/lib/abi/AttentionToken.json';
import StreamerStakingPoolABI from '@/lib/abi/StreamerStakingPool.json';
import ViewerRewardPoolABI from '@/lib/abi/ViewerRewardPool.json';

// Task status enum matching contract
const TaskStatus = {
  0: 'Active',
  1: 'Ended',
  2: 'Claimed',
  3: 'Unstaked'
};

// TaskCard component to display individual task
function TaskCard({ 
  taskId, 
  onEndTask, 
  onClaimReward, 
  onUnstake,
  isEnding,
  isClaiming,
  isUnstaking,
  endTaskSuccess,
  claimSuccess,
  unstakeSuccess
}: { 
  taskId: number;
  onEndTask: (id: number) => void;
  onClaimReward: (id: number) => void;
  onUnstake: (id: number) => void;
  isEnding: boolean;
  isClaiming: boolean;
  isUnstaking: boolean;
  endTaskSuccess: boolean;
  claimSuccess: boolean;
  unstakeSuccess: boolean;
}) {
  const { data: task, refetch: refetchTask } = useReadContract({
    address: STREAMER_STAKING_POOL_ADDRESS,
    abi: StreamerStakingPoolABI,
    functionName: 'tasks',
    args: [BigInt(taskId)],
  });

  // Auto-refresh when transactions succeed
  useEffect(() => {
    if (endTaskSuccess || claimSuccess || unstakeSuccess) {
      refetchTask();
    }
  }, [endTaskSuccess, claimSuccess, unstakeSuccess, refetchTask]);

  if (!task || !Array.isArray(task)) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-gray-500">Loading task #{taskId}...</p>
      </div>
    );
  }

  const [streamer, stakedAmount, startTime, endTime, duration, rewardRate, totalViewers, totalPoints, streamerReward, status, unstakeTime] = task;
  const statusText = TaskStatus[Number(status) as keyof typeof TaskStatus] || 'Unknown';
  const now = Math.floor(Date.now() / 1000);
  const canEnd = now >= Number(endTime) && Number(status) === 0;
  const canClaim = Number(status) === 1;
  const canUnstake = Number(status) === 2 && Number(unstakeTime) > 0 && now >= Number(unstakeTime);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-bold">Task #{taskId}</h4>
          <Chip 
            color={
              Number(status) === 0 ? 'success' : 
              Number(status) === 1 ? 'warning' : 
              Number(status) === 2 ? 'primary' : 
              'default'
            }
            size="sm"
            className="mt-1"
          >
            {statusText}
          </Chip>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Staked Amount</p>
          <p className="text-xl font-bold">{formatEther(stakedAmount)} ATT</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Start Time</p>
          <p className="text-sm font-medium">{new Date(Number(startTime) * 1000).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">End Time</p>
          <p className="text-sm font-medium">{new Date(Number(endTime) * 1000).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Duration</p>
          <p className="text-sm font-medium">{Number(duration) / 60} minutes</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Reward Rate</p>
          <p className="text-sm font-medium">{Number(rewardRate) / 100}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Viewers</p>
          <p className="text-sm font-medium">{Number(totalViewers)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Points</p>
          <p className="text-sm font-medium">{Number(totalPoints)}</p>
        </div>
      </div>

      {Number(streamerReward) > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">Streamer Reward</p>
          <p className="text-lg font-bold text-green-600">{formatEther(streamerReward)} ATT</p>
        </div>
      )}

      {Number(status) === 2 && Number(unstakeTime) > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600">Unstake Available</p>
          <p className="text-sm font-medium">
            {now >= Number(unstakeTime) 
              ? 'Now' 
              : new Date(Number(unstakeTime) * 1000).toLocaleString()}
          </p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {canEnd && (
          <Button
            color="warning"
            size="sm"
            onPress={() => onEndTask(taskId)}
            isLoading={isEnding}
            isDisabled={isEnding}
          >
            End Task
          </Button>
        )}
        {canClaim && (
          <Button
            color="success"
            size="sm"
            onPress={() => onClaimReward(taskId)}
            isLoading={isClaiming}
            isDisabled={isClaiming}
          >
            Claim Reward
          </Button>
        )}
        {canUnstake && (
          <Button
            color="primary"
            size="sm"
            onPress={() => onUnstake(taskId)}
            isLoading={isUnstaking}
            isDisabled={isUnstaking}
          >
            Unstake
          </Button>
        )}
        {Number(status) === 0 && !canEnd && (
          <p className="text-sm text-gray-500 flex items-center">
            Task ends in {Math.max(0, Math.floor((Number(endTime) - now) / 60))} minutes
          </p>
        )}
      </div>
    </div>
  );
}

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('streamer');

  // Streamer staking state
  const [stakeAmount, setStakeAmount] = useState('');
  const [duration, setDuration] = useState('10'); // 10 seconds default for testing
  const [rewardRate, setRewardRate] = useState('500'); // 5% default

  // Read streamer's task IDs
  const { data: taskIds, refetch: refetchTaskIds } = useReadContract({
    address: STREAMER_STAKING_POOL_ADDRESS,
    abi: StreamerStakingPoolABI,
    functionName: 'getStreamerTasks',
    args: address ? [address] : undefined,
  });

  // Read ATT balance
  const { data: attBalance } = useReadContract({
    address: ATTENTION_TOKEN_ADDRESS,
    abi: AttentionTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read viewer reward account
  const { data: viewerAccount } = useReadContract({
    address: VIEWER_REWARD_POOL_ADDRESS,
    abi: ViewerRewardPoolABI,
    functionName: 'getViewerAccount',
    args: address ? [address] : undefined,
  });

  // Read claimable tokens
  const { data: claimableTokens } = useReadContract({
    address: VIEWER_REWARD_POOL_ADDRESS,
    abi: ViewerRewardPoolABI,
    functionName: 'getClaimableTokens',
    args: address ? [address] : undefined,
  });

  // Write contracts
  const { writeContract: approveToken, data: approveHash } = useWriteContract();
  const { writeContract: createTask, data: createTaskHash } = useWriteContract();
  const { writeContract: endTask, data: endTaskHash } = useWriteContract();
  const { writeContract: claimStreamerReward, data: claimStreamerHash } = useWriteContract();
  const { writeContract: unstakeTokens, data: unstakeHash } = useWriteContract();
  const { writeContract: claimReward, data: claimHash } = useWriteContract();

  // Wait for transactions
  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isCreating, isSuccess: createSuccess } = useWaitForTransactionReceipt({ hash: createTaskHash });
  const { isLoading: isEnding, isSuccess: endTaskSuccess } = useWaitForTransactionReceipt({ hash: endTaskHash });
  const { isLoading: isClaimingStreamer, isSuccess: claimStreamerSuccess } = useWaitForTransactionReceipt({ hash: claimStreamerHash });
  const { isLoading: isUnstaking, isSuccess: unstakeSuccess } = useWaitForTransactionReceipt({ hash: unstakeHash });
  const { isLoading: isClaiming } = useWaitForTransactionReceipt({ hash: claimHash });

  // Refetch task list when task is created
  useEffect(() => {
    if (createSuccess) {
      refetchTaskIds();
    }
  }, [createSuccess, refetchTaskIds]);

  const handleApprove = async () => {
    if (!stakeAmount) return;
    
    approveToken({
      address: ATTENTION_TOKEN_ADDRESS,
      abi: AttentionTokenABI,
      functionName: 'approve',
      args: [STREAMER_STAKING_POOL_ADDRESS, parseEther(stakeAmount)],
    });
  };

  const handleCreateTask = async () => {
    if (!stakeAmount || !duration || !rewardRate) return;

    createTask({
      address: STREAMER_STAKING_POOL_ADDRESS,
      abi: StreamerStakingPoolABI,
      functionName: 'createStreamingTask',
      args: [parseEther(stakeAmount), BigInt(duration), BigInt(rewardRate)],
    });
  };

  const handleEndTask = async (taskId: number) => {
    endTask({
      address: STREAMER_STAKING_POOL_ADDRESS,
      abi: StreamerStakingPoolABI,
      functionName: 'endStreamingTask',
      args: [BigInt(taskId)],
    });
  };

  const handleClaimStreamerReward = async (taskId: number) => {
    claimStreamerReward({
      address: STREAMER_STAKING_POOL_ADDRESS,
      abi: StreamerStakingPoolABI,
      functionName: 'claimStreamerReward',
      args: [BigInt(taskId)],
    });
  };

  const handleUnstake = async (taskId: number) => {
    unstakeTokens({
      address: STREAMER_STAKING_POOL_ADDRESS,
      abi: StreamerStakingPoolABI,
      functionName: 'unstake',
      args: [BigInt(taskId)],
    });
  };

  const handleClaimReward = async () => {
    claimReward({
      address: VIEWER_REWARD_POOL_ADDRESS,
      abi: ViewerRewardPoolABI,
      functionName: 'claimReward',
    });
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600">Please connect your wallet to access staking features</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Staking</h1>
        <p className="text-gray-600">Stake ATT tokens to earn rewards</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Your ATT Balance</p>
              <p className="text-2xl font-bold">
                {attBalance ? formatEther(attBalance as bigint) : '0'} ATT
              </p>
            </div>
            <Chip color="primary" variant="flat">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </Chip>
          </div>
        </CardBody>
      </Card>

      <Tabs 
        selectedKey={activeTab} 
        onSelectionChange={(key) => setActiveTab(key as string)}
        className="mb-6"
      >
        <Tab key="streamer" title="Streamer Staking">
          {/* My Tasks Section */}
          {taskIds && Array.isArray(taskIds) && taskIds.length > 0 ? (
            <Card className="mb-6">
              <CardHeader>
                <h3 className="text-xl font-bold">My Tasks</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                {taskIds.map((taskId: bigint) => (
                  <TaskCard 
                    key={taskId.toString()} 
                    taskId={Number(taskId)}
                    onEndTask={handleEndTask}
                    onClaimReward={handleClaimStreamerReward}
                    onUnstake={handleUnstake}
                    isEnding={isEnding}
                    isClaiming={isClaimingStreamer}
                    isUnstaking={isUnstaking}
                    endTaskSuccess={endTaskSuccess}
                    claimSuccess={claimStreamerSuccess}
                    unstakeSuccess={unstakeSuccess}
                  />
                ))}
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <h3 className="text-xl font-bold">Create Streaming Task</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <Input
                  label="Stake Amount (ATT)"
                  placeholder="1000"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  type="number"
                  description={`Minimum: ${STAKING_CONFIG.minStakeAmount} ATT`}
                />
              </div>

              <div>
                <Input
                  label="Duration (seconds)"
                  placeholder="10"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  type="number"
                  description="Minimum: 10 seconds, Maximum: 86400 (24 hours)"
                />
              </div>

              <div>
                <Input
                  label="Reward Rate (basis points)"
                  placeholder="500"
                  value={rewardRate}
                  onChange={(e) => setRewardRate(e.target.value)}
                  type="number"
                  description="100 = 1%, 500 = 5%, 1000 = 10%"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Stake ATT tokens to create a streaming task</li>
                  <li>Earn rewards based on viewer engagement</li>
                  <li>Higher viewer count = higher rewards</li>
                  <li>Platform fee: {STAKING_CONFIG.platformFeeRate / 100}%</li>
                  <li>Unstake cooldown: {STAKING_CONFIG.unstakeCooldown} seconds (for testing)</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  color="primary"
                  variant="flat"
                  onPress={handleApprove}
                  isLoading={isApproving}
                  isDisabled={!stakeAmount || isApproving}
                >
                  1. Approve ATT
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreateTask}
                  isLoading={isCreating}
                  isDisabled={!stakeAmount || isCreating}
                >
                  2. Create Task
                </Button>
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="viewer" title="Viewer Rewards">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-bold">Claim Your Rewards</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Points</p>
                  <p className="text-2xl font-bold">
                    {viewerAccount && Array.isArray(viewerAccount) ? Number(viewerAccount[0]) : 0}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Pending Points</p>
                  <p className="text-2xl font-bold">
                    {viewerAccount && Array.isArray(viewerAccount) ? Number(viewerAccount[2]) : 0}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Claimable ATT</p>
                  <p className="text-2xl font-bold">
                    {claimableTokens ? formatEther(claimableTokens as bigint) : '0'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Claimed</p>
                  <p className="text-2xl font-bold">
                    {viewerAccount && Array.isArray(viewerAccount) && viewerAccount[3] 
                      ? formatEther(viewerAccount[3] as bigint) 
                      : '0'}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Conversion Rate:</h4>
                <p className="text-sm">
                  {STAKING_CONFIG.pointsPerToken} points = 1 ATT token
                </p>
                <p className="text-sm mt-1">
                  Minimum to claim: {STAKING_CONFIG.minClaimPoints} points
                </p>
              </div>

              <Button
                color="success"
                size="lg"
                className="w-full"
                onPress={handleClaimReward}
                isLoading={isClaiming}
                isDisabled={!claimableTokens || Number(claimableTokens) === 0 || isClaiming}
              >
                Claim Rewards
              </Button>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
