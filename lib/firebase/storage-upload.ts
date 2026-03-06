import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage"
import { getFirebaseClientApp } from "@/lib/firebase/client"

export async function uploadImageToStorage(
  file: File,
  folder: "campaigns" | "news" | "media" | "general",
  onProgress?: (percent: number) => void,
): Promise<string> {
  const storage = getStorage(getFirebaseClientApp())
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  const storageRef = ref(storage, `uploads/${folder}/${filename}`)

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        onProgress?.(percent)
      },
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        resolve(url)
      },
    )
  })
}
