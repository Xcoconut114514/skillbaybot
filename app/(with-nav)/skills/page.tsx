'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { SKILL_NFT_ADDRESS, SKILL_MARKET_ADDRESS } from '@/lib/contracts/skills';
import SkillNFTABI from '@/lib/abi/SkillNFT.json';
import SkillMarketABI from '@/lib/abi/SkillMarket.json';
import { generateCode } from '@/lib/activation-code';

interface SkillInfo {
  name: string;
  description: string;
  price: bigint;
  isActive: boolean;
  metadataURI: string;
}

function SkillCard({ 
  skillId, 
  skill,
  hasSkill,
  onPurchase 
}: { 
  skillId: number;
  skill: SkillInfo;
  hasSkill: boolean;
  onPurchase: (skillId: number, price: bigint) => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-col items-start">
        <div className="flex justify-between w-full items-start">
          <h3 className="text-xl font-bold">{skill.name}</h3>
          {hasSkill && (
            <Chip color="success" size="sm">Owned</Chip>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-gray-600 mb-4">{skill.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-2xl font-bold">{formatEther(skill.price)} ETH</p>
          </div>
          <Chip 
            color={skill.isActive ? 'success' : 'default'}
            variant="flat"
          >
            {skill.isActive ? 'Available' : 'Unavailable'}
          </Chip>
        </div>
      </CardBody>
      <CardFooter>
        <Button
          color="primary"
          className="w-full"
          onPress={() => onPurchase(skillId, skill.price)}
          isDisabled={!skill.isActive || hasSkill}
        >
          {hasSkill ? 'Already Owned' : 'Purchase Skill'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function SkillsPage() {
  const { address, isConnected, chain } = useAccount();
  const [selectedSkill, setSelectedSkill] = useState<{ id: number; price: bigint } | null>(null);
  const [telegramUserId, setTelegramUserId] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // 调试：显示当前链信息
  useEffect(() => {
    console.log('⛓️ Current Chain:', {
      chainId: chain?.id,
      chainName: chain?.name,
      isConnected,
      address,
    });
  }, [chain, isConnected, address]);

  // 从 Telegram WebApp 获取用户 ID
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      
      // 获取 Telegram 用户信息
      const user = tg.initDataUnsafe?.user;
      if (user?.id) {
        setTelegramUserId(user.id.toString());
      }
      
      // 从 startapp 参数获取技能 ID
      const startParam = tg.initDataUnsafe?.start_param;
      if (startParam && startParam.startsWith('skill_')) {
        const skillId = parseInt(startParam.replace('skill_', ''));
        if (!isNaN(skillId)) {
          // 自动打开购买弹窗
          setTimeout(() => {
            handleOpenPurchase(skillId, parseEther('0.001')); // 默认价格
          }, 1000);
        }
      }
    }
  }, []);

  // 读取技能总数 - 直接使用硬编码地址
  const { data: nextSkillId, isError: isNextSkillIdError, error: nextSkillIdError } = useReadContract({
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    abi: SkillNFTABI,
    functionName: 'nextSkillId',
    chainId: 31337, // 明确指定 chain ID
  });

  // 调试信息
  useEffect(() => {
    console.log('🔍 Skills Page Debug:', {
      isConnected,
      address,
      SKILL_NFT_ADDRESS,
      nextSkillId: nextSkillId?.toString(),
      isNextSkillIdError,
      nextSkillIdError: nextSkillIdError?.message,
    });
  }, [isConnected, address, nextSkillId, isNextSkillIdError, nextSkillIdError]);

  // 读取用户拥有的技能
  const { data: userSkills, refetch: refetchUserSkills } = useReadContract({
    address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    abi: SkillNFTABI,
    functionName: 'getUserSkills',
    args: address ? [address] : undefined,
    chainId: 31337,
  });

  // 购买技能
  const { writeContract: purchaseSkill, data: purchaseHash, isPending: isPurchasePending } = useWriteContract();
  const { 
    isLoading: isPurchasing, 
    isSuccess: purchaseSuccess,
    isError: isPurchaseError,
    error: purchaseError 
  } = useWaitForTransactionReceipt({ 
    hash: purchaseHash,
    chainId: 31337,
    timeout: 10000, // 10 秒超时
  });

  // 通过 SkillMarket 创建购买
  const { writeContract: createPurchase, data: createPurchaseHash, isPending: isCreatePurchasePending } = useWriteContract();
  const { 
    isLoading: isCreatingPurchase, 
    isSuccess: createPurchaseSuccess,
    isError: isCreatePurchaseError,
    error: createPurchaseError
  } = useWaitForTransactionReceipt({ 
    hash: createPurchaseHash,
    chainId: 31337,
    timeout: 10000, // 10 秒超时
  });

  // 调试交易状态
  useEffect(() => {
    console.log('💳 Transaction Status:', {
      purchaseHash,
      isPurchasing,
      purchaseSuccess,
      isPurchaseError,
      createPurchaseHash,
      isCreatingPurchase,
      createPurchaseSuccess,
      isCreatePurchaseError,
    });
  }, [
    purchaseHash, 
    isPurchasing, 
    purchaseSuccess, 
    isPurchaseError,
    createPurchaseHash,
    isCreatingPurchase,
    createPurchaseSuccess,
    isCreatePurchaseError
  ]);

  useEffect(() => {
    if (purchaseSuccess || createPurchaseSuccess) {
      console.log('✅ Purchase successful!');
      refetchUserSkills();
      setIsPurchaseModalOpen(false);

      // 生成激活码
      const secret = process.env.NEXT_PUBLIC_ACTIVATION_SECRET || 'skillsbay_default_secret';
      const skillKey = selectedSkill ? `skill_${selectedSkill.id}` : '';
      const userId = telegramUserId || (address ?? 'unknown');

      generateCode(skillKey, userId, secret).then((code) => {
        setActivationCode(code);

        // 主方案：如果在 Telegram Mini App 内，直接 sendData 回传给 Bot
        const tg = (window as any).Telegram?.WebApp;
        if (tg && telegramUserId) {
          try {
            tg.sendData(JSON.stringify({
              action: 'activate',
              skillId: skillKey,
              code: code,
              userId: telegramUserId,
            }));
            return;
          } catch (e) {
            console.log('sendData failed, showing activation code:', e);
          }
        }

        // 备选方案：显示激活码弹窗
        setShowActivationModal(true);
      });

      setSelectedSkill(null);
    }

    if (isPurchaseError || isCreatePurchaseError) {
      const errorMsg = purchaseError?.message || createPurchaseError?.message || '';
      console.error('❌ Purchase failed:', errorMsg);
      if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
        setIsPurchaseModalOpen(false);
        setTimeout(() => { refetchUserSkills(); window.location.reload(); }, 1000);
      } else {
        alert('Purchase failed: ' + errorMsg);
        setIsPurchaseModalOpen(false);
      }
    }
  }, [
    purchaseSuccess, 
    createPurchaseSuccess, 
    isPurchaseError,
    isCreatePurchaseError,
    purchaseError,
    createPurchaseError,
    refetchUserSkills
  ]);

  const handleOpenPurchase = (skillId: number, price: bigint) => {
    setSelectedSkill({ id: skillId, price });
    setIsPurchaseModalOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedSkill) return;

    if (telegramUserId) {
      // 通过 SkillMarket 购买（支持 Telegram 集成）
      createPurchase({
        address: SKILL_MARKET_ADDRESS,
        abi: SkillMarketABI,
        functionName: 'createPurchase',
        args: [BigInt(selectedSkill.id), telegramUserId],
        value: selectedSkill.price,
      });
    } else {
      // 直接通过 SkillNFT 购买
      purchaseSkill({
        address: SKILL_NFT_ADDRESS,
        abi: SkillNFTABI,
        functionName: 'purchaseSkill',
        args: [BigInt(selectedSkill.id)],
        value: selectedSkill.price,
      });
    }
  };

  const renderSkills = () => {
    if (!nextSkillId) {
      console.log('⚠️ nextSkillId is undefined');
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">Loading skills...</p>
        </div>
      );
    }

    const skillCount = Number(nextSkillId) - 1;
    console.log('📊 Total skills:', skillCount);
    
    if (skillCount === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">No skills available yet</p>
        </div>
      );
    }

    const skills = [];

    for (let i = 1; i <= skillCount; i++) {
      skills.push(<SkillItem key={i} skillId={i} />);
    }

    return skills;
  };

  function SkillItem({ skillId }: { skillId: number }) {
    const { data: skill, isError: isSkillError, error: skillError } = useReadContract({
      address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      abi: SkillNFTABI,
      functionName: 'getSkillInfo',
      args: [BigInt(skillId)],
      chainId: 31337,
    });

    const { data: hasSkill } = useReadContract({
      address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      abi: SkillNFTABI,
      functionName: 'hasSkill',
      args: address ? [address, BigInt(skillId)] : undefined,
      chainId: 31337,
    });

    // 调试信息
    useEffect(() => {
      console.log(`🎯 Skill ${skillId}:`, {
        skill,
        isSkillError,
        skillError: skillError?.message,
        hasSkill,
      });
    }, [skill, isSkillError, skillError, hasSkill]);

    if (isSkillError) {
      return (
        <Card className="h-full">
          <CardBody className="text-center py-12">
            <p className="text-red-500">Error loading skill #{skillId}</p>
            <p className="text-xs text-gray-500 mt-2">{skillError?.message}</p>
          </CardBody>
        </Card>
      );
    }

    if (!skill) {
      return (
        <Card className="h-full">
          <CardBody className="text-center py-12">
            <p className="text-gray-500">Loading skill #{skillId}...</p>
          </CardBody>
        </Card>
      );
    }

    // viem 返回的 struct 可能是数组或对象
    let skillInfo: SkillInfo;
    
    if (Array.isArray(skill)) {
      // 数组格式
      const [name, description, price, isActive, metadataURI] = skill;
      skillInfo = {
        name: name as string,
        description: description as string,
        price: price as bigint,
        isActive: isActive as boolean,
        metadataURI: metadataURI as string,
      };
    } else {
      // 对象格式
      skillInfo = {
        name: (skill as any).name,
        description: (skill as any).description,
        price: (skill as any).price,
        isActive: (skill as any).isActive,
        metadataURI: (skill as any).metadataURI,
      };
    }

    return (
      <SkillCard
        skillId={skillId}
        skill={skillInfo}
        hasSkill={hasSkill as boolean}
        onPurchase={handleOpenPurchase}
      />
    );
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600">Please connect your wallet to browse skills</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Skill Marketplace</h1>
        <p className="text-gray-600">Discover and purchase AI-powered skills</p>
        {telegramUserId && (
          <Chip color="primary" variant="flat" className="mt-2">
            Telegram ID: {telegramUserId}
          </Chip>
        )}
      </div>

      {/* My Skills Section */}
      {userSkills && Array.isArray(userSkills) && userSkills.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-2xl font-bold">My Skills</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {userSkills.map((skillId: bigint) => (
                <Chip key={skillId.toString()} color="success" variant="flat">
                  Skill #{skillId.toString()}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Available Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderSkills()}
      </div>

      {/* Purchase Modal */}
      <Modal 
        isOpen={isPurchaseModalOpen} 
        onClose={() => setIsPurchaseModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Confirm Purchase</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Skill ID</p>
                <p className="text-lg font-bold">#{selectedSkill?.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-2xl font-bold">
                  {selectedSkill ? formatEther(selectedSkill.price) : '0'} ETH
                </p>
              </div>
              {telegramUserId && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    This purchase will be linked to your Telegram account
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    You'll receive a notification when the skill is activated
                  </p>
                </div>
              )}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <p className="text-sm">
                  Protocol fee: 5% will be deducted from your payment
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => {
                setIsPurchaseModalOpen(false);
                setSelectedSkill(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handlePurchase}
              isLoading={isPurchasing || isCreatingPurchase || isPurchasePending || isCreatePurchasePending}
            >
              {isPurchasing || isCreatingPurchase ? 'Confirming...' : 'Confirm Purchase'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Activation Code Modal - 备选方案 */}
      <Modal isOpen={showActivationModal} onClose={() => setShowActivationModal(false)} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <span>🎉 支付成功！</span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">你的激活码：</p>
                <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono break-all select-all">
                  {activationCode}
                </code>
              </div>

              <Button
                color="primary"
                variant="flat"
                className="w-full"
                onPress={() => {
                  navigator.clipboard.writeText(activationCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? '✅ 已复制' : '📋 复制激活码'}
              </Button>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">使用方法：</p>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>复制上方激活码</li>
                  <li>回到 Telegram 机器人对话</li>
                  <li>发送 <code>/activate 你的激活码</code></li>
                  <li>激活成功后即可使用技能！</li>
                </ol>
              </div>

              {process.env.NEXT_PUBLIC_BOT_USERNAME && (
                <Button
                  color="success"
                  className="w-full"
                  onPress={() => {
                    const botUrl = `https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}`;
                    const tg = (window as any).Telegram?.WebApp;
                    if (tg) {
                      tg.openTelegramLink(botUrl);
                      tg.close();
                    } else {
                      window.open(botUrl, '_blank');
                    }
                  }}
                >
                  🤖 前往机器人激活
                </Button>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
