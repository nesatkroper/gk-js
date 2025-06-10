/**
 * Uploads a file to the server and returns the URL
 */
export const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
  
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
  
    if (!response.ok) {
      throw new Error("Failed to upload file")
    }
  
    const data = await response.json()
    return data.url
  }
  
  /**
   * Handles multiple file uploads for different fields
   */
  export const handleFileUploads = async (
    data: Record<string, any>,
    files: Record<string, File | undefined>,
  ): Promise<Record<string, any>> => {
    const updatedData = { ...data }
  
    // Process each file upload in parallel
    const uploadPromises = Object.entries(files)
      .filter(([_, file]) => file !== undefined)
      .map(async ([fieldName, file]) => {
        if (file) {
          const url = await uploadFile(file)
          return { fieldName, url }
        }
        return null
      })
  
    const results = await Promise.all(uploadPromises)
  
    // Update data with file URLs
    results.forEach((result) => {
      if (result) {
        updatedData[result.fieldName] = result.url
      }
    })
  
    return updatedData
  }
  