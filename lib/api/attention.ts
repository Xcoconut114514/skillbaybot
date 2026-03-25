// Attention LIVE API 服务层
import type { Task, User, PointRecord, VerificationResult, StreamerStats, LeaderboardEntry } from '@/types/attention';
import { mockTasks, mockUser, mockPointRecords, mockLeaderboard, mockStreamerStats } from './mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || !process.env.NEXT_PUBLIC_API_URL;

// 通用请求函数
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Mock 延迟模拟网络请求
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// 获取所有任务列表
export async function getTasks(): Promise<Task[]> {
  if (USE_MOCK) {
    await mockDelay();
    return mockTasks;
  }
  return fetchAPI<Task[]>('/tasks');
}

// 获取单个任务详情
export async function getTask(taskId: string): Promise<Task> {
  if (USE_MOCK) {
    await mockDelay();
    const task = mockTasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    return task;
  }
  return fetchAPI<Task>(`/tasks/${taskId}`);
}

// 提交验证码
export async function submitVerificationCode(
  taskId: string,
  code: string,
  userId: string
): Promise<VerificationResult> {
  if (USE_MOCK) {
    await mockDelay();
    // Mock 验证逻辑：验证码为 "1234" 时成功
    if (code === '1234') {
      return { success: true, points: 100, message: '验证成功！' };
    }
    return { success: false, message: '验证码错误，请重试' };
  }
  return fetchAPI<VerificationResult>('/verify', {
    method: 'POST',
    body: JSON.stringify({ taskId, code, userId }),
  });
}

// 获取用户信息
export async function getUser(userId: string): Promise<User> {
  if (USE_MOCK) {
    await mockDelay();
    return mockUser;
  }
  return fetchAPI<User>(`/users/${userId}`);
}

// 获取用户积分记录
export async function getPointRecords(userId: string): Promise<PointRecord[]> {
  if (USE_MOCK) {
    await mockDelay();
    return mockPointRecords;
  }
  return fetchAPI<PointRecord[]>(`/users/${userId}/points`);
}

// 获取排行榜
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  if (USE_MOCK) {
    await mockDelay();
    return mockLeaderboard.slice(0, limit);
  }
  return fetchAPI<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`);
}

// 获取主播统计数据
export async function getStreamerStats(streamerId: string): Promise<StreamerStats[]> {
  if (USE_MOCK) {
    await mockDelay();
    return mockStreamerStats;
  }
  return fetchAPI<StreamerStats[]>(`/streamers/${streamerId}/stats`);
}
