import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageUploadProps {
  onImagesSelected: (files: File[]) => void;
  onRemoveImage?: (index: number) => void;
  preview?: string[];
}

export function ImageUpload({ onImagesSelected, onRemoveImage, preview = [] }: ImageUploadProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>(preview);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    onImagesSelected(files);
  };

  const handleRemove = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    onRemoveImage?.(index);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={url}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Foto's toevoegen
        </Button>
      </div>
    </div>
  );
}
