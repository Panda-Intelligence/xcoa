import { headers } from 'next/headers';

type Language = 'zh' | 'en';

// Static metadata translations - avoids dynamic imports in Cloudflare Workers
const AUTH_METADATA_TRANSLATIONS = {
  zh: {
    sign_in_title: '登录',
    sign_in_description: '登录您的账户',
    sign_up_title: '注册',
    sign_up_description: '创建新账户',
    verify_email_title: '验证邮箱',
    verify_email_description: '验证您的邮箱地址',
    team_invite_title: '接受团队邀请',
    team_invite_description: '接受加入团队的邀请',
    forgot_password_title: '忘记密码',
    forgot_password_description: '重置您的密码',
    reset_password_title: '重置密码',
    reset_password_description: '为您的账户设置新密码',
    google_callback_title: '使用Google登录',
    google_callback_description: '完成您的Google登录'
  },
  en: {
    sign_in_title: 'Sign In',
    sign_in_description: 'Sign in to your account',
    sign_up_title: 'Sign Up',
    sign_up_description: 'Create a new account',
    verify_email_title: 'Verify Email',
    verify_email_description: 'Verify your email address',
    team_invite_title: 'Accept Team Invitation',
    team_invite_description: 'Accept an invitation to join a team',
    forgot_password_title: 'Forgot Password',
    forgot_password_description: 'Reset your password',
    reset_password_title: 'Reset Password',
    reset_password_description: 'Set a new password for your account',
    google_callback_title: 'Sign in with Google',
    google_callback_description: 'Complete your sign in with Google'
  }
} as const;

// Detect language from headers
async function detectLanguage(): Promise<Language> {
  try {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language') || '';
    
    // Simple language detection - prioritize Chinese if detected
    if (acceptLanguage.includes('zh')) {
      return 'zh';
    }
    
    return 'en'; // Default to English
  } catch {
    return 'en'; // Fallback to English if headers are not available
  }
}

// Convenience function for auth metadata
export async function getAuthMetadata(key: string, lang?: Language): Promise<string> {
  const language = lang || await detectLanguage();
  
  try {
    const translation = AUTH_METADATA_TRANSLATIONS[language][key as keyof typeof AUTH_METADATA_TRANSLATIONS[Language]];
    
    if (translation) {
      return translation;
    }

    // Try fallback language
    const fallbackLang = language === 'zh' ? 'en' : 'zh';
    const fallbackTranslation = AUTH_METADATA_TRANSLATIONS[fallbackLang][key as keyof typeof AUTH_METADATA_TRANSLATIONS[Language]];

    if (fallbackTranslation) {
      return fallbackTranslation;
    }

    return key; // Return key as fallback
  } catch (error) {
    console.error(`Failed to get auth metadata for key ${key}:`, error);
    return key;
  }
}