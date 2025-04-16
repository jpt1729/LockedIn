import StyledLink from "../styled_components/link";

export default function Footer({}) {
  return (
    <footer className="flex items-end flex-col gap-2">
      <div>
        <span>
          <StyledLink href={"/faq"}>FAQ</StyledLink> •{" "}
          <StyledLink href={"/donate"}>DONATE</StyledLink> •{" "}
          <StyledLink href={"/terms-of-service"}>TERMS OF SERVICE</StyledLink> •{" "}
          <StyledLink href={"/terms-of-service"}>PRIVACY POLICY</StyledLink>
        </span>
      </div>
      <div>
        <span>Copyright {new Date().getFullYear()} John Tan-Aristy</span>
      </div>
      <div>
        <span className="text-gray">Build: {process.env.NEXT_PUBLIC_BUILD_ID || 'ea5d6f092b9b23abb6b4fa1503ac4d03ae7ccd72'}</span>
      </div>
    </footer>
  );
}
