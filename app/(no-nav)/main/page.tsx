"use client";

import React from "react";
import Spline from "@splinetool/react-spline";
import { useRouter } from "next/navigation";

/**
 * 主入口页面（带 3D 场景）
 * 功能：展示 Spline 3D 场景，点击按钮跳转到首页
 */
export default function MainPage() {
  const router = useRouter();

  /**
   * Spline 鼠标按下事件处理
   */
  function onSplineMouseDown(e: any) {
    if (e?.target) {
      // reserved for future interactions
    }
  }

  /**
   * Spline 点击事件处理
   */
  function onSplineClick(e: any) {
    if (e.target) {
      router.push("/home");
    }
  }

  const handleNavigate = () => router.push("/home");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Spline 3D 场景 */}
      <Spline
        style={{ width: "100%", height: "100%" }}
        scene="/scene6.splinecode"
        onMouseDown={onSplineMouseDown}
        onClick={onSplineClick}
      />
      
      {/* 可点击的透明按钮区域 - 覆盖在 3D 场景的按钮位置上 */}
      <div 
        role="button"
        tabIndex={0}
        onClick={handleNavigate}
        onKeyDown={handleKeyDown}
        style={{
          position: "absolute",
          width: "18vw",  // 使用视口宽度单位保持响应式
          height: "10vh", // 使用视口高度单位保持响应式
          top: "55%",     // 垂直位置
          left: "20%",    // 水平位置
          transform: "translate(-50%, -50%)", // 居中对齐
          cursor: "pointer",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}
