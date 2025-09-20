import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { eq, sql, and, inArray } from 'drizzle-orm';
import { z } from 'zod';

const licenseCheckRequestSchema = z.object({
  scaleIds: z.array(z.string()).min(1).max(20),
  intendedUse: z.enum(['clinical', 'research', 'commercial', 'education', 'personal']),
  organizationType: z.enum(['hospital', 'clinic', 'university', 'research_institute', 'pharmaceutical', 'individual']).optional(),
  country: z.string().optional(),
});

// 获取许可类型的详细信息
function getLicenseTypeDetails(licenseType: string, intendedUse: string) {
  const baseInfo = {
    public_domain: {
      title: '公共领域',
      titleEn: 'Public Domain',
      canUseDirectly: true,
      requiresPermission: false,
      typicalCost: 'FREE',
      restrictions: [],
      icon: '🆓',
      color: 'green',
    },
    open_source: {
      title: '开源许可',
      titleEn: 'Open Source',
      canUseDirectly: true,
      requiresPermission: false,
      typicalCost: 'FREE',
      restrictions: ['需保留版权声明', '可能需要共享改进'],
      icon: '📖',
      color: 'blue',
    },
    academic_free: {
      title: '学术免费',
      titleEn: 'Academic Free',
      canUseDirectly: intendedUse === 'research' || intendedUse === 'education',
      requiresPermission: intendedUse === 'commercial' || intendedUse === 'clinical',
      typicalCost: intendedUse === 'research' ? 'FREE' : 'CONTACT_FOR_PRICING',
      restrictions: ['仅限学术和研究用途', '商业用途需要许可'],
      icon: '🎓',
      color: 'yellow',
    },
    commercial: {
      title: '商业许可',
      titleEn: 'Commercial License',
      canUseDirectly: false,
      requiresPermission: true,
      typicalCost: 'PAID',
      restrictions: ['需要购买许可证', '可能有使用范围限制'],
      icon: '💼',
      color: 'orange',
    },
    contact_required: {
      title: '需联系版权方',
      titleEn: 'Contact Required',
      canUseDirectly: false,
      requiresPermission: true,
      typicalCost: 'VARIES',
      restrictions: ['必须联系版权方确认', '许可条件因用途而异'],
      icon: '📧',
      color: 'red',
    },
    restricted: {
      title: '受限使用',
      titleEn: 'Restricted Use',
      canUseDirectly: false,
      requiresPermission: true,
      typicalCost: 'SPECIAL_PERMISSION',
      restrictions: ['严格限制使用条件', '可能不对外授权'],
      icon: '🔒',
      color: 'gray',
    },
  };

  return baseInfo[licenseType as keyof typeof baseInfo] || baseInfo.contact_required;
}

// 批量检查量表许可状态
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scaleIds, intendedUse, organizationType, country } = licenseCheckRequestSchema.parse(body);
    
    const db = getDB();
    
    // 获取量表许可信息
    const scales = await db
      .select({
        id: ecoaScaleTable.id,
        name: ecoaScaleTable.name,
        nameEn: ecoaScaleTable.nameEn,
        acronym: ecoaScaleTable.acronym,
        categoryName: ecoaCategoryTable.name,
        copyrightInfo: ecoaScaleTable.copyrightInfo,
        psychometricProperties: ecoaScaleTable.psychometricProperties,
      })
      .from(ecoaScaleTable)
      .leftJoin(ecoaCategoryTable, eq(ecoaScaleTable.categoryId, ecoaCategoryTable.id))
      .where(inArray(ecoaScaleTable.id, scaleIds));

    const licenseResults = scales.map(scale => {
      let licenseType = 'contact_required';
      let copyrightContact = null;
      
      if (scale.psychometricProperties) {
        try {
          const props = typeof scale.psychometricProperties === 'string' 
            ? JSON.parse(scale.psychometricProperties)
            : scale.psychometricProperties;
          
          licenseType = props.licenseType || 'contact_required';
          copyrightContact = props.copyrightContact || null;
        } catch (error) {
          console.warn('Error parsing properties for scale:', scale.id);
        }
      }

      const licenseDetails = getLicenseTypeDetails(licenseType, intendedUse);
      
      return {
        scale: {
          id: scale.id,
          name: scale.name,
          acronym: scale.acronym,
          category: scale.categoryName,
        },
        license: {
          ...licenseDetails,
          rawType: licenseType,
        },
        copyright: {
          info: scale.copyrightInfo,
          contact: copyrightContact,
        },
        recommendation: {
          action: licenseDetails.canUseDirectly ? 'proceed' : 'contact_required',
          priority: licenseDetails.requiresPermission ? 'high' : 'low',
          timeEstimate: licenseDetails.canUseDirectly ? 'immediate' : '1-5 business days',
        }
      };
    });

    // 生成使用指导建议
    const summary = {
      totalScales: licenseResults.length,
      canUseDirectly: licenseResults.filter(r => r.license.canUseDirectly).length,
      needsContact: licenseResults.filter(r => r.license.requiresPermission).length,
      estimatedCost: {
        free: licenseResults.filter(r => r.license.typicalCost === 'FREE').length,
        paid: licenseResults.filter(r => r.license.typicalCost === 'PAID').length,
        varies: licenseResults.filter(r => r.license.typicalCost === 'VARIES').length,
      },
      licenseDistribution: licenseResults.reduce((acc, r) => {
        acc[r.license.rawType] = (acc[r.license.rawType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    const recommendations = [];
    
    if (summary.canUseDirectly > 0) {
      recommendations.push(`${summary.canUseDirectly} 个量表可以直接使用，无需额外许可`);
    }
    
    if (summary.needsContact > 0) {
      recommendations.push(`${summary.needsContact} 个量表需要联系版权方获得使用许可`);
    }
    
    if (intendedUse === 'research' || intendedUse === 'education') {
      recommendations.push('学术研究用途通常享有更优惠的许可条件');
    }
    
    if (intendedUse === 'commercial') {
      recommendations.push('商业用途建议提前规划许可获取时间和预算');
    }

    return NextResponse.json({
      results: licenseResults,
      summary,
      recommendations,
      requestInfo: {
        intendedUse,
        organizationType,
        country,
        checkedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('License check API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid license check parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check license information' },
      { status: 500 }
    );
  }
}