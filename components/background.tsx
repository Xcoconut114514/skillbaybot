'use client';

import React from 'react';
import Spline from '@splinetool/react-spline';

/**
 * 背景组件
 * 渲染 Spline 3D 场景作为全屏背景
 */
export default function Background() {
  return (
    <div className="w-full h-full">
      <Spline
        style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
        scene="/scene2.splinecode"
      />
    </div>
  );
}
