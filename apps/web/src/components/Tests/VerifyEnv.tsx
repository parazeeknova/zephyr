import type React from "react";
import { useEffect } from "react";

const VerifyEnv: React.FC = () => {
  useEffect(() => {
    console.log(
      "NEXT_PUBLIC_UPLOADTHING_APP_ID:",
      process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID
    );
  }, []);

  return null;
};

export default VerifyEnv;
