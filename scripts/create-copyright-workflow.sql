-- 创建版权联系工单系统表（基于现有表结构扩展）
-- Copyright Request Tickets - 类似 Zendesk 的工单系统

-- 在现有的 user 表中添加团队类型分类
ALTER TABLE user ADD COLUMN teamType TEXT CHECK (teamType IN ('individual_researcher', 'academic_organization', 'university', 'commercial_company', 'pharmaceutical', 'clinic_hospital', 'government', 'nonprofit')) DEFAULT 'individual_researcher';
ALTER TABLE user ADD COLUMN organizationName TEXT;
ALTER TABLE user ADD COLUMN organizationDomain TEXT;
ALTER TABLE user ADD COLUMN organizationSize TEXT CHECK (organizationSize IN ('small', 'medium', 'large', 'enterprise')) DEFAULT 'small';
ALTER TABLE user ADD COLUMN organizationCountry TEXT DEFAULT 'CN';

-- 创建版权联系工单表 (使用现有表模式)
CREATE TABLE IF NOT EXISTS copyright_ticket (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  scaleId TEXT NOT NULL,
  
  -- 工单基本信息
  ticketNumber TEXT UNIQUE NOT NULL, -- CRT-20250920-001
  subject TEXT NOT NULL,
  requestType TEXT NOT NULL, -- license_inquiry, usage_request, pricing_info, support
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT DEFAULT 'open', -- open, in_progress, waiting_response, resolved, closed
  
  -- 版权方信息
  copyrightOrganization TEXT NOT NULL,
  copyrightEmail TEXT,
  copyrightPhone TEXT,
  copyrightWebsite TEXT,
  
  -- 用户请求信息
  intendedUse TEXT NOT NULL,
  projectDescription TEXT,
  expectedStartDate TEXT,
  expectedDuration TEXT,
  budgetRange TEXT,
  
  -- 沟通记录
  initialMessage TEXT,
  lastContactAt INTEGER,
  responseReceived INTEGER DEFAULT 0,
  lastResponseAt INTEGER,
  responseMessage TEXT,
  adminNotes TEXT,
  
  -- 结果信息
  licenseGranted INTEGER DEFAULT 0,
  licenseTerms TEXT,
  licenseFee TEXT,
  licenseExpiryDate INTEGER,
  
  -- 系统字段
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  resolvedAt INTEGER,
  
  FOREIGN KEY (userId) REFERENCES user(id),
  FOREIGN KEY (scaleId) REFERENCES ecoa_scale(id)
);

-- 创建工单沟通记录表
CREATE TABLE IF NOT EXISTS copyright_ticket_message (
  id TEXT PRIMARY KEY,
  ticketId TEXT NOT NULL,
  
  -- 消息信息
  messageType TEXT NOT NULL, -- user_message, system_message, copyright_response, admin_note
  sender TEXT, -- user_id or 'system' or 'copyright_holder' or 'admin'
  subject TEXT,
  content TEXT NOT NULL,
  attachments TEXT, -- JSON array of file URLs
  
  -- 消息状态
  isRead INTEGER DEFAULT 0,
  isPublic INTEGER DEFAULT 1, -- 0 for internal admin notes
  
  -- 自动化信息
  emailSent INTEGER DEFAULT 0,
  emailSentAt INTEGER,
  emailDelivered INTEGER DEFAULT 0,
  emailOpened INTEGER DEFAULT 0,
  
  createdAt INTEGER NOT NULL,
  
  FOREIGN KEY (ticketId) REFERENCES copyright_ticket(id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_copyright_ticket_user_id ON copyright_ticket(userId);
CREATE INDEX IF NOT EXISTS idx_copyright_ticket_scale_id ON copyright_ticket(scaleId);
CREATE INDEX IF NOT EXISTS idx_copyright_ticket_status ON copyright_ticket(status);
CREATE INDEX IF NOT EXISTS idx_copyright_ticket_priority ON copyright_ticket(priority);
CREATE INDEX IF NOT EXISTS idx_copyright_ticket_created_at ON copyright_ticket(createdAt);
CREATE INDEX IF NOT EXISTS idx_copyright_ticket_number ON copyright_ticket(ticketNumber);

CREATE INDEX IF NOT EXISTS idx_ticket_message_ticket_id ON copyright_ticket_message(ticketId);
CREATE INDEX IF NOT EXISTS idx_ticket_message_type ON copyright_ticket_message(messageType);
CREATE INDEX IF NOT EXISTS idx_ticket_message_created_at ON copyright_ticket_message(createdAt);