'use client';

import { Card, CardBody } from '@heroui/card';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/api/attention';
import type { User } from '@/types/attention';

export function PointsWidget() {
  const [user, setUser] = useState<User | null>(null);
  const userId = 'user-123';

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await getUser(userId);
      setUser(data);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  if (!user) return null;

  return (
    <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30">
      <CardBody className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💎</span>
          <span className="text-sm text-default-500">我的积分</span>
        </div>
        <div className="text-3xl font-bold text-green-500">
          {user.totalPoints.toLocaleString()} PTS
        </div>
        <div className="text-xs text-default-400 mt-1">
          ≈ ${(user.totalPoints * 0.01).toFixed(2)} USDT
        </div>
      </CardBody>
    </Card>
  );
}
