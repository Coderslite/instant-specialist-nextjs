// components/ImageUploader.tsx
'use client';

import { RiImageAddFill, RiCloseFill } from 'react-icons/ri';
import { useRef, useState, ChangeEvent } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  onImagesChange: (images: File[]) => void;
  disabled: boolean,
}

const ImageUploader = ({ onImagesChange }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => file.type.startsWith('image/'));

      if (validFiles.length + files.length > 5) {
        alert('You can upload a maximum of 5 images');
        return;
      }

      const newPreviewImages = validFiles.map(file => URL.createObjectURL(file));

      setFiles([...files, ...validFiles]);
      setPreviewImages([...previewImages, ...newPreviewImages]);
      onImagesChange([...files, ...validFiles]);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...files];
    const newPreviewImages = [...previewImages];

    newFiles.splice(index, 1);
    newPreviewImages.splice(index, 1);

    setFiles(newFiles);
    setPreviewImages(newPreviewImages);
    onImagesChange(newFiles);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {previewImages.map((image, index) => (
        <div key={index} className="relative h-[100px] w-[100px]">
          <Image
            src={image}
            alt={`Preview ${index}`}
            fill
            className="object-cover rounded-lg"
          />
          <button
            onClick={() => removeImage(index)}
            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
          >
            <RiCloseFill className="text-white" />
          </button>
        </div>
      ))}

      {previewImages.length < 5 && (
        <div
          className="h-[100px] w-[100px] bg-gray-200 rounded-lg flex justify-center items-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <RiImageAddFill className="text-3xl text-gray-500" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
            multiple
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;