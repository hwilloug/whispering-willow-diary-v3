import { createUploadthing } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import { createRouteHandler } from "uploadthing/next";
import { FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 }
  })
    .middleware(async () => {
      const session = auth();
      if (!session.userId) throw new Error("Unauthorized");
      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { url: file.url };
    })
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Create and export the route handlers
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
}); 