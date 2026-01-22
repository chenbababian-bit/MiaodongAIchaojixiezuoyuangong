"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    "nav.features": "Features",
    "nav.showcase": "Showcase",
    "nav.reviews": "Reviews",
    "nav.faq": "FAQ",
    "nav.getStarted": "Get Started",
    
    // Hero
    "hero.badge": "AI Image Editor",
    "hero.title": "Transform Images with",
    "hero.titleHighlight": "Simple Text",
    "hero.description": "Advanced AI model delivers consistent character editing and scene preservation. Experience the future of AI image editing with natural language prompts.",
    "hero.cta": "Start Editing",
    "hero.secondary": "View Examples",
    
    // Upload Section
    "upload.title": "Get Started",
    "upload.subtitle": "Try The AI Editor",
    "upload.description": "Experience the power of natural language image editing. Transform any photo with simple text commands.",
    "upload.promptEngine": "Prompt Engine",
    "upload.promptDesc": "Transform your image with AI-powered editing",
    "upload.imageToImage": "Image to Image",
    "upload.textToImage": "Text to Image",
    "upload.modelSelection": "AI Model Selection",
    "upload.modelDesc": "Different models offer unique characteristics and styles",
    "upload.referenceImage": "Reference Image",
    "upload.addImage": "Add Image",
    "upload.maxSize": "Max 10MB",
    "upload.mainPrompt": "Main Prompt",
    "upload.promptPlaceholder": "Describe your desired edit...",
    "upload.generate": "Generate Now",
    "upload.outputGallery": "Output Gallery",
    "upload.outputDesc": "Your AI creations appear here instantly",
    "upload.ready": "Ready for generation",
    "upload.readyDesc": "Enter your prompt and unleash the power",
    
    // Features
    "features.title": "Core Features",
    "features.subtitle": "Why Choose FrogSnap?",
    "features.description": "The most advanced AI image editor. Revolutionize your photo editing with natural language understanding.",
    "features.naturalLanguage": "Natural Language Editing",
    "features.naturalLanguageDesc": "Edit images using simple text prompts. AI understands complex instructions like GPT for images.",
    "features.characterConsistency": "Character Consistency",
    "features.characterConsistencyDesc": "Maintain perfect character details across edits. Excels at preserving faces and identities.",
    "features.scenePreservation": "Scene Preservation",
    "features.scenePreservationDesc": "Seamlessly blend edits with original backgrounds. Superior scene fusion technology.",
    "features.oneShot": "One-Shot Editing",
    "features.oneShotDesc": "Perfect results in a single attempt. Solves one-shot image editing challenges effortlessly.",
    "features.multiImage": "Multi-Image Context",
    "features.multiImageDesc": "Process multiple images simultaneously. Support for advanced multi-image editing workflows.",
    "features.ugc": "AI UGC Creation",
    "features.ugcDesc": "Create consistent AI influencers and UGC content. Perfect for social media and marketing.",
    
    // Showcase
    "showcase.title": "Showcase",
    "showcase.subtitle": "Lightning-Fast AI Creations",
    "showcase.description": "See what FrogSnap generates in milliseconds",
    "showcase.speed": "FrogSnap Speed",
    "showcase.cta": "Try FrogSnap Generator",
    "showcase.item1": "Ultra-Fast Portrait Generation",
    "showcase.item1Desc": "Created in 0.8 seconds with optimized neural engine",
    "showcase.item2": "Instant Scene Creation",
    "showcase.item2Desc": "Complex scene rendered in milliseconds",
    "showcase.item3": "Real-time Style Transfer",
    "showcase.item3Desc": "Photorealistic results at lightning speed",
    "showcase.item4": "Rapid Effect Generation",
    "showcase.item4Desc": "Advanced effects processed instantly",
    
    // Reviews
    "reviews.title": "User Reviews",
    "reviews.subtitle": "What creators are saying",
    "reviews.role1": "Digital Creator",
    "reviews.review1": "This editor completely changed my workflow. The character consistency is incredible!",
    "reviews.role2": "UGC Specialist",
    "reviews.review2": "Creating consistent AI content has never been easier. It maintains perfect details across edits!",
    "reviews.role3": "Professional Editor",
    "reviews.review3": "One-shot editing is basically solved with this tool. The scene blending is so natural!",
    
    // FAQ
    "faq.title": "FAQs",
    "faq.subtitle": "Frequently Asked Questions",
    "faq.q1": "What is FrogSnap?",
    "faq.a1": "FrogSnap is a revolutionary AI image editing tool that transforms photos using natural language prompts. It offers exceptional consistency and superior performance for character editing and scene preservation.",
    "faq.q2": "How does it work?",
    "faq.a2": "Simply upload an image and describe your desired edits in natural language. The AI understands complex instructions and processes your text prompt to generate perfectly edited images.",
    "faq.q3": "What makes it different?",
    "faq.a3": "FrogSnap excels in character consistency, scene blending, and one-shot editing. It preserves facial features and seamlessly integrates edits with backgrounds, also supporting multi-image context.",
    "faq.q4": "Can I use it for commercial projects?",
    "faq.a4": "Yes! FrogSnap is perfect for creating AI UGC content, social media campaigns, and marketing materials. The high-quality outputs are suitable for professional use.",
    "faq.q5": "What types of edits can it handle?",
    "faq.a5": "The editor handles complex edits including face completion, background changes, object placement, style transfers, and character modifications while maintaining photorealistic quality.",
    "faq.q6": "Is there a free trial?",
    "faq.a6": "Yes, you can try FrogSnap for free with limited generations. Upgrade to Pro for unlimited access and advanced features like batch processing.",
    
    // Footer
    "footer.tagline": "Transform your images with AI",
    "footer.product": "Product",
    "footer.company": "Company",
    "footer.legal": "Legal",
    "footer.features": "Features",
    "footer.pricing": "Pricing",
    "footer.api": "API",
    "footer.about": "About",
    "footer.blog": "Blog",
    "footer.careers": "Careers",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.cookies": "Cookies",
    "footer.rights": "All rights reserved.",
  },
  zh: {
    // Header
    "nav.features": "功能特点",
    "nav.showcase": "案例展示",
    "nav.reviews": "用户评价",
    "nav.faq": "常见问题",
    "nav.getStarted": "开始使用",
    
    // Hero
    "hero.badge": "AI 图像编辑器",
    "hero.title": "用简单文字",
    "hero.titleHighlight": "变换图像",
    "hero.description": "先进的 AI 模型提供一致的角色编辑和场景保留。通过自然语言提示，体验 AI 图像编辑的未来。",
    "hero.cta": "开始编辑",
    "hero.secondary": "查看案例",
    
    // Upload Section
    "upload.title": "开始使用",
    "upload.subtitle": "体验 AI 编辑器",
    "upload.description": "体验自然语言图像编辑的强大功能。用简单的文字命令转换任何照片。",
    "upload.promptEngine": "提示引擎",
    "upload.promptDesc": "使用 AI 驱动的编辑功能转换您的图像",
    "upload.imageToImage": "图生图",
    "upload.textToImage": "文生图",
    "upload.modelSelection": "AI 模型选择",
    "upload.modelDesc": "不同模型提供独特的特点和风格",
    "upload.referenceImage": "参考图片",
    "upload.addImage": "添加图片",
    "upload.maxSize": "最大 10MB",
    "upload.mainPrompt": "主提示词",
    "upload.promptPlaceholder": "描述您想要的编辑效果...",
    "upload.generate": "立即生成",
    "upload.outputGallery": "输出画廊",
    "upload.outputDesc": "您的 AI 创作将即时显示在这里",
    "upload.ready": "准备生成",
    "upload.readyDesc": "输入提示词，释放 AI 的力量",
    
    // Features
    "features.title": "核心功能",
    "features.subtitle": "为什么选择 FrogSnap？",
    "features.description": "最先进的 AI 图像编辑器。通过自然语言理解彻底改变您的照片编辑方式。",
    "features.naturalLanguage": "自然语言编辑",
    "features.naturalLanguageDesc": "使用简单的文字提示编辑图像。AI 像 GPT 一样理解复杂指令。",
    "features.characterConsistency": "角色一致性",
    "features.characterConsistencyDesc": "在编辑中保持完美的角色细节。擅长保留面部和身份特征。",
    "features.scenePreservation": "场景保留",
    "features.scenePreservationDesc": "将编辑与原始背景无缝融合。卓越的场景融合技术。",
    "features.oneShot": "一次成型",
    "features.oneShotDesc": "一次尝试即可获得完美结果。轻松解决一次性图像编辑挑战。",
    "features.multiImage": "多图上下文",
    "features.multiImageDesc": "同时处理多张图像。支持高级多图编辑工作流程。",
    "features.ugc": "AI UGC 创作",
    "features.ugcDesc": "创建一致的 AI 内容创作。完美适用于社交媒体和营销。",
    
    // Showcase
    "showcase.title": "案例展示",
    "showcase.subtitle": "闪电般快速的 AI 创作",
    "showcase.description": "看看 FrogSnap 在毫秒内生成的作品",
    "showcase.speed": "FrogSnap 速度",
    "showcase.cta": "体验 FrogSnap 生成器",
    "showcase.item1": "超快人像生成",
    "showcase.item1Desc": "使用优化的神经引擎在 0.8 秒内创建",
    "showcase.item2": "即时场景创建",
    "showcase.item2Desc": "复杂场景在毫秒内渲染完成",
    "showcase.item3": "实时风格转换",
    "showcase.item3Desc": "以闪电般的速度实现逼真效果",
    "showcase.item4": "快速效果生成",
    "showcase.item4Desc": "高级效果即时处理",
    
    // Reviews
    "reviews.title": "用户评价",
    "reviews.subtitle": "创作者们怎么说",
    "reviews.role1": "数字创作者",
    "reviews.review1": "这个编辑器彻底改变了我的工作流程。角色一致性令人难以置信！",
    "reviews.role2": "UGC 专家",
    "reviews.review2": "创建一致的 AI 内容从未如此简单。它在编辑中保持完美的细节！",
    "reviews.role3": "专业编辑",
    "reviews.review3": "这个工具基本解决了一次成型编辑的问题。场景融合非常自然！",
    
    // FAQ
    "faq.title": "常见问题",
    "faq.subtitle": "常见问题解答",
    "faq.q1": "什么是 FrogSnap？",
    "faq.a1": "FrogSnap 是一款革命性的 AI 图像编辑工具，使用自然语言提示转换照片。它提供卓越的一致性和出色的角色编辑及场景保留性能。",
    "faq.q2": "它是如何工作的？",
    "faq.a2": "只需上传图像并用自然语言描述您想要的编辑。AI 理解复杂的指令，处理您的文字提示以生成完美编辑的图像。",
    "faq.q3": "它有什么不同？",
    "faq.a3": "FrogSnap 在角色一致性、场景融合和一次成型编辑方面表现出色。它保留面部特征，将编辑与背景无缝集成，还支持多图上下文。",
    "faq.q4": "可以用于商业项目吗？",
    "faq.a4": "可以！FrogSnap 非常适合创建 AI UGC 内容、社交媒体活动和营销材料。高质量的输出适合专业使用。",
    "faq.q5": "它可以处理哪些类型的编辑？",
    "faq.a5": "编辑器可以处理复杂的编辑，包括面部补全、背景更改、对象放置、风格转换和角色修改，同时保持逼真的质量。",
    "faq.q6": "有免费试用吗？",
    "faq.a6": "有的，您可以免费试用 FrogSnap，但生成次数有限。升级到 Pro 可获得无限访问和批量处理等高级功能。",
    
    // Footer
    "footer.tagline": "用 AI 转换您的图像",
    "footer.product": "产品",
    "footer.company": "公司",
    "footer.legal": "法律",
    "footer.features": "功能",
    "footer.pricing": "定价",
    "footer.api": "API",
    "footer.about": "关于",
    "footer.blog": "博客",
    "footer.careers": "招聘",
    "footer.privacy": "隐私",
    "footer.terms": "条款",
    "footer.cookies": "Cookies",
    "footer.rights": "保留所有权利。",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
