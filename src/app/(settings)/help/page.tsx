'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  HelpCircle,
  Book,
  MessageSquare,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
  Users,
  Settings,
  CreditCard
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import Link from 'next/link';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  helpful: boolean;
}

export default function HelpPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get FAQ data from translations
  const FAQ_DATA: FAQItem[] = useMemo(() => {
    const faqKeys = [
      'basic_001', 'basic_002', 'basic_003',
      'favorites_001', 'favorites_002',
      'copyright_001', 'copyright_002', 'copyright_003',
      'tech_001', 'tech_002', 'tech_003',
      'account_001', 'account_002',
      'team_001', 'team_002'
    ];

    return faqKeys.map(key => ({
      id: key,
      category: t(`help.categories.${key.split('_')[0]}`),
      question: t(`help.faq.${key}.question`),
      answer: t(`help.faq.${key}.answer`),
      tags: t(`help.faq.${key}.tags`) as unknown as string[],
      helpful: true
    }));
  }, [t]);

  // Get all categories
  const categories = useMemo(() => [
    'all',
    'basic',
    'favorites',
    'copyright',
    'tech_support',
    'account',
    'team'
  ], []);

  // Filter FAQ
  const filteredFAQ = FAQ_DATA.filter(item => {
    const matchesSearch = !searchQuery ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' ||
      item.id.startsWith(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Toggle FAQ expansion
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        items={[
          { href: "/help", label: t('help.title') }
        ]}
      />

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col gap-4 p-4">
          {/* Page Title */}
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold flex items-center justify-center space-x-3 mb-4">
              <HelpCircle className="w-8 h-8 text-blue-600" />
              <span>{t('help.page_title')}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('help.description')}
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('help.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          <Tabs defaultValue="faq" className="max-w-4xl mx-auto w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="faq">{t('help.tabs.faq')}</TabsTrigger>
              <TabsTrigger value="guides">{t('help.tabs.guides')}</TabsTrigger>
              <TabsTrigger value="contact">{t('help.tabs.contact')}</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-6">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {t(`help.categories.${category}`)}
                  </Button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                {filteredFAQ.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">{t('help.no_results.title')}</h3>
                      <p className="text-muted-foreground">
                        {t('help.no_results.description')}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredFAQ.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="cursor-pointer" onClick={() => toggleExpanded(item.id)}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg leading-tight">
                              {item.question}
                            </CardTitle>
                          </div>
                          <div className="flex items-center space-x-2">
                            {expandedItems.has(item.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {expandedItems.has(item.id) && (
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-muted-foreground leading-relaxed">
                              {item.answer}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {item.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t">
                              <span className="text-sm text-muted-foreground">{t('help.feedback.question')}</span>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  {t('help.feedback.helpful')}
                                </Button>
                                <Button size="sm" variant="outline">
                                  {t('help.feedback.not_helpful')}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="guides" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Book className="w-5 h-5 text-blue-600" />
                      <span>{t('help.guides.quick_start.title')}</span>
                    </CardTitle>
                    <CardDescription>
                      {t('help.guides.quick_start.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {(t('help.guides.quick_start.items') as unknown as string[]).map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      <span>{t('help.guides.copyright.title')}</span>
                    </CardTitle>
                    <CardDescription>
                      {t('help.guides.copyright.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {(t('help.guides.copyright.items') as unknown as string[]).map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span>{t('help.guides.team.title')}</span>
                    </CardTitle>
                    <CardDescription>
                      {t('help.guides.team.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {(t('help.guides.team.items') as unknown as string[]).map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                      <span>{t('help.guides.billing.title')}</span>
                    </CardTitle>
                    <CardDescription>
                      {t('help.guides.billing.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {(t('help.guides.billing.items') as unknown as string[]).map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span>{t('help.contact.email.title')}</span>
                    </CardTitle>
                    <CardDescription>
                      {t('help.contact.email.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-sm">{t('help.contact.email.customer_service')}</span>
                        <p className="text-blue-600">support@openecoa.com</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">{t('help.contact.email.business')}</span>
                        <p className="text-blue-600">business@openecoa.com</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">{t('help.contact.email.technical')}</span>
                        <p className="text-blue-600">tech@openecoa.com</p>
                      </div>
                      <Button className="w-full">
                        <Mail className="w-4 h-4 mr-2" />
                        {t('help.contact.email.send_email')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      <span>{t('help.contact.chat.title')}</span>
                    </CardTitle>
                    <CardDescription>
                      {t('help.contact.chat.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-sm">{t('help.contact.chat.service_hours')}</span>
                        <p className="text-muted-foreground">{t('help.contact.chat.service_hours_value')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">{t('help.contact.chat.response_time')}</span>
                        <p className="text-muted-foreground">{t('help.contact.chat.response_time_value')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">{t('help.contact.chat.languages')}</span>
                        <p className="text-muted-foreground">{t('help.contact.chat.languages_value')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Other Resources */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Book className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-medium mb-1">{t('help.contact.resources.manual.title')}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t('help.contact.resources.manual.description')}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {t('help.contact.resources.manual.action')}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium mb-1">{t('help.contact.resources.api_docs.title')}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t('help.contact.resources.api_docs.description')}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {t('help.contact.resources.api_docs.action')}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-medium mb-1">{t('help.contact.resources.forum.title')}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {t('help.contact.resources.forum.description')}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {t('help.contact.resources.forum.action')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}