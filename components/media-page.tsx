"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  videoSubCategories,
  videoContentTemplates,
  douyinOperationTemplates,
  videoAccountTemplates,
  kuaishouOperationTemplates,
  dataAnalysisTemplates,
} from "@/lib/video-templates";
import {
  liveSubCategories,
  liveScriptTemplates,
} from "@/lib/live-templates";

// 第二层分类（自媒体文案、短视频文案、直播文案）
const secondLevelCategories = [
  { id: "media", label: "自媒体文案" },
  { id: "video", label: "短视频文案" },
  { id: "live", label: "直播文案" },
];

// 第三层分类（自媒体文案下的子分类）
const mediaSubCategories = [
  { id: "xiaohongshu", label: "小红书" },
  { id: "wechat", label: "公众号" },
  { id: "toutiao", label: "今日头条" },
  { id: "weibo", label: "微博运营" },
  { id: "zhihu", label: "知乎运营" },
  { id: "private", label: "私域运营" },
];

// 小红书模板
export const xiaohongshuTemplates = [
  {
    id: 101,
    icon: "📝",
    title: "小红书旅游攻略",
    desc: "设计一系列能够吸引小红书用户关注的旅游攻略内容。",
    color: "bg-red-500",
  },
  {
    id: 102,
    icon: "/20240723180934ae8ed2830.png",
    title: "小红书爆款文案",
    desc: "创作出能够吸引用户注意力、引发共鸣、促进互动的自媒体文案。",
    color: "bg-red-500",
  },
  {
    id: 103,
    icon: "📝",
    title: "小红书爆款标题",
    desc: "设计出能够吸引目标受众、提高点击率和互动率的标题。",
    color: "bg-red-500",
  },
  {
    id: 104,
    icon: "📝",
    title: "小红书账号简介",
    desc: "设计一个能够吸引目标受众并反映个人品牌特色的小红书账号简介。",
    color: "bg-red-500",
  },
  {
    id: 105,
    icon: "📝",
    title: "小红书seo关键词布局",
    desc: "设计一个能够帮助用户在小红书上进行有效SEO关键词布局的流程，以提高内容的搜索排名和用户参与度。",
    color: "bg-red-500",
  },
  {
    id: 106,
    icon: "📝",
    title: "小红书风格排版",
    desc: "创作出能够吸引小红书用户注意力的高质量内容，提升个人品牌影响力。",
    color: "bg-red-500",
  },
  {
    id: 107,
    icon: "📝",
    title: "小红书产品种草笔记",
    desc: "创作出能够吸引目标受众、增加互动和转化的高质量种草笔记。",
    color: "bg-red-500",
  },
  {
    id: 108,
    icon: "📝",
    title: "小红书好物推荐",
    desc: "创作出能够引起目标受众兴趣和购买欲望的好物推荐文案。",
    color: "bg-red-500",
  },
];

// 公众号模板
export const wechatTemplates = [
  {
    id: 201,
    icon: "💬",
    title: "公众号文章撰写",
    desc: "创作高质量的公众号文章，提升文章的吸引力和传播力。",
    color: "bg-green-500",
  },
  {
    id: 202,
    icon: "💬",
    title: "公众号文本续写",
    desc: "设计一个能够帮助用户快速生成公众号文案的提示词框架，提高文案的吸引力和传播效果。",
    color: "bg-green-500",
  },
  {
    id: 203,
    icon: "💬",
    title: "公众号标题",
    desc: "设计出能够激发目标受众兴趣并促使他们点击阅读的公众号标题。",
    color: "bg-green-500",
  },
  {
    id: 204,
    icon: "💬",
    title: "公众号文章-大纲",
    desc: "帮助用户制定一个结构化的公众号文章大纲，确保文章内容丰富、有条理、易于读者理解。",
    color: "bg-green-500",
  },
  {
    id: 205,
    icon: "💬",
    title: "公众号标题党",
    desc: "设计引人注目的公众号标题，以增加文章的曝光率和互动。",
    color: "bg-green-500",
  },
];

