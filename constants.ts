import { DesignConfig, SlideContent } from './types';

export const DEFAULT_DESIGN: DesignConfig = {
  aspectRatio: '4:5',
  customWidth: 1080,
  customHeight: 1350,
  watermark: '@YourHandle',
  globalNotePosition: { x: 85, y: 92 }, // Default bottom-rightish
  bgType: 'color',
  bgColor: '#3b82f6',
  bgSize: 'cover',
  bgPosition: 'center',
  bgBlur: 0,
  overlayType: 'black',
  overlayOpacity: 0.3,
  
  frameStyle: 'none',
  frameColor: '#ffffff',
  
  showProgressBar: true, // Default enabled
  
  titleStyle: {
    fontSize: 120,
    fontFamily: 'Noto Sans TC',
    color: '#ffffff',
    fontWeight: '900',
    hasBackground: false,
    backgroundColor: '#000000',
    textAlign: 'left',
    lineHeight: 1.2,
    enableShadow: false,
  },
  subtitleStyle: {
    fontSize: 90,
    fontFamily: 'Noto Sans TC',
    color: '#ffffff',
    fontWeight: '700',
    hasBackground: false,
    backgroundColor: '#000000',
    textAlign: 'left',
    lineHeight: 1.2,
    enableShadow: false,
  },
  bodyStyle: {
    fontSize: 50,
    fontFamily: 'Noto Sans TC',
    color: '#f1f5f9',
    fontWeight: '400',
    hasBackground: false,
    backgroundColor: '#000000',
    textAlign: 'left',
    lineHeight: 1.6,
    enableShadow: false,
  },
  noteStyle: {
    fontSize: 30,
    fontFamily: 'Noto Sans TC',
    color: '#ffffff',
    fontWeight: '500',
    hasBackground: true,
    backgroundColor: '#000000',
    textAlign: 'center',
    lineHeight: 1.2,
    enableShadow: false,
  },
  
  // Independent End Slide Styles
  endTitleStyle: {
    fontSize: 80,
    fontFamily: 'Noto Sans TC',
    color: '#ffffff',
    fontWeight: '900',
    hasBackground: false,
    backgroundColor: '#000000',
    textAlign: 'center',
    lineHeight: 1.3,
    enableShadow: false,
  },
  endBodyStyle: {
    fontSize: 45,
    fontFamily: 'Noto Sans TC',
    color: '#e2e8f0',
    fontWeight: '400',
    hasBackground: false,
    backgroundColor: '#000000',
    textAlign: 'center',
    lineHeight: 1.6,
    enableShadow: false,
  }
};

export const INITIAL_SLIDES: SlideContent[] = [
  {
    id: '1',
    type: 'cover',
    title: '你的大標題在這裡',
    body: '這是一個副標題或引言，吸引讀者向右滑動。',
    note: '01',
  },
  {
    id: '2',
    type: 'content',
    title: '重點一：內容標題',
    body: '這裡是主要內容區域。AI 會自動幫你將長篇文章摘要成精簡的重點。你可以自由調整字體大小和顏色。',
    note: '02',
  },
  {
    id: '3',
    type: 'end',
    title: '喜歡這篇貼文嗎？',
    body: '收藏、分享、或是留言告訴我你的想法！',
    note: 'LINK IN BIO',
  },
];

// Existing presets (Legacy)
export const PRESET_THEMES: Record<string, Partial<DesignConfig>> = {
  modern: { /* ... */ },
  bold: { /* ... */ },
  elegant: { /* ... */ }
};
