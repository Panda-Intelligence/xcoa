#!/bin/bash
#
# 量表数据质量检查脚本
#
# 功能：
# - 检查量表数据完整性
# - 统计items覆盖率
# - 检查版权信息完整度
# - 生成质量报告
#
# 运行：bash scripts/utils/quality-check.sh
#

set -e

echo "═══════════════════════════════════════════════════════════"
echo "                  📊 数据质量报告                           "
echo "═══════════════════════════════════════════════════════════"
echo ""

# 获取数据库名称
DB_NAME=$(node scripts/get-db-name.mjs)

# 使用 wrangler d1 execute 查询数据库
execute_query() {
  local query=$1
  pnpm exec wrangler d1 execute $DB_NAME --local --command "$query" --json 2>/dev/null
}

# 提取count值的辅助函数
extract_count() {
  echo "$1" | grep -o '"count":[0-9]*' | head -1 | grep -o '[0-9]*' || echo "0"
}

# 提取其他字段值
extract_value() {
  local json=$1
  local field=$2
  echo "$json" | grep -o "\"$field\":[0-9.]*" | grep -o '[0-9.]*' | head -1 || echo "0"
}

echo "🔍 正在收集数据..."
echo ""

# 1. 量表总数
TOTAL_SCALES_JSON=$(execute_query "SELECT COUNT(*) as count FROM ecoa_scale")
TOTAL_SCALES=$(extract_count "$TOTAL_SCALES_JSON")

# 2. 有items的量表数
SCALES_WITH_ITEMS_JSON=$(execute_query "SELECT COUNT(*) as count FROM ecoa_scale WHERE itemsCount > 0")
SCALES_WITH_ITEMS=$(extract_count "$SCALES_WITH_ITEMS_JSON")

# 3. 总items数
TOTAL_ITEMS_JSON=$(execute_query "SELECT COUNT(*) as count FROM ecoa_item")
TOTAL_ITEMS=$(extract_count "$TOTAL_ITEMS_JSON")

# 4. Items统计（平均、最小、最大）
ITEMS_STATS_JSON=$(execute_query "SELECT AVG(itemsCount) as avg, MIN(itemsCount) as min, MAX(itemsCount) as max FROM ecoa_scale WHERE itemsCount > 0")
AVG_ITEMS=$(extract_value "$ITEMS_STATS_JSON" "avg" | awk '{print int($1+0.5)}')
MIN_ITEMS=$(extract_value "$ITEMS_STATS_JSON" "min")
MAX_ITEMS=$(extract_value "$ITEMS_STATS_JSON" "max")

# 5. 版权信息统计
SCALES_WITH_COPYRIGHT_JSON=$(execute_query "SELECT COUNT(*) as count FROM ecoa_scale WHERE copyrightHolderId IS NOT NULL")
SCALES_WITH_COPYRIGHT=$(extract_count "$SCALES_WITH_COPYRIGHT_JSON")

SCALES_WITH_LICENSE_JSON=$(execute_query "SELECT COUNT(*) as count FROM ecoa_scale WHERE licenseType IS NOT NULL")
SCALES_WITH_LICENSE=$(extract_count "$SCALES_WITH_LICENSE_JSON")

# 6. 状态统计
DRAFT_JSON=$(execute_query "SELECT COUNT(*) as count FROM ecoa_scale WHERE validationStatus = 'draft'")
VALIDATED_JSON=$(execute_query "SELECT COUNT(*) as count FROM ecoa_scale WHERE validationStatus = 'validated'")
PUBLISHED_JSON=$(execute_query "SELECT COUNT(*) as count FROM ecoa_scale WHERE validationStatus = 'published'")

DRAFT_SCALES=$(extract_count "$DRAFT_JSON")
VALIDATED_SCALES=$(extract_count "$VALIDATED_JSON")
PUBLISHED_SCALES=$(extract_count "$PUBLISHED_JSON")

# 7. 多语言支持统计
ENGLISH_NAME_JSON=$(execute_query "SELECT COUNT(*) as count FROM ecoa_scale WHERE nameEn IS NOT NULL")
ENGLISH_DESC_JSON=$(execute_query "SELECT COUNT(*) as count FROM ecoa_scale WHERE descriptionEn IS NOT NULL")

ENGLISH_NAME=$(extract_count "$ENGLISH_NAME_JSON")
ENGLISH_DESC=$(extract_count "$ENGLISH_DESC_JSON")

# 计算百分比
calc_percentage() {
  local value=$1
  local total=$2
  if [ "$total" -eq 0 ]; then
    echo "0.0%"
  else
    echo $(awk "BEGIN {printf \"%.1f%%\", ($value/$total)*100}")
  fi
}

# 计算缺失数量
SCALES_WITHOUT_ITEMS=$((TOTAL_SCALES - SCALES_WITH_ITEMS))
SCALES_WITHOUT_COPYRIGHT=$((TOTAL_SCALES - SCALES_WITH_COPYRIGHT))

# 打印报告
echo "📦 量表总览:"
echo "   总量表数: $TOTAL_SCALES"
echo "   ✅ 有Items: $SCALES_WITH_ITEMS ($(calc_percentage $SCALES_WITH_ITEMS $TOTAL_SCALES))"
echo "   ⚠️  无Items: $SCALES_WITHOUT_ITEMS ($(calc_percentage $SCALES_WITHOUT_ITEMS $TOTAL_SCALES))"
echo ""

echo "📝 Items详情:"
echo "   总Items数: $TOTAL_ITEMS"
if [ "$SCALES_WITH_ITEMS" -gt 0 ]; then
  echo "   平均每个量表: $AVG_ITEMS 个items"
  echo "   最少items: $MIN_ITEMS"
  echo "   最多items: $MAX_ITEMS"