// 今日头条模板
export const toutiaoTemplates = [
  {
    id: 301,
    icon: "📰",
    title: "头条爆文",
    desc: "帮助用户创作出能够吸引大量读者、提高阅读量和互动率的爆款文章。",
    color: "bg-red-600",
  },
  {
    id: 302,
    icon: "📰",
    title: "头条爆款标题",
    desc: "设计出能够迅速抓住用户眼球的头条爆款标题，提升内容的打开率和分享率。",
    color: "bg-red-600",
  },
  {
    id: 303,
    icon: "📰",
    title: "头条问答",
    desc: "创作出能够在头条问答平台上引起广泛关注和讨论的内容。",
    color: "bg-red-600",
  },
  {
    id: 304,
    icon: "📰",
    title: "微头条文案",
    desc: "设计一个能够帮助用户快速构思并创作出高质量微头条文案的提示词框架。",
    color: "bg-red-600",
  },
  {
    id: 305,
    icon: "📰",
    title: "头条文章大纲",
    desc: "设计一个结构清晰、内容丰富、能够吸引读者的头条文章大纲。",
    color: "bg-red-600",
  },
];

// 微博运营模板
export const weiboTemplates = [
  {
    id: 401,
    icon: "🐦",
    title: "微博短推文",
    desc: "创作能够引发共鸣、传播和互动的微博短推文。",
    color: "bg-orange-500",
  },
  {
    id: 402,
    icon: "🐦",
    title: "微博长文",
    desc: "创作出能够引起共鸣、传播和讨论的微博长文。",
    color: "bg-orange-500",
  },
  {
    id: 403,
    icon: "🐦",
    title: "微博爆款标题",
    desc: "设计出能够迅速吸引用户注意并引发传播的微博爆款标题。",
    color: "bg-orange-500",
  },
  {
    id: 404,
    icon: "🐦",
    title: "微博账号名称",
    desc: "设计一个易于识别、记忆并且能够代表用户品牌或个性的微博账号名称。",
    color: "bg-orange-500",
  },
  {
    id: 405,
    icon: "🐦",
    title: "微博热点分析",
    desc: "设计一个能够引导用户深入分析微博热点的提示词，帮助用户理解当前社交媒体上的流行话题和用户兴趣。",
    color: "bg-orange-500",
  },
  {
    id: 406,
    icon: "🐦",
    title: "微博账号简介",
    desc: "设计一个能够吸引目标受众、展现个人特色和专业领域的微博账号简介。",
    color: "bg-orange-500",
  },
  {
    id: 407,
    icon: "🐦",
    title: "微博推文",
    desc: "设计吸引用户注意力的微博推文，提高用户参与度和内容传播力。",
    color: "bg-orange-500",
  },
];

// 知乎运营模板
export const zhihuTemplates = [
  {
    id: 501,
    icon: "🔵",
    title: "知乎高赞问答",
    desc: "设计一个能够帮助用户快速创作出高赞问答的流程，提高用户在知乎上的互动和影响力。",
    color: "bg-blue-500",
  },
  {
    id: 502,
    icon: "🔵",
    title: "知乎高赞回答仿写",
    desc: "创作出能够吸引知乎用户注意、引发讨论并获得高赞的回答。",
    color: "bg-blue-500",
  },
  {
    id: 503,
    icon: "🔵",
    title: "知乎账号个人简介",
    desc: "帮助用户创建一个能够反映其专业背景、兴趣和个性的个人简介。",
    color: "bg-blue-500",
  },
  {
    id: 504,
    icon: "🔵",
    title: "知乎一句话简介",
    desc: "创作出能够引起广泛关注和讨论的知乎文章或回答。",
    color: "bg-blue-500",
  },
  {
    id: 505,
    icon: "🔵",
    title: "知乎账号名称",
    desc: "创作出能够吸引知乎用户关注和参与讨论的高质量内容。",
    color: "bg-blue-500",
  },
];

