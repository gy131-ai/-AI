const PAGE_FILE = {
  home: "index.html",
  imageCreate: "image-create.html",
  videoCreate: "video-create.html",
  templates: "templates.html",
  templateCreate: "template-create.html",
  marketingPlan: "marketing-plan.html",
  marketingCreate: "marketing-create.html",
  generation: "generation.html",
  result: "result.html",
  marketingActivity: "marketing-activity.html",
  edit: "edit.html",
  works: "works.html",
  profile: "profile.html",
  hotels: "hotels.html",
  hotelNew: "hotel-new.html",
  hotelEdit: "hotel-edit.html",
  assets: "assets.html",
  account: "account.html"
};

const ASSET = {
  mark: "assets/yingdian-editorial-mark.svg",
  night: "assets/hotel-night.jpg",
  room: "assets/hotel-room.jpg",
  dining: "assets/hotel-dining.jpg",
  detail: "assets/hotel-detail.jpg"
};

const templates = [
  { id: "summer", name: "夏日度假", type: "朋友圈海报", scene: "亲子与周末度假", ratio: "3:4", image: ASSET.night, qr: false },
  { id: "breakfast", name: "早餐套餐", type: "活动海报", scene: "早餐与餐饮促销", ratio: "4:3", image: ASSET.dining, qr: true },
  { id: "invite", name: "夏夜邀请", type: "邀请函", scene: "活动邀约", ratio: "3:4", image: ASSET.detail, qr: false },
  { id: "room", name: "房间上新", type: "朋友圈海报", scene: "客房与设施介绍", ratio: "1:1", image: ASSET.room, qr: false }
];

const defaultHotelContext = { id: "hotel-1", name: "云栖酒店·杭州", address: "杭州", logo: "云" };

const defaultWorks = [
  { id: "sample-1", hotelId: "hotel-1", title: "夏日亲子入住推广", type: "宣传图", status: "已完成", image: ASSET.night, time: "今天 10:24", marketing: true },
  { id: "sample-2", hotelId: "hotel-1", title: "早餐套餐", type: "宣传图", status: "已完成", image: ASSET.dining, time: "昨天 16:08" },
  { id: "sample-3", hotelId: "hotel-1", title: "周末客房焕新", type: "15秒视频", status: "已完成", image: ASSET.room, time: "8月17日" }
];

