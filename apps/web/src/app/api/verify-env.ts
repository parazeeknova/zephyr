import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  console.log(
    "NEXT_PUBLIC_UPLOADTHING_APP_ID:",
    process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID
  );
  res
    .status(200)
    .json({ message: "Check server logs for environment variable values" });
}
