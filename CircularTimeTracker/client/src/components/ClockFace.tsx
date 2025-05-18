import React from "react";
import { Card } from "@/components/ui/card";
import { ActivityWithCategory } from "@shared/schema";

interface ClockFaceProps {
  activities: ActivityWithCategory[];
  onTimeSlotClick: (start: number, end: number) => void;
}

// 単純化されたClockFace実装 - 無限ループを防止
export default function ClockFace({ activities, onTimeSlotClick }: ClockFaceProps) {
  // 固定サイズでレンダリング
  const size = 300;
  
  // 時間帯セクションを生成
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    // 対応するアクティビティを探す
    const activity = activities.find(a => a.startHour <= hour && hour < a.endHour);
    
    // 背景色を設定
    const bgColor = activity ? activity.category.color : 'rgba(229, 231, 235, 0.4)';
    
    // 位置を計算
    const angle = (hour / 24) * 360;
    const startAngle = (hour / 24) * 360 - 90;
    const endAngle = ((hour + 1) / 24) * 360 - 90;
    
    // パスの座標を計算
    const innerRadius = size / 2 * 0.5;
    const outerRadius = size / 2 * 0.85;
    const centerX = size / 2;
    const centerY = size / 2;
    
    const startRadians = startAngle * (Math.PI / 180);
    const endRadians = endAngle * (Math.PI / 180);
    
    const startX1 = Math.cos(startRadians) * innerRadius + centerX;
    const startY1 = Math.sin(startRadians) * innerRadius + centerY;
    const endX1 = Math.cos(endRadians) * innerRadius + centerX;
    const endY1 = Math.sin(endRadians) * innerRadius + centerY;
    
    const startX2 = Math.cos(startRadians) * outerRadius + centerX;
    const startY2 = Math.sin(startRadians) * outerRadius + centerY;
    const endX2 = Math.cos(endRadians) * outerRadius + centerX;
    const endY2 = Math.sin(endRadians) * outerRadius + centerY;
    
    // SVGパスを構築
    const path = `
      M ${startX1} ${startY1}
      L ${startX2} ${startY2}
      A ${outerRadius} ${outerRadius} 0 0 1 ${endX2} ${endY2}
      L ${endX1} ${endY1}
      A ${innerRadius} ${innerRadius} 0 0 0 ${startX1} ${startY1}
      Z
    `;
    
    // 時間マーカーの位置を計算
    const radians = (angle - 90) * (Math.PI / 180);
    const markerRadius = size / 2 * 0.9;
    const markerX = Math.cos(radians) * markerRadius + centerX;
    const markerY = Math.sin(radians) * markerRadius + centerY;
    
    // カテゴリ名を表示
    const categoryName = activity ? activity.category.name : '';
    
    timeSlots.push(
      <g key={hour}>
        {/* 時間セグメント */}
        <path
          d={path}
          fill={bgColor}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
          className="transition-colors hover:brightness-90 cursor-pointer"
          onClick={() => onTimeSlotClick(hour, hour + 1)}
        />
        
        {/* 時間マーカー */}
        <text
          x={markerX}
          y={markerY}
          fontSize="10"
          fill="#666"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {hour}:00
        </text>
        
        {/* カテゴリ名を表示 */}
        {activity && (
          <text
            x={Math.cos((startAngle + endAngle) / 2 * (Math.PI / 180)) * (innerRadius + (outerRadius - innerRadius) / 2) + centerX}
            y={Math.sin((startAngle + endAngle) / 2 * (Math.PI / 180)) * (innerRadius + (outerRadius - innerRadius) / 2) + centerY}
            fontSize="10"
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="bold"
            strokeWidth="0.5"
            stroke="rgba(0,0,0,0.3)"
            paintOrder="stroke"
          >
            {categoryName}
          </text>
        )}
      </g>
    );
  }
  
  // 現在時刻の針
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeAngle = ((hour + minute / 60) / 24) * 360 - 90;
  const timeRadians = timeAngle * (Math.PI / 180);
  const handLength = size / 2 * 0.85;
  const handX = Math.cos(timeRadians) * handLength + size / 2;
  const handY = Math.sin(timeRadians) * handLength + size / 2;
  
  return (
    <Card className="relative flex items-center justify-center p-2 w-full h-full">
      <div className="relative rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* 全体のSVG */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* 時間セグメント */}
          {timeSlots}
          
          {/* 中心点 */}
          <circle 
            cx={size / 2} 
            cy={size / 2} 
            r={4} 
            fill="#666" 
          />
          
          {/* 現在時刻の針 */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={handX}
            y2={handY}
            stroke="red"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </Card>
  );
}