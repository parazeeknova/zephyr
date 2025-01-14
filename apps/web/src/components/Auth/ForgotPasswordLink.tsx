"use client";

import resetPasswordImage from "@zephyr-assets/previews/passwordreset.png";
import { HelpLink } from "../Animations/ImageLinkPreview";

export default function ForgotPasswordLink() {
  return (
    <HelpLink
      href="/reset-password"
      text="Forgot your password?"
      previewImage={resetPasswordImage.src}
    />
  );
}
