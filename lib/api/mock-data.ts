// Mock 数据 - 用于开发测试
import type { Task, User, PointRecord, StreamerStats, LeaderboardEntry } from '@/types/attention';

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Binance Square 深度解析：Web3 新叙事',
    streamerName: 'CryptoKing',
    streamUrl: 'https://www.binance.com/zh-CN/live/video?roomId=2179393',
    reward: 100,
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    participantCount: 1267,
  },
  {
    id: 'task-2',
    title: 'BTC 暴涨解析：十年回顾与未来展望',
    streamerName: 'CryptoLegend',
    streamUrl: 'https://www.binance.com/zh-CN/live/video?roomId=2179394',
    reward: 150,
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    participantCount: 8006,
  },
  {
    id: 'task-3',
    title: 'Attention Layer 独家访谈 & 交流探讨',
    streamerName: 'Archie_Huang',
    streamUrl: 'https://www.binance.com/zh-CN/live/video?roomId=2179395',
    reward: 200,
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 5400000).toISOString(),
    participantCount: 5180,
  },
  {
    id: 'task-4',
    title: 'ETH L2 生态大爆发：机会在哪里？',
    streamerName: 'EthereumJS',
    streamUrl: 'https://www.binance.com/zh-CN/live/video?roomId=2179396',
    reward: 120,
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 4800000).toISOString(),
    participantCount: 3400,
  },
];

export const mockUser: User = {
  id: 'user-123',
  username: 'CryptoFan',
  totalPoints: 2580,
  rank: 42,
};

export const mockPointRecords: PointRecord[] = [
  {
    id: 'record-1',
    taskId: 'task-1',
    taskTitle: 'BTC 行情分析直播',
    points: 100,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: 'earn',
  },
  {
    id: 'record-2',
    taskId: 'task-2',
    taskTitle: 'ETH 2.0 技术解读',
    points: 150,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: 'earn',
  },
];

export const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: 50 }, (_, i) => ({
  rank: i + 1,
  username: `User${i + 1}`,
  points: 10000 - i * 150,
}));

export const mockStreamerStats: StreamerStats[] = [
  {
    taskId: 'task-1',
    taskTitle: 'BTC 行情分析直播',
    activeViewers: 1234,
    totalPoints: 123400,
    verificationRate: 0.78,
  },
];
