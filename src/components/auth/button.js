import { auth, signIn, signOut } from "@/utils/auth";

export default async function AuthButton() {
  const session = await auth();
  if (!session?.user)
    return (
      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <button type="submit">Signin with Google</button>
      </form>
    );
  return (
    <div>
      <span>Welcome, {session.user?.name}</span>
      <span
        onClick={async () => {
          "use server";
          await signOut();
        }}
      >
        Log out
      </span>
    </div>
  );
}
