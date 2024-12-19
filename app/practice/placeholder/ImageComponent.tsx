"use client";

import React, { useEffect, useState } from "react";

/**
 * @name ImageCompProps
 * @description 이미지 컴포넌트의 props
 *
 * @param src
 * @description 이미지 경로
 *
 * @param alt
 * @description 이미지 대체 텍스트
 */
interface ImageCompProps {
  src: string;
  alt: string;
}
export default function ImageComponent({ src, alt }: ImageCompProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <div>
      {isLoaded ? (
        <img src={src} alt={alt} />
      ) : (
        <div>Loading image...</div> // placeholder
      )}
    </div>
  );
}
