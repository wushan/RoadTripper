# RoadTripper 開發 Prompt

> 此文件用於 Claude CLI 的 plan mode，作為整個專案開發的指導文件。

-----

## 專案概述

### 產品名稱

RoadTripper

### 一句話定義

讓公路旅行者不再錯過任何值得停留的地方

### 核心概念

這是一款以 PWA 為基礎的行動應用程式，透過即時定位追蹤，主動推送周圍的美食、景點、住宿資訊。與 Google Maps 的主動搜尋模式不同，RoadTripper 採用「被動探索」模式——使用者只需要「看」和「決定」，無需停車搜尋。

-----

## 技術規格

### 技術棧

- **前端框架**: React 18 + TypeScript
- **建構工具**: Vite
- **地圖**: Mapbox GL JS
- **狀態管理**: Zustand
- **PWA**: vite-plugin-pwa
- **POI 資料**: Google Places API (New)
- **後端**: Cloudflare Workers (用於 API Key 保護與快取)
- **本地儲存**: IndexedDB (Dexie.js)
- **樣式**: Tailwind CSS

### 架構設計原則

#### Platform Abstraction Layer

為保留未來轉換為 iOS/Android 原生 APP 的彈性，所有平台相關功能必須透過介面抽象：

```typescript
// 所有平台相關功能都要定義介面
interface LocationProvider {
  watchPosition(callback: (pos: GeoPosition) => void): void;
  stopWatching(): void;
  getCurrentPosition(): Promise<GeoPosition>;
}

// 然後各平台實作各自的 Adapter
class WebLocationAdapter implements LocationProvider { ... }
class NativeLocationAdapter implements LocationProvider { ... } // 未來
```

需要抽象的功能：

1. 定位服務 (LocationProvider)
1. 儲存服務 (StorageProvider)
1. 導航跳轉 (NavigationProvider)

-----

## 專案結構

```
roadtripper/
├── src/
│   ├── core/                    # 平台無關的核心邏輯
│   │   ├── interfaces/          # 介面定義
│   │   │   ├── location.ts
│   │   │   ├── storage.ts
│   │   │   └── navigation.ts
│   │   ├── services/            # 業務邏輯服務
│   │   │   ├── poi-service.ts
│   │   │   ├── distance-tracker.ts
│   │   │   └── quota-service.ts
│   │   ├── models/              # 資料模型
│   │   │   ├── poi.ts
│   │   │   ├── position.ts
│   │   │   └── filter.ts
│   │   └── utils/               # 工具函數
│   │       ├── geo.ts           # 地理計算
│   │       └── format.ts        # 格式化
│   │
│   ├── adapters/                # 平台特定實作
│   │   └── web/
│   │       ├── location-adapter.ts
│   │       ├── storage-adapter.ts
│   │       └── navigation-adapter.ts
│   │
│   ├── components/              # React 組件
│   │   ├── Map/
│   │   │   ├── MapContainer.tsx
│   │   │   ├── POIMarker.tsx
│   │   │   └── UserMarker.tsx
│   │   ├── POI/
│   │   │   ├── POICard.tsx
│   │   │   ├── POICardStack.tsx
│   │   │   └── POIDetail.tsx
│   │   ├── Filter/
│   │   │   ├── FilterPanel.tsx
│   │   │   └── FilterChip.tsx
│   │   ├── Quota/
│   │   │   ├── QuotaBanner.tsx
│   │   │   └── PaywallModal.tsx
│   │   └── common/
│   │       ├── Loading.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── hooks/                   # 自定義 Hooks
│   │   ├── useLocation.ts
│   │   ├── usePOI.ts
│   │   ├── useQuota.ts
│   │   └── useMap.ts
│   │
│   ├── store/                   # Zustand Store
│   │   ├── location-store.ts
│   │   ├── poi-store.ts
│   │   ├── filter-store.ts
│   │   └── quota-store.ts
│   │
│   ├── api/                     # API 層
│   │   └── places.ts
│   │
│   ├── styles/                  # 全域樣式
│   │   └── index.css
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── worker/                      # Cloudflare Worker
│   └── src/
│       └── index.ts
│
├── public/
│   ├── manifest.json
│   └── icons/
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

-----

## 核心功能實作規格

### 1. 定位服務

```typescript
// src/core/interfaces/location.ts
export interface GeoPosition {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number;
  timestamp: number;
}

