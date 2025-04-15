import Link from "next/link";

export default function Footer({}) {
  return (
    <footer>
      <span>
        <Link
          href={"/faq"}
          className="hover:italic underline underline-offset-2 cursor-pointer"
        >
          FAQ
        </Link>{" "}
        •{" "}
        <Link
          href={"/donate"}
          className="hover:italic underline underline-offset-2 cursor-pointer"
        >
          DONATE
        </Link>{" "}
        •{" "}
        <Link
          href={"/terms-of-service"}
          className="hover:italic underline underline-offset-2 cursor-pointer"
        >
          TERMS OF SERVICE
        </Link>{" "}
        •{" "}
        <Link
          href={"/terms-of-service"}
          className="hover:italic underline underline-offset-2 cursor-pointer"
        >
          PRIVACY POLICY
        </Link>
      </span>
    </footer>
  );
}
