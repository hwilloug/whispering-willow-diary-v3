import { auth } from "@clerk/nextjs/server";

export const getServerAuthSession = () => {
  const session = auth();
  if (!session.userId) return null;
  
  return {
    user: {
      id: session.userId
    }
  };
}; 