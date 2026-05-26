---
description: 高德地图使用规范，统一使用 gdmap-utils 库进行地图操作。当开发地图相关功能时，必须使用此规范指导，禁止使用已废弃的 src/utils/gdMap/ 目录。
---

# 高德地图使用规范

项目使用 `gdmap-utils` 统一高德地图使用规范，该库封装了常用的地图操作和图层管理功能。

**详细文档**: [node_modules/gdmap-utils/README.md](../../node_modules/gdmap-utils/README.md)

## 核心特性

- 统一封装 `AMap.Marker`、`AMap.LabelMarker`、`AMap.MarkerCluster` 为图层管理
- 数据驱动的覆盖物更新
- 支持创建新地图实例或包装已有实例

## 快速使用

```javascript
import { initMapSource, createMapUtils } from 'gdmap-utils';

// 1. 加载高德地图环境
await initMapSource({
  key: 'your-key',
  version: '2.0',
  plugins: ['AMap.MoveAnimation', 'AMap.MarkerCluster'],
});

// 2. 创建地图工具实例
const mapUtils = createMapUtils({
  mountSelector: '#mapContainer', // 或 mapIns: existingMapInstance
  zoom: 12,
  center: [116.397428, 39.90923],
});

// 3. 创建图层管理覆盖物
const markerLayer = mapUtils.createBaseMarkerLayer({
  layerType: 'markerLayer',
  layerName: 'vehicleLayer',
  getIconUrl: (item) => item.overlayData.iconUrl,
  getOverlayOpts: (item, index, MapUtils) => ({
    anchor: 'bottom-center',
    zooms: [2, 20],
  }),
  overlayList: data.map((item) => ({
    id: item.id,
    overlayData: { lon: item.lng, lat: item.lat, ...item },
  })),
});

// 4. 图层操作
markerLayer.show();
markerLayer.hide();
markerLayer.add(newOverlayList);
markerLayer.remove(['id1', 'id2']);
markerLayer.refreshOverlayIcon('id'); // 刷新图标
markerLayer.refreshOverlayLabel('id'); // 刷新标签
```

## 主要 API

| 方法                             | 说明                         |
| -------------------------------- | ---------------------------- |
| `initMapSource(opts)`            | 加载高德地图环境             |
| `createMapUtils(opts)`           | 创建地图工具实例             |
| `createBaseMarkerLayer(opts)`    | 创建 Marker/LabelMarker 图层 |
| `createClusterMarkerLayer(opts)` | 创建聚合图层 (海量点)        |
| `createIcon(opts)`               | 创建图标                     |
| `createAMapInfoWindow(opts)`     | 创建信息窗体                 |
| `createAMapPolyline(opts)`       | 创建折线                     |

## 注意事项

- **Why:** 旧目录 `src/utils/gdMap/` 已废弃，统一使用 gdmap-utils 库可以保持代码一致性，减少重复封装。
- **How to apply:** 开发新地图功能时，必须使用 gdmap-utils 库；遇到旧代码使用 gdMap 目录时，应提示迁移。
