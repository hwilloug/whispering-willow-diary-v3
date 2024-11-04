import { appRouter } from "@/server"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({
      userId: null,
      req: req as any // Type assertion to NextApiRequest
    })
  })
}
export { handler as GET, handler as POST }