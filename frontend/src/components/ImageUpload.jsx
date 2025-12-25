import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ImageUpload = ({ images = [], onChange, maxImages = 10 }) => {
  const [previewImages, setPreviewImages] = useState(images);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Check max images limit
    if (previewImages.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Create preview URLs
    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    const updatedPreviews = [...previewImages, ...newPreviews];
    setPreviewImages(updatedPreviews);
    
    // Notify parent component
    onChange(updatedPreviews);
  };

  const removeImage = (index) => {
    const updatedPreviews = previewImages.filter((_, i) => i !== index);
    
    // Revoke object URL to prevent memory leaks
    if (previewImages[index].preview.startsWith('blob:')) {
      URL.revokeObjectURL(previewImages[index].preview);
    }
    
    setPreviewImages(updatedPreviews);
    onChange(updatedPreviews);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    const inputEvent = { target: { files } };
    handleFileSelect(inputEvent);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">Drag & drop images here, or click to browse</p>
        <p className="text-sm text-gray-500 mb-4">
          Supports JPG, PNG up to 5MB each
        </p>
        <button
          type="button"
          className="btn-secondary inline-flex items-center"
        >
          <FiImage className="mr-2" />
          Select Images
        </button>
        
        {previewImages.length > 0 && (
          <p className="text-sm text-gray-600 mt-4">
            {previewImages.length} of {maxImages} images selected
          </p>
        )}
      </div>

      {previewImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {previewImages.map((item, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={item.preview || item}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <FiX size={14} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.file?.name || `Image ${index + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;