import { auth, signIn } from "@/app/auth";
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
    </div>
  )
}
