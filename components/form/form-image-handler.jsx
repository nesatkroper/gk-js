import React, { useState, useCallback, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCroppedImg } from "@/utils/crop-image";
import { defimg } from "@/utils/resize-crop-image";
import Cropper from "react-easy-crop";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PropTypes from "prop-types";

const FormImageHandler = ({
  onImageChange,
  imgSrc = defimg,
  label = "Image",
  labelClass = "",
  imgClass = "",
  resolution = 600,
  underLine = false,
}) => {
  const fileInputRef = useRef(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1 / 1);
  const [selectedAspect, setSelectedAspect] = useState("1x1");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [tempImageSrc, setTempImageSrc] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setTempImageSrc(reader.result);
          setDialogOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAspectChange = (value) => {
    setSelectedAspect(value);
    switch (value) {
      case "1x1":
        setAspect(1 / 1);
        break;
      case "2x3":
        setAspect(2 / 3);
        break;
      case "3x2":
        setAspect(3 / 2);
        break;
      case "16x9":
        setAspect(16 / 9);
        break;
      default:
        setAspect(1 / 1);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const generateCroppedImage = useCallback(async () => {
    try {
      let outputWidth = resolution;
      let outputHeight = resolution;

      switch (aspect) {
        case 1 / 1:
          outputWidth = resolution;
          outputHeight = resolution;
          break;
        case 2 / 3:
          outputWidth = (resolution * 2) / 3;
          outputHeight = resolution;
          break;
        case 3 / 2:
          outputWidth = resolution;
          outputHeight = (resolution * 2) / 3;
          break;
        case 16 / 9:
          outputWidth = resolution;
          outputHeight = (resolution * 9) / 16;
          break;
        default:
          outputWidth = resolution;
          outputHeight = resolution;
      }

      return await getCroppedImg(
        tempImageSrc,
        croppedAreaPixels,
        outputWidth,
        outputHeight
      );
    } catch (e) {
      console.error("Error generating cropped image:", e);
      throw e;
    }
  }, [tempImageSrc, croppedAreaPixels, aspect, resolution]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cropped = await generateCroppedImage();
      if (!cropped) throw new Error("Cropped image is null or undefined");

      const formData = new FormData();
      formData.append("picture", cropped, "cropped-image.jpg");
      onImageChange(formData);
      setDialogOpen(false);
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  return (
    <div className='columns-1'>
      <Label className={`${labelClass} ${underLine ? "underline" : ""}`}>
        {label}
      </Label>

      <div className='relative group'>
        <img
          src={imgSrc}
          alt='preview'
          className={`rounded-xl shadow cursor-pointer ${imgClass}`}
          // onClick={() => document.getElementById("image-upload-input").click()}
          onClick={handleImageClick}
        />
        <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100'>
          <span className='text-white font-medium'>Click to change image</span>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        id='image-upload-input'
        type='file'
        accept='image/*'
        onChange={handleFileUpload}
        className='hidden'
      />

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className='max-w-[400px] p-4 gap-2'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-md font-semibold'>
              Crop Your Picture
            </AlertDialogTitle>
          </AlertDialogHeader>

          <Separator />
          <div>
            <p className='text-sm text-center text-muted-foreground mb-2'>
              Choose aspect ratio:
            </p>
            <div className='grid grid-cols-4 gap-3'>
              {[
                { value: "1x1", label: "1:1", width: 40, height: 40 },
                { value: "3x2", label: "3:2", width: 40, height: 26.5 },
                { value: "2x3", label: "2:3", width: 26.5, height: 40 },
                { value: "16x9", label: "16:9", width: 40, height: 22.5 },
              ].map((option) => (
                <AspectRatioOption
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  width={option.width}
                  height={option.height}
                  isSelected={selectedAspect === option.value}
                  onClick={() => handleAspectChange(option.value)}
                />
              ))}
            </div>
          </div>
          <Separator />

          {tempImageSrc && (
            <div
              className='relative rounded-lg overflow-hidden bg-checkerboard'
              style={{ height: "220px", width: "100%" }}>
              <Cropper
                image={tempImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit='contain'
              />
            </div>
          )}

          <div className='m-0'>
            <label className='text-sm text-muted-foreground'>
              Zoom: {zoom.toFixed(1)}x
            </label>
            <input
              type='range'
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby='Zoom'
              onChange={(e) => setZoom(Number(e.target.value))}
              className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
            />
          </div>

          <AlertDialogFooter className='mt-0'>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className='bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'>
              Apply & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function AspectRatioOption({
  value,
  label,
  width,
  height,
  isSelected,
  onClick,
}) {
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
          : "border-border bg-background hover:border-primary/30"
      )}>
      <div className='flex justify-center mb-0'>
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            maxWidth: "100%",
          }}
          className={cn(
            "relative bg-muted rounded-md overflow-hidden",
            isSelected ? "bg-primary/20" : "bg-muted"
          )}>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className='absolute inset-0 flex items-center justify-center'>
              <Check className='w-6 h-6 text-primary' />
            </motion.div>
          )}
        </div>
      </div>
      <span
        className={cn(
          "text-sm font-medium",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}>
        {label}
      </span>
    </motion.div>
  );
}

FormImageHandler.propTypes = {
  onImageChange: PropTypes.func.isRequired,
  imgSrc: PropTypes.string,
  label: PropTypes.string,
  labelClass: PropTypes.string,
  imgClass: PropTypes.string,
  resolution: PropTypes.number,
  underLine: PropTypes.bool,
};

AspectRatioOption.propTypes = {
  value: PropTypes.any,
  label: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
};

export default FormImageHandler;