// 私域运营模板
export const privateTemplates = [
  {
    id: 601,
    icon: "👥",
    title: "私域日常文案库",
    desc: "创作出能够引起目标受众共鸣、激发行动或引发讨论的文案。",
    color: "bg-purple-500",
  },
  {
    id: 602,
    icon: "👥",
    title: "私域朋友圈发文计划库",
    desc: "设计一系列能够激发朋友圈用户兴趣和互动的发文计划。",
    color: "bg-purple-500",
  },
  {
    id: 603,
    icon: "👥",
    title: "私域价值感文案库",
    desc: "设计一个能够引导用户创作出有吸引力的私域价值感文案的提示词。",
    color: "bg-purple-500",
  },
  {
    id: 604,
    icon: "👥",
    title: "私域产品营销文案库",
    desc: "提供一个结构化的提示词框架，帮助用户快速生成具有吸引力的营销文案。",
    color: "bg-purple-500",
  },
  {
    id: 605,
    icon: "👥",
    title: "私域客户回复助手",
    desc: "帮助用户快速生成针对不同客户情况的回复建议，提升客户满意度和忠诚度。",
    color: "bg-purple-500",
  },
  {
    id: 606,
    icon: "👥",
    title: "私域社群活动策划",
    desc: "设计一系列能够吸引社群成员参与的活动，提高社群活跃度和成员忠诚度。",
    color: "bg-purple-500",
  },
  {
    id: 607,
    icon: "👥",
    title: "私域社群规则生成库",
    desc: "设计一套既能激发成员积极性，又能维护社群秩序的规则体系。",
    color: "bg-purple-500",
  },
];

