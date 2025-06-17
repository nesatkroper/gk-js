export const getCroppedImg = (
  imageSrc,
  croppedAreaPixels,
  outputWidth,
  outputHeight
) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(
              new File([blob], "cropped-image.jpg", { type: "image/jpeg" })
            );
          } else {
            reject(new Error("Canvas is empty!"));
          }
        },
        "image/jpeg",
        1
      );
    };

    image.onerror = (error) => {
      reject(error);
    };
  });
};
