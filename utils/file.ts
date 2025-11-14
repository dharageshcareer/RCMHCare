/**
 * Converts a File object to a Base64 encoded string.
 * The "data:mime/type;base64," prefix is removed.
 * @param file The file to convert.
 * @returns A promise that resolves with the Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // The result includes the Base64 prefix, which we need to remove.
      // e.g., "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
      const base64String = (reader.result as string).split(',')[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error("Could not extract Base64 string from file."));
      }
    };
    reader.onerror = error => reject(error);
  });
};
