// hooks/usePermissions.ts
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ FIXED: use `next/navigation`

type Permissions = {
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
};

export const usePermissions = () => {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permissions>({});

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("permissions="))
      ?.split("=")[1];

    if (cookie) {
      try {
        const decoded = JSON.parse(decodeURIComponent(cookie));
        localStorage.setItem("permissions", JSON.stringify(decoded));
        setPermissions(decoded);
      } catch (error) {
        console.error("Invalid permissions cookie", error);
      }
    }
  }, []);

  return permissions;
};
