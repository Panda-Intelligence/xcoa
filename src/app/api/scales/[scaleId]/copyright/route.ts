import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { ecoaScaleTable, ecoaCategoryTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const copyrightParamsSchema = z.object({
  scaleId: z.string(),
});

const contactRequestSchema = z.object({
  scaleId: z.string(),
  requestType: z.enum(['license_inquiry', 'usage_request', 'support', 'pricing_info', 'other']),
  intendedUse: z.enum(['clinical', 'research', 'commercial', 'education', 'personal', 'other']),
  contactName: z.string().min(1).max(255),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  organizationName: z.string().optional(),
  message: z.string().max(2000).optional(),
});

// 获取许可类型详情
function getLicenseInfo(licenseType: string) {
  const licenses = {
    public_domain: {
      type: 'public_domain',
      title: '公共领域',
      description: '可自由使用，无需许可',
      canUseDirectly: true,
      requiresContact: false,
      icon: '🆓',
      color: 'green',
      usageGuidelines: '可用于临床、研究和教育目的，建议保留原始版权声明。'
    },
    academic_free: {
      type: 'academic_free',
      title: '学术免费',
      description: '学术和研究用途免费，商业用途需要许可',
      canUseDirectly: false,
      requiresContact: true,
      icon: '🎓',
      color: 'yellow',
      usageGuidelines: '学术研究和非营利临床使用免费，商业用途需联系版权方获得许可。'
    },
    commercial: {
      type: 'commercial',
      title: '商业许可',
      description: '需要购买许可证使用',
      canUseDirectly: false,
      requiresContact: true,
      icon: '💼',
      color: 'orange',
      usageGuidelines: '所有用途均需购买相应许可证，请联系版权方获取详细信息。'
    },
    contact_required: {
      type: 'contact_required',
      title: '需联系版权方',
      description: '使用前需联系版权方确认许可',
      canUseDirectly: false,
      requiresContact: true,
      icon: '📧',
      color: 'red',
      usageGuidelines: '使用前必须联系版权方获得明确的使用许可，不同用途可能有不同要求。'
    }
  };

  return licenses[licenseType as keyof typeof licenses] || licenses.contact_required;
}

// 获取版权信息
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  try {
    const db = getDB();
    const params = await context.params;
    const { scaleId } = copyrightParamsSchema.parse(params);

    const [scale] = await db
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
      .where(eq(ecoaScaleTable.id, scaleId));

    if (!scale) {
      return NextResponse.json({ error: 'Scale not found' }, { status: 404 });
    }

    // 解析版权信息
    let copyrightContact = null;
    let licenseType = 'contact_required';

    if (scale.psychometricProperties) {
      try {
        const props = typeof scale.psychometricProperties === 'string'
          ? JSON.parse(scale.psychometricProperties)
          : scale.psychometricProperties;

        licenseType = props.licenseType || 'contact_required';
        copyrightContact = props.copyrightContact || null;
      } catch (error) {
        console.warn('Error parsing psychometric properties:', error);
      }
    }

    const licenseInfo = getLicenseInfo(licenseType);

    return NextResponse.json({
      scale: {
        id: scale.id,
        name: scale.name,
        nameEn: scale.nameEn,
        acronym: scale.acronym,
        category: scale.categoryName,
      },
      copyright: {
        info: scale.copyrightInfo,
        contact: copyrightContact,
        license: licenseInfo,
      },
      actions: {
        canUseDirectly: licenseInfo.canUseDirectly,
        requiresContact: licenseInfo.requiresContact,
        availableActions: [
          licenseInfo.canUseDirectly ? 'direct_use' : null,
          licenseInfo.requiresContact ? 'contact_copyright_holder' : null,
          'view_license_terms',
        ].filter(Boolean),
      }
    });

  } catch (error) {
    console.error('Copyright info API error:', error);
    return NextResponse.json({ error: 'Failed to fetch copyright information' }, { status: 500 });
  }
}

// 处理版权联系请求
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contactRequest = contactRequestSchema.parse(body);

    const db = getDB();

    const [scale] = await db
      .select({
        id: ecoaScaleTable.id,
        name: ecoaScaleTable.name,
        acronym: ecoaScaleTable.acronym,
        psychometricProperties: ecoaScaleTable.psychometricProperties,
      })
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, contactRequest.scaleId));

    if (!scale) {
      return NextResponse.json({ error: 'Scale not found' }, { status: 404 });
    }

    // 解析联系信息
    let copyrightContact = null;
    if (scale.psychometricProperties) {
      try {
        const props = typeof scale.psychometricProperties === 'string'
          ? JSON.parse(scale.psychometricProperties)
          : scale.psychometricProperties;
        copyrightContact = props.copyrightContact || null;
      } catch (error) {
        console.warn('Error parsing copyright contact:', error);
      }
    }

    if (!copyrightContact || !copyrightContact.email) {
      return NextResponse.json(
        { error: 'No contact information available for this scale' },
        { status: 400 }
      );
    }

    // 生成邮件模板
    const emailTemplate = {
      to: copyrightContact.email,
      subject: `xCOA Platform - ${contactRequest.requestType.replace('_', ' ')} for ${scale.acronym}`,
      body: `Dear ${copyrightContact.organization} Team,

I am writing to inquire about the usage license for the following assessment scale:

Scale Information:
- Name: ${scale.name}
- Acronym: ${scale.acronym}
- Request Type: ${contactRequest.requestType.replace('_', ' ')}
- Intended Use: ${contactRequest.intendedUse}

Contact Information:
- Name: ${contactRequest.contactName}
- Email: ${contactRequest.contactEmail}
- Phone: ${contactRequest.contactPhone || 'N/A'}
- Organization: ${contactRequest.organizationName || 'Individual'}

${contactRequest.message ? `Message:\n${contactRequest.message}\n` : ''}

This inquiry was submitted through the xCOA platform (openecoa.com).

Thank you for your consideration.

Best regards,
${contactRequest.contactName}`
    };

    return NextResponse.json({
      success: true,
      message: 'Contact information prepared',
      emailTemplate,
      copyrightHolder: copyrightContact,
      nextSteps: [
        `发送邮件至: ${copyrightContact.email}`,
        copyrightContact.phone ? `电话联系: ${copyrightContact.phone}` : null,
        copyrightContact.website ? `访问官网: ${copyrightContact.website}` : null,
      ].filter(Boolean)
    });

  } catch (error) {
    console.error('Copyright contact error:', error);
    return NextResponse.json({ error: 'Failed to process contact request' }, { status: 500 });
  }
}