export interface LocationProvider {
  watchPosition(
    onSuccess: (position: GeoPosition) => void,
    onError: (error: GeolocationPositionError) => void
  ): void;
  stopWatching(): void;
  getCurrentPosition(): Promise<GeoPosition>;
}
```

Web Adapter 實作要點：

- 使用 `navigator.geolocation.watchPosition`
- 設定 `enableHighAccuracy: true`
- 設定 `maximumAge: 5000` (5秒快取)
- 處理各種錯誤狀態

### 2. POI 搜尋服務

```typescript
// src/core/services/poi-service.ts
export interface POI {
  id: string;
  name: string;
  type: POIType;
  location: {
    latitude: number;
    longitude: number;
  };
  distance: number;        // 公尺
  rating: number;          // 1-5
  ratingCount: number;
  priceLevel?: number;     // 1-4
  isOpen?: boolean;
  thumbnail?: string;
}

export type POIType = 
  | 'restaurant'
  | 'cafe'
  | 'attraction'
  | 'hotel'
  | 'gas_station'
  | 'convenience_store';

export interface POIFilter {
  categories: POIType[];
  minRating: number;       // 預設 4.0
  openNow: boolean;        // 預設 false
}

export interface POISearchResult {
  pois: POI[];
  searchRadius: number;
  suggestedZoom: number;
}
```

搜尋邏輯：

1. 預設搜尋半徑 1000 公尺
1. 如果結果少於 3 個，每次增加 1000 公尺
1. 最大搜尋半徑 10000 公尺
1. 根據搜尋半徑建議地圖縮放等級

```typescript
// 縮放等級對照
const zoomLevelMap = {
  1000: 15,
  2000: 14,
  3000: 14,
  5000: 13,
  10000: 12
};
```

### 3. 距離追蹤服務

```typescript
// src/core/services/distance-tracker.ts
export class DistanceTracker {
  private positions: GeoPosition[] = [];
  private totalDistance: number = 0;

  // Haversine 公式計算兩點距離
  private calculateDistance(p1: GeoPosition, p2: GeoPosition): number;
  
  // 新增位置點，過濾 GPS 漂移
  addPosition(position: GeoPosition): number;
  
  // 取得累計距離
  getTotalDistance(): number;
  
  // 重置（每日）
  reset(): void;
}
```

GPS 漂移過濾邏輯：

- 移動距離 < 10 公尺：忽略（可能是漂移）
- 移動距離 > 500 公尺：忽略（不合理的跳躍）

### 4. 額度管理服務

```typescript
// src/core/services/quota-service.ts
export interface UsageQuota {
  distanceTraveled: number;    // 已移動公尺
  distanceLimit: number;       // 5000 (5KM)
  searchCount: number;         // 已搜尋次數
  searchLimit: number;         // 100 次/天
  lastReset: string;           // ISO 日期字串
}

export class QuotaService {
  // 檢查是否超過距離額度
  isDistanceExceeded(): boolean;
  
  // 檢查是否超過搜尋額度
  isSearchExceeded(): boolean;
  
  // 取得剩餘額度百分比
  getDistanceRemaining(): number;
  
  // 記錄搜尋
  recordSearch(): void;
  
  // 更新距離
  updateDistance(meters: number): void;
  
  // 每日重置檢查
  checkAndResetIfNeeded(): void;
}
```

### 5. 地圖控制

Mapbox GL JS 設定要點：

- 初始縮放: 15
- 最小縮放: 10
- 最大縮放: 18
- 地圖風格: `mapbox://styles/mapbox/streets-v12`

POI 標記顏色：

```typescript
const markerColors = {
  restaurant: '#EF4444',  // 紅色
  cafe: '#F59E0B',        // 橙色
  attraction: '#10B981',  // 綠色
  hotel: '#3B82F6',       // 藍色
  gas_station: '#6B7280', // 灰色
  convenience_store: '#8B5CF6' // 紫色
};
```

-----

## API 規格

### Cloudflare Worker 端點

```typescript
// POST /api/places/nearby
interface NearbyRequest {
  latitude: number;
  longitude: number;
  radius: number;        // 公尺
  types: string[];       // Google Places API 類型
}

interface NearbyResponse {
  places: GooglePlace[];
}
```

Google Places API (New) 對應類型：

- restaurant → `restaurant`
- cafe → `cafe`
- attraction → `tourist_attraction`
- hotel → `lodging`
- gas_station → `gas_station`
- convenience_store → `convenience_store`

### 導航跳轉

```typescript
// Google Maps 導航 URL 格式
const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

// 或使用 Google Maps App URL Scheme (行動裝置)
const mobileUrl = `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`;
```

-----

## UI 規格

### 主畫面配置

```
┌─────────────────────────────────────────┐
│  🚗 已探索 3.2/5 KM        [篩選] [⚙️]  │ ← 頂部狀態列 (48px)
├─────────────────────────────────────────┤
│                                         │
│                                         │
│              地圖區域                    │ ← 主要區域 (flex-1)
│           (Mapbox GL JS)                │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ 🍜 阿宗麵線                    ↗  │  │ ← 卡片區域 (180px)
│  │ ⭐ 4.6 (2,341) · 0.8 KM · 營業中  │  │
│  │ $$ · 台灣小吃                     │  │
│  └───────────────────────────────────┘  │
│  ← 滑動看更多                           │
└─────────────────────────────────────────┘
```

