import { AuthOptions, Session, User } from "next-auth";

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/login",
  },
};
