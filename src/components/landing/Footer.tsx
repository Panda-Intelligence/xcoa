import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">eCOA Pro</h3>
            <p className="text-sm text-muted-foreground">
              专业的电子临床结果评估量表 AI 检索平台，为医疗研究提供数字化解决方案。
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@ecoapro.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>400-123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>北京市朝阳区</span>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">产品</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">量表库</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI 检索</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">数据分析</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API 服务</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">资源</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">帮助文档</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">开发者指南</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">最佳实践</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">研究案例</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">公司</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">关于我们</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">新闻动态</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">招聘信息</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">联系我们</a></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 eCOA Pro. 保留所有权利。
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              隐私政策
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              服务条款
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookie 政策
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}