export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string);

// 👀 TAMBAHKAN DUA BARIS INI UNTUK DEBUGGING:
  console.log("Mencoba fetch ke URL:", url);
  console.log("Dengan Preset:", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) throw new Error("Gagal mengunggah gambar");
  const data = await res.json();
  return data.secure_url;
};
