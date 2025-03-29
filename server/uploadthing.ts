import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 }
  })
    .middleware(async () => {
      const session = auth();
      if (!session.userId) throw new Error("Unauthorized");
      return { userId: session.userId };
    })
    .onUploadComplete(() => {
      // This code RUNS ON YOUR SERVER after upload
      return { success: true };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 