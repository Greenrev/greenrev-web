import { useState, useEffect } from 'react';

export function useImagePreloader(imageUrls: string[]) {
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);
  const [loadedCount, setLoadedCount] = useState<number>(0);

  useEffect(() => {
    let isCancelled = false;

    if (!imageUrls || imageUrls.length === 0) {
      setImagesPreloaded(true);
      return;
    }

    let loaded = 0;
    const total = imageUrls.length;

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (isCancelled) return;
        loaded += 1;
        setLoadedCount(loaded);
        if (loaded === total) {
          setImagesPreloaded(true);
        }
      };
      img.onerror = () => {
        if (isCancelled) return;
        loaded += 1;
        setLoadedCount(loaded);
        if (loaded === total) {
          setImagesPreloaded(true);
        }
      };
    });

    return () => {
      isCancelled = true;
    };
  }, [imageUrls]);

  return { imagesPreloaded, loadedCount, progress: imageUrls.length ? (loadedCount / imageUrls.length) * 100 : 100 };
}
