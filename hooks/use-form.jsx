"use client"

import { useState } from "react"

export const useFormHandler = (initialValues) => {
  const [formData, setFormData] = useState(initialValues)

  const handleChange = (eventOrName, value) => {
    if (typeof eventOrName === "string") {
      setFormData((prev) => ({ ...prev, [eventOrName]: value }))
    } else if (eventOrName?.target) {
      const { name, value } = eventOrName.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageData = (fieldNameOrFormData, formDataMaybe) => {
    let fieldName = "picture"
    let fileSource = fieldNameOrFormData

    if (typeof fieldNameOrFormData === "string") {
      fieldName = fieldNameOrFormData
      fileSource = formDataMaybe
    }

    let imageFile = null

    if (fileSource instanceof FormData) {
      imageFile = fileSource.get(fieldName) || fileSource.get("file") || null
    } else if (fileSource instanceof File) {
      imageFile = fileSource
    } else if (fileSource?.target?.files?.[0]) {
      imageFile = fileSource.target.files[0]
    } else {
      console.warn("handleImageData: invalid input", fileSource)
      return
    }

    if (imageFile instanceof File || imageFile === null) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: imageFile,
      }))
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

    // Handle picture URLs
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === "string" && (key.toLowerCase().includes("picture") || key.toLowerCase().includes("image"))) {
        data[key] = value
      }
    }

    return { 
      data, 
      file: files.picture || files.file || null,
      files 
    }
  }

  const getFormDataForSubmission = () => {
    const submissionFormData = new FormData()
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          submissionFormData.append(key, value)
        } else if (typeof value === 'object') {
          submissionFormData.append(key, JSON.stringify(value))
        } else {
          submissionFormData.append(key, value)
        }
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
    getSubmissionData,
    getFormDataForSubmission,
  }
}

// "use client"

// import { useState } from "react"

// export const useFormHandler = (initialValues) => {
//   const [formData, setFormData] = useState(initialValues)

//   const handleChange = (eventOrName, value) => {
//     if (typeof eventOrName === "string") {
//       setFormData((prev) => ({ ...prev, [eventOrName]: value }))
//     } else if (eventOrName?.target) {
//       const { name, value } = eventOrName.target
//       setFormData((prev) => ({ ...prev, [name]: value }))
//     }
//   }

//   const handleImageData = (fieldNameOrFormData, formDataMaybe) => {
//     let fieldName = "picture"
//     let fileSource = fieldNameOrFormData

//     // Determine if field name is passed
//     if (typeof fieldNameOrFormData === "string") {
//       fieldName = fieldNameOrFormData
//       fileSource = formDataMaybe
//     }

//     let imageFile = null

//     if (fileSource instanceof FormData) {
//       imageFile = fileSource.get("picture") || fileSource.get("file")
//     } else if (fileSource instanceof File) {
//       imageFile = fileSource
//     } else {
//       console.error("handleImageData: invalid input", fileSource)
//       return
//     }

//     if (imageFile instanceof File) {
//       setFormData((prev) => ({
//         ...prev,
//         [fieldName]: imageFile,
//       }))
//     } else {
//       console.warn("handleImageData: no valid file found")
//     }
//   }

//   const resetForm = () => {
//     setFormData(initialValues)
//   }

//   const getSubmissionData = () => {
//     const data = {}
//     const files = {}

//     for (const [key, value] of Object.entries(formData)) {
//       if (value instanceof File) {
//         files[key] = value
//       } else {
//         data[key] = value
//       }
//     }

//     // Backward compatibility: preserve URL string if already uploaded
//     for (const [key, value] of Object.entries(formData)) {
//       if (typeof value === "string" && key.toLowerCase().includes("picture")) {
//         data[key] = value
//       }
//     }

//     return { data, file: files.picture ?? null }
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
//     getSubmissionData,
//     getFormDataForSubmission,
//   }
// }








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

