import NextAuth from "next-auth";
import { authOptions } from "./authOptions";

const handler = NextAuth(authOptions);

// App Router expects GET/POST route handlers
export { handler as GET, handler as POST };