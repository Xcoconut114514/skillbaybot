'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Mock 登录，实际应调用后端 API
    if (username.trim()) {
      localStorage.setItem('userId', 'user-123');
      localStorage.setItem('username', username);
      router.push('/tasks');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pb-6">
          <h1 className="text-3xl font-bold">Attention LIVE</h1>
          <p className="text-default-500">Watch-to-Earn 直播激励平台</p>
        </CardHeader>
        <CardBody className="gap-4">
          <Input
            label="用户名"
            placeholder="输入你的用户名"
            value={username}
            onValueChange={setUsername}
          />
          
          <Button
            color="primary"
            size="lg"
            className="w-full"
            onPress={handleLogin}
            isDisabled={!username.trim()}
          >
            开始体验
          </Button>

          <div className="text-center text-sm text-default-500">
            <p>或使用币安账号登录（即将推出）</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
