"use client"

import { useState } from "react"

export const useFormHandler = (initialValues) => {
  const [formData, setFormData] = useState(initialValues)

  const handleChange = (eventOrName, value) => {
    if (typeof eventOrName === "string") {
      setFormData((prev) => ({ ...prev, [eventOrName]: value }))
    } else if (eventOrName.target) {
      const { name, value } = eventOrName.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageData = (fieldName, formDataFromComponent) => {
    let imageFile = null
    if (formDataFromComponent instanceof FormData) {
      // Try common FormData keys
      imageFile = formDataFromComponent.get("picture") || formDataFromComponent.get("file")
    } else if (formDataFromComponent instanceof File) {
      // Fallback: accept File directly
      imageFile = formDataFromComponent
    } else {
      console.error("Invalid formDataFromComponent: Expected FormData or File, got", formDataFromComponent)
      return
    }
    if (imageFile instanceof File) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: imageFile,
      }))
    } else {
      console.warn("No valid file found for field", fieldName)
    }
  }

  const resetForm = () => {
    setFormData(initialValues)
  }

  const getSubmissionData = () => {
    const data = {}
    const files = {}
    for (const [key, value] of Object.entries(formData)) {
      if (value instanceof File) {
        files[key] = value
      } else {
        data[key] = value
      }
    }
    // Preserve picture URL for backward compatibility
    if (typeof formData.picture === "string") {
      data.picture = formData.picture
    }
    return { data, files }
  }

  const getFormDataForSubmission = () => {
    const submissionFormData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        submissionFormData.append(key, value)
      }
    })
    return submissionFormData
  }

  return {
    formData,
    handleChange,
    setFormData,
    resetForm,
    handleImageData,
    getFormDataForSubmission,
    getSubmissionData,
  }
}






// "use client"

// import { useState } from "react"

// export const useFormHandler = (initialValues) => {
//   const [formData, setFormData] = useState(initialValues)

//   const handleChange = (eventOrName, value) => {
//     if (typeof eventOrName === "string") {
//       setFormData((prev) => ({ ...prev, [eventOrName]: value }))
//     } else if (eventOrName.target) {
//       const { name, value } = eventOrName.target
//       setFormData((prev) => ({ ...prev, [name]: value }))
//     }
//   }

//   const handleImageData = (formDataFromComponent) => {
//     const imageFile = formDataFromComponent.get("picture")
//     if (imageFile) {
//       setFormData((prev) => ({
//         ...prev,
//         picture: imageFile,
//       }))
//     }
//   }

//   const resetForm = () => {
//     setFormData(initialValues)
//   }

//   const getSubmissionData = () => {
//     const { picture, ...otherData } = formData

//     const file = picture instanceof File ? picture : null
//     const pictureUrl = typeof picture === "string" ? picture : null

//     return {
//       data: {
//         ...otherData,
//         picture: pictureUrl,
//       },
//       file: file,
//     }
//   }

//   const getFormDataForSubmission = () => {
//     const submissionFormData = new FormData()
//     Object.entries(formData).forEach(([key, value]) => {
//       if (value !== null && value !== undefined) {
//         submissionFormData.append(key, value)
//       }
//     })
//     return submissionFormData
//   }

//   return {
//     formData,
//     handleChange,
//     setFormData,
//     resetForm,
//     handleImageData,
//     getFormDataForSubmission,
//     getSubmissionData,
//   }
// }

