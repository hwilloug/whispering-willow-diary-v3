import { generateReactHelpers } from "@uploadthing/react";
 
import type { OurFileRouter } from "@/server/uploadthing";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

export { UploadButton, UploadDropzone } from "@uploadthing/react"; 