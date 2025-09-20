import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { userTable, teamTable } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { z } from 'zod';

const teamTypeUpdateSchema = z.object({
  teamType: z.enum([
    'individual_researcher',
    'academic_organization', 
    'university',
    'commercial_company',
    'pharmaceutical',
    'clinic_hospital',
    'government',
    'nonprofit'
  ]),
  organizationName: z.string().optional(),
  organizationDomain: z.string().optional(),
  organizationSize: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
  organizationCountry: z.string().optional(),
});

// 获取团队类型定价信息
export async function GET(request: NextRequest) {
  try {
    const pricingTiers = {
      individual_researcher: {
        type: 'individual_researcher',
        name: '个人研究者',
        nameEn: 'Individual Researcher',
        description: '独立研究人员或学生',
        icon: '👨‍🔬',
        color: 'blue',
        pricing: {
          copyrightContact: 2,
          scaleInterpretation: 1,
          bulkDownload: 3,
          prioritySupport: 5,
        },
        features: [
          '基础版权联系服务',
          '标准响应时间 (5-7个工作日)',
          '基础量表解读功能',
          '个人使用许可支持',
        ],
        limitations: [
          '不支持批量操作',
          '不包含商业使用咨询',
          '标准优先级处理',
        ],
      },
      academic_organization: {
        type: 'academic_organization',
        name: '学术机构',
        nameEn: 'Academic Organization',
        description: '学术研究机构或实验室',
        icon: '🏛️',
        color: 'green',
        pricing: {
          copyrightContact: 5,
          scaleInterpretation: 2,
          bulkDownload: 8,
          prioritySupport: 10,
        },
        features: [
          '学术优惠定价',
          '批量许可支持',
          '专业量表解读',
          '优先响应 (3-5个工作日)',
          '研究用途许可专业咨询',
        ],
        limitations: [
          '仅限学术研究用途',
          '需要提供机构证明',
        ],
      },
      university: {
        type: 'university',
        name: '大学院校',
        nameEn: 'University',
        description: '高等教育院校',
        icon: '🎓',
        color: 'purple',
        pricing: {
          copyrightContact: 8,
          scaleInterpretation: 3,
          bulkDownload: 12,
          prioritySupport: 15,
        },
        features: [
          '教育机构特惠',
          '多科室使用支持',
          '学生使用许可',
          '快速响应 (2-3个工作日)',
          '教学使用许可咨询',
          '批量师生账户管理',
        ],
        limitations: [
          '需要验证教育机构身份',
          '商业用途需要额外授权',
        ],
      },
      commercial_company: {
        type: 'commercial_company',
        name: '商业公司',
        nameEn: 'Commercial Company',
        description: '一般商业机构',
        icon: '🏢',
        color: 'orange',
        pricing: {
          copyrightContact: 15,
          scaleInterpretation: 8,
          bulkDownload: 25,
          prioritySupport: 30,
        },
        features: [
          '商业使用许可支持',
          '快速响应 (1-2个工作日)',
          '专业法务咨询',
          '定制化许可方案',
          '多项目管理支持',
        ],
        limitations: [
          '商业定价标准',
          '可能需要更复杂的许可协议',
        ],
      },
      pharmaceutical: {
        type: 'pharmaceutical',
        name: '制药公司',
        nameEn: 'Pharmaceutical Company',
        description: '制药和生物技术公司',
        icon: '💊',
        color: 'red',
        pricing: {
          copyrightContact: 25,
          scaleInterpretation: 15,
          bulkDownload: 40,
          prioritySupport: 50,
        },
        features: [
          '临床试验许可专业服务',
          '紧急响应 (24小时内)',
          '监管合规咨询',
          '全球多地区许可支持',
          '专属客户经理',
          'FDA/EMA 申报支持',
        ],
        limitations: [
          '需要完整的合规审查',
          '可能涉及复杂的知识产权协议',
        ],
      },
      clinic_hospital: {
        type: 'clinic_hospital',
        name: '医院诊所',
        nameEn: 'Clinic/Hospital',
        description: '医疗机构和诊所',
        icon: '🏥',
        color: 'teal',
        pricing: {
          copyrightContact: 10,
          scaleInterpretation: 5,
          bulkDownload: 15,
          prioritySupport: 20,
        },
        features: [
          '临床使用许可支持',
          '医疗优先响应 (2-4个工作日)',
          '患者使用指导',
          '质量改进项目支持',
          '多科室使用许可',
        ],
        limitations: [
          '需要医疗机构认证',
          '研究用途可能需要额外许可',
        ],
      },
    };

    return NextResponse.json({
      pricingTiers,
      recommendations: {
        forResearchers: '选择"学术机构"或"大学院校"可享受研究优惠',
        forClinics: '医院诊所享有临床使用专业支持',
        forPharma: '制药公司获得监管合规和全球许可专业服务',
        forIndividuals: '个人研究者适合小规模项目和学习用途',
      },
      comparisonMatrix: {
        responseTime: {
          individual_researcher: '5-7 工作日',
          academic_organization: '3-5 工作日',
          university: '2-3 工作日',
          commercial_company: '1-2 工作日',
          pharmaceutical: '24 小时内',
          clinic_hospital: '2-4 工作日',
        },
        supportLevel: {
          individual_researcher: '基础',
          academic_organization: '专业',
          university: '高级',
          commercial_company: '专业+',
          pharmaceutical: '企业级',
          clinic_hospital: '医疗专业',
        },
      }
    });

  } catch (error) {
    console.error('Team pricing API error:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing information' }, { status: 500 });
  }
}

