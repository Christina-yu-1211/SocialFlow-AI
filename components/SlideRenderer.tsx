import React, { useMemo, useRef } from 'react';
import { DesignConfig, SlideContent, TextStyle } from '../types';

interface SlideRendererProps {
  slide: SlideContent;
  config: DesignConfig;
  scale?: number; // For scaling down in preview
  id?: string; // HTML ID for export
  onNoteDragEnd?: (id: string, x: number, y: number) => void;
  isEditable?: boolean; // Whether dragging is enabled
  index?: number; 
  totalSlides?: number;
}

const SlideRenderer: React.FC<SlideRendererProps> = ({ 
  slide, 
  config, 
  scale = 1, 
  id,
  onNoteDragEnd,
  isEditable = false,
  index = 0,
  totalSlides = 1
}) => {
  
  // Increased padding to 64px for wider margins (Magazine style)
  const basePadding = 64; 
  const currentPadding = basePadding * scale;

  // Dragging Logic Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Calculate dynamic styles based on scale
  const getStyle = (styleConfig: TextStyle) => {
    const alignment = styleConfig.textAlign || 'left';
    
    let alignSelf = 'flex-start';
    if (alignment === 'center') alignSelf = 'center';
    if (alignment === 'right') alignSelf = 'flex-end';
    if (alignment === 'justify') alignSelf = 'stretch';

    return {
      // FIX: Wrap font family in quotes to handle names with spaces (e.g., "M PLUS Rounded 1c")
      fontFamily: `"${styleConfig.fontFamily}"`,
      fontSize: `${styleConfig.fontSize * scale}px`,
      color: styleConfig.color,
      fontWeight: styleConfig.fontWeight,
      backgroundColor: styleConfig.hasBackground ? styleConfig.backgroundColor : 'transparent',
      padding: styleConfig.hasBackground ? `${8 * scale}px ${16 * scale}px` : '0',
      borderRadius: styleConfig.hasBackground ? `${8 * scale}px` : '0',
      display: 'inline-block', 
      maxWidth: '100%',
      lineHeight: styleConfig.lineHeight || 1.6,
      textAlign: alignment as any,
      alignSelf: alignSelf,
      whiteSpace: 'pre-wrap',
      // Text Shadow Implementation
      textShadow: styleConfig.enableShadow ? `0px ${2 * scale}px ${10 * scale}px rgba(0,0,0,0.5)` : 'none',
      // Visual Guide Lines (Dashed Border)
      border: isEditable ? '1px dashed rgba(255, 255, 255, 0.15)' : 'none',
      transition: 'border-color 0.2s',
    } as React.CSSProperties;
  };

  const containerStyle: React.CSSProperties = useMemo(() => {
    let width = config.customWidth;
    let height = config.customHeight;

    if (config.aspectRatio === '1:1') { width = 1080; height = 1080; }
    if (config.aspectRatio === '4:5') { width = 1080; height = 1350; }
    if (config.aspectRatio === '9:16') { width = 1080; height = 1920; }

    return {
      width: `${width * scale}px`,
      height: `${height * scale}px`,
      // If color type, use background color here. If image type, we use a separate div for blur.
      // But we can keep a fallback color.
      backgroundColor: config.bgType === 'color' ? config.bgColor : '#000',
      position: 'relative',
      overflow: 'hidden',
    };
  }, [config, scale]);

  const bgImageStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      backgroundImage: config.bgType === 'image' && config.bgImage ? `url(${config.bgImage})` : 'none',
      backgroundSize: config.bgSize || 'cover',
      backgroundPosition: config.bgPosition || 'center',
      backgroundRepeat: 'no-repeat',
      // Apply blur if exists. Multiply by scale so visual blur matches export blur approx.
      filter: config.bgBlur ? `blur(${config.bgBlur * scale}px)` : 'none',
      // Slight scale to prevent blurred edges from showing white background
      transform: config.bgBlur ? 'scale(1.05)' : 'scale(1)',
      zIndex: 0,
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: config.overlayType === 'black' ? '#000000' : config.overlayType === 'white' ? '#ffffff' : 'transparent',
    opacity: config.overlayType === 'none' ? 0 : config.overlayOpacity,
    zIndex: 1,
  };

  // Watermark fixed position (Top Right)
  // Modified: Use content padding for positioning to ensure it sits clearly inside any frames
  const watermarkStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${currentPadding}px`, 
    right: `${currentPadding}px`,
    fontSize: `${20 * scale}px`,
    color: config.overlayType === 'white' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
    fontWeight: 500,
    fontFamily: `"${config.bodyStyle.fontFamily}"`,
    zIndex: 3,
    pointerEvents: 'none',
    lineHeight: 1, 
    textShadow: config.bodyStyle.enableShadow ? `0px ${1 * scale}px ${4 * scale}px rgba(0,0,0,0.3)` : 'none',
  };

  // Note Position Logic (Percentage based)
  const notePos = slide.notePosition || config.globalNotePosition || { x: 50, y: 92 };
  
  const noteStyle: React.CSSProperties = {
    ...getStyle(config.noteStyle),
    position: 'absolute',
    left: `${notePos.x}%`,
    top: `${notePos.y}%`,
    transform: 'translate(-50%, -50%)', // Center anchor
    zIndex: 10,
    cursor: isEditable ? 'move' : 'default',
    userSelect: 'none',
    touchAction: 'none',
    border: isEditable ? '1px dashed rgba(255, 255, 255, 0.3)' : 'none', // Slightly stronger border for draggable element
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isEditable || !containerRef.current) return;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));

    if (onNoteDragEnd) {
      onNoteDragEnd(slide.id, x, y);
    }
  };

  // Content rendering based on type
  const renderContent = () => {
    // Define consistent spacing that scales with the view
    // 50px is chosen to match the visual "wideness" seen in preview mode (previously gap-6 was fixed 24px)
    const contentSpacing = 50 * scale;

    if (slide.type === 'cover') {
      return (
        <div className="flex flex-col justify-center my-auto w-full group">
          <h1 
            style={{ ...getStyle(config.titleStyle), marginBottom: `${contentSpacing}px` }} 
            className="hover:border-blue-400/50 transition-colors"
          >
            {slide.title}
          </h1>
          <p style={getStyle(config.bodyStyle)} className="hover:border-blue-400/50 transition-colors">{slide.body}</p>
        </div>
      );
    } 
    
    if (slide.type === 'end') {
      // Use Separate END styles
      const endTitleStyle = config.endTitleStyle || config.subtitleStyle;
      const endBodyStyle = config.endBodyStyle || config.bodyStyle;

      return (
        <div className="flex flex-col justify-center my-auto w-full h-full" 
             style={{ 
               alignItems: endTitleStyle.textAlign === 'center' ? 'center' : endTitleStyle.textAlign === 'right' ? 'flex-end' : 'flex-start' 
             }}>
           <h2 
             style={{ ...getStyle(endTitleStyle), marginBottom: `${contentSpacing}px` }} 
             className="hover:border-blue-400/50 transition-colors"
           >
             {slide.title}
           </h2>
           <p style={getStyle(endBodyStyle)} className="hover:border-blue-400/50 transition-colors">{slide.body}</p>
        </div>
      );
    }

    // Standard Content
    return (
      <div className="flex flex-col justify-center my-auto w-full">
        <h2 
          style={{ ...getStyle(config.subtitleStyle), marginBottom: `${contentSpacing}px` }} 
          className="hover:border-blue-400/50 transition-colors"
        >
          {slide.title}
        </h2>
        <p style={getStyle(config.bodyStyle)} className="hover:border-blue-400/50 transition-colors">{slide.body}</p>
      </div>
    );
  };

  // Progress Bar Rendering
  const renderProgressBar = () => {
    if (!config.showProgressBar || totalSlides <= 1) return null;
    
    const progress = ((index + 1) / totalSlides) * 100;
    
    // Determine color based on background darkness
    const isLightMode = config.overlayType === 'white';
    const trackColor = isLightMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
    const barColor = isLightMode ? '#000000' : '#ffffff';

    return (
      <div style={{
        position: 'absolute',
        bottom: `${40 * scale}px`, // Fixed position from bottom
        left: '10%', // Use specific left/width instead of transform for better html2canvas support
        width: '80%', 
        height: `${4 * scale}px`,
        backgroundColor: trackColor,
        borderRadius: `${2 * scale}px`,
        zIndex: 5,
        // overflow: 'hidden', // Rely on inner border radius instead of overflow for html2canvas consistency
        pointerEvents: 'none'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: barColor,
          borderRadius: `${2 * scale}px`, // Match parent radius
          transition: 'width 0.3s ease'
        }} />
      </div>
    );
  };

  // Frame Rendering
  const renderFrame = () => {
    if (!config.frameStyle || config.frameStyle === 'none') return null;

    const color = config.frameColor || '#ffffff';
    const inset = 32 * scale; // Default margin for frames

    const commonFrameStyle: React.CSSProperties = {
      position: 'absolute',
      top: `${inset}px`,
      left: `${inset}px`,
      right: `${inset}px`,
      bottom: `${inset}px`,
      pointerEvents: 'none',
      zIndex: 2, // Above overlay, below text
    };

    if (config.frameStyle === 'simple') {
      return (
        <div style={{
          ...commonFrameStyle,
          border: `${2 * scale}px solid ${color}`,
        }} />
      );
    }

    if (config.frameStyle === 'bold') {
      return (
        <div style={{
          ...commonFrameStyle,
          border: `${6 * scale}px solid ${color}`,
        }} />
      );
    }

    if (config.frameStyle === 'corners') {
      const length = 60 * scale;
      const thick = 3 * scale;
      const cornerBase: React.CSSProperties = { position: 'absolute', width: `${length}px`, height: `${length}px`, borderColor: color, borderStyle: 'solid', borderWidth: 0 };
      return (
        <div style={commonFrameStyle}>
           <div style={{ ...cornerBase, top: 0, left: 0, borderTopWidth: thick, borderLeftWidth: thick }} />
           <div style={{ ...cornerBase, top: 0, right: 0, borderTopWidth: thick, borderRightWidth: thick }} />
           <div style={{ ...cornerBase, bottom: 0, left: 0, borderBottomWidth: thick, borderLeftWidth: thick }} />
           <div style={{ ...cornerBase, bottom: 0, right: 0, borderBottomWidth: thick, borderRightWidth: thick }} />
        </div>
      );
    }

    if (config.frameStyle === 'cinema') {
      return (
        <div style={{
           position: 'absolute',
           top: `${inset * 1.5}px`, bottom: `${inset * 1.5}px`, left: 0, right: 0,
           pointerEvents: 'none', zIndex: 2,
           borderTop: `${2 * scale}px solid ${color}`,
           borderBottom: `${2 * scale}px solid ${color}`,
        }} />
      );
    }

    return null;
  };


  return (
    <div 
      id={id} 
      ref={containerRef}
      style={containerStyle} 
      // Only apply drop shadow if it's NOT an export slide (detected by presence of ID)
      // This ensures the exported image is clean without outer shadows.
      className={`${id ? '' : 'shadow-2xl'} flex flex-col relative shrink-0`}
    >
      {/* Separate Background Image Layer with Blur Support */}
      {config.bgType === 'image' && (
        <div style={bgImageStyle} />
      )}

      {/* Overlay */}
      <div style={overlayStyle} />

      {/* Frame (New) */}
      {renderFrame()}

      {/* Watermark (Account Handle) - Fixed Top Right */}
      {config.watermark && (
        <div style={watermarkStyle}>{config.watermark}</div>
      )}
      
      {/* Progress Bar (Visual Guide Line) */}
      {renderProgressBar()}

      {/* Draggable Note (Footer) */}
      {slide.note && (
        <div 
          style={noteStyle}
          className="hover:border-blue-400 transition-colors hover:bg-white/10"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {slide.note}
        </div>
      )}

      {/* Content Container */}
      <div 
        className="flex-1 flex flex-col relative h-full w-full" 
        style={{ 
          zIndex: 2,
          padding: `${currentPadding}px`
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default SlideRenderer;