
export type AspectRatio = '1:1' | '4:5' | '9:16' | 'custom';

export type FontFamily = 
  | 'Noto Sans TC' 
  | 'Noto Serif TC' 
  | 'Shippori Mincho'   
  | 'Dela Gothic One' 
  | 'Anton'             // New: Tall Impact Font
  | 'M PLUS Rounded 1c' 
  | 'Rampart One'       
  | 'Klee One'          
  | 'DotGothic16' 
  | 'Montserrat'
  | 'Playfair Display';

export type ThemeStyle = 'modern' | 'minimal' | 'bold' | 'elegant';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export type FrameStyle = 'none' | 'simple' | 'bold' | 'corners' | 'cinema';

export interface TextStyle {
  fontSize: number;
  fontFamily: FontFamily;
  color: string;
  fontWeight: string;
  backgroundColor?: string; // For text highlights
  hasBackground: boolean;
  textAlign: TextAlign;
  lineHeight: number;
  enableShadow: boolean; // New: Text Shadow toggle
}

export interface Position {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
}

export interface DesignConfig {
  aspectRatio: AspectRatio;
  customWidth: number;
  customHeight: number;
  
  // Global Account Handle / Watermark
  watermark: string;
  
  // Note/Footer Global Position
  globalNotePosition: Position;

  // Background
  bgType: 'color' | 'image';
  bgColor: string;
  bgImage?: string; // Data URL or URL
  bgSize?: 'cover' | 'contain';
  bgPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  bgBlur: number; // New: Background Blur amount (px)
  
  // Overlay (Membrane)
  overlayType: 'none' | 'black' | 'white';
  overlayOpacity: number; // 0 to 1

  // Frames (New)
  frameStyle: FrameStyle;
  frameColor: string;

  // Visual Elements
  showProgressBar: boolean; // New: Progress Bar Toggle

  // Typography Settings
  titleStyle: TextStyle; // H1 (Cover)
  subtitleStyle: TextStyle; // H2 (Inner pages)
  bodyStyle: TextStyle; // P (Content)
  noteStyle: TextStyle; // Small footer/caption
  
  // New Separate Styles for End Slide
  endTitleStyle: TextStyle;
  endBodyStyle: TextStyle;
}

export interface SlideContent {
  id: string;
  type: 'cover' | 'content' | 'end';
  title: string;
  body: string;
  note: string;
  // Per-slide override for note position
  notePosition?: Position; 
}

export interface GeminiRequest {
  text: string;
  pageCount: number;
}

export interface GeminiResponse {
  slides: SlideContent[];
  themeSuggestion?: {
    bgColor: string;
    titleColor: string; // Separate color for impact
    bodyColor: string;  // Readable color
    fontFamily: FontFamily;
    mood: string;
  };
}
