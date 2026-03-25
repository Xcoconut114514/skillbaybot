'use client';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  // 调试信息
  console.log('🔍 ConnectWallet 组件状态:', {
    isConnected,
    connectorsCount: connectors?.length || 0,
    connectors: connectors?.map(c => ({ id: c.id, type: c.type, name: c.name })),
    status,
    hasError: !!error
  });

  // 监听连接状态变化
  useEffect(() => {
    if (status === 'success') {
      console.log('✅ 连接成功！');
    } else if (status === 'error') {
      console.log('❌ 连接失败:', error);
    }
  }, [status, error]);

  // 防止 hydration 错误
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <button 
          disabled
          className="inline-flex items-center z-10 justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:bg-accent disabled:text-muted-foreground bg-blue-500/20 hover:bg-blue-500/15 text-blue-400 rounded-xl h-10 px-4 py-2"
        >
          Connect
        </button>
      </div>
    );
  }

  const handleConnect = async () => {
    console.log('🔗 开始钱包连接');
    console.log('📋 可用连接器:', connectors);
    
    try {
      // 检测可用的钱包
      if (typeof window === 'undefined') {
        alert('请在浏览器环境中使用');
        return;
      }

      // 处理多钱包冲突：优先使用 MetaMask
      let provider = window.ethereum;
      
      if (window.ethereum?.providers?.length) {
        // 多个钱包扩展存在
        console.log('🔍 检测到多个钱包:', window.ethereum.providers.length);
        
        // 尝试找到 MetaMask
        const metamaskProvider = window.ethereum.providers.find(
          (p: any) => p.isMetaMask && !p.isOkxWallet
        );
        
        if (metamaskProvider) {
          provider = metamaskProvider;
          console.log('✅ 使用 MetaMask');
        } else {
          console.log('⚠️ 未找到 MetaMask，使用默认钱包');
        }
      } else if (!window.ethereum) {
        alert('未检测到钱包扩展，请安装 MetaMask 或 OKX 钱包');
        return;
      }
      
      // 获取当前链 ID（用于调试）
      const chainId = await provider.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);
      console.log('🔗 当前链 ID:', currentChainId, '(31337=localhost, 97=BSC Testnet)');
      
      // 本地测试：直接连接，不切换网络
      // 生产环境：可以根据需要添加网络切换逻辑
      
      // 连接钱包
      console.log('🔌 尝试连接钱包...');
      const injectedConnector = connectors.find(c => c.type === 'injected' || c.id === 'injected');
      console.log('🔍 找到的连接器:', injectedConnector);
      
      if (injectedConnector) {
        console.log('✅ 使用 injected 连接器');
        connect({ connector: injectedConnector });
      } else if (connectors.length > 0) {
        console.log('✅ 使用第一个可用连接器:', connectors[0]);
        connect({ connector: connectors[0] });
      } else {
        console.error('❌ 没有可用的连接器');
        alert('没有可用的钱包连接器');
      }
    } catch (err: any) {
      console.error('❌ 连接失败:', err);
      if (err.code !== 4001) { // 4001 = 用户拒绝
        alert('连接失败: ' + err.message);
      }
    }
  };

  if (error) {
    console.error('Connection error:', error);
  }

  const isLoading = status === 'pending';

  if (!isConnected) {
    return (
      <div className="flex items-center gap-3">
        <button 
          onClick={handleConnect} 
          disabled={isLoading}
          className="inline-flex items-center z-10 justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:bg-accent disabled:text-muted-foreground bg-blue-500/20 hover:bg-blue-500/15 text-blue-400 rounded-xl h-10 px-4 py-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              Connecting...
            </>
          ) : (
            'Connect'
          )}
        </button>
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Error: {error.message}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-green-400">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}
        </span>
      </div>
      <button 
        onClick={() => disconnect()}
        className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-500/30 text-red-400 font-medium rounded-xl hover:from-red-500/30 hover:to-pink-500/30 hover:text-red-300 transition-all duration-300 hover:scale-105"
      >
        Disconnect
      </button>
    </div>
  );
}
