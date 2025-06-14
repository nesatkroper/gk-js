import { useState } from "react";

export const useFormHandler = (initialValues) => {
  const [formData, setFormData] = useState(initialValues);

  const handleChange = (eventOrName, value) => {
    if (typeof eventOrName === "string") {
      setFormData((prev) => ({ ...prev, [eventOrName]: value }));
    } else if (eventOrName.target) {
      const { name, value } = eventOrName.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageData = (formDataFromComponent) => {
    const imageFile = formDataFromComponent.get("picture");
    if (imageFile) {
      setFormData((prev) => ({
        ...prev,
        picture: imageFile,
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialValues);
  };

  const getFormDataForSubmission = () => {
    const submissionFormData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionFormData.append(key, value);
    });
    return submissionFormData;
  };

  return {
    formData,
    handleChange,
    setFormData,
    resetForm,
    handleImageData,
    getFormDataForSubmission,
  };
};
