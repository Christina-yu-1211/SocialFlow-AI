import React, { useState, useRef, useEffect } from 'react';
import {
  Layout, Type, Image as ImageIcon, Settings,
  Download, Wand2, ChevronLeft, ChevronRight,
  Palette, Upload, Plus, Trash2, Maximize,
  Undo, Redo, RotateCcw,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  AtSign, ZoomIn, ZoomOut, Minus, Loader2, MousePointer2, Type as TypeIcon,
  Heading, FileText, StickyNote, Flag, ListStart, RefreshCw, Dices, Shuffle,
  Sparkles, Coffee, Zap, Feather, BookOpen, Camera, Gamepad2, Grid, Layers, Frame, Square, Crop, Monitor,
  Eye, Edit3, Share2, X, CheckCircle2, FileArchive
} from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { DesignConfig, SlideContent, AspectRatio, TextStyle, FontFamily, FrameStyle } from './types';
import { DEFAULT_DESIGN, INITIAL_SLIDES } from './constants';
import SlideRenderer from './components/SlideRenderer';
import { generateSocialContent } from './services/geminiService';

const STORAGE_KEY = 'socialflow_state_v5';

// --- 1. Refined Font Collection ---
const FONTS_GROUPED = [
  { label: '標準黑體 (現代/乾淨)', value: 'Noto Sans TC' },
  { label: '標準明體 (優雅/文學)', value: 'Noto Serif TC' },
  { label: '特粗黑體 (大標題/限一般)', value: 'Dela Gothic One' },
  { label: '美式海報 (Anton Impact)', value: 'Anton' },
  { label: '古風明體 (質感/沈穩)', value: 'Shippori Mincho' },
  { label: '日系手寫 (溫暖/親切)', value: 'Klee One' },
  { label: '圓體 (柔和)', value: 'M PLUS Rounded 1c' },
  { label: '立體特效', value: 'Rampart One' },
  { label: '點陣復古', value: 'DotGothic16' },
  { label: 'English - Modern', value: 'Montserrat' },
  { label: 'English - Elegant', value: 'Playfair Display' },
];