### 卡片設計

```typescript
interface POICardProps {
  poi: POI;
  onTap: () => void;      // 開啟導航
  isActive: boolean;      // 是否為當前選中
}
```

卡片內容：

- 類型圖標 + 地點名稱
- 星級評分 + 評論數
- 距離（格式：0.8 KM）
- 營業狀態
- 價位等級（$-$$$$）
- 導航按鈕

### 篩選面板

預設選項（免費版可選 3 種）：

- ☑️ 餐廳
- ☑️ 咖啡廳
- ☑️ 景點
- ☐ 住宿（付費版）
- ☐ 加油站（付費版）
- ☐ 便利商店（付費版）

附加選項：

- 最低評分滑桿（3.0 - 5.0）
- 只顯示營業中開關

### 付費提示

**Banner（達到 5KM 時）**：

```
🎉 您已探索 5 公里！升級解鎖無限旅程 → [了解更多]
```

**Modal（超額後點擊導航）**：

```
┌─────────────────────────────────────────┐
│                                         │
│     🎉 您已探索 5 公里！                 │
│                                         │
│     看來這是一趟精彩的旅程               │
│     升級 RoadTripper 繼續無限探索        │
│                                         │
│     ┌─────────────┐  ┌─────────────┐   │
│     │  稍後再說   │  │ 升級 $2.99  │   │
│     └─────────────┘  └─────────────┘   │
│                                         │
│     [ ] 今天不再提醒                     │
│                                         │
└─────────────────────────────────────────┘
```

-----

## 開發階段

### Phase 1: MVP（Week 1-4）

**Week 1-2: 基礎建設**

- [ ] 專案初始化（Vite + React + TypeScript + Tailwind）
- [ ] 定義核心介面 (interfaces/)
- [ ] 實作 Web Location Adapter
- [ ] Mapbox 地圖整合
- [ ] 使用者位置標記

**Week 3: POI 整合**

- [ ] Cloudflare Worker 設置
- [ ] Google Places API 串接
- [ ] POI Service 實作
- [ ] 動態搜尋範圍邏輯

**Week 4: 核心體驗**

- [ ] POI 卡片 UI 組件
- [ ] 卡片堆疊與滑動
- [ ] 地圖標記與卡片聯動
- [ ] Google Maps 導航跳轉
- [ ] PWA 配置

### Phase 2: 體驗優化（Week 5-7）

**Week 5-6**

- [ ] Filter 系統
- [ ] 地圖動畫
- [ ] 距離追蹤服務
- [ ] 額度管理系統
- [ ] IndexedDB 快取

**Week 7**

- [ ] 節流與防抖優化
- [ ] 錯誤處理
- [ ] Loading 狀態
- [ ] PWA 安裝提示

### Phase 3: 商業化（Week 8-9）

**Week 8**

- [ ] 付費提示 UI
- [ ] 額度超限處理
- [ ] 使用數據追蹤

**Week 9**

- [ ] Landing Page
- [ ] 效能優化
- [ ] 部署與測試

-----

## 環境變數

```env
# .env.local (前端)
VITE_MAPBOX_ACCESS_TOKEN=pk.xxx

# Cloudflare Worker 環境變數
GOOGLE_PLACES_API_KEY=AIzaxxx
```

-----

## 開發指令

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建構
npm run build

# 預覽建構結果
npm run preview

# 部署 Worker
cd worker && wrangler deploy
```

-----

## 注意事項

1. **定位權限**：首次使用需請求定位權限，需優雅處理被拒絕的情況
1. **電池消耗**：watchPosition 會持續消耗電池，需在背景時暫停
1. **API 費用控制**：
- 使用快取減少 API 呼叫
- 實作節流（移動超過 100 公尺才重新搜尋）
- Worker 端實作結果快取
1. **離線支援**：
- Service Worker 快取靜態資源
- IndexedDB 快取最近的 POI 資料
1. **跨平台準備**：
- 所有平台相關邏輯都要通過 Adapter
- 避免直接使用 `window`、`navigator` 等 Web API

-----

## 開始開發

請從 Phase 1 Week 1-2 開始，首先：

1. 初始化專案結構
1. 設置開發環境
1. 定義核心介面
1. 實作 Web Location Adapter
1. 整合 Mapbox 地圖

每完成一個主要功能，請確認：

- TypeScript 型別正確
- 錯誤處理完整
- 程式碼有適當註解
- 符合 Platform Abstraction 原則