// 更新用户/团队类型
export async function PUT(request: NextRequest) {
  try {
    const db = getDB();
    const session = await getSessionFromCookie();
    const user = session?.user;
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const body = await request.json();
    const updateData = teamTypeUpdateSchema.parse(body);
    
    // 更新用户团队类型信息 (通过 SQL 直接更新，因为表结构是新增的)
    await db.execute(sql`
      UPDATE user SET
        teamType = ${updateData.teamType},
        organizationName = ${updateData.organizationName || null},
        organizationDomain = ${updateData.organizationDomain || null},
        organizationSize = ${updateData.organizationSize || 'small'},
        organizationCountry = ${updateData.organizationCountry || 'CN'},
        updatedAt = ${Math.floor(Date.now() / 1000)}
      WHERE id = ${user.id}
    `);

    // 获取更新后的用户信息
    const updatedUser = await db.execute(sql`
      SELECT teamType, organizationName, organizationSize, organizationCountry
      FROM user WHERE id = ${user.id}
    `);

    return NextResponse.json({
      success: true,
      message: 'Team type updated successfully',
      updatedInfo: updatedUser.results?.[0] || null,
      newPricing: {
        copyrightContact: calculateCopyrightContactFee(updateData.teamType, 'license_inquiry'),
        scaleInterpretation: calculateScaleInterpretationFee(updateData.teamType),
      }
    });

  } catch (error) {
    console.error('Team type update API error:', error);
    return NextResponse.json({ error: 'Failed to update team type' }, { status: 500 });
  }
}

// 计算费用的辅助函数
function calculateCopyrightContactFee(teamType: string, requestType: string): number {
  const baseFees = {
    individual_researcher: 2,
    academic_organization: 5,
    university: 8,
    commercial_company: 15,
    pharmaceutical: 25,
    clinic_hospital: 10,
    government: 8,
    nonprofit: 5,
  };
  
  return baseFees[teamType as keyof typeof baseFees] || 10;
}

function calculateScaleInterpretationFee(teamType: string): number {
  const fees = {
    individual_researcher: 1,
    academic_organization: 2,
    university: 3,
    commercial_company: 8,
    pharmaceutical: 15,
    clinic_hospital: 5,
    government: 3,
    nonprofit: 2,
  };
  
  return fees[teamType as keyof typeof fees] || 5;
}