"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"


const FormImagePreview = ({
  imgSrc = "",
  width = 200,
  height = 200,
  label = "Picture Preview",
  underLine = false,
  required = false,
  multiple = false,
  maxImages = 5,
  onRemove,
  onAdd,
  className,
}) => {
  // Handle both single and multiple images
  const images = React.useMemo(() => {
    if (!imgSrc) return ["/placeholder.svg"]
    if (Array.isArray(imgSrc)) {
      return imgSrc.length > 0 ? imgSrc : ["/placeholder.svg"]
    }
    return [imgSrc]
  }, [imgSrc])

  const isPlaceholder = (src) => src === "/placeholder.svg"
  const canAddMore = multiple && images.length < maxImages && onAdd
  const showRemoveButton = onRemove && !isPlaceholder(images[0])

  if (!multiple) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className={`${underLine ? "underline" : ""}`}>
          {label} {required && <span className="text-red-700">*</span>}
        </Label>
        <div className="relative group">
          <Image
            src={images[0] || "/placeholder.svg"}
            alt="picture preview"
            width={width}
            height={height}
            className="rounded-xl shadow object-cover"
          />
          {showRemoveButton && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove()}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className={`${underLine ? "underline" : ""}`}>
        {label} {required && <span className="text-red-700">*</span>}
        {multiple && (
          <span className="text-sm text-muted-foreground ml-2">
            ({images.filter((img) => !isPlaceholder(img)).length}/{maxImages})
          </span>
        )}
      </Label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((src, index) => (
          <div key={index} className="relative group">
            <Image
              src={src || "/placeholder.svg"}
              alt={`picture preview ${index + 1}`}
              width={width}
              height={height}
              className="rounded-xl shadow object-cover w-full aspect-square"
            />
            {showRemoveButton && !isPlaceholder(src) && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}

        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            className="aspect-square rounded-xl border-2 border-dashed hover:border-primary transition-colors"
            onClick={onAdd}
          >
            <Plus className="h-8 w-8 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default FormImagePreview

export const getCroppedImg = (
  imageSrc,
  croppedAreaPixels,
  outputWidth,
  outputHeight,
) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = imageSrc
    image.crossOrigin = "anonymous"
    image.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      canvas.width = outputWidth
      canvas.height = outputHeight

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height,
      )

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], "cropped-image.jpg", { type: "image/jpeg" }))
          } else {
            reject(new Error("Canvas is empty!"))
          }
        },
        "image/jpeg",
        1,
      )
    }

    image.onerror = (error) => {
      reject(error)
    }
  })
}



// "use client";

// import React from "react";
// import { Label } from "@/components/ui/label";
// import Image from "next/image";

// const FormImagePreview = ({
//   imgSrc = "",
//   width = 200,
//   height = 200,
//   label = "Picture Preview",
//   underLine = false,
//   required,
// }) => {
//   const src = imgSrc || "/placeholder.svg"; 

//   return (
//     <div className="space-y-2">
//       <Label className={`${underLine ? "underline" : ""}`}>
//         {label} {required && <span className="text-red-700">*</span>}
//       </Label>
//       <div className='relative '>
//         <Image
//           src={src}
//           alt="picture preview"
//           width={width}
//           height={height}
//           className="rounded-xl shadow object-cover"
//         />
//       </div>
//     </div>
//   );
// };

// export default FormImagePreview;

