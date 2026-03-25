'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Avatar } from '@heroui/avatar';
import { getLeaderboard } from '@/lib/api/attention';
import type { LeaderboardEntry } from '@/types/attention';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard(50);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">排行榜</h1>

      <Card>
        <CardBody className="p-0">
          <div className="divide-y divide-default-200">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between p-4 hover:bg-default-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center">
                    {getMedalEmoji(entry.rank) || (
                      <span className="text-lg font-semibold text-default-500">
                        {entry.rank}
                      </span>
                    )}
                  </div>
                  <Avatar
                    src={entry.avatar}
                    name={entry.username}
                    size="md"
                  />
                  <span className="font-medium">{entry.username}</span>
                </div>
                <span className="text-warning font-semibold text-lg">
                  {entry.points.toLocaleString()} 积分
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
