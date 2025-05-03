import Heading from "@/components/styled_components/heading";
import Footer from "@/components/footer";

import AuthButton from "@/components/auth/button";

import ConnectStatusChip from "@/components/user_table/connect_status_chip";
import UserTable from "@/components/user_table";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-mono)]">
      <div>
        <Heading level={1}>Locked In</Heading>
        <Heading level={2}>An app by John Tan-Aristy</Heading>
        <p className="text-sm">
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
          faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi
          pretium tellus duis convallis. Tempus leo eu aenean sed diam urna
          tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
          Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut
          hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent
          per conubia nostra inceptos himenaeos.
        </p>
      </div>
      <div className="w-full">
        <UserTable/>
      </div>
      <Footer />
      <div className="flex gap-1"><AuthButton/><ConnectStatusChip/></div>
      
    </div>
  );
}
