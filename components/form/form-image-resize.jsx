"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Check, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCroppedImg } from "./form-image-preview"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"



const FormImageResize = ({
  onCallbackData,
  resolution = 600,
  label = "Choose Image",
  required = false,
  multiple = false,
  maxImages = 5,
  fieldName = "picture",
}) => {
  const [images, setImages] = useState>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState(1 / 1)
  const [selectedAspect, setSelectedAspect] = useState("1x1")
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [pendingFiles, setPendingFiles] = useState([])

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (!multiple) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImages([reader.result])
          setPendingFiles([file])
          setCurrentImageIndex(0)
          setDialogOpen(true)
        }
      }
      reader.readAsDataURL(file)
    } else {
      const newImages = []
      const newFiles = []
      let loadedCount = 0

      files.slice(0, maxImages - images.length).forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === "string") {
            newImages.push(reader.result)
            newFiles.push(file)
            loadedCount++

            if (loadedCount === files.length || loadedCount === maxImages - images.length) {
              setImages((prev) => [...prev, ...newImages])
              setPendingFiles((prev) => [...prev, ...newFiles])
              setCurrentImageIndex(images.length)
              setDialogOpen(true)
            }
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleAspectChange = (value) => {
    setSelectedAspect(value)
    switch (value) {
      case "1x1":
        setAspect(1 / 1)
        break
      case "2x3":
        setAspect(2 / 3)
        break
      case "3x2":
        setAspect(3 / 2)
        break
      case "16x9":
        setAspect(16 / 9)
        break
      default:
        setAspect(1 / 1)
    }
  }

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const generateCroppedImage = useCallback(
    async (imageSrc) => {
      if (!croppedAreaPixels) throw new Error("No crop area defined")

      let outputWidth = resolution
      let outputHeight = resolution

      switch (aspect) {
        case 1 / 1:
          break
        case 2 / 3:
          outputWidth = (resolution * 2) / 3
          break
        case 3 / 2:
          outputHeight = (resolution * 2) / 3
          break
        case 16 / 9:
          outputHeight = (resolution * 9) / 16
          break
      }

      return await getCroppedImg(imageSrc, croppedAreaPixels, outputWidth, outputHeight)
    },
    [croppedAreaPixels, aspect, resolution],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!multiple) {
        // Single image mode
        const cropped = await generateCroppedImage(images[0])
        const formData = new FormData()
        formData.append(fieldName, cropped, "cropped-image.jpg")
        onCallbackData(formData)
      } else {
        // Multiple images mode - crop all images
        const croppedImages = []

        for (let i = 0; i < images.length; i++) {
          const cropped = await generateCroppedImage(images[i])
          const formData = new FormData()
          formData.append(`${fieldName}_${i}`, cropped, `cropped-image-${i}.jpg`)
          croppedImages.push(formData)
        }

        onCallbackData(croppedImages)
      }

      setDialogOpen(false)
      // Reset for next use
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    } catch (err) {
      console.error("Upload error:", err)
    }
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
    if (currentImageIndex >= images.length - 1) {
      setCurrentImageIndex(Math.max(0, images.length - 2))
    }
  }

  const currentImage = images[currentImageIndex]

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-700">*</span>}
        {multiple && <span className="text-sm text-muted-foreground ml-2">(Max {maxImages} images)</span>}
      </Label>

      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileUpload}
          className="cursor-pointer file:cursor-pointer"
        />

        {images.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Crop ({images.length})
          </Button>
        )}
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="max-w-[480px] p-4 gap-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-md font-semibold">
              Crop Your {multiple ? "Images" : "Picture"}
              {multiple && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({currentImageIndex + 1} of {images.length})
                </span>
              )}
            </AlertDialogTitle>
          </AlertDialogHeader>

          <Separator />

          {multiple && images.length > 1 && (
            <div className="flex gap-2 mb-2 overflow-x-auto">
              {images.map((img, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-12 h-12 rounded border-2 overflow-hidden",
                      currentImageIndex === index ? "border-primary" : "border-border",
                    )}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-4 gap-3 mb-2">
            {[
              { value: "1x1", label: "1:1", width: 40, height: 40 },
              { value: "3x2", label: "3:2", width: 40, height: 26.5 },
              { value: "2x3", label: "2:3", width: 26.5, height: 40 },
              { value: "16x9", label: "16:9", width: 40, height: 22.5 },
            ].map((option) => (
              <AspectRatioOption
                key={option.value}
                {...option}
                isSelected={selectedAspect === option.value}
                onClick={() => handleAspectChange(option.value)}
              />
            ))}
          </div>

          {currentImage && (
            <div className="relative rounded-lg overflow-hidden bg-checkerboard" style={{ height: 280 }}>
              <Cropper
                image={currentImage}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Apply & Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function AspectRatioOption({ value, label, width, height, isSelected, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-between p-1 rounded-lg cursor-pointer transition-all duration-200",
        "border-2 shadow-sm hover:shadow-md",
        isSelected
          ? "border-primary bg-primary/5 shadow-primary/20"
          : "border-border bg-background hover:border-primary/30",
      )}
    >
      <div className="flex justify-center mb-0">
        <div
          style={{ width: `${width}px`, height: `${height}px` }}
          className={cn("relative bg-muted rounded-md overflow-hidden", isSelected ? "bg-primary/20" : "bg-muted")}
        >
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check className="w-6 h-6 text-primary" />
            </motion.div>
          )}
        </div>
      </div>
      <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>{label}</span>
    </motion.div>
  )
}

export default FormImageResize




// "use client";

// import React, { useState, useCallback } from "react";
// import Cropper from "react-easy-crop";
// import { Separator } from "@/components/ui/separator";
// import { Input } from "@/components/ui/input";
// import { Slider } from "@/components/ui/slider"
// import { Label } from "@/components/ui/label";
// import { motion } from "framer-motion";
// import { Check } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { getCroppedImg } from "@/utils/crop-image";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";

// const FormImageResize = ({
//   onCallbackData,
//   resolution = 600,
//   label = 'Choose Image',
//   required,
// }) => {
//   const [imageSrc, setImageSrc] = useState("/placeholder.svg"); // ✅ fallback
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [aspect, setAspect] = useState(1 / 1);
//   const [selectedAspect, setSelectedAspect] = useState("1x1");
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

//   const handleFileUpload = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         if (typeof reader.result === "string") {
//           setImageSrc(reader.result);
//         }
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleAspectChange = (value) => {
//     setSelectedAspect(value);
//     switch (value) {
//       case "1x1":
//         setAspect(1 / 1);
//         break;
//       case "2x3":
//         setAspect(2 / 3);
//         break;
//       case "3x2":
//         setAspect(3 / 2);
//         break;
//       case "16x9":
//         setAspect(16 / 9);
//         break;
//       default:
//         setAspect(1 / 1);
//     }
//   };

//   const onCropComplete = useCallback((_, croppedPixels) => {
//     setCroppedAreaPixels(croppedPixels);
//   }, []);

//   const generateCroppedImage = useCallback(async () => {
//     const original = new Image();
//     original.src = imageSrc;

//     let outputWidth = resolution;
//     let outputHeight = resolution;

//     switch (aspect) {
//       case 1 / 1:
//         break;
//       case 2 / 3:
//         outputWidth = (resolution * 2) / 3;
//         break;
//       case 3 / 2:
//         outputHeight = (resolution * 2) / 3;
//         break;
//       case 16 / 9:
//         outputHeight = (resolution * 9) / 16;
//         break;
//     }

//     return await getCroppedImg(
//       imageSrc,
//       croppedAreaPixels,
//       outputWidth,
//       outputHeight
//     );
//   }, [imageSrc, croppedAreaPixels, aspect, resolution]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const cropped = await generateCroppedImage();
//       if (!cropped) throw new Error("Cropped image is null");

//       const formData = new FormData();
//       formData.append("picture", cropped, "cropped-image.jpg");
//       onCallbackData(formData);
//       setDialogOpen(false);
//     } catch (err) {
//       console.error("Upload error:", err);
//     }
//   };

//   return (
//     <div className="space-y-2">
//       <Label>
//         {label} {required && <span className="text-red-700">*</span>}
//       </Label>
//       <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <AlertDialogTrigger asChild>
//           <Input
//             type="file"
//             accept="image/*"
//             onChange={handleFileUpload}
//             className="cursor-pointer file:cursor-pointer"
//           />
//         </AlertDialogTrigger>

//         <AlertDialogContent className="max-w-[380px] p-4 gap-2">
//           <AlertDialogHeader>
//             <AlertDialogTitle className="text-md font-semibold">
//               Crop Your Picture
//             </AlertDialogTitle>
//           </AlertDialogHeader>

//           <Separator />
//           <div className="grid grid-cols-4 gap-3 mb-2">
//             {[
//               { value: "1x1", label: "1:1", width: 40, height: 40 },
//               { value: "3x2", label: "3:2", width: 40, height: 26.5 },
//               { value: "2x3", label: "2:3", width: 26.5, height: 40 },
//               { value: "16x9", label: "16:9", width: 40, height: 22.5 },
//             ].map((option) => (
//               <AspectRatioOption
//                 key={option.value}
//                 {...option}
//                 isSelected={selectedAspect === option.value}
//                 onClick={() => handleAspectChange(option.value)}
//               />
//             ))}
//           </div>

//           {imageSrc && (
//             <div className="relative rounded-lg overflow-hidden bg-checkerboard" style={{ height: 220 }}>
//               <Cropper
//                 image={imageSrc}
//                 crop={crop}
//                 zoom={zoom}
//                 aspect={aspect}
//                 onCropChange={setCrop}
//                 onZoomChange={setZoom}
//                 onCropComplete={onCropComplete}
//                 objectFit="contain"
//               />
//             </div>
//           )}

//           {/* <div>
//             <Label className="text-sm text-muted-foreground">Zoom: {zoom.toFixed(1)}x</Label>
//             <Slider onChange={(e) => setZoom(Number(e.target.value))} defaultValue={[zoom]} min={1}
//               max={3}
//               step={0.1} />
//           </div> */}

//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleSubmit}
//             >
//               Apply & Continue
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// function AspectRatioOption({ value, label, width, height, isSelected, onClick }) {
//   return (
//     <motion.div
//       whileHover={{ scale: 1.03 }}
//       whileTap={{ scale: 0.97 }}
//       onClick={onClick}
//       className={cn(
//         "relative flex flex-col items-center justify-between p-1 rounded-lg cursor-pointer transition-all duration-200",
//         "border-2 shadow-sm hover:shadow-md",
//         isSelected
//           ? "border-primary bg-primary/5 shadow-primary/20"
//           : "border-border bg-background hover:border-primary/30"
//       )}
//     >
//       <div className="flex justify-center mb-0">
//         <div
//           style={{ width: `${width}px`, height: `${height}px` }}
//           className={cn(
//             "relative bg-muted rounded-md overflow-hidden",
//             isSelected ? "bg-primary/20" : "bg-muted"
//           )}
//         >
//           {isSelected && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.5 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="absolute inset-0 flex items-center justify-center"
//             >
//               <Check className="w-6 h-6 text-primary" />
//             </motion.div>
//           )}
//         </div>
//       </div>
//       <span
//         className={cn(
//           "text-sm font-medium",
//           isSelected ? "text-primary" : "text-muted-foreground"
//         )}
//       >
//         {label}
//       </span>
//     </motion.div>
//   );
// }

// export default FormImageResize;