// --- 2. Enhanced Presets with Specific Palettes ---
// Each preset now carries a list of "curated palettes" that work well with it.
const PRESET_STYLES = [
  {
    id: 'power',
    name: '核心信息',
    icon: Zap,
    desc: '瑞士極簡風，清爽有力，強調重點',
    palettes: [
      { bg: '#FFFFFF', title: '#000000', body: '#171717', label: '經典黑白' },
      { bg: '#FDE047', title: '#000000', body: '#171717', label: '警示黃' },
      { bg: '#000000', title: '#22D3EE', body: '#FFFFFF', label: '電光藍' },
      { bg: '#000000', title: '#F472B6', body: '#FFFFFF', label: '螢光粉' },
      { bg: '#EF4444', title: '#FFFFFF', body: '#FEF2F2', label: 'Supreme紅' },
      { bg: '#2563EB', title: '#FFFFFF', body: '#EFF6FF', label: '寶藍' },
      { bg: '#111827', title: '#34D399', body: '#ECFDF5', label: '駭客綠' },
      { bg: '#4C1D95', title: '#A78BFA', body: '#F5F3FF', label: '迷幻紫' },
    ],
    config: {
      bgType: 'color',
      bgColor: '#FFFFFF',
      overlayType: 'none',
      titleStyle: { fontFamily: 'Anton', color: '#000000', textAlign: 'left', fontWeight: '400', hasBackground: false, enableShadow: false, lineHeight: 1.1 },
      subtitleStyle: { fontFamily: 'Anton', color: '#000000', textAlign: 'left', fontWeight: '400', hasBackground: false, enableShadow: false },
      bodyStyle: { fontFamily: 'Noto Sans TC', color: '#171717', fontWeight: '500', textAlign: 'left', hasBackground: false, enableShadow: false },
      noteStyle: { fontFamily: 'Noto Sans TC', color: '#DC2626', textAlign: 'left', hasBackground: false },
      endTitleStyle: { fontFamily: 'Anton', color: '#000000', textAlign: 'left' },
      endBodyStyle: { fontFamily: 'Noto Sans TC', color: '#171717', textAlign: 'left' }
    }
  },
  {
    id: 'cinematic',
    name: '電影氛圍',
    icon: Camera,
    desc: '黑膜+照片底，跳色標題，探索頁高觸及',
    palettes: [
      { bg: '#1c1917', title: '#FDE047', body: '#FFFFFF', label: '鵝黃 (熱門)' },
      { bg: '#1c1917', title: '#22D3EE', body: '#FFFFFF', label: '電光藍' },
      { bg: '#1c1917', title: '#F472B6', body: '#FFFFFF', label: '霓虹粉' },
      { bg: '#1c1917', title: '#FFFFFF', body: '#E5E7EB', label: '經典全白' },
      { bg: '#1c1917', title: '#A3E635', body: '#FFFFFF', label: '酸性綠' },
      { bg: '#1c1917', title: '#FB923C', body: '#FFFFFF', label: '愛馬仕橘' },
      { bg: '#1c1917', title: '#E879F9', body: '#FFFFFF', label: '紫羅蘭' },
      { bg: '#1c1917', title: '#67E8F9', body: '#FFFFFF', label: '冰河藍' },
    ],
    config: {
      bgType: 'image',
      bgImage: '',
      bgColor: '#1c1917',
      overlayType: 'black',
      overlayOpacity: 0.6,
      bgBlur: 0,
      titleStyle: { fontFamily: 'Noto Serif TC', color: '#FDE047', textAlign: 'center', fontWeight: '700', hasBackground: false, enableShadow: true },
      subtitleStyle: { fontFamily: 'Noto Serif TC', color: '#FDE047', textAlign: 'center', fontWeight: '500', hasBackground: false, enableShadow: true },
      bodyStyle: { fontFamily: 'Noto Serif TC', color: '#FFFFFF', fontWeight: '400', textAlign: 'center', hasBackground: false, enableShadow: true },
      noteStyle: { fontFamily: 'Montserrat', color: '#D1D5DB', textAlign: 'center', hasBackground: false, enableShadow: true },
      endTitleStyle: { fontFamily: 'Noto Serif TC', color: '#FDE047', textAlign: 'center' },
      endBodyStyle: { fontFamily: 'Noto Serif TC', color: '#FFFFFF', textAlign: 'center' }
    }
  },
  {
    id: 'devotional',
    name: '晨更默想',
    icon: Coffee,
    desc: '優雅明體、大地色系，適合靈修與反思',
    palettes: [
      { bg: '#F5F5F0', title: '#4A4A40', body: '#5C5C50', label: '米灰/深灰' },
      { bg: '#E7E5E4', title: '#57534E', body: '#78716C', label: '石灰/暖灰' },
      { bg: '#FFF7ED', title: '#9A3412', body: '#C2410C', label: '暖橘/白' },
      { bg: '#F0FDF4', title: '#166534', body: '#15803D', label: '薄荷/深綠' },
      { bg: '#FAFAF9', title: '#44403C', body: '#78716C', label: '極簡石' },
      { bg: '#ECFEFF', title: '#155E75', body: '#0E7490', label: '晨露' },
      { bg: '#FFF1F2', title: '#9F1239', body: '#BE123C', label: '玫瑰' },
    ],
    config: {
      bgType: 'color',
      bgColor: '#F5F5F0',
      overlayType: 'none',
      titleStyle: { fontFamily: 'Noto Serif TC', color: '#4A4A40', fontWeight: '900', textAlign: 'center', hasBackground: false, enableShadow: false },
      subtitleStyle: { fontFamily: 'Noto Serif TC', color: '#4A4A40', fontWeight: '700', textAlign: 'center', hasBackground: false, enableShadow: false },
      bodyStyle: { fontFamily: 'Noto Serif TC', color: '#5C5C50', fontWeight: '500', textAlign: 'center', hasBackground: false, enableShadow: false },
      noteStyle: { fontFamily: 'Noto Sans TC', color: '#A3A390', textAlign: 'center', hasBackground: false },
      endTitleStyle: { fontFamily: 'Noto Serif TC', color: '#4A4A40', textAlign: 'center' },
      endBodyStyle: { fontFamily: 'Noto Serif TC', color: '#5C5C50', textAlign: 'center' }
    }
  },
  {
    id: 'life',
    name: '生活筆記',
    icon: Feather,
    desc: '手寫字體、溫暖米黃，適合牧者心聲',
    palettes: [
      { bg: '#FDF6E3', title: '#5D4037', body: '#795548', label: '米黃/咖' },
      { bg: '#FEFCE8', title: '#854D0E', body: '#A16207', label: '淡黃/金' },
      { bg: '#F0F9FF', title: '#0369A1', body: '#075985', label: '信紙藍' },
      { bg: '#FFFBEB', title: '#B45309', body: '#D97706', label: '蜂蜜' },
      { bg: '#F5F3FF', title: '#6D28D9', body: '#7C3AED', label: '薰衣草' },
      { bg: '#FFF7ED', title: '#C2410C', body: '#EA580C', label: '暖陽' },
    ],
    config: {
      bgType: 'color',
      bgColor: '#FDF6E3',
      overlayType: 'none',
      titleStyle: { fontFamily: 'Klee One', color: '#5D4037', fontWeight: '600', textAlign: 'center', hasBackground: false, enableShadow: false },
      subtitleStyle: { fontFamily: 'Klee One', color: '#5D4037', fontWeight: '600', textAlign: 'center', hasBackground: false, enableShadow: false },
      bodyStyle: { fontFamily: 'Klee One', color: '#795548', fontWeight: '400', textAlign: 'center', hasBackground: false, enableShadow: false },
      noteStyle: { fontFamily: 'Klee One', color: '#A1887F', textAlign: 'center', hasBackground: false },
      endTitleStyle: { fontFamily: 'Klee One', color: '#5D4037', textAlign: 'center' },
      endBodyStyle: { fontFamily: 'Klee One', color: '#795548', textAlign: 'center' }
    }
  },
  {
    id: 'theology',
    name: '神學思考',
    icon: BookOpen,
    desc: '極簡黑體、深藍冷調，適合知識內容',
    palettes: [
      { bg: '#1E293B', title: '#FFFFFF', body: '#E2E8F0', label: '深藍/白' },
      { bg: '#0F172A', title: '#38BDF8', body: '#E0F2FE', label: '午夜/淺藍' },
      { bg: '#334155', title: '#F1F5F9', body: '#CBD5E1', label: '石墨/灰' },
      { bg: '#14532D', title: '#FFFFFF', body: '#DCFCE7', label: '學院綠' },
      { bg: '#451A03', title: '#FEF3C7', body: '#FDE68A', label: '書卷咖' },
      { bg: '#312E81', title: '#E0E7FF', body: '#C7D2FE', label: '靛藍' },
    ],
    config: {
      bgType: 'color',
      bgColor: '#1E293B',
      overlayType: 'none',
      titleStyle: { fontFamily: 'Noto Sans TC', color: '#FFFFFF', fontWeight: '700', textAlign: 'left', hasBackground: false, enableShadow: false },
      subtitleStyle: { fontFamily: 'Noto Sans TC', color: '#94A3B8', fontWeight: '500', textAlign: 'left', hasBackground: false, enableShadow: false },
      bodyStyle: { fontFamily: 'Noto Sans TC', color: '#E2E8F0', fontWeight: '400', textAlign: 'left', hasBackground: false, enableShadow: false },
      noteStyle: { fontFamily: 'Montserrat', color: '#64748B', textAlign: 'left', hasBackground: false },
      endTitleStyle: { fontFamily: 'Noto Sans TC', color: '#FFFFFF', textAlign: 'left' },
      endBodyStyle: { fontFamily: 'Noto Sans TC', color: '#CBD5E1', textAlign: 'left' }
    }
  },
  {
    id: 'y2k',
    name: 'Y2K 千禧復古',
    icon: Gamepad2, // Requires importing Gamepad2 or Dices
    desc: '大膽配色、粗框線條、像素風，適合年輕潮流',
    palettes: [
      { bg: '#FF00FF', title: '#FFFF00', body: '#FFFFFF', label: '桃紅/黃' },
      { bg: '#000000', title: '#00FF00', body: '#FFFFFF', label: '駭客/綠' },
      { bg: '#FFFF00', title: '#0000FF', body: '#000000', label: '黃/藍' },
      { bg: '#E0E7FF', title: '#FF0000', body: '#0000FF', label: '白/紅藍' },
      { bg: '#4F46E5', title: '#A5B4FC', body: '#FFFFFF', label: '電子紫' },
      { bg: '#F472B6', title: '#881337', body: '#FFFFFF', label: '芭比粉' },
    ],
    config: {
      bgType: 'color',
      bgColor: '#FF00FF',
      overlayType: 'none',
      titleStyle: { fontFamily: 'Dela Gothic One', color: '#FFFF00', fontWeight: '400', textAlign: 'center', hasBackground: false, enableShadow: true, lineHeight: 1.1 },
      subtitleStyle: { fontFamily: 'Dela Gothic One', color: '#FFFF00', fontWeight: '400', textAlign: 'center', hasBackground: false, enableShadow: true },
      bodyStyle: { fontFamily: 'DotGothic16', color: '#FFFFFF', fontWeight: '400', textAlign: 'center', hasBackground: false, enableShadow: false },
      noteStyle: { fontFamily: 'DotGothic16', color: '#FFFFFF', textAlign: 'center', hasBackground: true, backgroundColor: '#000000' },
      endTitleStyle: { fontFamily: 'Dela Gothic One', color: '#FFFF00', textAlign: 'center' },
      endBodyStyle: { fontFamily: 'DotGothic16', color: '#FFFFFF', textAlign: 'center' }
    }
  }
];

