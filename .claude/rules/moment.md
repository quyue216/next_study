# Moment 时间处理规范

## 核心原则

**所有时间处理必须使用 moment 库，禁止直接使用原生 Date 对象进行复杂时间操作。**

## 使用步骤

### 第一步：检查是否有封装函数

项目中已封装了大量常用时间函数，位于 `@/plugins/moment.js`。**优先使用这些封装函数**。

```javascript
// 正确：优先使用封装好的函数
import { timeFormat, getToDay, getPastDate } from '@/plugins/moment';

const now = getToDay('YYYY-MM-DD');
const yesterday = getPastDate(1);
const formatted = timeFormat(date, 'YYYY-MM-DD HH:mm:ss');
```

### 第二步：封装函数不满足需求时使用 moment

当 `@/plugins/moment.js` 中没有满足需求的函数时，直接使用 moment：

```javascript
import moment from 'moment';

const timestamp = moment(dateStr).valueOf();
const isValid = moment(dateStr).isValid();
const startOfDay = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
```

### 第三步：禁止的做法

```javascript
// 错误：禁止使用原生 Date 进行复杂计算
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

// 错误：禁止手动拼接时间字符串
const timeStr = year + '-' + month + '-' + day;

// 错误：禁止使用 new Date() 解析不确定格式的字符串
const timestamp = new Date(dateStr).getTime();
```

## 封装函数速查

### 格式化类

| 函数 | 用途 | 示例 |
|------|------|------|
| `timeFormat(date, format)` | 格式化时间 | `timeFormat(new Date())` |
| `getToDay(format)` | 获取今天 | `getToDay('YYYY-MM-DD')` |
| `curStartTime()` | 今天开始时间 | `2024-01-01 00:00:00` |
| `curEndTime()` | 今天结束时间 | `2024-01-01 23:59:59` |

### 日期计算类

| 函数 | 用途 | 示例 |
|------|------|------|
| `getPastDate(days, format)` | 几天前 | `getPastDate(7)` |
| `getNextDate(days, format)` | 几天后 | `getNextDate(7)` |
| `getFirstDayOfCurrentMonth()` | 当月第一天 | - |
| `getLastDayOfCurrentMonth()` | 当月最后一天 | - |
| `getMonthStartAndEndDates(date)` | 某月起止日期 | - |
| `getRelativeBeforeTime(date, unit, amount)` | 某时间之前 | `getRelativeBeforeTime(date, 'hours', 2)` |
| `getRelativeAfterTime(date, unit, amount)` | 某时间之后 | `getRelativeAfterTime(date, 'hours', 2)` |

### 日期判断类

| 函数 | 用途 | 示例 |
|------|------|------|
| `isDateEarlierThan(start, end)` | 是否早于 | `isDateEarlierThan('2024-01-01', '2024-01-02')` |
| `isFirstDateEarlierOrEqual(start, end)` | 是否早等于 | - |
| `isDateInRange(date, [start, end])` | 是否在范围内 | `isDateInRange(date, rangeArr)` |

### 时间差计算类

| 函数 | 用途 | 返回值 |
|------|------|--------|
| `calculateTimeDifference(start, end)` | 计算时间差 | `{days, hours, minutes, seconds}` |
| `getDaysBetweenDates(start, end)` | 计算天数差 | 天数 |
| `calculateAge(birthDate)` | 计算年龄 | 岁数 |

## 常用 moment 操作

```javascript
import moment from 'moment';

// 格式化
moment().format('YYYY-MM-DD');
moment().format('YYYY-MM-DD HH:mm:ss');
moment().format('HH:mm:ss');

// 解析
moment('2024-01-01', 'YYYY-MM-DD');
moment(dateStr).isValid();

// 时间戳
moment(date).valueOf();  // 毫秒
moment(date).unix();     // 秒

// 比较
moment(date1).isBefore(date2);
moment(date1).isAfter(date2);
moment(date1).isSame(date2, 'day');
moment(date).isBetween(start, end);

// 加减
moment().add(7, 'days');
moment().subtract(1, 'months');

// 起始/结束
moment().startOf('day');
moment().endOf('day');
moment().startOf('month');
moment().endOf('month');
```

## 格式规范

| 场景 | 格式 |
|------|------|
| 完整日期时间 | `YYYY-MM-DD HH:mm:ss` |
| 日期 | `YYYY-MM-DD` |
| 时间 | `HH:mm:ss` |
| 小时分钟 | `HH:mm` |
| 年月 | `YYYY-MM` |

## 注意事项

1. **可变性问题**：moment 对象是可变的，链式操作前使用 `.clone()`
   ```javascript
   const m1 = moment();
   const m2 = m1.clone().add(1, 'day'); // 正确
   const m3 = m1.add(1, 'day');         // 错误：m1 也被修改了
   ```

2. **扩展封装**：如需新增函数，在 `src/plugins/moment.js` 中添加并导出

**Why:** 统一使用 moment 并优先使用封装函数，可以保证时间处理的一致性和正确性，避免原生 Date 对象的坑。

**How to apply:** 处理时间时，先查 `@/plugins/moment.js` 有无封装函数；没有时直接用 moment；禁止使用 `new Date()` 进行复杂时间计算。
