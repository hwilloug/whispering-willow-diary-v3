import { appRouter } from "@/server"
import { auth } from "@clerk/nextjs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

function handler(req: Request) {
  const { userId } = auth();
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({
      userId,
      req: req as any // Type assertion to NextApiRequest
    })
  })
}
export { handler as GET, handler as POST }