else
  echo "   暂无items数据"
fi
echo ""

echo "©️  版权信息:"
echo "   ✅ 有版权信息: $SCALES_WITH_COPYRIGHT ($(calc_percentage $SCALES_WITH_COPYRIGHT $TOTAL_SCALES))"
echo "   ⚠️  无版权信息: $SCALES_WITHOUT_COPYRIGHT ($(calc_percentage $SCALES_WITHOUT_COPYRIGHT $TOTAL_SCALES))"
echo "   📜 有许可类型: $SCALES_WITH_LICENSE ($(calc_percentage $SCALES_WITH_LICENSE $TOTAL_SCALES))"
echo ""

echo "📋 验证状态:"
echo "   📝 Draft: $DRAFT_SCALES ($(calc_percentage $DRAFT_SCALES $TOTAL_SCALES))"
echo "   ✔️  Validated: $VALIDATED_SCALES ($(calc_percentage $VALIDATED_SCALES $TOTAL_SCALES))"
echo "   ✅ Published: $PUBLISHED_SCALES ($(calc_percentage $PUBLISHED_SCALES $TOTAL_SCALES))"
echo ""

echo "🌐 多语言支持:"
echo "   有英文名称: $ENGLISH_NAME ($(calc_percentage $ENGLISH_NAME $TOTAL_SCALES))"
echo "   有英文描述: $ENGLISH_DESC ($(calc_percentage $ENGLISH_DESC $TOTAL_SCALES))"
echo ""

# 计算评分
get_score_emoji() {
  local score=$1
  if (( $(echo "$score >= 90" | bc -l) )); then
    echo "🟢 优秀"
  elif (( $(echo "$score >= 70" | bc -l) )); then
    echo "🟡 良好"
  elif (( $(echo "$score >= 50" | bc -l) )); then
    echo "🟠 一般"
  else
    echo "🔴 需改进"
  fi
}

ITEMS_SCORE=$(awk "BEGIN {printf \"%.1f\", ($SCALES_WITH_ITEMS/$TOTAL_SCALES)*100}")
COPYRIGHT_SCORE=$(awk "BEGIN {printf \"%.1f\", ($SCALES_WITH_COPYRIGHT/$TOTAL_SCALES)*100}")
PUBLISHED_SCORE=$(awk "BEGIN {printf \"%.1f\", ($PUBLISHED_SCALES/$TOTAL_SCALES)*100}")
MULTILANG_SCORE=$(awk "BEGIN {printf \"%.1f\", ($ENGLISH_NAME/$TOTAL_SCALES)*100}")
OVERALL_SCORE=$(awk "BEGIN {printf \"%.1f\", ($ITEMS_SCORE+$COPYRIGHT_SCORE+$PUBLISHED_SCORE+$MULTILANG_SCORE)/4}")

echo "⭐ 质量评分:"
echo "   Items完整度: ${ITEMS_SCORE}%  $(get_score_emoji $ITEMS_SCORE)"
echo "   版权信息完整度: ${COPYRIGHT_SCORE}%  $(get_score_emoji $COPYRIGHT_SCORE)"
echo "   发布状态: ${PUBLISHED_SCORE}%  $(get_score_emoji $PUBLISHED_SCORE)"
echo "   多语言支持: ${MULTILANG_SCORE}%  $(get_score_emoji $MULTILANG_SCORE)"
echo "   ─────────────────────────────────"
echo "   综合评分: ${OVERALL_SCORE}%  $(get_score_emoji $OVERALL_SCORE)"
echo ""

# 待改进项
echo "⚠️  待改进项:"
if [ "$SCALES_WITHOUT_ITEMS" -gt 0 ]; then
  echo "   ⚠️  $SCALES_WITHOUT_ITEMS 个量表缺少items数据"
  echo "      建议运行 items 爬虫补充数据"
fi

if [ "$SCALES_WITHOUT_COPYRIGHT" -gt 0 ]; then
  echo "   ⚠️  $SCALES_WITHOUT_COPYRIGHT 个量表缺少版权信息"
  echo "      建议添加版权方信息"
fi

if [ "$DRAFT_SCALES" -gt 0 ]; then
  echo "   📝 $DRAFT_SCALES 个量表处于Draft状态，需要审核"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# 改进建议
echo "💡 改进建议:"
if (( $(echo "$ITEMS_SCORE < 50" | bc -l) )); then
  echo "   🔴 紧急：Items完整度低于50%，建议立即运行爬虫补充items数据"
elif (( $(echo "$ITEMS_SCORE < 80" | bc -l) )); then
  echo "   🟡 重要：Items完整度低于80%，建议补充缺失的items数据"
fi

if (( $(echo "$COPYRIGHT_SCORE < 70" | bc -l) )); then
  echo "   🟡 重要：版权信息不足，建议添加版权方信息"
fi

if (( $(echo "$PUBLISHED_SCORE < 90" | bc -l) )); then
  echo "   🟡 建议：将验证通过的量表状态改为Published"
fi

if (( $(echo "$MULTILANG_SCORE < 50" | bc -l) )); then
  echo "   🟡 建议：使用AI翻译工具补充英文名称和描述"
fi

echo ""

# 返回退出码
if (( $(echo "$OVERALL_SCORE < 50" | bc -l) )); then
  echo "❌ 质量检查失败：综合评分低于50%"
  echo ""
  exit 1
elif (( $(echo "$OVERALL_SCORE < 80" | bc -l) )); then
  echo "⚠️  质量检查通过，但仍有改进空间"
  echo ""
  exit 0
else
  echo "✅ 质量检查通过：数据质量良好"
  echo ""
  exit 0
fi
