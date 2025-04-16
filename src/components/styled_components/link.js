import Link from "next/link";

export default function StyledLink({children, className, ...props}) {
  return (
    <Link
      {...props}
      className={`hover:italic hover:no-underline underline underline-offset-2 cursor-pointer ${className && className}`}
    >
      {children}
    </Link>
  );
}