const state = {
  hotelContext: readPlatformHotelContext(),
  works: read("yingdian_works", defaultWorks),
  homeType: "朋友圈海报",
  worksFilter: "image",
  selectedTemplateId: sessionStorage.getItem("yingdian_template") || "summer",
  selectedImages: [ASSET.room],
  selectedQr: false,
  selectedRatioImage: "3:4",
  selectedRatioVideo: "9:16",
  selectedMusicStyle: sessionStorage.getItem("yingdian_music_style") || "轻松",
  hotelUsage: { name: false, address: false, logo: false },
  qrUsage: false,
  idea: "",
  marketingType: sessionStorage.getItem("yingdian_marketing_type") || "image",
  marketingIdea: "围绕暑期尾声，突出亲子房、早餐和儿童用品，让家庭客人更安心地入住。",
  marketingImages: [],
  editImages: [],
  marketingAdjust: { open: false, status: "input", draft: "", pending: false, timer: null },
  editIdea: "",
  voiceListening: false,
  voiceTarget: "",
  voiceTimer: null,
  generation: read("yingdian_generation", null),
  toastTimer: null,
  sheet: null
};

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value || fallback;
  } catch (error) {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readPlatformHotelContext() {
  const params = new URLSearchParams(location.search);
  const incomingId = params.get("hotel_id");
  const incomingName = params.get("hotel_name");
  if (incomingId && incomingName) {
    const incomingContext = {
      id: incomingId,
      name: incomingName,
      address: params.get("hotel_address") || "",
      logo: params.get("hotel_logo") || ""
    };
    sessionStorage.setItem("yingdian_platform_hotel_context", JSON.stringify(incomingContext));
    return incomingContext;
  }
  try {
    return JSON.parse(sessionStorage.getItem("yingdian_platform_hotel_context")) || defaultHotelContext;
  } catch (error) {
    return defaultHotelContext;
  }
}

function currentHotel() {
  return state.hotelContext || null;
}

function isMarketingWork(work) {
  return work?.marketing === true || work?.marketing === "true" || work?.source === "marketingCreate" || work?.activityId;
}

function isMarketingGeneration(generation) {
  return generation?.source === "marketingCreate" || generation?.marketing === true;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
}

function icon(name) {
  const paths = {
    back: '<path d="m15 18-6-6 6-6"/><path d="M9 12h10"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m4 17 5-5 3 3 2-2 4 4"/>',
    video: '<rect x="3" y="5" width="15" height="14" rx="2"/><path d="m18 10 3-2v8l-3-2z"/><path d="m10 9 4 3-4 3z"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.4 3-5 7-5s6.2 1.6 7 5"/>',
    home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/>',
    works: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.2a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 3.7 12v-.2a2 2 0 0 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A2 2 0 0 0 19.4 15Z"/>',
    building: '<path d="M4 20V5l8-2 8 2v15"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2"/><path d="M3 20h18"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    upload: '<path d="M12 16V4M8 8l4-4 4 4"/><path d="M4 14v4h16v-4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    play: '<path d="m9 6 9 6-9 6z"/>',
    download: '<path d="M12 4v10M8 10l4 4 4-4M5 20h14"/>',
    copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    share: '<circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.7-4L3 10"/><path d="M3 5v5h5M4 13a8 8 0 0 0 14.7 4L21 14"/><path d="M21 19v-5h-5"/>',
    edit: '<path d="m4 16-.8 4.8L8 20l10.8-10.8-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
    trash: '<path d="M4 7h16M10 11v5M14 11v5M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    sparkle: '<path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3ZM19 16l.6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM18 18h3v3h-3zM18 14h3M14 18v3"/>',
    mic: '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M19 11v1a7 7 0 0 1-14 0v-1M12 19v3M8 22h8"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.info}</svg>`;
}

function fileFor(page) {
  return PAGE_FILE[page] || PAGE_FILE.home;
}

function go(page, params = {}) {
  const query = new URLSearchParams(params).toString();
  location.href = `${fileFor(page)}${query ? `?${query}` : ""}`;
}

function pageShell({ title, subtitle = "", content, back = true, nav = false, action = "", overlay = "" }) {
  return `<div class="screen"><div class="page-scroll"><main class="page-content ${nav ? "with-nav" : ""} ${action ? "with-action" : ""}">
    ${nav && title === "作品" ? platformAppTop() : back ? legacyPageTop(title) : `<header class="topbar secondary-topbar"><div class="page-title-wrap"><h1>营点AI</h1></div></header>`}
    ${content}
  </main></div>${overlay}${action ? `<div class="bottom-action">${action}</div>` : ""}${nav ? bottomNav(title) : ""}</div>`;
}

function bottomNav(active) {
  const items = [
    ["首页", "home", "home"], ["作品", "works", "works"]
  ];
  return `<nav class="bottom-nav">${items.map(([label, page, ico]) => `<button class="nav-item ${active === label ? "active" : ""}" data-nav="${page}"><span class="nav-icon">${icon(ico)}</span><span>${label}</span></button>`).join("")}</nav>`;
}

function platformAppTop(pageTitle = "") {
  return `<header class="topbar platform-topbar"><button class="platform-back" data-action="platform-back" aria-label="返回酒店AI助手">${icon("back")}<span>返回酒店AI助手</span></button><div class="platform-app-title"><strong>营点AI</strong>${pageTitle && pageTitle !== "首页" ? `<small>${esc(pageTitle)}</small>` : ""}</div><span class="platform-topbar-spacer" aria-hidden="true"></span></header>`;
}

function legacyPageTop(title) {
  return `<header class="topbar secondary-topbar"><button class="back-btn" data-action="back" aria-label="返回">${icon("back")}</button><div class="page-title-wrap"><h1>${esc(title)}</h1></div><span class="topbar-spacer" aria-hidden="true"></span></header>`;
}

function topHome() {
  return platformAppTop("首页");
}

function hotelSelect() {
  const hotel = currentHotel();
  return `<span class="hotel-context-label"><span>${hotel ? esc(hotel.name) : "未选择酒店"}</span></span>`;
}

function renderHome() {
  const filtered = templates.filter((item) => item.type === state.homeType);
  const cards = filtered.length ? filtered : templates.slice(0, 2);
  return `<div class="screen home-page"><div class="page-scroll"><main class="page-content with-nav">${topHome()}
    <section class="home-welcome"><h1 class="hero-title">今天，想做点什么？</h1></section>
    <div class="home-modules">
      <section class="home-module home-creation" aria-label="自由创作"><div class="quick-grid"><button class="action-card" data-nav="imageCreate"><span class="action-icon">${icon("image")}</span><span class="action-copy"><strong>做宣传图</strong><span>描述想法，快速生成</span></span></button><button class="action-card" data-nav="videoCreate"><span class="action-icon">${icon("video")}</span><span class="action-copy"><strong>做15秒视频</strong><span>上传照片，自动制作</span></span></button></div></section>
      <section class="home-module home-planner"><div class="section-head home-module-head"><h2 class="section-title">智能营销策划</h2>${hotelSelect()}</div><div class="campaign-suite"><button class="campaign-card" data-action="marketing-open"><span class="campaign-copy"><span class="campaign-kicker">本期主推</span><h3>暑期亲子入住推广</h3><p>围绕亲子房、早餐和儿童用品，一次形成文案、宣传图和15秒视频。</p><span class="campaign-meta"><span>8月中下旬</span><span class="campaign-cta">开始策划 ${icon("chevron")}</span></span></span><span class="campaign-visual" aria-hidden="true"><span class="campaign-sheet campaign-sheet-back"></span><span class="campaign-sheet campaign-sheet-front"></span><span class="campaign-orbit"></span><span class="campaign-light"></span></span></button><div class="idea-row"><button class="idea-link" data-action="marketing-topic" data-topic="早餐体验推广">早餐体验推广</button><button class="idea-link" data-action="marketing-topic" data-topic="周末度假">周末度假</button><button class="idea-link" data-action="marketing-topic" data-topic="会议接待">会议接待</button></div></div></section>
      <section class="home-module home-templates"><div class="section-head home-module-head"><div><h2 class="section-title">模板创作</h2><p class="section-note">选一个喜欢的样式，上传酒店照片就能做</p></div><button class="text-action" data-nav="templates">查看全部 ${icon("chevron")}</button></div><div class="home-template-content"><div class="tabs">${["朋友圈海报", "活动海报", "邀请函"].map((type) => `<button class="tab ${state.homeType === type ? "active" : ""}" data-action="home-type" data-type="${type}">${type}</button>`).join("")}</div><div class="template-strip">${cards.map((item) => templateCard(item)).join("")}</div></div></section>
    </div>
  </main></div>${bottomNav("首页")}</div>`;
}

function templateCard(item) {
  return `<button class="template-card" data-action="template-open" data-template="${item.id}"><span class="poster"><img src="${item.image}" alt="${esc(item.name)}"><span class="poster-copy"><small>${esc(item.type)}</small><strong>${esc(item.name)}</strong><span>${esc(item.scene)}</span></span></span><span class="template-meta"><strong>${esc(item.name)}</strong><span>${item.ratio}</span></span></button>`;
}

function sectionCard(title, body, extraClass = "") {
  return `<section class="section"><div class="section-head"><h2 class="section-title">${title}</h2></div><div class="surface-card ${extraClass}">${body}</div></section>`;
}

function textInput(label, value, placeholder, action = "", voice = false) {
  const labelMarkup = label ? `<label class="field-label">${label}</label>` : "";
  const voiceMarkup = voice ? `<button class="voice-btn ${state.voiceListening ? "listening" : ""}" data-action="voice-input" aria-label="${state.voiceListening ? "停止语音输入" : "语音输入"}">${icon("mic")}<span>${state.voiceListening ? "正在听" : "语音输入"}</span></button>` : "";
  return `${labelMarkup}<div class="text-area-wrap"><textarea class="text-area" data-bind="${action}" aria-label="${esc(label || "创作想法")}" placeholder="${placeholder}">${esc(value)}</textarea>${voiceMarkup}</div>`;
}

function renderAssetThumbs(images, removeAction = "asset-remove", kind = "image", listKey = "selectedImages") {
  const thumbs = images.map((image, index) => `<span class="asset-thumb"><img src="${image}" alt="已选素材"><button data-action="${removeAction}" data-index="${index}" aria-label="删除素材">${icon("close")}</button></span>`).join("");
  return `<div class="asset-picker ${images.length ? "has-assets" : "empty"}">${thumbs}<button class="asset-add-tile" data-action="asset-sheet" data-kind="${kind}" data-list="${listKey}"><span class="asset-add-icon">${icon("plus")}</span><span>添加素材</span></button></div>`;
}

function renderQuickPrompt({ value, bind, placeholder, images, removeAction, kind, listKey, assetLabel, suggestion = "", label = "想做什么？" }) {
  const listening = state.voiceListening && state.voiceTarget === bind;
  const selectedAssets = images.length ? `<div class="quick-chosen-assets">${images.map((image, index) => `<span class="quick-asset-thumb"><img src="${image}" alt="已添加素材"><button data-action="${removeAction}" data-index="${index}" aria-label="删除素材">${icon("close")}</button></span>`).join("")}<button class="quick-asset-add" data-action="asset-sheet" data-kind="${kind}" data-list="${listKey}" aria-label="继续添加素材">${icon("plus")}</button></div>` : "";
  const suggestionMarkup = suggestion ? `<div class="quick-asset-suggestion"><strong>建议使用素材</strong><span>${esc(suggestion)}</span></div>` : "";
  return `<article class="quick-prompt-card"><h2 class="quick-prompt-label">${esc(label)}</h2><textarea class="quick-prompt-idea" data-bind="${bind}" aria-label="${esc(label)}" placeholder="${esc(placeholder)}">${esc(value)}</textarea><div class="quick-material-zone">${suggestionMarkup}${selectedAssets}</div><div class="quick-prompt-actions"><button class="quick-asset-action" data-action="asset-sheet" data-kind="${kind}" data-list="${listKey}">${icon("image")}<span>${esc(assetLabel)}</span></button><button class="quick-voice-action ${listening ? "listening" : ""}" data-action="voice-input" data-field="${bind}">${icon("mic")}<span>${listening ? "正在听" : "语音输入"}</span></button></div></article>`;
}

function displayHotelLabels() {
  const labels = [];
  if (state.hotelUsage.name) labels.push("酒店名称");
  if (state.hotelUsage.address) labels.push("酒店地址");
  if (state.hotelUsage.logo && currentHotel()?.logo) labels.push("Logo");
  return labels;
}

function renderHotelInfoRow(media, showQr) {
  const labels = displayHotelLabels();
  return `<button class="display-content-row ${labels.length ? "has-selection" : ""}" data-action="display-content" data-media="${media}" data-qr="${showQr ? "1" : "0"}"><span class="display-content-main"><strong>酒店信息</strong><span>${labels.length ? labels.join("、") : "未使用"}</span></span>${icon("chevron")}</button>`;
}

function renderQrSettingRow() {
  const selected = state.selectedQr;
  return `<div class="display-setting-row ${selected ? "has-selection" : ""}"><button class="display-content-row ${selected ? "has-selection" : ""}" data-action="qr-sheet" aria-label="${selected ? "更换二维码" : "添加二维码"}"><span class="display-content-main"><strong>二维码</strong><span>${selected ? "已添加" : "未添加"}</span></span>${icon("chevron")}</button>${selected ? `<button class="display-row-remove" data-action="qr-remove" aria-label="移除二维码">${icon("trash")}</button>` : ""}</div>`;
}

function renderDisplaySettings(media, showQr) {
  return `<section class="display-settings-section"><div class="quick-setting-head"><h2>使用信息（可选）</h2></div><div class="display-setting-list">${renderHotelInfoRow(media, showQr)}${showQr ? renderQrSettingRow() : ""}</div></section>`;
}

function renderQuickRatioSection(kind, title) {
  const selected = kind === "video" ? state.selectedRatioVideo : state.selectedRatioImage;
  return `<section class="quick-setting-section"><div class="quick-setting-head"><h2>${title}</h2><span>当前 ${esc(selected)}</span></div>${ratioRow(kind)}</section>`;
}

function renderQuickMusicSection() {
  return `<section class="quick-setting-section"><div class="quick-setting-head"><h2>背景音乐</h2><span>当前 ${esc(state.selectedMusicStyle)}</span></div>${musicRow()}</section>`;
}

function templateMaterialHint(item) {
  const orientation = item.ratio === "4:3" ? "横向画面" : item.ratio === "1:1" ? "方形画面" : "竖向画面";
  return `${item.scene}相关照片，${orientation}，主体清晰`;
}

function renderHotelCard(showQr = false) {
  const hotel = currentHotel();
  if (!hotel) return `<div class="empty-card"><div class="empty-icon">${icon("building")}</div><h3>尚未选择酒店</h3><p>请先在酒店AI助手中选择酒店，再返回营点AI。</p><button class="secondary-btn" data-action="platform-back">返回酒店AI助手</button></div>`;
  const rows = [["name", "酒店名称", hotel.name], ["address", "酒店地址", hotel.address]];
  if (hotel.logo) rows.push(["logo", "酒店标志", hotel.logo]);
  return `<div class="hotel-card"><div class="hotel-card-head"><span class="hotel-card-caption">当前酒店</span><span class="hotel-context-readonly">由酒店AI助手提供</span></div><div class="hotel-use-list">${rows.map(([key, label, value]) => `<button class="check-row ${state.hotelUsage[key] ? "selected" : ""} ${key === "logo" ? "has-logo" : ""}" data-action="hotel-use" data-key="${key}"><span class="check-copy"><strong>${label}</strong><span class="${key === "logo" ? "hotel-value-logo" : ""}">${key === "logo" ? `<span class="hotel-logo">${esc(value)}</span>` : esc(value)}</span></span><span class="checkbox">${icon("check")}</span></button>`).join("")}</div>${showQr ? `<div class="hotel-card-divider"></div>${renderQrRow()}` : ""}</div>`;
}

function renderQrRow() {
  return `<div class="qr-row"><span class="check-copy"><strong>二维码</strong><span>${state.selectedQr ? "已添加一个二维码" : "可选，仅支持一个"}</span></span>${state.selectedQr ? `<span class="qr-row-actions"><button class="qr-preview" data-action="qr-preview" aria-label="查看二维码">${Array.from({ length: 9 }).map(() => "<i></i>").join("")}</button><button class="qr-text-action" data-action="qr-sheet">更换</button><button class="qr-text-action danger" data-action="qr-remove">移除</button></span>` : `<button class="qr-add" data-action="qr-sheet">添加 ${icon("plus")}</button>`}</div>`;
}

function ratioRow(kind) {
  const values = kind === "video" ? [["9:16", "竖屏", "story"], ["16:9", "横屏", "landscape"], ["1:1", "方形", "square"]] : [["3:4", "竖版", "portrait"], ["1:1", "方形", "square"], ["4:3", "横版", "landscape"], ["9:16", "长图", "story"]];
  const selected = kind === "video" ? state.selectedRatioVideo : state.selectedRatioImage;
  return `<div class="ratio-row">${values.map(([value, label, shape]) => `<button class="ratio-option ${value === selected ? "selected" : ""}" data-action="ratio" data-kind="${kind}" data-ratio="${value}"><span class="ratio-shape ${shape}"></span><strong>${value}</strong><span>${label}</span></button>`).join("")}</div>`;
}

function musicRow() {
  return `<div class="music-row">${["轻松", "温暖", "活力"].map((style) => `<button class="music-option ${state.selectedMusicStyle === style ? "selected" : ""}" data-action="music-style" data-style="${style}">${style}</button>`).join("")}</div>`;
}

function renderImageCreate() {
  const action = `<button class="primary-btn" data-action="start-generation" data-source="imageCreate">${icon("sparkle")}开始生成宣传图</button>`;
  const content = `<div class="quick-create-content">${renderQuickPrompt({ value: state.idea, bind: "image-idea", placeholder: "描述你想做的宣传图，越具体越容易生成", images: state.selectedImages, removeAction: "asset-remove", kind: "image", listKey: "selectedImages", assetLabel: "添加图片" })}<div class="quick-settings-panel">${renderDisplaySettings("image", true)}${renderQuickRatioSection("image", "画幅比例")}</div></div>`;
  return pageShell({ title: "做宣传图", content, action });
}

function renderVideoCreate() {
  const action = `<button class="primary-btn" data-action="start-generation" data-source="videoCreate">${icon("sparkle")}开始生成15秒视频</button>`;
  const content = `<div class="quick-create-content">${renderQuickPrompt({ value: state.idea, bind: "video-idea", placeholder: "描述你想做的15秒视频，越具体越容易生成", images: state.selectedImages, removeAction: "asset-remove", kind: "video", listKey: "selectedImages", assetLabel: "添加图片或视频" })}<div class="quick-settings-panel">${renderDisplaySettings("video", false)}${renderQuickRatioSection("video", "视频比例")}${renderQuickMusicSection()}</div></div>`;
  return pageShell({ title: "做15秒视频", content, action });
}

function renderTemplates() {
  const type = new URLSearchParams(location.search).get("type") || state.homeType;
  const list = templates.filter((item) => item.type === type);
  const cards = list.length ? list : templates;
  const content = `<section class="section templates-library-section"><div class="tabs templates-filter-tabs">${["朋友圈海报", "活动海报", "邀请函"].map((item) => `<button class="tab ${item === type ? "active" : ""}" data-action="template-filter" data-type="${item}">${item}</button>`).join("")}</div><div class="template-list">${cards.map((item) => `<article class="template-list-card"><button class="template-list-preview" data-action="template-preview" data-template="${item.id}" aria-label="查看${esc(item.name)}大图"><span class="poster"><img src="${item.image}" alt="${esc(item.name)}模板"></span></button><button class="template-list-info" data-action="template-open" data-template="${item.id}"><span class="template-list-title"><strong>${esc(item.name)}</strong>${icon("chevron")}</span><span class="template-list-meta">${esc(item.type)} · ${item.ratio}</span><span class="template-list-scene">${esc(item.scene)}</span></button></article>`).join("")}</div></section>`;
  return pageShell({ title: "全部模板", subtitle: "选择适合本次内容的样式", content });
}

function selectedTemplate() {
  return templates.find((item) => item.id === state.selectedTemplateId) || templates[0];
}

function renderTemplateCreate() {
  const item = selectedTemplate();
  const action = `<button class="primary-btn" data-action="start-generation" data-source="templateCreate">${icon("sparkle")}生成成品</button>`;
  const templatePreview = `<section class="section template-context-section"><div class="template-context-card"><button class="template-context-thumb" data-action="template-preview" data-template="${item.id}" aria-label="查看${esc(item.name)}样式"><img src="${item.image}" alt="${esc(item.name)}样式缩略图"></button><div class="template-context-copy"><div class="template-context-heading"><div><p class="eyebrow">当前模板</p><h2 class="section-title">${esc(item.name)}</h2><p class="section-note">${esc(item.type)} · ${esc(item.scene)}</p></div><span class="template-context-ratio">${esc(item.ratio)}</span></div><p class="template-context-hint">上传主图，套用这个样式</p><div class="template-context-actions"><button class="text-action" data-action="template-preview" data-template="${item.id}">查看样式 ${icon("chevron")}</button><button class="text-action" data-nav="templates">重新选择 ${icon("chevron")}</button></div></div></div></section>`;
  const content = `<div class="quick-create-content template-quick-create">${templatePreview}${renderQuickPrompt({ value: state.idea, bind: "template-idea", placeholder: "描述这次想突出什么，模板会保持当前样式", images: state.selectedImages, removeAction: "asset-remove", kind: "template", listKey: "selectedImages", assetLabel: "添加主图", suggestion: templateMaterialHint(item) })}<div class="quick-settings-panel">${renderDisplaySettings("image", item.qr)}</div></div>`;
  return pageShell({ title: "模板创作", content, action });
}

function marketingAdjustSheet() {
  const adjust = state.marketingAdjust;
  const isOpen = adjust.open ? "open" : "";
  const isLoading = adjust.status === "loading";
  const context = "暑期尾声亲子入住推广";
  const inputState = adjust.status === "input" ? "" : "hidden";
  const loadingState = adjust.status === "loading" ? "" : "hidden";
  const resultState = adjust.status === "result" ? "" : "hidden";
  const errorState = adjust.status === "error" ? "" : "hidden";
  return `<div class="sheet-backdrop marketing-adjust-backdrop ${isOpen}" id="marketing-adjust-sheet" role="presentation"><section class="sheet marketing-adjust-sheet ${isLoading ? "is-generating" : ""}" role="dialog" aria-modal="true" aria-labelledby="marketing-adjust-title"><div class="display-sheet-head marketing-adjust-head"><div><h3 id="marketing-adjust-title">补充一点情况</h3><p>基于当前营点调整，不重新定义主题</p></div><button class="display-sheet-close" data-action="marketing-adjust-close" aria-label="关闭">${icon("close")}</button></div><div class="marketing-adjust-context"><span>当前营点</span><strong>${context}</strong></div><div class="marketing-adjust-state ${inputState}" data-state="input"><p class="marketing-adjust-note">告诉我一个酒店最近的情况，我会结合这次营点再想一版。</p><textarea class="marketing-adjust-input" data-bind="marketing-adjust" aria-label="补充一点情况" placeholder="例如：周边最近有亲子音乐节；更想突出客房景观">${esc(adjust.draft)}</textarea><div class="marketing-prompt-list"><button class="marketing-prompt-chip" data-action="marketing-adjust-prompt" data-prompt="周边最近有什么活动？">周边最近有什么活动？</button><button class="marketing-prompt-chip" data-action="marketing-adjust-prompt" data-prompt="最近哪类客人更多？">最近哪类客人更多？</button><button class="marketing-prompt-chip" data-action="marketing-adjust-prompt" data-prompt="这次更想突出什么？">这次更想突出什么？</button><button class="marketing-prompt-chip" data-action="marketing-adjust-prompt" data-prompt="有没有暂时不想强调的内容？">有没有暂时不想强调的内容？</button></div><div class="marketing-adjust-actions"><button class="primary-btn" data-action="marketing-adjust-submit">基于补充内容调整策划</button></div></div><div class="marketing-adjust-state ${loadingState}" data-state="loading"><div class="marketing-adjust-loading"><span class="marketing-loading-orbit" aria-hidden="true"></span><h3>正在调整策划</h3><p>AI 正在结合酒店情况和当前营点重新整理</p></div><div class="marketing-loading-steps"><div class="marketing-loading-step done">理解补充情况</div><div class="marketing-loading-step active">结合当前营点</div><div class="marketing-loading-step">整理调整摘要</div></div><button class="secondary-btn marketing-adjust-cancel" data-action="marketing-adjust-cancel">取消调整</button></div><div class="marketing-adjust-state ${resultState}" data-state="result"><div class="marketing-result-heading"><span>✓</span><h3>策划调整好了</h3></div><div class="marketing-result-summary"><strong>调整摘要</strong><p>可以把这次宣传从“亲子入住”，延展成“入住酒店＋周边亲子体验”的轻度假安排。</p></div><div class="marketing-change-list"><div>宣传重点：亲子房、早餐、周边亲子活动</div><div>内容表达：从介绍酒店变为“入住＋周边体验”</div><div>素材建议：补充酒店周边环境或亲子活动素材</div></div><p class="marketing-adjust-note">后续生成的文案、宣传图和视频都会沿用这一版调整后的方向。</p><div class="marketing-result-actions"><button class="secondary-btn" data-action="marketing-adjust-continue">继续补充</button><button class="primary-btn" data-action="marketing-adjust-accept">认可这版策划</button></div></div><div class="marketing-adjust-state ${errorState}" data-state="error"><div class="marketing-adjust-error">这次调整没有完成，原策划没有变化。可以重试，已填写的内容会保留。</div><div class="marketing-result-actions"><button class="secondary-btn" data-action="marketing-adjust-retry">重试</button><button class="primary-btn" data-action="marketing-adjust-edit">返回修改</button></div></div></section></div>`;
}

function renderMarketingPlan() {
  const hotel = currentHotel();
  const topicParam = new URLSearchParams(location.search).get("topic");
  const adjustedPlan = sessionStorage.getItem("yingdian_marketing_adjusted") === "1" && (!topicParam || topicParam === "暑期亲子入住推广");
  const topic = adjustedPlan ? "入住酒店＋周边亲子体验" : (topicParam || "暑期亲子入住推广");
  const hotelName = hotel ? hotel.name : "尚未选择酒店";
  const hotelAddress = hotel ? hotel.address : "请先返回酒店AI助手选择酒店";
  const hotelLogo = hotel?.logo || hotelName.slice(0, 1);
  const adjust = state.marketingAdjust;
  const reasonTitle = adjustedPlan ? "把入住和周边亲子体验连起来" : "暑期尾声仍有一波短途亲子需求";
  const reasonBody = adjustedPlan ? "结合补充情况，这次不只介绍酒店，也把周边亲子体验纳入安排，让家庭客人更容易理解这一趟轻度假。" : "现在更适合强调“住得舒服、带孩子方便、顺便有得玩”，让家庭客人快速理解这家酒店的安排。";
  const focusItems = adjustedPlan ? "<b>亲子房</b><b>早餐</b><b>周边亲子活动</b>" : "<b>亲子房</b><b>早餐</b><b>周边亲子去处</b>";
  const expressionDirection = adjustedPlan ? "从介绍酒店变为“入住＋周边体验”，保持轻松、有画面感的周末安排。" : "明亮、轻松、有具体入住画面；不只介绍设施，也让人感到这趟周末安排很省心。";
  const materialSuggestion = adjustedPlan ? "客房、早餐、家庭入住场景，补充一张酒店周边环境或亲子活动的照片。" : "客房、早餐、家庭入住场景，最好能补充一张酒店周边亲子去处的照片。";
  const content = `<div class="marketing-plan-content"><section class="marketing-topic-card"><div class="marketing-topic-topline"><span class="marketing-topic-tag">AI 推荐营点</span><span class="marketing-topic-date">8月中下旬</span></div><h2 class="marketing-topic-title">${esc(topic)}</h2><p class="marketing-topic-reason">抓住暑期最后两周的短途亲子出行需求，把亲子房、早餐和周边体验串成一件值得现在宣传的事。</p><div class="marketing-hotel-line"><span class="marketing-hotel-mark">${esc(hotelLogo)}</span><span>本次酒店</span><strong>${esc(hotelName)}</strong></div><span class="marketing-hotel-address">${esc(hotelAddress)}</span></section><section class="marketing-section"><h2 class="marketing-section-title">推荐理由</h2><div class="marketing-surface-card"><div class="marketing-insight-intro"><span class="marketing-insight-icon">${icon("sparkle")}</span><div><strong>${reasonTitle}</strong><p>${reasonBody}</p></div></div><div class="marketing-metric-grid"><div><span>建议时间</span><strong>8月中下旬</strong></div><div><span>目标客群</span><strong>周末亲子家庭</strong></div></div></div></section><section class="marketing-section"><h2 class="marketing-section-title">策划详情</h2><div class="marketing-surface-card marketing-detail-list"><div><span>宣传目标</span><strong>让家庭客人产生“现在就去住一晚”的入住兴趣</strong></div><div><span>宣传重点</span><p>${focusItems}</p></div><div><span>表达方向</span><strong>${expressionDirection}</strong></div><div><span>素材建议</span><strong>${materialSuggestion}</strong></div></div></section><section class="marketing-section"><h2 class="marketing-section-title">内容清单</h2><div class="marketing-deliverables"><div><span class="marketing-deliverable-icon">${icon("copy")}</span><span><strong>通用发布文案</strong><small>围绕亲子周末入住的发布文案方向</small></span><em>待生成</em></div><div><span class="marketing-deliverable-icon">${icon("image")}</span><span><strong>宣传图</strong><small>明亮的亲子入住场景，一眼看懂主推重点</small></span><em>待生成</em></div><div><span class="marketing-deliverable-icon">${icon("video")}</span><span><strong>15秒视频</strong><small>用入住动线补充氛围与细节</small></span><em>待生成</em></div></div></section><section class="marketing-section marketing-adjust-section"><button class="marketing-adjust-row" data-action="marketing-adjust-open" aria-haspopup="dialog" aria-controls="marketing-adjust-sheet" aria-expanded="${adjust.open ? "true" : "false"}"><span><strong>${adjust.pending ? "查看调整结果" : "补充一点情况"}</strong><small>${adjust.pending ? "有一版调整后的策划等待确认" : "告诉我一个酒店最近的情况，我会基于当前营点再想一版"}</small></span>${icon("chevron")}</button></section></div>`;
  const action = `<button class="primary-btn" data-nav="marketingCreate">认可策划，开始创作</button>`;
  return pageShell({ title: "营销策划", content, action, overlay: marketingAdjustSheet() });
}

function renderMarketingCreate() {
  const image = state.marketingType === "image";
  const action = `<button class="primary-btn" data-action="start-generation" data-source="marketingCreate">${icon("sparkle")}生成当前内容</button>`;
  const adjusted = sessionStorage.getItem("yingdian_marketing_adjusted") === "1";
  const summaryTitle = adjusted ? "入住酒店＋周边亲子体验" : "暑期亲子入住推广";
  const summaryNote = adjusted ? "在亲子房、早餐基础上，补充周边亲子体验，延展成一份轻度假安排。" : "围绕亲子房、早餐和儿童用品，保持明亮、轻松的入住氛围。";
  const summary = `<section class="section"><div class="editorial-card"><div class="editorial-card-body"><p class="eyebrow">策划摘要</p><h2 class="section-title">${summaryTitle}</h2><p class="section-note">${summaryNote}</p><div class="marketing-summary-action"><button class="text-action" data-nav="marketingPlan">查看完整策划 ${icon("chevron")}</button></div></div></div></section>`;
  const typeSelector = `<section class="section"><div class="section-head"><h2 class="section-title">内容类型</h2><span class="section-note">选择一种先生成</span></div><div class="segmented"><button class="segment ${image ? "active" : ""}" data-action="marketing-type" data-type="image">文案＋图片</button><button class="segment ${!image ? "active" : ""}" data-action="marketing-type" data-type="video">文案＋视频</button></div></section>`;
  const settings = `${renderDisplaySettings(image ? "image" : "video", image)}${renderQuickRatioSection(image ? "image" : "video", image ? "图片比例" : "视频比例")}${image ? "" : renderQuickMusicSection()}`;
  const content = `<div class="quick-create-content marketing-quick-create">${summary}${typeSelector}${renderQuickPrompt({ value: state.marketingIdea, bind: "marketing-idea", placeholder: "编辑基于策划生成的内容想法", images: state.marketingImages, removeAction: "marketing-asset-remove", kind: image ? "image" : "video", listKey: "marketingImages", assetLabel: image ? "添加图片" : "添加图片或视频", suggestion: "亲子房环境、早餐餐台、儿童用品和酒店公共空间照片" })}<div class="quick-settings-panel">${settings}</div></div>`;
  return pageShell({ title: "营销内容创作", content, action });
}

function marketingCompletedItems() {
  try {
    return JSON.parse(sessionStorage.getItem("yingdian_marketing_completed") || "[]");
  } catch (error) {
    return [];
  }
}

function generationMeta(gen) {
  const mediaLabel = gen.kind === "video" ? "15秒视频" : "宣传图";
  const isMarketing = isMarketingGeneration(gen);
  const isTemplate = gen.source === "templateCreate";
  const hotel = gen.hotelContext || currentHotel();
  const completed = Array.isArray(gen.completed) ? gen.completed : [];
  const currentCombo = isMarketing ? `通用发布文案＋${mediaLabel}` : mediaLabel;
  const pending = isMarketing ? ["通用发布文案", mediaLabel].filter((item) => !completed.includes(item)) : [mediaLabel];
  const sourceName = isMarketing ? "营销活动" : isTemplate ? "模板创作" : "自由创作";
  const topic = sessionStorage.getItem("yingdian_marketing_adjusted") === "1" ? "入住酒店＋周边亲子体验" : "暑期亲子入住推广";
  const activity = isMarketing ? topic : "";
  const idea = isTemplate ? selectedTemplate().name : isMarketing ? "围绕亲子房、早餐和周边体验，保持轻松的入住表达。" : (state.idea || "围绕酒店特色，生成一份适合发布的内容。");
  const steps = isMarketing ? ["读取营点策划", "生成通用发布文案", `生成${mediaLabel}`, "整理内容组合"] : isTemplate ? ["读取模板结构", "替换主图与酒店信息", "生成宣传图", "整理作品信息"] : ["理解创作想法", "组合素材与酒店信息", `生成${mediaLabel}画面`, "整理作品信息"];
  const materialImages = Array.isArray(gen.materialImages) ? gen.materialImages : isMarketing ? state.marketingImages : state.selectedImages;
  const materialTags = isMarketing && !materialImages.length ? ["客房", "早餐", "家庭入住场景"] : [];
  return { mediaLabel, isMarketing, isTemplate, hotel, completed, currentCombo, pending, sourceName, activity, idea, steps, materialImages, materialTags };
}

function generationMaterialVisual(meta) {
  const outputMode = meta.mediaLabel === "15秒视频" ? "video" : "image";
  const hasMaterial = meta.materialImages.length > 0;
  const sourceImages = meta.materialImages.slice(0, 3);
  const collageImages = sourceImages.map((image, index) => `<img class="generation-collage-image collage-image-${index + 1}" src="${image}" alt="正在组合的素材">`).join("");
  const words = meta.isMarketing ? ["亲子", "入住", "夏日"] : meta.isTemplate ? ["样式", "主图", "酒店"] : ["想法", "画面", "内容"];
  const emptyVisual = `<div class="generation-empty-field" aria-hidden="true">${words.map((word, index) => `<span class="generation-empty-word word-${index + 1}">${word}</span>`).join("")}<span class="generation-empty-core"></span><span class="generation-empty-orbit orbit-one"></span><span class="generation-empty-orbit orbit-two"></span></div>`;
  return `<div class="generation-material-stage ${hasMaterial ? "has-material" : "no-material"}"><div class="generation-material-source">${hasMaterial ? `<div class="generation-material-collage" aria-hidden="true">${collageImages}<span class="generation-collage-wash"></span><span class="generation-collage-glint"></span></div>` : emptyVisual}</div><div class="generation-flow-line"><i></i><i></i><i></i></div><div class="generation-output-preview"><div class="generation-output-frame abstract-output ${outputMode}"><span class="generation-output-art" aria-hidden="true"><i></i><i></i><i></i><b></b></span><span class="generation-output-shimmer"></span></div></div></div>`;
}

function generationTaskCard(meta, gen) {
  const rows = [];
  if (meta.isMarketing) rows.push(`<div><span>营销活动</span><strong>${esc(meta.activity)}</strong></div>`, `<div><span>当前营点</span><strong>暑期亲子入住推广</strong></div>`);
  else rows.push(`<div><span>创作来源</span><strong>${meta.sourceName}</strong></div>`);
  rows.push(`<div><span>当前生成组合</span><strong>${meta.currentCombo}</strong></div>`);
  if (!meta.isMarketing) rows.push(`<div><span>${meta.isTemplate ? "使用模板" : "创作想法"}</span><strong>${esc(meta.idea)}</strong></div>`);
  return `<div class="generation-task-card ${gen.status === "failed" ? "failed" : ""}"><div class="generation-task-status"><span class="status-dot"></span><span>${gen.status === "failed" ? "生成失败" : "正在生成"}</span></div><div class="generation-task-list">${rows.join("")}</div></div>`;
}

function generationSteps(meta, gen) {
  const activeIndex = gen.status === "failed" ? 1 : Math.min(2, 1 + (gen.attempts || 0));
  return `<div class="generation-steps">${meta.steps.map((step, index) => `<div class="generation-step ${index < activeIndex ? "done" : index === activeIndex ? "active" : ""}"><span class="generation-step-dot">${index < activeIndex ? icon("check") : ""}</span><span>${step}</span></div>`).join("")}</div>`;
}

function generationCompletion(meta) {
  const completed = meta.completed.length ? meta.completed.join("、") : "暂无";
  const pending = meta.pending.length ? meta.pending.join("、") : "暂无";
  return `<div class="generation-completion"><div><span>已完成内容</span><strong>${completed}</strong></div><div><span>待完成内容</span><strong>${pending}</strong></div></div>`;
}

function renderGeneration() {
  if (!state.generation) {
    state.generation = { status: "running", source: "imageCreate", attempts: 0, kind: "image", title: "夏日亲子入住推广", createdFrom: "imageCreate", completed: [] };
    write("yingdian_generation", state.generation);
  }
  const gen = state.generation;
  const meta = generationMeta(gen);
  if (gen.status === "running") {
    const context = meta.isMarketing ? meta.activity : meta.isTemplate ? selectedTemplate().name : "自由创作";
    const content = `<div class="generation-page-content"><section class="section generation-intro"><p class="eyebrow">${meta.sourceName}</p><h2 class="section-title">正在生成${meta.isMarketing ? meta.currentCombo : `你的${meta.mediaLabel}`}</h2><div class="generation-context-line">${esc(context)}</div></section><section class="section generation-visual-section">${generationMaterialVisual(meta)}<div class="generation-live-status"><span>正在理解创作方向</span><span>正在组合内容表达</span><span>正在整理最终画面</span></div></section></div>`;
    return pageShell({ title: "生成中", content, action: `<button class="danger-btn" data-action="generation-cancel">取消</button>` });
  }
  if (gen.status === "failed") {
    const repeated = gen.attempts > 1;
    const reason = repeated ? "素材组合暂时不可用" : "素材读取超时";
    const context = meta.isMarketing ? meta.activity : meta.isTemplate ? selectedTemplate().name : "自由创作";
    const content = `<div class="generation-page-content"><section class="section generation-intro"><p class="eyebrow failed-eyebrow">生成失败</p><h2 class="section-title">这次没有生成成功</h2><div class="generation-context-line">${esc(context)}</div></section><section class="section generation-visual-section">${generationMaterialVisual(meta)}</section><section class="section"><div class="generation-error-card"><span class="generation-error-icon">${icon("info")}</span><div><strong>${reason}</strong><p>可以直接重试，当前创作信息会保留。</p></div></div><div class="button-row generation-retry-row"><button class="primary-btn" data-action="generation-retry">重试</button>${repeated ? `<button class="secondary-btn" data-action="generation-edit">返回修改</button>` : ""}</div></section></div>`;
    return pageShell({ title: "生成失败", content, action: `<button class="danger-btn" data-action="generation-cancel">取消</button>` });
  }
  const result = gen.kind === "video" ? "video" : "image";
  const content = `<section class="section"><p class="eyebrow">生成完成</p><h2 class="section-title">作品已生成</h2><div class="surface-card"><div class="summary-list"><div class="summary-item"><span>作品名称</span><strong>${esc(gen.title)}</strong></div><div class="summary-item"><span>内容类型</span><strong>${result === "video" ? "15秒视频" : "宣传图"}</strong></div><div class="summary-item"><span>来源</span><strong>${gen.source === "marketingCreate" ? "营销活动" : "自由创作"}</strong></div></div></div></section>`;
  setTimeout(() => go("result", { kind: result }), 500);
  return pageShell({ title: "生成完成", content });
}

function renderResult() {
  const resultParams = new URLSearchParams(location.search);
  const kind = resultParams.get("kind") || (state.generation?.kind === "video" ? "video" : "image");
  const video = kind === "video";
  const marketing = isMarketingGeneration(state.generation) || resultParams.get("source") === "marketingActivity";
  const template = state.generation?.source === "templateCreate";
  const resultHotel = state.generation?.hotelContext || currentHotel();
  const media = `<div class="result-media ${video ? "video" : "image"}"><img src="${video ? ASSET.room : ASSET.night}" alt="${video ? "15秒视频封面" : "宣传图作品"}"><div class="result-overlay"><small>${esc(resultHotel?.name || "当前酒店")}</small><strong>${video ? "在这里，住进一段暑假" : "这个夏天，和孩子住得刚刚好"}</strong><span>${video ? "15秒视频 · 暑期亲子入住推广" : "宣传图 · 暑期亲子入住推广"}</span></div>${video ? `<button class="play-btn" data-action="play">${icon("play")}</button>` : ""}</div>`;
  const resultExplanation = marketing ? "" : template
    ? `<section class="section result-explanation"><p class="eyebrow">创作说明</p><p class="result-explanation-title">已按所选样式完成主图替换</p></section>`
    : `<section class="section result-explanation"><p class="eyebrow">创作说明</p><p class="result-explanation-title">根据你的想法生成</p><p class="result-explanation-copy">${esc(state.generation?.idea || "围绕酒店特色，生成一份适合发布的内容。")}</p></section>`;
  const marketingCompleted = marketingCompletedItems();
  const marketingCopy = "这个夏天，带孩子住得舒服，也顺便有得玩。亲子房、早餐和周边体验，一次安排好。";
  const marketingNext = video ? "宣传图" : "15秒视频";
  const marketingNextKind = video ? "image" : "video";
  const marketingDone = marketingCompleted.length ? marketingCompleted.join("、") : `${video ? "通用发布文案、15秒视频" : "通用发布文案、宣传图"}`;
  const marketingContent = marketing ? `<section class="section marketing-result-section"><div class="section-head"><div><p class="eyebrow">营销活动</p><h2 class="section-title">暑期尾声亲子入住推广</h2></div><div class="marketing-result-head-actions"><span class="status-pill">${marketingCompleted.includes("宣传图") && marketingCompleted.includes("15秒视频") ? "已完成" : "进行中"}</span><button class="text-action" data-nav="marketingActivity">查看活动详情 ${icon("chevron")}</button></div></div><div class="copy-block marketing-result-copy"><div class="copy-block-head"><strong>通用发布文案</strong><button class="text-action" data-action="copy">复制文案</button></div><p>${marketingCopy}</p></div><p class="marketing-result-progress">已完成：${esc(marketingDone)}</p></section><section class="section"><div class="editorial-card"><div class="editorial-card-body"><p class="eyebrow">营销活动后续</p><h2 class="section-title">${marketingCompleted.includes("宣传图") && marketingCompleted.includes("15秒视频") ? "本次内容已完成" : `继续完成${marketingNext}`}</h2><p class="section-note">${marketingCompleted.includes("宣传图") && marketingCompleted.includes("15秒视频") ? "文案、宣传图和15秒视频已归入同一次营销活动。" : `共享通用文案会自动复用，接着生成${marketingNext}。`}</p>${marketingCompleted.includes("宣传图") && marketingCompleted.includes("15秒视频") ? "" : `<button class="text-action" data-action="marketing-continue" data-kind="${marketingNextKind}">继续生成${marketingNext} ${icon("chevron")}</button>`}</div></div></section>` : "";
  const content = `<section class="section">${media}</section>${resultExplanation}${marketingContent}`;
  const title = marketing ? "营销内容结果" : video ? "视频结果" : "宣传图结果";
  const action = `<div class="button-row result-action-bar"><button class="secondary-btn" data-action="download">${icon("download")}下载</button><button class="primary-btn" data-nav="edit" data-kind="${kind}">${icon("edit")}修改</button></div>`;
  return pageShell({ title, content, action });
}

function renderMarketingActivity() {
  const completed = marketingCompletedItems();
  const imageDone = completed.includes("宣传图");
  const videoDone = completed.includes("15秒视频");
  const allDone = imageDone && videoDone;
  const nextKind = imageDone ? "video" : "image";
  const nextLabel = imageDone ? "视频" : "图片";
  const hotel = currentHotel();
  const content = `<section class="section"><div class="activity-hero"><p class="eyebrow">营销活动</p><h2 class="section-title">暑期尾声亲子入住推广</h2><div class="activity-meta"><span>${esc(hotel?.name || "云栖酒店·杭州")}</span><span>8月中下旬</span></div></div></section><section class="section"><div class="section-head"><h2 class="section-title">策划摘要</h2><span class="section-note">已认可</span></div><div class="surface-card activity-plan-card"><div class="summary-list"><div class="summary-item"><span>推荐理由</span><strong>暑期最后两周仍有短途亲子出行需求。</strong></div><div class="summary-item"><span>宣传目标</span><strong>让家庭客人快速了解亲子入住体验。</strong></div><div class="summary-item"><span>目标客群</span><strong>计划暑期周末出行的年轻家庭。</strong></div><div class="summary-item"><span>宣传重点</span><strong>亲子房、早餐和酒店周边亲子去处。</strong></div><div class="summary-item"><span>建议时间</span><strong>8月中下旬。</strong></div></div></div></section><section class="section"><div class="section-head"><div><h2 class="section-title">内容完成情况</h2><p class="section-note">文案、图片和视频来自同一份策划</p></div><span class="status-pill">${allDone ? "已完成" : "进行中"}</span></div><div class="activity-content-list"><div class="activity-content-row"><span class="activity-content-icon ${completed.includes("通用发布文案") || completed.length ? "done" : "pending"}">${completed.includes("通用发布文案") || completed.length ? icon("check") : icon("copy")}</span><div><strong>通用发布文案</strong><small>${completed.includes("通用发布文案") || completed.length ? "已生成，可在结果页复制" : "随首个内容一起生成"}</small></div></div><div class="activity-content-row"><span class="activity-content-icon ${imageDone ? "done" : "pending"}">${imageDone ? icon("check") : icon("image")}</span><div><strong>宣传图</strong><small>${imageDone ? "已完成" : "待生成"}</small></div></div><div class="activity-content-row"><span class="activity-content-icon ${videoDone ? "done" : "pending"}">${videoDone ? icon("check") : icon("video")}</span><div><strong>15秒视频</strong><small>${videoDone ? "已完成" : "待生成"}</small></div></div></div>${allDone ? `<p class="activity-complete-note">本次营销活动的内容已经完成。</p>` : `<button class="primary-btn activity-next-action" data-action="marketing-continue" data-kind="${nextKind}">继续生成${nextLabel}</button>`}</section>`;
  return pageShell({ title: "营销活动详情", content });
}

function renderMarketingActivityV2() {
  const completed = marketingCompletedItems();
  const copyDone = completed.includes("通用发布文案") || completed.length > 0;
  const imageDone = completed.includes("宣传图");
  const videoDone = completed.includes("15秒视频");
  const allDone = imageDone && videoDone;
  const nextKind = imageDone ? "video" : "image";
  const nextLabel = imageDone ? "视频" : "图片";
  const hotel = currentHotel();
  const completedRow = (kind, title, description, iconName) => `<button class="activity-content-row is-complete" data-action="marketing-content-open" data-kind="${kind}" aria-label="查看已完成${title}"><span class="activity-content-icon done">${icon("check")}</span><span class="activity-content-copy"><strong>${title}</strong><small>${description} · 点击查看</small></span><span class="activity-content-state done">已完成</span>${icon("chevron")}</button>`;
  const pendingRow = (title, description, iconName) => `<div class="activity-content-row is-pending"><span class="activity-content-icon pending">${icon(iconName)}</span><span class="activity-content-copy"><strong>${title}</strong><small>${description}</small></span><span class="activity-content-state pending">待生成</span></div>`;
  const contentRows = `${copyDone ? completedRow("image", "通用发布文案", "已生成，可在结果页复制", "copy") : pendingRow("通用发布文案", "随首个内容一起生成", "copy")}${imageDone ? completedRow("image", "宣传图", "已完成本次营销活动图片", "image") : pendingRow("宣传图", "待生成", "image")}${videoDone ? completedRow("video", "15秒视频", "已完成本次营销活动视频", "video") : pendingRow("15秒视频", "待生成", "video")}`;
  const content = `<section class="section"><div class="activity-hero"><p class="eyebrow">营销活动</p><h2 class="section-title">暑期尾声亲子入住推广</h2><div class="activity-meta"><span>${esc(hotel?.name || "云栖酒店·杭州")}</span><span>8月中下旬</span></div></div></section><section class="section"><div class="section-head"><h2 class="section-title">策划摘要</h2><span class="section-note">已认可</span></div><div class="surface-card activity-plan-card"><div class="summary-list"><div class="summary-item"><span>推荐理由</span><strong>暑期最后两周仍有短途亲子出行需求。</strong></div><div class="summary-item"><span>宣传目标</span><strong>让家庭客人快速了解亲子入住体验。</strong></div><div class="summary-item"><span>目标客群</span><strong>计划暑期周末出行的年轻家庭。</strong></div><div class="summary-item"><span>宣传重点</span><strong>亲子房、早餐和酒店周边亲子去处。</strong></div><div class="summary-item"><span>建议时间</span><strong>8月中下旬。</strong></div></div></div></section><section class="section"><div class="section-head"><div><h2 class="section-title">内容完成情况</h2><p class="section-note">已完成内容可直接查看</p></div><span class="status-pill">${allDone ? "已完成" : "进行中"}</span></div><div class="activity-content-list">${contentRows}</div>${allDone ? `<p class="activity-complete-note">本次营销活动的内容已经完成。</p>` : `<button class="primary-btn activity-next-action" data-action="marketing-continue" data-kind="${nextKind}">继续生成${nextLabel}</button>`}</section>`;
  return pageShell({ title: "营销活动详情", content });
}

function renderEdit() {
  const kind = new URLSearchParams(location.search).get("kind") || (state.generation?.kind === "video" ? "video" : "image");
  const video = kind === "video";
  const action = `<button class="primary-btn" data-action="start-generation" data-source="edit" data-kind="${kind}">${icon("sparkle")}生成修改版</button>`;
  const media = `<section class="section edit-original-section"><div class="result-media ${video ? "video" : "image"}"><img src="${video ? ASSET.room : ASSET.night}" alt="原作品"><div class="result-overlay"><small>原作品</small><strong>${video ? "在这里，住进一段暑假" : "这个夏天，和孩子住得刚刚好"}</strong></div>${video ? `<button class="play-btn" data-action="play">${icon("play")}</button>` : ""}</div></section>`;
  const prompt = renderQuickPrompt({ value: state.editIdea, bind: "edit-idea", placeholder: video ? "描述想怎么调整，也可以添加或更换图片、视频" : "描述想怎么调整，也可以添加或更换图片", images: state.editImages, removeAction: "edit-asset-remove", kind: video ? "video" : "image", listKey: "editImages", assetLabel: video ? "添加图片或视频" : "添加图片", label: "想改什么？" });
  const settings = `${renderDisplaySettings(video ? "video" : "image", !video)}${renderQuickRatioSection(video ? "video" : "image", video ? "视频比例" : "画幅比例")}${video ? renderQuickMusicSection() : ""}`;
  const content = `${media}<div class="quick-create-content edit-quick-create">${prompt}<div class="quick-settings-panel">${settings}</div></div>`;
  return pageShell({ title: video ? "修改15秒视频" : "修改宣传图", content, action });
}

function renderWorks() {
  const filter = state.worksFilter;
  const hotelId = currentHotel()?.id;
  const contextWorks = state.works.filter((work) => !work.hotelId || work.hotelId === hotelId);
  const ordinaryWorks = contextWorks.map((work) => work.type === "模板创作" ? { ...work, type: "宣传图" } : work);
  const filtered = ordinaryWorks.filter((work) => !isMarketingWork(work) && (filter === "image" ? work.type !== "15秒视频" : work.type === "15秒视频"));
  const workList = filtered.length ? `<div class="work-list">${filtered.map((work) => `<button class="work-item" data-action="work-open" data-id="${work.id}"><span class="work-thumb"><img src="${work.image}" alt="${esc(work.title)}"></span><span class="work-copy"><strong>${esc(work.title)}</strong><span>${filter === "image" ? "图片" : "视频"} · ${esc(work.status)} · ${esc(work.time)}</span></span>${icon("chevron")}</button>`).join("")}</div>` : `<div class="empty-card compact"><div class="empty-icon">${icon(filter === "image" ? "image" : "video")}</div><h3>还没有${filter === "image" ? "图片" : "视频"}作品</h3><p>完成生成后，作品会自动保存在这里。</p></div>`;
  const marketingCompleted = marketingCompletedItems();
  const marketingImageDone = marketingCompleted.includes("宣传图") || !marketingCompleted.length;
  const marketingVideoDone = marketingCompleted.includes("15秒视频");
  const marketingComplete = marketingImageDone && marketingVideoDone;
  const marketingNextKind = marketingImageDone ? "video" : "image";
  const marketingNextLabel = marketingImageDone ? "视频" : "图片";
  const marketingList = `<div class="campaign-work-list"><article class="campaign-work-card"><div class="campaign-work-cover"><img src="${ASSET.night}" alt="暑期亲子入住推广"><span>营销活动</span></div><div class="campaign-work-body"><div class="section-head"><div><h3>暑期亲子入住推广</h3><p>今天 10:24 更新</p></div><span class="status-pill">${marketingComplete ? "已完成" : "进行中"}</span></div><div class="campaign-detail-link"><button class="text-action" data-nav="marketingActivity">查看活动详情 ${icon("chevron")}</button></div><div class="campaign-progress"><span class="done">${icon("check")}通用发布文案${marketingImageDone ? "、图片" : "待生成"}</span><span class="${marketingVideoDone ? "done" : ""}">${icon("video")}${marketingVideoDone ? "15秒视频已完成" : "15秒视频待生成"}</span></div>${marketingComplete ? `<p class="campaign-complete-note">文案、图片和视频已归入同一次营销活动。</p>` : `<button class="campaign-next" data-action="marketing-continue" data-kind="${marketingNextKind}"><span><strong>继续完成${marketingNextLabel}内容</strong><small>复用本次文案与策划信息</small></span>${icon("chevron")}</button>`}</div></article></div>`;
  const content = `<section class="section"><div class="section-head"><div><h2 class="section-title">我的作品</h2><p class="section-note">生成成功的内容会自动保存</p></div><button class="text-action" data-action="works-refresh">刷新 ${icon("refresh")}</button></div><div class="works-tabs"><button class="works-tab ${filter === "image" ? "active" : ""}" data-action="works-filter" data-filter="image">图片</button><button class="works-tab ${filter === "video" ? "active" : ""}" data-action="works-filter" data-filter="video">视频</button><button class="works-tab ${filter === "marketing" ? "active" : ""}" data-action="works-filter" data-filter="marketing">营销活动</button></div>${filter === "marketing" ? marketingList : workList}</section>`;
  return pageShell({ title: "作品", subtitle: "最近生成的内容", content, nav: true });
}

function renderProfile() {
  const hotel = currentHotel();
  const content = `<section class="section"><div class="profile-user-card"><span class="profile-avatar">${icon("user")}</span><span class="profile-copy"><strong>平台账户</strong><span>账户与酒店信息由酒店AI助手平台管理</span></span></div></section><section class="section"><div class="section-head"><div><h2 class="section-title">当前酒店</h2><p class="section-note">进入营点AI后保持平台所选酒店</p></div></div>${hotel ? `<div class="profile-hotel-card is-readonly"><span class="hotel-logo">${esc(hotel.logo || hotel.name.slice(0, 1))}</span><span class="profile-hotel-copy"><strong>${esc(hotel.name)}</strong><span>${esc(hotel.address)}</span><small>由酒店AI助手提供</small></span></div>` : `<div class="empty-card compact"><h3>尚未选择酒店</h3><p>请先返回酒店AI助手选择酒店。</p><button class="secondary-btn" data-action="platform-back">返回酒店AI助手</button></div>`}</section><section class="section"><h2 class="section-title">常用功能</h2><div class="menu-list"><button class="menu-row" data-nav="assets">${icon("layers")}<span>常用素材</span><small>图片与二维码 ${icon("chevron")}</small></button></div></section>`;
  return pageShell({ title: "我的", subtitle: "账户与常用设置", content, nav: true });
}

function renderHotels() {
  const hotel = currentHotel();
  const content = `<section class="section"><div class="surface-card platform-managed-note"><span class="profile-avatar">${icon("building")}</span><div><h2 class="section-title">酒店信息由平台管理</h2><p class="section-note">营点AI会持续使用酒店AI助手当前所选酒店，不在应用内新增、编辑或切换酒店。</p></div></div></section>${hotel ? `<section class="section"><div class="profile-hotel-card is-readonly"><span class="hotel-logo">${esc(hotel.logo || hotel.name.slice(0, 1))}</span><span class="profile-hotel-copy"><strong>${esc(hotel.name)}</strong><span>${esc(hotel.address)}</span><small>当前酒店信息</small></span></div></section>` : ""}`;
  return pageShell({ title: "当前酒店", content, action: `<button class="primary-btn" data-action="platform-back">返回酒店AI助手</button>` });
}

function renderHotelForm() {
  return renderHotels();
}

function renderAssets() {
  const type = new URLSearchParams(location.search).get("type") || "image";
  const images = [ASSET.room, ASSET.dining, ASSET.night, ASSET.detail];
  const list = type === "qr" ? [ASSET.detail] : images;
  const content = `<section class="section"><div class="tabs"><button class="tab ${type === "image" ? "active" : ""}" data-action="asset-filter" data-type="image">图片 <small>4</small></button><button class="tab ${type === "qr" ? "active" : ""}" data-action="asset-filter" data-type="qr">二维码 <small>1</small></button></div><div class="section-head"><div><h2 class="section-title">${type === "qr" ? "二维码" : "图片"}</h2><p class="section-note">点击缩略图可查看大图</p></div><button class="secondary-btn" data-action="asset-upload" data-kind="${type}">${icon("plus")}上传${type === "qr" ? "二维码" : "图片"}</button></div><div class="asset-library-grid ${type === "qr" ? "qr-library" : ""}">${list.map((image, index) => `<button class="asset-library-item" data-action="asset-preview" data-image="${image}" aria-label="查看${type === "qr" ? "二维码" : "图片"} ${index + 1}"><img src="${image}" alt="${type === "qr" ? "二维码" : "图片"} ${index + 1}">${type === "qr" ? `<span class="asset-qr-mask">${icon("qr")}</span>` : ""}</button>`).join("")}</div></section>`;
  return pageShell({ title: "素材与二维码", subtitle: "管理常用图片与二维码", content });
}

function renderAccount() {
  const content = `<section class="section"><div class="surface-card platform-managed-note"><span class="profile-avatar">${icon("user")}</span><div><h2 class="section-title">账户信息</h2><p class="section-note">用户身份、头像和账户设置由酒店AI助手平台统一管理。</p></div></div></section>`;
  return pageShell({ title: "账户信息", subtitle: "由酒店AI助手平台管理", content });
}

function renderApp() {
  const app = document.getElementById("app");
  const page = document.body.dataset.page;
  let html = "";
  switch (page) {
    case "home": html = renderHome(); break;
    case "imageCreate": html = renderImageCreate(); break;
    case "videoCreate": html = renderVideoCreate(); break;
    case "templates": html = renderTemplates(); break;
    case "templateCreate": html = renderTemplateCreate(); break;
    case "marketingPlan": html = renderMarketingPlan(); break;
    case "marketingCreate": html = renderMarketingCreate(); break;
    case "generation": html = renderGeneration(); break;
    case "result": html = renderResult(); break;
    case "marketingActivity": html = renderMarketingActivityV2(); break;
    case "edit": html = renderEdit(); break;
    case "works": html = renderWorks(); break;
    case "profile": html = renderProfile(); break;
    case "hotels": html = renderHotels(); break;
    case "hotelNew": html = renderHotelForm(false); break;
    case "hotelEdit": html = renderHotelForm(true); break;
    case "assets": html = renderAssets(); break;
    case "account": html = renderAccount(); break;
    default: html = renderHome();
  }
  app.innerHTML = html + `<div class="toast" id="toast"></div><div class="sheet-backdrop" id="sheet-backdrop"><div class="sheet" id="sheet"></div></div>`;
  bindInputs();
  if (page === "generation" && state.generation?.status === "running") scheduleGeneration();
}

function bindInputs() {
  document.querySelectorAll("[data-bind]").forEach((input) => {
    input.addEventListener("input", () => {
      const bind = input.dataset.bind;
      if (bind === "image-idea" || bind === "video-idea" || bind === "template-idea") state.idea = input.value;
      if (bind === "marketing-idea") state.marketingIdea = input.value;
      if (bind === "marketing-adjust") state.marketingAdjust.draft = input.value;
      if (bind === "edit-idea") state.editIdea = input.value;
    });
  });
}

function scheduleGeneration() {
  if (state.generation.timer) return;
  state.generation.timer = setTimeout(() => {
    state.generation.timer = null;
    if (state.generation.status !== "running") return;
    state.generation.status = "success";
    write("yingdian_generation", state.generation);
    addWorkFromGeneration();
    renderApp();
  }, 4000);
}

function addWorkFromGeneration() {
  const gen = state.generation;
  const marketing = isMarketingGeneration(gen);
  const item = { id: `work-${Date.now()}`, hotelId: gen.hotelContext?.id || currentHotel()?.id || "", title: gen.title || "未命名作品", type: gen.kind === "video" ? "15秒视频" : (gen.source === "templateCreate" ? "模板创作" : "宣传图"), status: "已完成", image: gen.kind === "video" ? ASSET.room : ASSET.night, time: "刚刚", source: gen.source, marketing, activityId: marketing ? "summer-family-stay" : "" };
  state.works = [item, ...state.works.filter((work) => work.id !== item.id)];
  write("yingdian_works", state.works);
  if (marketing) {
    const completed = [...new Set([...(gen.completed || []), "通用发布文案", gen.kind === "video" ? "15秒视频" : "宣传图"])];
    sessionStorage.setItem("yingdian_marketing_completed", JSON.stringify(completed));
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function openSheet(kind, payload = {}) {
  state.sheet = { kind, payload };
  const backdrop = document.getElementById("sheet-backdrop");
  const sheet = document.getElementById("sheet");
  if (!backdrop || !sheet) return;
  sheet.className = `sheet ${kind === "display-content" ? "display-content-sheet-host" : ""}`;
  sheet.innerHTML = sheetContent(kind, payload);
  backdrop.classList.add("open");
}

function closeSheet() {
  state.sheet = null;
  document.getElementById("sheet-backdrop")?.classList.remove("open");
}

function sheetContent(kind, payload) {
  if (kind === "display-content") {
    const hotel = currentHotel();
    const media = payload.media === "video" ? "video" : "image";
    const title = "酒店信息";
    const hotelRows = hotel ? [["name", "酒店名称", hotel.name], ["address", "酒店地址", hotel.address], ...(hotel.logo ? [["logo", "酒店标志", `${hotel.name} Logo`]] : [])] : [];
    const hotelSection = hotel ? `<div class="display-current-hotel is-readonly"><span class="hotel-logo">${esc(hotel.logo || hotel.name.slice(0, 1))}</span><span class="display-current-hotel-copy"><strong>${esc(hotel.name)}</strong><span>${esc(hotel.address)}</span></span><span class="display-context-badge">当前酒店</span></div><div class="display-option-list">${hotelRows.map(([key, label, value]) => `<button class="display-option-row ${state.hotelUsage[key] ? "selected" : ""}" data-action="display-hotel-use" data-key="${key}" data-media="${media}"><span class="display-option-copy"><strong>${label}</strong><span>${esc(value)}</span></span><span class="display-selection-toggle">${icon("check")}</span></button>`).join("")}</div>` : `<div class="empty-card compact"><h3>尚未选择酒店</h3><p>请先返回酒店AI助手选择酒店。</p><button class="secondary-btn" data-action="platform-back">返回酒店AI助手</button></div>`;
    return `<div class="display-content-sheet"><div class="display-sheet-head"><div><h3>${title}</h3><p>选择要添加到${media === "video" ? "视频" : "图片"}中的酒店信息</p></div><button class="display-sheet-close" data-action="display-content-done" aria-label="关闭">${icon("close")}</button></div>${hotelSection}<button class="display-sheet-done" data-action="display-content-done">完成</button></div>`;
  }
  if (kind === "asset-channel") {
    const isQr = payload.kind === "qr";
    const kindText = isQr ? "二维码" : payload.kind === "video" ? "图片或视频" : "图片素材";
    const myAction = isQr ? "qr-my" : "asset-my";
    const localAction = isQr ? "qr-local" : "asset-local";
    const listAttr = payload.list ? ` data-list="${payload.list}"` : "";
    return `<div class="sheet-handle"></div><h3>添加${kindText}</h3><div class="sheet-options"><button class="sheet-option" data-action="${myAction}" data-kind="${payload.kind}"${listAttr}>${icon("layers")}<span><strong>从我的素材选择</strong><small>${isQr ? "选择已保存的二维码" : "选择已经保存的图片素材"}</small></span>${icon("chevron")}</button><button class="sheet-option" data-action="${localAction}" data-kind="${payload.kind}"${listAttr}>${icon("upload")}<span><strong>从手机照片选择</strong><small>${isQr ? "支持一个二维码图片" : payload.kind === "video" ? "支持图片或视频" : "支持图片"}</small></span>${icon("chevron")}</button></div><button class="text-action" data-action="sheet-close">取消</button>`;
  }
  if (kind === "asset-select") {
    const images = [ASSET.room, ASSET.dining, ASSET.night, ASSET.detail];
    const listKey = ["marketingImages", "editImages"].includes(payload.list) ? payload.list : "selectedImages";
    const selected = state[listKey];
    return `<div class="sheet-handle"></div><h3>选择我的素材</h3><div class="asset-grid">${images.map((image, index) => `<button class="asset-thumb ${selected.includes(image) ? "selected" : ""}" data-action="asset-pick" data-image="${image}" data-list="${listKey}"><img src="${image}" alt="素材${index + 1}">${selected.includes(image) ? `<span class="checkbox" style="position:absolute;right:6px;top:6px;color:#fff;background:#173c8d">${icon("check")}</span>` : ""}</button>`).join("")}</div><p class="field-help">已选 ${selected.length} 个素材</p><div class="button-row"><button class="secondary-btn" data-action="sheet-close">取消</button><button class="primary-btn" data-action="asset-confirm">确认使用</button></div>`;
  }
  if (kind === "qr-select") {
    return `<div class="sheet-handle"></div><h3>选择我的二维码</h3><button class="sheet-option selected" data-action="qr-pick"><span class="qr-preview">${Array.from({ length: 9 }).map(() => "<i></i>").join("")}</span><span><strong>活动报名二维码</strong><small>使用已保存的二维码</small></span>${icon("check")}</button><button class="text-action" data-action="sheet-close">取消</button>`;
  }
  if (kind === "qr") {
    return `<div class="sheet-handle"></div><h3>添加二维码</h3><div class="sheet-options"><button class="sheet-option" data-action="qr-my" data-kind="qr">${icon("layers")}<span><strong>从我的素材选择</strong><small>选择已保存的二维码</small></span>${icon("chevron")}</button><button class="sheet-option" data-action="qr-local" data-kind="qr">${icon("upload")}<span><strong>从手机照片选择</strong><small>支持一个二维码图片</small></span>${icon("chevron")}</button></div><button class="text-action" data-action="sheet-close">取消</button>`;
  }
  if (kind === "qr-preview") {
    return `<div class="sheet-handle"></div><h3>二维码预览</h3><div class="qr-preview-large">${Array.from({ length: 9 }).map(() => "<i></i>").join("")}</div><button class="text-action" data-action="sheet-close">关闭</button>`;
  }
  if (kind === "preview") {
    const item = templates.find((template) => template.id === payload.id) || templates[0];
    return `<div class="sheet-handle"></div><h3>${esc(item.name)}</h3><div class="sheet-preview"><span class="poster"><img src="${item.image}" alt="${esc(item.name)}"><span class="poster-copy"><small>${esc(item.type)}</small><strong>${esc(item.name)}</strong><span>${esc(item.scene)}</span></span></span></div><div class="button-row template-preview-actions"><button class="secondary-btn" data-action="sheet-close">关闭</button><button class="primary-btn" data-action="template-use-preview" data-template="${item.id}">使用这个模板</button></div>`;
  }
  if (kind === "asset-preview") {
    return `<div class="sheet-handle"></div><h3>素材预览</h3><div class="sheet-preview"><span class="poster"><img src="${payload.image}" alt="素材预览"></span></div><button class="text-action" data-action="sheet-close">关闭</button>`;
  }
  return `<div class="sheet-handle"></div><h3>原型演示</h3><p class="section-note">此操作在当前原型中以反馈方式展示。</p><button class="text-action" data-action="sheet-close">关闭</button>`;
}

function startGeneration(source, kindOverride) {
  const page = document.body.dataset.page;
  if (["imageCreate", "videoCreate", "templateCreate"].includes(source) && !state.idea.trim()) {
    showToast("请先填写本次创作想法");
    return;
  }
  if (source === "marketingCreate" && !state.marketingIdea.trim()) {
    showToast("请先填写本次内容想法");
    return;
  }
  if (source === "edit" && !state.editIdea.trim()) {
    showToast("请先填写修改要求");
    return;
  }
  const inheritedMarketing = source === "edit" && isMarketingGeneration(state.generation);
  const marketing = source === "marketingCreate" || inheritedMarketing;
  const generationSource = marketing ? "marketingCreate" : source;
  const kind = kindOverride || (source === "videoCreate" || (marketing && state.marketingType === "video") || (source === "edit" && new URLSearchParams(location.search).get("kind") === "video") ? "video" : "image");
  const titles = { image: source === "templateCreate" ? selectedTemplate().name : marketing ? "暑期亲子入住推广" : "夏日亲子入住推广", video: marketing ? "暑期亲子入住短片" : "暑期亲子入住短片" };
  state.generation = { status: "running", source: generationSource, marketing, kind, attempts: 0, title: titles[kind], createdFrom: page, hotelContext: currentHotel() ? { ...currentHotel() } : null, musicStyle: kind === "video" ? state.selectedMusicStyle : "", idea: source === "templateCreate" ? selectedTemplate().name : marketing ? state.marketingIdea : source === "edit" ? state.editIdea : state.idea, materialImages: source === "edit" ? [...state.editImages] : source === "marketingCreate" ? [...state.marketingImages] : [...state.selectedImages], completed: marketing ? marketingCompletedItems() : [] };
  write("yingdian_generation", state.generation);
  go("generation");
}

function handleAction(action, target) {
  const data = target.dataset;
  if (action === "platform-back") {
    if (history.length > 1) history.back();
    else showToast("返回酒店AI助手（原型演示）");
    return;
  }
  if (action === "back") { history.length > 1 ? history.back() : go("home"); return; }
  if (action === "hotel-use") { state.hotelUsage[data.key] = !state.hotelUsage[data.key]; renderApp(); return; }
  if (action === "voice-input") {
    const voiceTarget = data.field || "image-idea";
    if (state.voiceListening) {
      clearTimeout(state.voiceTimer);
      state.voiceTimer = null;
      state.voiceListening = false;
      state.voiceTarget = "";
      renderApp();
      showToast("已停止语音输入");
      return;
    }
    state.voiceListening = true;
    state.voiceTarget = voiceTarget;
    renderApp();
    state.voiceTimer = setTimeout(() => {
      state.voiceTimer = null;
      state.voiceListening = false;
      state.voiceTarget = "";
      if (voiceTarget === "marketing-idea") {
        if (!state.marketingIdea.trim()) state.marketingIdea = "围绕暑期亲子入住推广，突出亲子房、早餐和儿童用品。";
        else state.marketingIdea = `${state.marketingIdea}，语气轻松自然。`;
      } else if (voiceTarget === "edit-idea") {
        if (!state.editIdea.trim()) state.editIdea = "让画面更明亮，突出亲子入住的轻松氛围。";
        else state.editIdea = `${state.editIdea}，语气更自然。`;
      } else {
        if (!state.idea.trim()) state.idea = "围绕暑期亲子入住推广，突出亲子房、早餐和轻松的度假氛围。";
        else state.idea = `${state.idea}，语气轻松自然。`;
      }
      renderApp();
      showToast("已识别语音内容（原型演示）");
    }, 1400);
    return;
  }
  if (action === "display-content") { openSheet("display-content", { media: data.media, showQr: data.qr === "1" }); return; }
  if (action === "display-content-done") { closeSheet(); renderApp(); return; }
  if (action === "display-hotel-use") {
    state.hotelUsage[data.key] = !state.hotelUsage[data.key];
    openSheet("display-content", { media: data.media, showQr: data.qr === "1" });
    return;
  }
  if (action === "display-qr-add") { openSheet("asset-channel", { kind: "qr", returnContent: { media: data.media, showQr: true } }); return; }
  if (action === "display-qr-use") {
    state.qrUsage = !state.qrUsage;
    openSheet("display-content", { media: data.media, showQr: true });
    return;
  }
  if (action === "display-qr-remove") {
    state.selectedQr = false;
    state.qrUsage = false;
    openSheet("display-content", { media: data.media, showQr: true });
    return;
  }
  if (action === "ratio") { if (data.kind === "video") state.selectedRatioVideo = data.ratio; else state.selectedRatioImage = data.ratio; renderApp(); return; }
  if (action === "music-style") { state.selectedMusicStyle = data.style; sessionStorage.setItem("yingdian_music_style", data.style); renderApp(); return; }
  if (action === "asset-sheet") { openSheet("asset-channel", { kind: data.kind, list: data.list }); return; }
  if (action === "asset-my") { openSheet("asset-select", { kind: data.kind, list: data.list }); return; }
  if (action === "qr-my") { openSheet("qr-select", { returnContent: state.sheet?.payload?.returnContent }); return; }
  if (action === "asset-local") { closeSheet(); showToast("已打开手机照片选择器（原型演示）"); return; }
  if (action === "asset-pick") { const image = data.image; const listKey = ["marketingImages", "editImages"].includes(data.list) ? data.list : "selectedImages"; const list = state[listKey]; state[listKey] = list.includes(image) ? list.filter((item) => item !== image) : [...list, image]; openSheet("asset-select", { kind: state.sheet?.payload?.kind, list: listKey }); return; }
  if (action === "asset-confirm") { closeSheet(); renderApp(); showToast("素材已更新"); return; }
  if (["asset-remove", "marketing-asset-remove", "edit-asset-remove"].includes(action)) { const list = action === "marketing-asset-remove" ? state.marketingImages : action === "edit-asset-remove" ? state.editImages : state.selectedImages; list.splice(Number(data.index), 1); renderApp(); return; }
  if (action === "qr-sheet") { openSheet("asset-channel", { kind: "qr" }); return; }
  if (action === "qr-pick") {
    const returnContent = state.sheet?.payload?.returnContent;
    state.selectedQr = true;
    state.qrUsage = true;
    if (returnContent) openSheet("display-content", returnContent);
    else { closeSheet(); renderApp(); }
    return;
  }
  if (action === "qr-local") {
    const returnContent = state.sheet?.payload?.returnContent;
    state.selectedQr = true;
    state.qrUsage = true;
    if (returnContent) openSheet("display-content", returnContent);
    else { closeSheet(); renderApp(); }
    showToast("已从手机照片添加二维码（原型演示）");
    return;
  }
  if (action === "qr-preview") { openSheet("qr-preview"); return; }
  if (action === "qr-remove") { state.selectedQr = false; state.qrUsage = false; renderApp(); showToast("已移除二维码"); return; }
  if (action === "sheet-close") { closeSheet(); return; }
  if (action === "template-open") { state.selectedTemplateId = data.template; sessionStorage.setItem("yingdian_template", data.template); go("templateCreate"); return; }
  if (action === "template-preview") { openSheet("preview", { id: data.template }); return; }
  if (action === "template-use-preview") { state.selectedTemplateId = data.template; sessionStorage.setItem("yingdian_template", data.template); closeSheet(); go("templateCreate"); return; }
  if (action === "home-type") { state.homeType = data.type; renderApp(); return; }
  if (action === "template-filter") { go("templates", { type: data.type }); return; }
  if (action === "marketing-open") { go("marketingPlan"); return; }
  if (action === "marketing-topic") { go("marketingPlan", { topic: data.topic }); return; }
  if (action === "plan-toggle") { showToast("完整策划详情已展开（原型演示）"); return; }
  if (action === "marketing-adjust-open") {
    state.marketingAdjust.open = true;
    state.marketingAdjust.status = state.marketingAdjust.pending ? "result" : "input";
    renderApp();
    return;
  }
  if (action === "marketing-adjust-close") {
    if (state.marketingAdjust.status === "loading") return;
    state.marketingAdjust.open = false;
    renderApp();
    return;
  }
  if (action === "marketing-adjust-prompt") {
    state.marketingAdjust.draft = data.prompt || "";
    state.marketingAdjust.open = true;
    state.marketingAdjust.status = "input";
    renderApp();
    return;
  }
  if (action === "marketing-adjust-submit") {
    if (!state.marketingAdjust.draft.trim()) { showToast("先补充一点情况，再让我想想"); return; }
    if (state.marketingAdjust.timer) clearTimeout(state.marketingAdjust.timer);
    state.marketingAdjust.open = true;
    state.marketingAdjust.status = "loading";
    renderApp();
    state.marketingAdjust.timer = setTimeout(() => {
      state.marketingAdjust.timer = null;
      if (document.body.dataset.page !== "marketingPlan") return;
      state.marketingAdjust.status = "result";
      state.marketingAdjust.pending = true;
      state.marketingAdjust.open = true;
      renderApp();
    }, 2200);
    return;
  }
  if (action === "marketing-adjust-cancel") {
    if (state.marketingAdjust.timer) clearTimeout(state.marketingAdjust.timer);
    state.marketingAdjust.timer = null;
    state.marketingAdjust.status = "input";
    state.marketingAdjust.pending = false;
    state.marketingAdjust.open = true;
    renderApp();
    showToast("已取消调整，原策划不变");
    return;
  }
  if (action === "marketing-adjust-continue") {
    state.marketingAdjust.pending = false;
    state.marketingAdjust.status = "input";
    state.marketingAdjust.open = true;
    renderApp();
    return;
  }
  if (action === "marketing-adjust-retry") {
    state.marketingAdjust.open = true;
    state.marketingAdjust.status = "loading";
    renderApp();
    state.marketingAdjust.timer = setTimeout(() => {
      state.marketingAdjust.timer = null;
      state.marketingAdjust.status = "result";
      state.marketingAdjust.pending = true;
      state.marketingAdjust.open = true;
      renderApp();
    }, 2200);
    return;
  }
  if (action === "marketing-adjust-edit") {
    state.marketingAdjust.status = "input";
    state.marketingAdjust.open = true;
    renderApp();
    return;
  }
  if (action === "marketing-adjust-accept") {
    sessionStorage.setItem("yingdian_marketing_adjusted", "1");
    sessionStorage.setItem("yingdian_marketing_adjustment", "入住酒店＋周边亲子体验");
    state.marketingAdjust.open = false;
    state.marketingAdjust.status = "result";
    go("marketingCreate");
    return;
  }
  if (action === "marketing-type") { state.marketingType = data.type; sessionStorage.setItem("yingdian_marketing_type", data.type); renderApp(); return; }
  if (action === "start-generation") { startGeneration(data.source || document.body.dataset.page, data.kind); return; }
  if (action === "generation-cancel") { const sourcePage = state.generation?.createdFrom || "home"; if (state.generation?.timer) clearTimeout(state.generation.timer); state.generation = null; localStorage.removeItem("yingdian_generation"); go(sourcePage); return; }
  if (action === "simulate-fail") { if (state.generation?.timer) clearTimeout(state.generation.timer); state.generation.timer = null; state.generation.status = "failed"; state.generation.attempts = Math.max(1, state.generation.attempts + 1); write("yingdian_generation", state.generation); renderApp(); return; }
  if (action === "generation-retry") { state.generation.status = "running"; state.generation.attempts += 1; write("yingdian_generation", state.generation); renderApp(); return; }
  if (action === "generation-edit") { go("edit", { kind: state.generation.kind }); return; }
  if (action === "generation-home") { state.generation = null; localStorage.removeItem("yingdian_generation"); go("home"); return; }
  if (action === "play") { showToast("视频播放/暂停（原型演示）"); return; }
  if (action === "copy") { navigator.clipboard?.writeText("这个夏天，和孩子住得刚刚好。")?.catch(() => {}); showToast("文案已复制"); return; }
  if (action === "download") { showToast("下载已开始（原型演示）"); return; }
  if (action === "share") { showToast("分享面板已打开（原型演示）"); return; }
  if (action === "marketing-continue") {
    state.marketingType = data.kind;
    sessionStorage.setItem("yingdian_marketing_type", data.kind);
    go("marketingCreate");
    return;
  }
  if (action === "marketing-content-open") {
    go("result", { kind: data.kind || "image", source: "marketingActivity" });
    return;
  }
  if (action === "works-refresh") { showToast("作品列表已刷新"); return; }
  if (action === "works-filter") { state.worksFilter = data.filter || "image"; renderApp(); return; }
  if (action === "work-open") { const work = state.works.find((item) => item.id === data.id); if (isMarketingWork(work)) { go("marketingActivity"); return; } go("result", { kind: work?.type === "15秒视频" ? "video" : "image" }); return; }
  if (["hotel-edit", "hotel-logo", "hotel-logo-remove", "hotel-form-cancel", "hotel-form-save"].includes(action)) {
    showToast("酒店信息由酒店AI助手统一管理");
    return;
  }
  if (action === "asset-filter") { go("assets", { type: data.type }); return; }
  if (action === "asset-upload") { showToast(`已打开手机照片选择器（${data.kind === "qr" ? "二维码" : "图片"}，原型演示）`); return; }
  if (action === "asset-preview") { openSheet("asset-preview", { image: data.image }); return; }
  if (action === "toast") { showToast(data.message || "操作已完成"); return; }
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-nav], [data-action]");
  if (!target) {
    if (event.target.id === "sheet-backdrop") {
      const refreshPage = state.sheet?.kind === "display-content";
      closeSheet();
      if (refreshPage) renderApp();
    }
    return;
  }
  if (target.dataset.nav) {
    const page = target.dataset.nav;
    const params = target.dataset.kind ? { kind: target.dataset.kind } : {};
    if (page === "result" && !state.generation?.status) go("works");
    else go(page, params);
    return;
  }
  handleAction(target.dataset.action, target);
});

window.addEventListener("storage", () => {
  state.hotelContext = readPlatformHotelContext();
  renderApp();
});

renderApp();
