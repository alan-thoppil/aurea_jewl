'use client';

import { useStudioStore, Ornament } from '@/store/useStudioStore';
import { Upload, X, Camera } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import * as fabric from 'fabric';

export default function PhotoCanvas() {
  const { uploadedPhoto, setUploadedPhoto, selectedOrnaments, isGeneratingAI } = useStudioStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  
  // Track which ornaments are currently added to the canvas to avoid duplicates
  const renderedOrnamentsRef = useRef<Map<string, fabric.Image>>(new Map());

  // Set up custom luxury controls for Fabric.js
  useEffect(() => {
    if (typeof window !== 'undefined' && fabric.InteractiveFabricObject) {
      fabric.InteractiveFabricObject.ownDefaults = {
        ...fabric.InteractiveFabricObject.ownDefaults,
        cornerColor: '#D4AF37',
        cornerStrokeColor: '#000000',
        borderColor: '#D4AF37',
        cornerSize: 12,
        transparentCorners: false,
        padding: 10,
        cornerStyle: 'circle'
      };
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) setUploadedPhoto(e.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Initialize Canvas when photo is uploaded
  useEffect(() => {
    if (uploadedPhoto && canvasRef.current && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: clientWidth,
        height: clientHeight,
        preserveObjectStacking: true,
      });

      // Add dynamic metallic shine on move/rotate
      canvas.on('object:moving', (e) => {
        if (e.target && e.target.type === 'image') {
          // Subtle rotation-based brightness change
          const angle = e.target.angle || 0;
          const brightness = Math.sin(angle * (Math.PI / 180)) * 0.1; 
          
          const target = e.target as any;
          if (target.filters && target.filters.length > 0) {
            (target.filters[0] as any).brightness = brightness;
            target.applyFilters();
            canvas.requestRenderAll();
          }
        }
      });
      
      canvas.on('object:rotating', (e) => {
        if (e.target && e.target.type === 'image') {
          const angle = e.target.angle || 0;
          const brightness = Math.sin(angle * (Math.PI / 180)) * 0.1;
          
          const target = e.target as any;
          if (target.filters && target.filters.length > 0) {
            (target.filters[0] as any).brightness = brightness;
            target.applyFilters();
            canvas.requestRenderAll();
          }
        }
      });

      setFabricCanvas(canvas);

      // Expose to global window for ActionPanel to trigger AI generation
      (window as any).getStudioCanvasDataUrl = () => {
        return canvas.toDataURL({ format: 'png', quality: 1, multiplier: 1 });
      };

      return () => {
        canvas.dispose();
        renderedOrnamentsRef.current.clear();
        delete (window as any).getStudioCanvasDataUrl;
      };
    } else {
      setFabricCanvas(null);
    }
  }, [uploadedPhoto]);

  // Handle Background Image
  useEffect(() => {
    if (!fabricCanvas || !uploadedPhoto) return;

    const loadBg = async () => {
      try {
        const img = await fabric.Image.fromURL(uploadedPhoto);
        
        // Calculate scaling to cover/contain
        const canvasAspectRatio = fabricCanvas.width! / fabricCanvas.height!;
        const imageAspectRatio = img.width! / img.height!;
        let scaleFactor = 1;

        if (imageAspectRatio > canvasAspectRatio) {
          scaleFactor = fabricCanvas.height! / img.height!;
        } else {
          scaleFactor = fabricCanvas.width! / img.width!;
        }

        img.set({
          scaleX: scaleFactor,
          scaleY: scaleFactor,
          originX: 'center',
          originY: 'center',
          left: fabricCanvas.width! / 2,
          top: fabricCanvas.height! / 2,
        });

        fabricCanvas.backgroundImage = img;
        fabricCanvas.requestRenderAll();
      } catch (err) {
        console.error("Failed to load background image:", err);
      }
    };
    
    loadBg();
  }, [fabricCanvas, uploadedPhoto]);

  // Handle Ornaments Sync
  useEffect(() => {
    if (!fabricCanvas) return;

    const currentIds = selectedOrnaments.map(o => o.id);
    const renderedMap = renderedOrnamentsRef.current;

    // Remove ornaments that were unselected
    Array.from(renderedMap.keys()).forEach(id => {
      if (!currentIds.includes(id)) {
        const obj = renderedMap.get(id);
        if (obj) fabricCanvas.remove(obj);
        renderedMap.delete(id);
      }
    });

    // Add newly selected ornaments
    selectedOrnaments.forEach(async (ornament) => {
      if (!renderedMap.has(ornament.id)) {
        try {
          const img = await fabric.Image.fromURL(ornament.imageUrl);
          
          // Default auto-placement logic based on category
          const cw = fabricCanvas.width!;
          const ch = fabricCanvas.height!;
          
          let top = ch / 2;
          let left = cw / 2;
          let scale = 0.3; // Default scale

          switch (ornament.category) {
            case 'Necklaces':
              top = ch * 0.65; // Lower neck area
              scale = 0.4;
              break;
            case 'Earrings':
              top = ch * 0.45; // Ear area
              scale = 0.15;
              break;
            case 'Rings':
              top = ch * 0.85; // Hands area
              scale = 0.1;
              break;
            case 'Bangles':
              top = ch * 0.8; // Wrists area
              scale = 0.2;
              break;
          }

          // Initial placement with realistic drop shadow
          img.set({
            left,
            top,
            originX: 'center',
            originY: 'center',
            transparentCorners: false,
            shadow: new fabric.Shadow({
              color: 'rgba(0,0,0,0.4)',
              blur: 15,
              offsetX: 5,
              offsetY: 10
            })
          });
          
          // Apply scale
          img.scale(scale);

          // Add a base Brightness filter for metallic simulation
          const filters = (fabric.Image as any).filters || (fabric as any).filters;
          const brightnessFilter = new filters.Brightness({ brightness: 0 });
          (img as any).filters.push(brightnessFilter);
          img.applyFilters();

          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          renderedMap.set(ornament.id, img);
          fabricCanvas.requestRenderAll();
        } catch (err) {
          console.error("Failed to load ornament:", err);
        }
      }
    });
  }, [selectedOrnaments, fabricCanvas]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 lg:p-8">
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t border-l border-gold/40"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-gold/40"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b border-l border-gold/40"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r border-gold/40"></div>

      <div 
        ref={containerRef}
        className={`w-full max-w-2xl aspect-[3/4] md:aspect-auto md:h-full max-h-[80vh] rounded-xl overflow-hidden glass-panel-heavy relative transition-all duration-300 ${
          isDragging ? 'border-gold shadow-[0_0_30px_rgba(212,175,55,0.3)]' : ''
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) processFile(file);
        }}
      >
        {!uploadedPhoto ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 rounded-full glass-gold flex items-center justify-center mb-6 animate-breathe">
              <Camera size={40} className="text-gold" />
            </div>
            <h2 className="font-serif text-3xl mb-2 text-white">Upload Your Portrait</h2>
            <p className="text-gray-400 text-sm max-w-xs mb-8">
              For best results, upload a clear, well-lit portrait facing the camera.
            </p>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 bg-white/5 border border-gold/30 rounded-full hover:bg-gold/10 transition-colors text-white flex items-center gap-2"
            >
              <Upload size={18} />
              <span>Browse Files</span>
            </button>
            <p className="text-xs text-gray-500 mt-4">or drag and drop here</p>
            
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
        ) : (
          <div className="relative w-full h-full">
            <canvas ref={canvasRef} className="w-full h-full" />

            <button 
              onClick={() => setUploadedPhoto(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors text-white z-50"
              title="Clear Photo"
            >
              <X size={18} />
            </button>
            
            {/* AI Generation Cinematic Overlay */}
            {isGeneratingAI && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center animate-fadeIn">
                <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-gold/30 rounded-full animate-spin-slow"></div>
                  <div className="absolute inset-2 border-4 border-t-gold border-r-gold border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  <span className="text-gold font-serif text-3xl animate-pulse">A</span>
                </div>
                <h3 className="text-2xl font-serif text-white tracking-widest uppercase mb-2">Generating Luxury Portrait</h3>
                <p className="text-gold/80 text-sm tracking-widest uppercase animate-pulse">Applying Cinematic Lighting & Shadows...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
