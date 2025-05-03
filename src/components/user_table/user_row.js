import StyledLink from "../styled_components/link";

function NameChip({ name, linkedin_profile }) {
  return (
    <div className="flex justify-center">
      <StyledLink href={linkedin_profile} className={"flex gap-1"}>
        <div className="w-6 h-6 bg-amber-700 rounded-full" />
        <span>{name && name}</span>
      </StyledLink>
    </div>
  );
}

export function UserRow({ name, role, email, active, time_connected }) {
    const formatDate = (d) =>
      `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} @ ${
        ((d.getHours() + 11) % 12) + 1
      }:${d.getMinutes().toString().padStart(2, "0")}${
        d.getHours() >= 12 ? "pm" : "am"
      }`;
    return (
      <tr className="gap-4">
        <td>
          <div className="flex justify-center">
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="aspect-square w-3 rounded-xs border-gray border-2 peer-checked:bg-blue-600 peer-checked:border-blue-600">
                <svg
                  className="w-3 h-3 text-white hidden peer-checked:block"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </label>
          </div>
        </td>
        <td>
          <div className="flex justify-center">
            <NameChip name={name} linkedin_profile={""} />
          </div>
        </td>
        <td>
          <div className="flex justify-center">
            <span>{role && role}</span>
          </div>
        </td>
        <td>
          <div className="flex justify-center">
            <span>{email && email}</span>
          </div>
        </td>
        <td>
          <div className="flex justify-center">
            {active ? (
              <div className="flex gap-1 items-center">
                <div className="w-4 h-4 bg-success-green rounded-full" />
                <span>Active</span>
              </div>
            ) : (
              <div className="flex gap-1 items-center">
                <div className="w-4 h-4 bg-failure-red rounded-full" />
                <span>Inactive</span>
              </div>
            )}
          </div>
        </td>
  
        <td>
          <div className="flex justify-center">
            <span>{time_connected && formatDate(time_connected)}</span>
          </div>
        </td>
      </tr>
    );
  }