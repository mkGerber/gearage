export interface CompressionOptions {
  quality?: number; // 0.1 to 1.0, default 0.2 (80% reduction)
  maxWidth?: number; // maximum width in pixels, default 1200
  maxHeight?: number; // maximum height in pixels, default 1200
  format?: 'jpeg' | 'webp' | 'png'; // default 'jpeg'
}

const defaultOptions: CompressionOptions = {
  quality: 0.2, // 80% reduction in file size
  maxWidth: 1200,
  maxHeight: 1200,
  format: 'jpeg'
};

export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > opts.maxWidth!) {
          height = (height * opts.maxWidth!) / width;
          width = opts.maxWidth!;
        }
        
        if (height > opts.maxHeight!) {
          width = (width * opts.maxHeight!) / height;
          height = opts.maxHeight!;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        ctx!.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create new file with compressed data
              const compressedFile = new File([blob], file.name, {
                type: `image/${opts.format}`,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          `image/${opts.format}`,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export async function compressMultipleImages(
  files: File[], 
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressedFiles: File[] = [];
  
  for (const file of files) {
    try {
      const compressedFile = await compressImage(file, options);
      compressedFiles.push(compressedFile);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // If compression fails, use original file
      compressedFiles.push(file);
    }
  }
  
  return compressedFiles;
}

// Utility function to get file size in MB
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024);
}

// Utility function to format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 