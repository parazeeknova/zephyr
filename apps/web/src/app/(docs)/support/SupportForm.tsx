"use client";

import { FossBanner } from "@/components/misc/foss-banner";
import {} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatedZephyrText } from "./components/AnimatedZephyrText";
import { GithubIssueButton } from "./components/GithubIssueButton";
import { StepIndicator } from "./components/StepIndicator";
import { StepOne, StepThree, StepTwo } from "./components/steps";
import type { Attachment } from "./types";

export default function SupportForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [formData, setFormData] = useState({
    email: "",
    type: "",
    category: "",
    priority: "medium",
    subject: "",
    message: "",
    os: navigator.platform,
    browser: navigator.userAgent
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedFiles = [];
      for (const file of attachments) {
        const formData = new FormData();
        formData.append("file", file.file);

        const response = await fetch("/api/support/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("Failed to upload attachments");
        }

        const data = await response.json();
        uploadedFiles.push({
          url: data.url,
          key: data.key,
          name: file.name,
          type: file.type
        });
      }

      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          attachments: uploadedFiles
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      toast({
        title: "Message sent successfully",
        description: "We'll get back to you as soon as possible."
      });

      setFormData({
        email: "",
        type: "",
        category: "",
        priority: "medium",
        subject: "",
        message: "",
        os: navigator.platform,
        browser: navigator.userAgent
      });
      setAttachments([]);
      setStep(1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const maxFiles = 3;
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain"
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (attachments.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`
      });
      return;
    }

    for (const file of Array.from(files)) {
      try {
        if (!file.type || !allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: "Please upload images, PDFs, or text files only"
          });
          continue;
        }

        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: "Files must be less than 5MB"
          });
          continue;
        }

        // Create FormData
        const formData = new FormData();
        formData.append("file", file); // Append the actual file
        formData.append("fileName", file.name);
        formData.append("fileType", file.type);

        const response = await fetch("/api/support/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();

        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            file,
            url: data.url,
            key: data.key,
            originalName: data.originalName,
            size: data.size,
            type: data.type,
            isUploading: false
          }
        ]);

        toast({
          title: "Success",
          description: "File uploaded successfully"
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload file",
          variant: "destructive"
        });
      }
    }
  };

  const formContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  useEffect(() => {
    return () => {
      // biome-ignore lint/complexity/noForEach: This is a cleanup function
      attachments.forEach((attachment) => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, []);

  return (
    <div className="relative">
      <Link
        href="/"
        className="fixed top-8 left-8 flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={formContainerVariants}
        className="mx-auto mt-8 max-w-2xl"
      >
        <div className="rounded-xl border bg-card/30 p-6 shadow-lg backdrop-blur-md">
          <StepIndicator currentStep={step} totalSteps={3} />
          <GithubIssueButton />

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <StepOne
                  formData={formData}
                  setFormData={setFormData}
                  onNext={() => setStep(2)}
                />
              )}
              {step === 2 && (
                <StepTwo
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              )}
              {step === 3 && (
                <StepThree
                  formData={formData}
                  setFormData={setFormData}
                  // @ts-expect-error
                  fileInputRef={fileInputRef}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  loading={loading}
                  handleFileUpload={handleFileUpload}
                  onBack={() => setStep(2)}
                />
              )}
            </AnimatePresence>

            <motion.div
              className="h-2 w-full overflow-hidden rounded-full bg-muted/50 backdrop-blur-sm"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
            >
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "33.33%" }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </form>
        </div>

        <FossBanner className="mt-6" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-lg border bg-card/30 p-4 text-muted-foreground text-sm backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Privacy Notice</span>
          </div>
          <p className="mt-2">
            To prevent abuse and ensure service quality, we collect and store
            certain information including browser details and
            sumuted-foregroundissionsm timestamps. This data is used solely for
            rate limiting and system improvements.
          </p>
        </motion.div>
      </motion.div>

      <AnimatedZephyrText className="fixed right-8 bottom-8" />
    </div>
  );
}
