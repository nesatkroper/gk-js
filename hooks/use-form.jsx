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

  const handleImageData = (fieldNameOrEvent, fileSource) => {
    let fieldName = "picture"
    let fileData = fileSource

    if (typeof fieldNameOrEvent === "string") {
      fieldName = fieldNameOrEvent
    } else if (fieldNameOrEvent?.target) {
      fieldName = fieldNameOrEvent.target.name || "picture"
      fileData = fieldNameOrEvent.target.files?.[0] || null
    } else if (fieldNameOrEvent instanceof File || fieldNameOrEvent === null) {
      fileData = fieldNameOrEvent
    } else if (fieldNameOrEvent instanceof FormData) {
      fileData = fieldNameOrEvent.get(fieldName) || fieldNameOrEvent.get("file") || null
    }

    if (fileData !== null && !(fileData instanceof File) && typeof fileData !== "string") {
      console.warn("handleImageData: invalid file data", fileData)
      return
    }

    setFormData((prev) => ({
      ...prev,
      [fieldName]: fileData,
    }))
  }

  const handleMultipleImages = (filesData) => {
    const updates = {}

    for (const [fieldName, fileData] of Object.entries(filesData)) {
      if (fileData === null || fileData instanceof File) {
        updates[fieldName] = fileData
      } else {
        console.warn(`Invalid file data for field ${fieldName}`, fileData)
      }
    }

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }))
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

    return {
      data,
      files,
      file: files.picture || files.file || null,
    }
  }

  const getFormDataForSubmission = () => {
    const submissionFormData = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          submissionFormData.append(key, value)
        } else if (typeof value === "object" && !(value instanceof File)) {
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
    handleMultipleImages,
    getSubmissionData,
    getFormDataForSubmission,
  }
}



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

//   const handleImageData = (fieldNameOrEvent, fileSource) => {
//     let fieldName = "picture" 
//     let fileData = fileSource

//     if (typeof fieldNameOrEvent === "string") {
//       fieldName = fieldNameOrEvent
//     } else if (fieldNameOrEvent?.target) {
//       fieldName = fieldNameOrEvent.target.name || "picture"
//       fileData = fieldNameOrEvent.target.files?.[0] || null
//     } else if (fieldNameOrEvent instanceof File || fieldNameOrEvent === null) {
//       fileData = fieldNameOrEvent
//     } else if (fieldNameOrEvent instanceof FormData) {
//       fileData = fieldNameOrEvent.get(fieldName) || fieldNameOrEvent.get("file") || null
//     }

//     if (fileData !== null && !(fileData instanceof File)) {
//       console.warn("handleImageData: invalid file data", fileData)
//       return
//     }

//     setFormData((prev) => ({
//       ...prev,
//       [fieldName]: fileData,
//     }))
//   }

//   const handleMultipleImages = (filesData) => {
//     const updates = {}

//     for (const [fieldName, fileData] of Object.entries(filesData)) {
//       if (fileData === null || fileData instanceof File) {
//         updates[fieldName] = fileData
//       } else {
//         console.warn(`Invalid file data for field ${fieldName}`, fileData)
//       }
//     }

//     setFormData((prev) => ({
//       ...prev,
//       ...updates,
//     }))
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

//     return {
//       data,
//       files,
//       file: files.picture || files.file || null
//     }
//   }

//   const getFormDataForSubmission = () => {
//     const submissionFormData = new FormData()

//     Object.entries(formData).forEach(([key, value]) => {
//       if (value !== null && value !== undefined) {
//         if (value instanceof File) {
//           submissionFormData.append(key, value)
//         } else if (typeof value === 'object' && !(value instanceof File)) {
//           submissionFormData.append(key, JSON.stringify(value))
//         } else {
//           submissionFormData.append(key, value)
//         }
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
//     handleMultipleImages,
//     getSubmissionData,
//     getFormDataForSubmission,
//   }
// }