const App: React.FC = () => {
  // --- Initialization ---
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    return { slides: INITIAL_SLIDES, config: DEFAULT_DESIGN };
  };

  const initialState = loadState();

  // --- State ---
  const [slides, setSlides] = useState<SlideContent[]>(initialState.slides);
  const [config, setConfig] = useState<DesignConfig>(initialState.config);
  const [activePresetId, setActivePresetId] = useState<string>('power');

  const [lastInteractedSlideId, setLastInteractedSlideId] = useState<string | null>(null);
  const [history, setHistory] = useState<{ slides: SlideContent[], config: DesignConfig }[]>([
    { slides: initialState.slides, config: initialState.config }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'text'>('content');
  const [previewScale, setPreviewScale] = useState(0.4);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const [promptText, setPromptText] = useState('');
  const [pageCount, setPageCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedImages, setExportedImages] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNavigatingHistory = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Effects ---

  // 1. Sanitize Config Effect: Force Dela Gothic One to 400 weight to prevent "Stuck" bold state
  useEffect(() => {
    let hasChanges = false;
    const newConfig = { ...config };

    (['titleStyle', 'subtitleStyle', 'bodyStyle', 'noteStyle', 'endTitleStyle', 'endBodyStyle'] as const).forEach(key => {
      // If font is Dela Gothic One, force weight to 400 (Regular)
      // This is necessary because Dela Gothic One is very thick and doesn't support bolding well,
      // and sometimes previous state sticks (e.g. switching from Noto Sans 900).
      if (newConfig[key].fontFamily === 'Dela Gothic One' && newConfig[key].fontWeight !== '400') {
        newConfig[key] = { ...newConfig[key], fontWeight: '400' };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setConfig(newConfig);
    }
  }, [config]);


  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) {
        // Mobile: Calculate exact scale to fit width with padding
        // Standard width is 1080px. We want some padding (e.g. 40px total).
        const availableWidth = w - 40;
        const mobileScale = availableWidth / 1080;
        // Clamp scale to reasonable bounds for mobile
        setPreviewScale(Math.min(0.45, Math.max(0.2, mobileScale)));
      } else {
        // Desktop: 60vw container logic
        const containerWidth = w * 0.6;
        setPreviewScale(Math.min(0.5, (containerWidth - 100) / 1080));
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const currentState = { slides, config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));

    if (isNavigatingHistory.current) {
      isNavigatingHistory.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setHistory(prev => {
        const currentHistory = prev.slice(0, historyIndex + 1);
        const lastState = currentHistory[currentHistory.length - 1];

        if (JSON.stringify(lastState) !== JSON.stringify(currentState)) {
          const newHistory = [...currentHistory, currentState];
          return newHistory;
        }
        return prev;
      });
    }, 500);

  }, [slides, config, historyIndex]);

  useEffect(() => {
    if (!isNavigatingHistory.current && history.length > 0) {
      setHistoryIndex(history.length - 1);
    }
  }, [history.length]);


  // --- Logic Handlers ---

  const handleUndo = () => {
    if (historyIndex > 0) {
      isNavigatingHistory.current = true;
      const prevIndex = historyIndex - 1;
      const prevState = history[prevIndex];
      setSlides(prevState.slides);
      setConfig(prevState.config);
      setHistoryIndex(prevIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isNavigatingHistory.current = true;
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      setSlides(nextState.slides);
      setConfig(nextState.config);
      setHistoryIndex(nextIndex);
    }
  };

  const handleReset = () => {
    if (window.confirm("確定要重置所有設定嗎？這將無法復原。")) {
      localStorage.removeItem(STORAGE_KEY);
      setSlides(INITIAL_SLIDES);
      setConfig(DEFAULT_DESIGN);
      setHistory([{ slides: INITIAL_SLIDES, config: DEFAULT_DESIGN }]);
      setHistoryIndex(0);
    }
  };

  const handleGenerate = async () => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const { slides: generatedSlides, themeSuggestion } = await generateSocialContent(promptText, pageCount);
      setSlides(generatedSlides);

      if (themeSuggestion) {
        // Find best match font from our grouped list or default to Noto Sans
        const matchedFont = FONTS_GROUPED.find(f => f.value === themeSuggestion.fontFamily)?.value || 'Noto Sans TC';

        setConfig(prev => ({
          ...prev,
          bgType: 'color',
          bgColor: themeSuggestion.bgColor,
          titleStyle: { ...prev.titleStyle, color: themeSuggestion.titleColor, fontFamily: matchedFont as FontFamily },
          subtitleStyle: { ...prev.subtitleStyle, color: themeSuggestion.titleColor, fontFamily: matchedFont as FontFamily },
          bodyStyle: { ...prev.bodyStyle, color: themeSuggestion.bodyColor, fontFamily: matchedFont as FontFamily },
          noteStyle: { ...prev.noteStyle, color: themeSuggestion.bodyColor, fontFamily: matchedFont as FontFamily },
          endTitleStyle: { ...prev.endTitleStyle, color: themeSuggestion.titleColor, fontFamily: matchedFont as FontFamily },
          endBodyStyle: { ...prev.endBodyStyle, color: themeSuggestion.bodyColor, fontFamily: matchedFont as FontFamily },
        }));
      }

      setActiveTab('content');
    } catch (err) {
      setErrorMsg("AI 產生失敗，請確認 API Key。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSlide = (id: string, field: keyof SlideContent, value: string) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleApplyPreset = (preset: typeof PRESET_STYLES[0]) => {
    setActivePresetId(preset.id);
    setConfig(prev => ({
      ...prev,
      ...preset.config,
      // CRITICAL: Force the background type from the preset. 
      // If the preset uses 'color', it MUST override 'image'.
      bgType: preset.config.bgType,

      // Preserve user specific settings like Watermark or Aspect Ratio
      aspectRatio: prev.aspectRatio,
      watermark: prev.watermark,
      globalNotePosition: prev.globalNotePosition,
      // Ensure types align for deep merge
      titleStyle: { ...prev.titleStyle, ...preset.config.titleStyle } as any,
      subtitleStyle: { ...prev.subtitleStyle, ...preset.config.subtitleStyle } as any,
      bodyStyle: { ...prev.bodyStyle, ...preset.config.bodyStyle } as any,
      noteStyle: { ...prev.noteStyle, ...preset.config.noteStyle } as any,
      endTitleStyle: { ...prev.endTitleStyle, ...preset.config.endTitleStyle } as any,
      endBodyStyle: { ...prev.endBodyStyle, ...preset.config.endBodyStyle } as any,
    }));
  };

  const handleApplyPalette = (palette: { bg: string, title: string, body: string }) => {
    setConfig(prev => ({
      ...prev,
      // CRITICAL: When clicking a palette color, Force bgType to 'color' 
      // so users don't get stuck with an image background hiding the color.
      bgType: 'color',
      bgColor: palette.bg,
      titleStyle: { ...prev.titleStyle, color: palette.title },
      subtitleStyle: { ...prev.subtitleStyle, color: palette.title },
      bodyStyle: { ...prev.bodyStyle, color: palette.body },
      noteStyle: { ...prev.noteStyle, color: palette.body },
      endTitleStyle: { ...prev.endTitleStyle, color: palette.title },
      endBodyStyle: { ...prev.endBodyStyle, color: palette.body },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setConfig(prev => ({
        ...prev,
        bgType: 'image',
        bgImage: url,
        overlayType: 'black',
        overlayOpacity: 0.6,
        titleStyle: { ...prev.titleStyle, color: '#FDE047' }, // Default yellow on image
        bodyStyle: { ...prev.bodyStyle, color: '#ffffff' }
      }));
    }
  };

  const updateTextStyle = (
    key: 'titleStyle' | 'subtitleStyle' | 'bodyStyle' | 'noteStyle' | 'endTitleStyle' | 'endBodyStyle',
    field: keyof TextStyle,
    value: any
  ) => {
    let newValue = value;
    let newWeight = undefined;

    // Fix: Force weight to 400 if using Dela Gothic One (Thick font) - But only set it once, allow changes
    if (field === 'fontFamily') {
      if (value === 'Dela Gothic One') {
        newWeight = '400';
      }
    }

    setConfig(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: newValue,
        ...(newWeight ? { fontWeight: newWeight } : {})
      }
    }));
  };

  const handleNoteDragEnd = (id: string, x: number, y: number) => {
    setLastInteractedSlideId(id);
    setSlides(prev => prev.map(s => s.id === id ? { ...s, notePosition: { x, y } } : s));
  };

  const syncNotePositionToAll = () => {
    let targetPos = config.globalNotePosition;
    if (lastInteractedSlideId) {
      const sourceSlide = slides.find(s => s.id === lastInteractedSlideId);
      if (sourceSlide && sourceSlide.notePosition) targetPos = sourceSlide.notePosition;
    } else if (slides[0].notePosition) {
      targetPos = slides[0].notePosition;
    }
    setConfig(prev => ({ ...prev, globalNotePosition: targetPos }));
    setSlides(prev => prev.map(s => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { notePosition, ...rest } = s;
      return rest;
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportedImages([]);
    setExportProgress(0);
    setShowExportModal(true);

    // Create a small delay to allow modal to render
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const images: string[] = [];
      for (let i = 0; i < slides.length; i++) {
        const element = document.getElementById(`export-slide-${slides[i].id}`);
        if (element) {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            logging: false,
          });
          const dataUrl = canvas.toDataURL('image/png');
          images.push(dataUrl);
          setExportProgress(Math.round(((i + 1) / slides.length) * 100));
        }
      }
      setExportedImages(images);
    } catch (e) {
      console.error("Export failed", e);
      alert("匯出失敗，請稍後再試。");
      setShowExportModal(false);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadAllAsZip = async () => {
    if (exportedImages.length === 0) return;
    const zip = new JSZip();

    exportedImages.forEach((dataUrl, index) => {
      const base64Data = dataUrl.split(',')[1];
      zip.file(`socialflow-slide-${index + 1}.png`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'socialflow-carousel.zip';
    link.click();
  };

  const handleShareImage = async (dataUrl: string, index: number) => {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `slide-${index + 1}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `SocialFlow Slide ${index + 1}`,
        });
      } else {
        // Fallback: Just trigger a single download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `slide-${index + 1}.png`;
        link.click();
      }
    } catch (err) {
      console.error('Sharing failed', err);
    }
  };

  // Helper for safe number input
  const safeParseInt = (val: string) => {
    if (val === '') return 0;
    const num = parseInt(val);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">

      {/* Header */}
      <header className="h-14 border-b border-slate-700 bg-slate-950 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <img src="/icons/icon-192x192.png" className="w-8 h-8 rounded-lg object-cover" alt="SocialFlow Logo" />
          <span className="font-bold text-lg tracking-tight hidden md:inline">SocialFlow AI</span>
          <span className="font-bold text-lg tracking-tight md:hidden">SocialFlow</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">

          {/* Mobile Preview Toggle */}
          <button
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-blue-400 rounded-lg border border-slate-700 font-bold text-xs active:bg-slate-700"
          >
            {showMobilePreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showMobilePreview ? '編輯' : '預覽'}</span>
          </button>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center bg-slate-800 rounded-md p-0.5 border border-slate-700 mr-2">
            <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-30"><Undo className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-slate-700 mx-0.5"></div>
            <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-30"><Redo className="w-4 h-4" /></button>
          </div>
          <button onClick={handleReset} className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded"><RotateCcw className="w-3.5 h-3.5" /><span>重置</span></button>

          <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden md:inline">{isExporting ? '匯出中...' : '匯出圖片'}</span>
            <span className="md:hidden">匯出</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Left Sidebar (Editor) */}
        {/* On mobile: Hidden if showMobilePreview is true. On desktop: Always visible (flex) */}
        <div className={`w-full md:w-[400px] lg:w-[450px] bg-slate-900 border-r border-slate-700 flex-col shrink-0 z-10 ${showMobilePreview ? 'hidden md:flex' : 'flex'}`}>

          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            {[
              { id: 'content', icon: Type, label: '內容 & AI' },
              { id: 'design', icon: Palette, label: '風格背景' },
              { id: 'text', icon: Settings, label: '文字細節' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 flex flex-col items-center gap-1 text-xs font-medium transition-colors border-b-2 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-slate-800/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">

            {/* CONTENT TAB */}
            {activeTab === 'content' && (
              <div className="space-y-8">
                {/* AI Section */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Wand2 className="w-4 h-4" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">AI 智慧小編</h3>
                  </div>

                  <textarea
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32 leading-relaxed"
                    placeholder="貼上你的講道筆記、靈修心得或文章內容..."
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                  />

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-600">
                      <span className="text-xs text-slate-400">頁數</span>
                      <input
                        type="number"
                        min="1" max="10"
                        value={pageCount}
                        onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
                        className="w-10 bg-transparent text-center font-bold text-sm outline-none"
                      />
                    </div>
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !promptText}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2 disabled:opacity-50 transition-all"
                    >
                      {isGenerating ? '正在思考架構...' : '一鍵生成圖文'}
                      {!isGenerating && <Wand2 className="w-4 h-4" />}
                    </button>
                  </div>
                  {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}
                </div>

                {/* Manual Edit Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">編輯內容</h3>
                  {slides.map((slide, idx) => (
                    <div key={slide.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3 space-y-3 group hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 group-hover:text-blue-400">
                          {slide.type === 'cover' ? '封面 (Hook)' : slide.type === 'end' ? '結尾 (CTA)' : `第 ${idx + 1} 頁`}
                        </span>
                        <button onClick={() => { const newSlides = [...slides]; newSlides.splice(idx, 1); setSlides(newSlides); }} className="text-slate-500 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm font-bold focus:border-blue-500 outline-none" value={slide.title} onChange={(e) => handleUpdateSlide(slide.id, 'title', e.target.value)} placeholder="標題" />
                      <textarea className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm h-20 resize-none focus:border-blue-500 outline-none" value={slide.body} onChange={(e) => handleUpdateSlide(slide.id, 'body', e.target.value)} placeholder="內文" />
                      <input className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-400 focus:border-blue-500 outline-none" value={slide.note} onChange={(e) => handleUpdateSlide(slide.id, 'note', e.target.value)} placeholder="備註 / 小字" />
                    </div>
                  ))}
                  <button onClick={() => setSlides([...slides, { id: Date.now().toString(), type: 'content', title: '新標題', body: '新內容', note: 'New' }])} className="w-full py-3 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-blue-400 hover:border-blue-500 transition-colors flex justify-center items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> 新增頁面
                  </button>
                </div>
              </div>
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (
              <div className="space-y-8">

                {/* 1. Dimensions */}
                <section className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase">尺寸比例</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['1:1', '4:5', '9:16'].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setConfig(prev => ({ ...prev, aspectRatio: ratio as AspectRatio }))}
                        className={`py-2 px-3 rounded-md text-sm font-medium border ${config.aspectRatio === ratio
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                          }`}
                      >
                        {ratio === '1:1' ? '正方形' : ratio === '4:5' ? 'IG貼文' : '限動'}
                      </button>
                    ))}
                  </div>
                </section>

                <hr className="border-slate-800" />

                {/* 2. Frames (Moved Up) */}
                <section className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Frame className="w-3 h-3" />
                    簡約框線 (Frames)
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { id: 'none', label: '無', icon: Square },
                      { id: 'simple', label: '極簡', icon: Square },
                      { id: 'bold', label: '粗框', icon: Square },
                      { id: 'corners', label: '對焦', icon: Crop },
                      { id: 'cinema', label: '電影', icon: Monitor },
                    ].map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => setConfig(prev => ({ ...prev, frameStyle: frame.id as FrameStyle }))}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${config.frameStyle === frame.id
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                          }`}
                        title={frame.label}
                      >
                        <frame.icon className={`w-4 h-4 mb-1 ${frame.id === 'bold' ? 'stroke-[3px]' : ''}`} />
                        <span className="text-[10px]">{frame.label}</span>
                      </button>
                    ))}
                  </div>

                  {config.frameStyle !== 'none' && (
                    <div className="flex items-center gap-2 mt-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
                      <input type="color" value={config.frameColor} onChange={(e) => setConfig(prev => ({ ...prev, frameColor: e.target.value }))} className="w-6 h-6 rounded bg-transparent border-none cursor-pointer" />
                      <span className="text-xs text-slate-400">框線顏色</span>
                    </div>
                  )}
                </section>

                <hr className="border-slate-800" />

                {/* 3. Global Footer Layout (Watermark & Note Position) - Moved here */}
                <section className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Layout className="w-3 h-3" />
                    頁面佈局 (Global Layout)
                  </h3>

                  {/* Watermark Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1"><AtSign className="w-3 h-3" /> 帳號 / 浮水印</label>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2">
                      <input className="bg-transparent w-full text-sm outline-none" placeholder="your.church.youth" value={config.watermark} onChange={(e) => setConfig(prev => ({ ...prev, watermark: e.target.value }))} />
                    </div>
                  </div>

                  {/* Note Position Button */}
                  <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <span className="text-xs text-slate-400 flex items-center gap-2"><MousePointer2 className="w-3 h-3" /> 備註小字位置</span>
                    <button onClick={syncNotePositionToAll} className="text-[10px] bg-slate-700 hover:bg-blue-600 px-3 py-1.5 rounded transition-colors text-white">套用到所有頁面</button>
                  </div>
                </section>

                <hr className="border-slate-800" />

                {/* 4. Preset Styles (Curated Vibes) */}
                <section className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    精選牧養風格 (Curated Vibes)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => handleApplyPreset(style)}
                        className={`flex flex-col items-start p-3 border rounded-lg group transition-all text-left ${activePresetId === style.id
                          ? 'bg-blue-900/20 border-blue-500'
                          : 'bg-slate-800 hover:bg-slate-750 border-slate-700 hover:border-blue-500'
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1.5 rounded-md transition-colors ${activePresetId === style.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                            }`}>
                            <style.icon className="w-4 h-4" />
                          </div>
                          <span className={`text-sm font-bold ${activePresetId === style.id ? 'text-blue-200' : 'text-slate-200'
                            }`}>{style.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 leading-tight">{style.desc}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* 5. Style-Specific Palette Picker (Scrollable) */}
                {activePresetId && (
                  <section className="space-y-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                    <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                      <Palette className="w-3 h-3" />
                      {PRESET_STYLES.find(p => p.id === activePresetId)?.name} 專屬配色
                    </h3>
                    <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
                      {PRESET_STYLES.find(p => p.id === activePresetId)?.palettes?.map((palette, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleApplyPalette(palette)}
                          className="flex flex-col items-center gap-2 group min-w-[60px] snap-center"
                          title={palette.label}
                        >
                          <div className="w-12 h-12 rounded-full border-2 border-slate-600 overflow-hidden relative shadow-md group-hover:scale-110 group-hover:border-blue-400 transition-all">
                            <div className="absolute inset-0" style={{ backgroundColor: palette.bg }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-1/2 h-1/2 rounded-full shadow-sm" style={{ backgroundColor: palette.title }} />
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center group-hover:text-white">{palette.label}</span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                <hr className="border-slate-800" />

                {/* 6. Background */}
                <section className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase">背景設定</h3>
                  <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button onClick={() => setConfig(prev => ({ ...prev, bgType: 'color' }))} className={`flex-1 py-1.5 text-xs rounded-md ${config.bgType === 'color' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>純色</button>
                    <button onClick={() => setConfig(prev => ({ ...prev, bgType: 'image', overlayType: prev.overlayType === 'none' ? 'black' : prev.overlayType }))} className={`flex-1 py-1.5 text-xs rounded-md ${config.bgType === 'image' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>圖片</button>
                  </div>

                  {config.bgType === 'color' ? (
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <input type="color" value={config.bgColor} onChange={(e) => setConfig(prev => ({ ...prev, bgColor: e.target.value }))} className="w-10 h-10 rounded cursor-pointer bg-transparent border-none" />
                        <span className="text-sm text-slate-400 font-mono">{config.bgColor}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 4b. Upload */}
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-750 relative overflow-hidden group">
                        {config.bgImage && <img src={config.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity" />}
                        <div className="relative z-10 flex flex-col items-center justify-center pt-2">
                          <Upload className="w-6 h-6 mb-1 text-slate-400" />
                          <p className="text-xs text-slate-500">上傳背景圖片</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>

                      {/* 4c. Controls */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <label className="text-xs text-slate-500">遮罩濃度 (Overlay)</label>
                            <span className="text-xs text-slate-400 font-mono">{Math.round((config.overlayOpacity || 0) * 100)}%</span>
                          </div>
                          <input type="range" min="0" max="1" step="0.05" value={isNaN(config.overlayOpacity) ? 0 : config.overlayOpacity} onChange={(e) => setConfig(prev => ({ ...prev, overlayOpacity: parseFloat(e.target.value) || 0, overlayType: prev.overlayType === 'none' ? 'black' : prev.overlayType }))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <label className="text-xs text-slate-500">背景模糊 (Blur)</label>
                            <span className="text-xs text-slate-400 font-mono">{config.bgBlur || 0}px</span>
                          </div>
                          <input type="range" min="0" max="20" step="1" value={isNaN(config.bgBlur) ? 0 : config.bgBlur} onChange={(e) => setConfig(prev => ({ ...prev, bgBlur: parseInt(e.target.value) || 0 }))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      </div>

                    </div>
                  )}
                </section>

                {/* Visual Elements Toggle */}
                <section className="space-y-3 border-t border-slate-800 pt-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={config.showProgressBar} onChange={(e) => setConfig(prev => ({ ...prev, showProgressBar: e.target.checked }))} className="w-4 h-4 rounded border-slate-700 bg-slate-800" />
                    <span className="text-sm text-slate-400">顯示閱讀進度條 (Progress Bar)</span>
                  </div>
                </section>
              </div>
            )}

            {/* TEXT TAB */}
            {activeTab === 'text' && (
              <div className="space-y-8">

                {/* NOTE: Watermark & Note Position Moved to Design Tab */}

                {/* Dynamic Text Sections */}
                {[
                  { key: 'titleStyle', label: '封面大標題 (H1)', icon: Heading },
                  { key: 'subtitleStyle', label: '內頁副標題 (H2)', icon: TypeIcon },
                  { key: 'bodyStyle', label: '內文 (P)', icon: FileText },
                  { key: 'endTitleStyle', label: '結尾頁標題 (End Title)', icon: Flag }, // NEW
                  { key: 'endBodyStyle', label: '結尾頁內文 (End Body)', icon: ListStart }, // NEW
                  { key: 'noteStyle', label: '備註小字', icon: StickyNote },
                ].map((section) => {
                  const styleKey = section.key as 'titleStyle' | 'subtitleStyle' | 'bodyStyle' | 'noteStyle' | 'endTitleStyle' | 'endBodyStyle';
                  const style = config[styleKey];

                  return (
                    <section key={section.key} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-700/50 text-blue-300">
                        <section.icon className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-wider">{section.label}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase font-bold">字級</label>
                          <input type="number" value={style.fontSize} onChange={(e) => updateTextStyle(styleKey, 'fontSize', safeParseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 uppercase font-bold">粗細</label>
                          <select
                            value={style.fontWeight}
                            onChange={(e) => updateTextStyle(styleKey, 'fontWeight', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm"
                          >
                            <option value="400">一般 (Regular)</option>
                            <option value="500">中黑 (Medium)</option>
                            <option value="700">粗體 (Bold)</option>
                            <option value="900">特粗 (Black)</option>
                          </select>
                        </div>
                      </div>

                      {/* ADDED LINE HEIGHT CONTROL HERE */}
                      <div className="space-y-1 mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] text-slate-500 uppercase font-bold">行距 (Line Height)</label>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">{style.lineHeight || 1.2}</span>
                        </div>
                        <input
                          type="range"
                          min="0.8"
                          max="2.5"
                          step="0.1"
                          value={style.lineHeight || 1.2}
                          onChange={(e) => updateTextStyle(styleKey, 'lineHeight', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      {/* Font Family Selector (Updated Grouping) */}
                      <div className="space-y-1 mt-3">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">字體選擇</label>
                        <select
                          value={style.fontFamily}
                          onChange={(e) => updateTextStyle(styleKey, 'fontFamily', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm"
                        >
                          {FONTS_GROUPED.map((font) => (
                            <option key={font.value} value={font.value}>{font.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 mt-3">
                        <label className="text-[10px] text-slate-500 uppercase font-bold">對齊</label>
                        <div className="flex bg-slate-900 border border-slate-700 rounded overflow-hidden">
                          {[{ value: 'left', icon: AlignLeft }, { value: 'center', icon: AlignCenter }, { value: 'right', icon: AlignRight }].map((opt) => (
                            <button key={opt.value} onClick={() => updateTextStyle(styleKey, 'textAlign', opt.value)} className={`flex-1 py-1.5 flex justify-center hover:bg-slate-800 transition-colors ${style.textAlign === opt.value ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>
                              <opt.icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/50">
                        <input type="color" value={style.color} onChange={(e) => updateTextStyle(styleKey, 'color', e.target.value)} className="w-8 h-8 rounded bg-transparent border-none cursor-pointer" />
                        <span className="text-xs text-slate-400">文字顏色</span>

                        <div className="w-px h-4 bg-slate-700 mx-2"></div>

                        <input type="checkbox" checked={style.enableShadow || false} onChange={(e) => updateTextStyle(styleKey, 'enableShadow', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-800" />
                        <span className="text-xs text-slate-400">陰影</span>

                        <input type="checkbox" checked={style.hasBackground || false} onChange={(e) => updateTextStyle(styleKey, 'hasBackground', e.target.checked)} className="w-4 h-4 rounded border-slate-700 bg-slate-800 ml-2" />
                        <span className="text-xs text-slate-400">底色塊</span>
                      </div>
                    </section>
                  )
                })}
              </div>
            )}

          </div>
        </div>

        {/* Right Area (Canvas / Preview) */}
        {/* On mobile: Visible if showMobilePreview is true. On desktop: Always visible (flex-1) */}
        <div className={`flex-1 bg-slate-950 relative flex-col items-center justify-center overflow-hidden ${showMobilePreview ? 'flex' : 'hidden md:flex'}`}>

          <div className="absolute top-4 right-4 z-20 bg-slate-900/80 backdrop-blur px-1 py-1 rounded-full border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
            <button onClick={() => setPreviewScale(Math.max(0.1, previewScale - 0.1))} className="p-1 hover:bg-slate-700 rounded-full"><Minus className="w-3 h-3" /></button>
            <span className="min-w-[3rem] text-center font-mono">{Math.round(previewScale * 100)}%</span>
            <button onClick={() => setPreviewScale(Math.min(1.5, previewScale + 0.1))} className="p-1 hover:bg-slate-700 rounded-full"><Plus className="w-3 h-3" /></button>
          </div>

          <div ref={scrollContainerRef} className="w-full h-full overflow-x-auto overflow-y-hidden flex items-center px-10 md:px-20 gap-4 md:gap-8 scrollbar-thin select-none">
            {slides.map((slide, i) => (
              <SlideRenderer key={slide.id} slide={slide} config={config} scale={previewScale} isEditable={true} onNoteDragEnd={handleNoteDragEnd} index={i} totalSlides={slides.length} />
            ))}
            <div className="w-10 shrink-0" />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur px-4 py-2 rounded-full border border-slate-700 z-10">
            <button onClick={() => scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' })} className="p-2 hover:bg-slate-700 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-xs font-mono text-slate-400">{slides.length} SLIDES</span>
            <button onClick={() => scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' })} className="p-2 hover:bg-slate-700 rounded-full"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Hidden Container for high-res export */}
      <div style={{ position: 'fixed', top: 0, left: -99999, pointerEvents: 'none', display: 'flex' }}>
        {slides.map((slide, i) => (
          <SlideRenderer key={`export-${slide.id}`} id={`export-slide-${slide.id}`} slide={slide} config={config} scale={1} index={i} totalSlides={slides.length} />
        ))}
      </div>
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">匯出貼文圖集</h3>
                  <p className="text-xs text-slate-400">
                    {isExporting ? `正在生成圖片... ${exportProgress}%` : `已完成 ${exportedImages.length} 張圖片`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isExporting && setShowExportModal(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                disabled={isExporting}
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900/50">
              {isExporting ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-6">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                    <div
                      className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
                      style={{ animationDuration: '1s' }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
                      {exportProgress}%
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-medium text-slate-200">處理每一張精彩的幻燈片...</p>
                    <p className="text-xs text-slate-500">請勿關閉視窗，這需要一點時間來確保最高畫質</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {exportedImages.map((img, idx) => (
                    <div key={idx} className="group relative flex flex-col space-y-2 bg-slate-800 rounded-xl p-2 border border-slate-700 hover:border-blue-500 transition-all shadow-lg overflow-hidden">
                      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-slate-950 flex items-center justify-center">
                        <img src={img} className="w-full h-full object-contain" alt={`Slide ${idx + 1}`} />
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-slate-500">Slide {idx + 1}</span>
                        <button
                          onClick={() => handleShareImage(img, idx)}
                          className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors flex items-center gap-1 text-[10px] font-bold"
                        >
                          <Share2 className="w-3 h-3" />
                          {navigator.share ? '儲存' : '下載'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-950 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="text-xs text-slate-500 hidden md:block">
                <span className="text-blue-400 font-bold">提示：</span>
                手機用戶點擊「儲存」後，在選單中按「儲存影像」即可存入照片 App。
              </div>
              <div className="flex w-full md:w-auto gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 md:flex-none px-6 py-2.5 border border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  關閉
                </button>
                <button
                  onClick={downloadAllAsZip}
                  disabled={isExporting || exportedImages.length === 0}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-white text-slate-950 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <FileArchive className="w-4 h-4" />
                  全部下載 (ZIP)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Export Slides Container (High Resolution) */}
      <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
        {slides.map((s, idx) => (
          <div key={s.id} id={`export-slide-${s.id}`}>
            <SlideRenderer
              slide={s}
              config={config}
              scale={1}
              index={idx}
              totalSlides={slides.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;