export function MediaPage() {
  const router = useRouter();
  const [activeSecondLevel, setActiveSecondLevel] = useState("media");
  const [activeThirdLevel, setActiveThirdLevel] = useState("xiaohongshu");
  const [activeFourthLevel, setActiveFourthLevel] = useState("video-content"); // 短视频的四级分类
  const [activeLiveLevel, setActiveLiveLevel] = useState("live-script"); // 直播的四级分类

  const handleTemplateClick = (templateId: number, templateTitle: string) => {
    // 根据当前激活的分类构建source参数
    let source = "";
    if (activeSecondLevel === "media") {
      source = `media-${activeThirdLevel}`; // 例如：media-xiaohongshu, media-wechat
    } else if (activeSecondLevel === "video") {
      source = `video-${activeFourthLevel}`; // 例如：video-content
    } else if (activeSecondLevel === "live") {
      source = `live-${activeLiveLevel}`; // 例如：live-script
    }

    // 根据模板 ID 判断跳转到对应的写作页面
    console.log("点击了模板卡片，ID:", templateId);

    // 根据ID范围判断跳转页面
    // 小红书模板 (101-108) 或 公众号 (201-208)
    if ((templateId >= 101 && templateId <= 108) || (templateId >= 201 && templateId <= 208)) {
      router.push(`/writing/xiaohongshu?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=${source}`);
    }
    // 其他自媒体模板也跳转到xiaohongshu页面
    else {
      router.push(`/writing/xiaohongshu?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=${source}`);
    }
  };

  // 滚动到指定平台的位置
  const scrollToPlatform = (platformId: string) => {
    const element = document.getElementById(`platform-${platformId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActiveThirdLevel(platformId);
  };

  // 滚动到指定的短视频子分类
  const scrollToVideoCategory = (categoryId: string) => {
    const element = document.getElementById(`video-category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActiveFourthLevel(categoryId);
  };

  // 滚动到指定的直播子分类
  const scrollToLiveCategory = (categoryId: string) => {
    const element = document.getElementById(`live-category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActiveLiveLevel(categoryId);
  };

  // 所有平台的模板配置(自媒体文案)
  const allPlatforms = [
    {
      id: "xiaohongshu",
      label: "小红书",
      templates: xiaohongshuTemplates,
    },
    {
      id: "wechat",
      label: "公众号",
      templates: wechatTemplates,
    },
    {
      id: "toutiao",
      label: "今日头条",
      templates: toutiaoTemplates,
    },
    {
      id: "weibo",
      label: "微博运营",
      templates: weiboTemplates,
    },
    {
      id: "zhihu",
      label: "知乎运营",
      templates: zhihuTemplates,
    },
    {
      id: "private",
      label: "私域运营",
      templates: privateTemplates,
    },
  ];

  // 短视频文案的所有子分类配置
  const videoCategories = [
    {
      id: "video-content",
      label: "视频文案",
      templates: videoContentTemplates,
    },
    {
      id: "douyin-operation",
      label: "抖音运营",
      templates: douyinOperationTemplates,
    },
    {
      id: "video-account",
      label: "视频号",
      templates: videoAccountTemplates,
    },
    {
      id: "kuaishou-operation",
      label: "快手运营",
      templates: kuaishouOperationTemplates,
    },
    {
      id: "data-analysis",
      label: "数据分析",
      templates: dataAnalysisTemplates,
    },
  ];

  // 直播文案的所有子分类配置
  const liveCategories = [
    {
      id: "live-script",
      label: "直播话术",
      templates: liveScriptTemplates,
    },
  ];

  // 获取当前第二层分类的标题
  const getCurrentSecondLevelTitle = () => {
    const category = secondLevelCategories.find((cat) => cat.id === activeSecondLevel);
    return category?.label || "自媒体文案";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* 第二层导航 - 自媒体文案 / 短视频文案 / 直播文案 */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center px-6 h-14">
          {secondLevelCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveSecondLevel(category.id);
                // 如果切换到自媒体文案,默认选中小红书
                if (category.id === "media") {
                  setActiveThirdLevel("xiaohongshu");
                }
                // 如果切换到短视频文案,默认选中视频文案
                if (category.id === "video") {
                  setActiveFourthLevel("video-content");
                }
                // 如果切换到直播文案,默认选中直播话术
                if (category.id === "live") {
                  setActiveLiveLevel("live-script");
                }
              }}
              className={cn(
                "px-6 h-full text-sm font-medium transition-colors relative",
                activeSecondLevel === category.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {category.label}
              {activeSecondLevel === category.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - 第三层导航 */}
        <div className="w-48 border-r border-border bg-card overflow-y-auto">
          <div className="p-2">
          {activeSecondLevel === "media" && (
            <div className="space-y-1">
              {mediaSubCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => scrollToPlatform(category.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1",
                    activeThirdLevel === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}

          {/* 短视频文案的子分类 */}
          {activeSecondLevel === "video" && (
            <div className="space-y-1">
              {videoSubCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => scrollToVideoCategory(category.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1",
                    activeFourthLevel === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}

          {/* 直播文案的子分类 */}
          {activeSecondLevel === "live" && (
            <div className="space-y-1">
              {liveSubCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => scrollToLiveCategory(category.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1",
                    activeLiveLevel === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Main Content - 右侧内容区域 */}
        <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">{getCurrentSecondLevelTitle()}</h1>

        {/* 根据选中的第二层显示不同的内容 */}
        {activeSecondLevel === "media" && (
          /* 自媒体文案：按平台分组显示所有功能 */
          <div className="space-y-8">
            {allPlatforms.map((platform) => (
              <div key={platform.id} id={`platform-${platform.id}`}>
                {/* 平台标题 */}
                <h2 className="text-xl font-semibold mb-4">{platform.label}</h2>

                {/* 平台功能卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {platform.templates.map((template) => (
                    <Card
                      key={template.id}
                      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleTemplateClick(template.id, template.title)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0",
                            template.color
                          )}
                        >
                          {template.icon.startsWith('/') ? (
                            <img src={template.icon} alt={template.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            template.icon
                          )}
                        </div>
                        <h3 className="font-medium text-sm flex-1">{template.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.desc}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 短视频文案内容 */}
        {activeSecondLevel === "video" && (
          <div className="space-y-8">
            {videoCategories.map((category) => (
              <div key={category.id} id={`video-category-${category.id}`}>
                {/* 分类标题 */}
                <h2 className="text-xl font-semibold mb-4">{category.label}</h2>

                {/* 功能卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.templates.map((template) => (
                    <Card
                      key={template.id}
                      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleTemplateClick(template.id, template.title)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0",
                            template.color
                          )}
                        >
                          {template.icon.startsWith('/') ? (
                            <img src={template.icon} alt={template.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            template.icon
                          )}
                        </div>
                        <h3 className="font-medium text-sm flex-1">{template.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.desc}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 直播文案内容 */}
        {activeSecondLevel === "live" && (
          <div className="space-y-8">
            {liveCategories.map((category) => (
              <div key={category.id} id={`live-category-${category.id}`}>
                {/* 分类标题 */}
                <h2 className="text-xl font-semibold mb-4">{category.label}</h2>

                {/* 功能卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.templates.map((template) => (
                    <Card
                      key={template.id}
                      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleTemplateClick(template.id, template.title)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0",
                            template.color
                          )}
                        >
                          {template.icon.startsWith('/') ? (
                            <img src={template.icon} alt={template.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            template.icon
                          )}
                        </div>
                        <h3 className="font-medium text-sm flex-1">{template.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.desc}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
