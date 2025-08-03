import { useState, useEffect } from "react";
import { formatFileSize } from "../utils/imageCompression";

interface ImageCompressionInfoProps {
  originalFile: File | null;
  compressedFile: File | null;
}

export default function ImageCompressionInfo({
  originalFile,
  compressedFile,
}: ImageCompressionInfoProps) {
  const [savings, setSavings] = useState<{
    originalSize: string;
    compressedSize: string;
    savingsPercent: number;
    savingsBytes: number;
  } | null>(null);

  useEffect(() => {
    if (originalFile && compressedFile) {
      const originalSize = originalFile.size;
      const compressedSize = compressedFile.size;
      const savingsBytes = originalSize - compressedSize;
      const savingsPercent = (savingsBytes / originalSize) * 100;

      setSavings({
        originalSize: formatFileSize(originalSize),
        compressedSize: formatFileSize(compressedSize),
        savingsPercent: Math.round(savingsPercent),
        savingsBytes,
      });
    } else {
      setSavings(null);
    }
  }, [originalFile, compressedFile]);

  if (!savings) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm font-medium text-green-800">
          Image Compressed Successfully
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-green-700">Original:</span>
          <span className="ml-2 font-medium">{savings.originalSize}</span>
        </div>
        <div>
          <span className="text-green-700">Compressed:</span>
          <span className="ml-2 font-medium">{savings.compressedSize}</span>
        </div>
      </div>

      <div className="mt-2 text-sm">
        <span className="text-green-700">Storage saved:</span>
        <span className="ml-2 font-bold text-green-800">
          {savings.savingsPercent}% ({formatFileSize(savings.savingsBytes)})
        </span>
      </div>
    </div>
  );
}
