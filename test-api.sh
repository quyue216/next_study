#!/bin/bash

# Todo API 测试脚本
# 使用方法: ./test-api.sh

BASE_URL="http://localhost:3000/api"

echo "========================================="
echo "  Todo API 测试脚本"
echo "========================================="
echo ""

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查服务是否运行
check_service() {
  echo "检查服务是否运行..."
  if curl -s "$BASE_URL/todos" > /dev/null; then
    echo -e "${GREEN}✓ 服务运行正常${NC}"
    return 0
  else
    echo -e "${RED}✗ 服务未运行，请先执行: npm run dev${NC}"
    return 1
  fi
}

# 测试函数
test_get_todos() {
  echo ""
  echo -e "${YELLOW}1. 获取待办列表${NC}"
  curl -s "$BASE_URL/todos?page=1&pageSize=5" | jq '.'
}

test_get_tags() {
  echo ""
  echo -e "${YELLOW}2. 获取所有标签${NC}"
  curl -s "$BASE_URL/todos?action=tags" | jq '.'
}

test_create_todo() {
  echo ""
  echo -e "${YELLOW}3. 创建待办事项${NC}"
  curl -s -X POST "$BASE_URL/todos" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "测试任务 - 来自脚本",
      "priority": "high",
      "tags": ["脚本测试", "API"]
    }' | jq '.'
}

# 主菜单
show_menu() {
  echo ""
  echo "请选择测试:"
  echo "1) 获取待办列表"
  echo "2) 获取所有标签"
  echo "3) 创建待办事项"
  echo "4) 运行所有测试"
  echo "q) 退出"
  echo ""
  read -p "请输入选项: " choice
}

# 主程序
if ! check_service; then
  exit 1
fi

while true; do
  show_menu
  case $choice in
    1)
      test_get_todos
      ;;
    2)
      test_get_tags
      ;;
    3)
      test_create_todo
      ;;
    4)
      test_get_todos
      test_get_tags
      test_create_todo
      ;;
    q|Q)
      echo "再见！"
      exit 0
      ;;
    *)
      echo "无效选项"
      ;;
  esac
  echo ""
  read -p "按回车键继续..."
done
