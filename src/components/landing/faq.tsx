'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/hooks/useLanguage";

export function FAQ() {
  const { t } = useLanguage()

  const faqs = [
    {
      question: t('landing.faq_scales_coverage'),
      answer: (
        <>
          <p>xCOA平台收录了500+个标准化临床评估量表，涵盖多个专业领域：</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>精神心理：PHQ-9、GAD-7、BDI-II、HAM-D等抑郁焦虑评估量表</li>
            <li>认知功能：MMSE-2、MoCA、ADAS-Cog等认知评估工具</li>
            <li>生活质量：SF-36、EORTC QLQ-C30、FACT-G等生活质量评估</li>
            <li>疼痛评估：VAS、NRS、McGill疼痛问卷等疼痛量表</li>
            <li>功能评估：Barthel指数、FIM等功能独立性评估</li>
            <li>儿童评估：CBCL、Conners等儿童行为评估量表</li>
          </ul>
        </>
      ),
    },
    {
      question: t('landing.faq_copyright_compliance'),
      answer: (
        <>
          <p>xCOA平台提供专业的版权合规服务：</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>版权状态标识：每个量表都标明版权状态（公共领域、学术免费、商业许可等）</li>
            <li>许可申请服务：协助用户与版权方建立联系，申请使用许可</li>
            <li>工单跟踪系统：完整记录申请进展，确保合规流程</li>
            <li>专业建议：提供不同用途（临床、研究、商业）的许可建议</li>
            <li>法律风险提醒：明确标识需要特殊许可的量表，避免侵权风险</li>
          </ul>
        </>
      ),
    },
    {
      question: t('landing.faq_interpretation_content'),
      answer: (
        <>
          <p>我们为每个量表提供全面的专业解读指南：</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>评分方法：详细的计分方式和权重说明</li>
            <li>结果解读：不同分数段的临床意义和严重程度分级</li>
            <li>实施指导：量表使用的最佳实践和注意事项</li>
            <li>常见问题：实施过程中的常见挑战和解决方案</li>
            <li>文化适应：跨文化使用时的考虑因素</li>
            <li>临床应用：在筛查、诊断、监测、研究中的具体应用</li>
          </ul>
        </>
      ),
    },
    {
      question: t('landing.faq_cases_value'),
      answer: (
        <>
          <p>临床案例库提供真实的学习案例，帮助提升量表应用能力：</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>真实案例：基于实际临床情况的案例分析</li>
            <li>专科分类：按精神科、肿瘤科、神经科等专科组织</li>
            <li>难度分级：初级、中级、高级，适合不同经验水平</li>
            <li>完整流程：从患者背景到评估结果、临床决策的完整过程</li>
            <li>学习要点：提炼关键学习点，加深理解</li>
            <li>最佳实践：展示量表在实际临床中的最佳应用方式</li>
          </ul>
        </>
      ),
    },
    {
      question: t('landing.faq_scale_selection'),
      answer: (
        <>
          <p>xCOA平台提供多种方式帮助您选择合适的量表：</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>智能搜索：输入临床需求，AI推荐相关量表</li>
            <li>分类浏览：按疾病领域、评估目的、患者人群分类</li>
            <li>对比功能：比较不同量表的特点和适用性</li>
            <li>专家建议：基于循证医学的使用建议</li>
            <li>使用频率：参考其他用户的使用情况</li>
            <li>咨询服务：专业团队提供个性化的量表选择建议</li>
          </ul>
        </>
      ),
    },
    {
      question: t('landing.faq_data_security'),
      answer: (
        <>
          <p>我们采用企业级安全措施保护您的数据：</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>数据加密：全程HTTPS加密传输，数据库加密存储</li>
            <li>访问控制：基于角色的权限管理，最小权限原则</li>
            <li>隐私保护：严格遵循GDPR和中国数据保护法规</li>
            <li>审计日志：完整的操作日志记录，确保可追溯性</li>
            <li>定期备份：多重备份机制，确保数据安全</li>
            <li>合规认证：符合医疗行业数据安全标准</li>
          </ul>
        </>
      ),
    },
    {
      question: t('landing.faq_user_types'),
      answer: (
        <>
          <p>xCOA平台为不同用户群体提供专业服务：</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>临床医生：日常诊疗中的标准化评估和结果解读</li>
            <li>科研人员：临床试验和科研项目的评估工具选择</li>
            <li>心理咨询师：心理健康评估和治疗监测</li>
            <li>制药企业：药物临床试验的疗效评估</li>
            <li>医学院校：教学培训和学术研究</li>
            <li>医疗机构：标准化评估流程建设和质量管理</li>
          </ul>
        </>
      ),
    },
    {
      question: t('landing.faq_support_service'),
      answer: (
        <>
          <p>我们提供多层次的支持服务：</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>在线帮助：平台内置帮助文档和使用指南</li>
            <li>工单系统：提交技术问题或版权咨询，专业团队响应</li>
            <li>专家咨询：资深临床专家提供量表选择和应用建议</li>
            <li>培训服务：量表使用培训和最佳实践分享</li>
            <li>定制服务：根据特殊需求提供定制化解决方案</li>
            <li>邮件支持：support@xcoa.pro 提供技术支持</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10 dark:divide-gray-100/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight">
            {t("landing.frequently_asked_questions")}
          </h2>
          <Accordion type="single" collapsible className="w-full mt-10">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question.slice(0, 50)} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose dark:prose-invert w-full max-w-none">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}