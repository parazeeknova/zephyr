import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FileAudioIcon, FileCode, FileIcon, ImageIcon } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";

interface FileInputProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

type FileButtonType = "image" | "audio" | "document" | "code";

interface FileButtonProps {
  icon:
    | typeof ImageIcon
    | typeof FileAudioIcon
    | typeof FileIcon
    | typeof FileCode;
  label: string;
  type: FileButtonType;
  accept: string;
  inputRef: RefObject<HTMLInputElement>;
  buttonType: FileButtonType;
  capture?: string;
}

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

export function FileInput({ onFilesSelected, disabled }: FileInputProps) {
  const isMobile = useIsMobile();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const [hoveredButton, setHoveredButton] = useState<FileButtonType | null>(
    null
  );

  const handleFileSelect = (files: FileList | null) => {
    const fileArray = Array.from(files || []);
    if (fileArray.length) {
      onFilesSelected(fileArray);
    }
  };

  const FileButton = ({
    icon: Icon,
    label,
    type,
    accept,
    inputRef,
    buttonType,
    capture
  }: FileButtonProps) => {
    const ButtonContent = (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative overflow-hidden transition-all duration-300 ease-in-out",
          "hover:scale-110 active:scale-95",
          "before:absolute before:inset-0 before:z-0 before:opacity-0 before:transition-opacity",
          "before:duration-300 before:ease-in-out hover:before:opacity-100",
          hoveredButton === buttonType ? "ring-2 ring-primary" : "",
          buttonType === "image" &&
            "before:bg-gradient-to-r before:from-pink-500/10 before:to-purple-500/10",
          buttonType === "audio" &&
            "before:bg-gradient-to-r before:from-blue-500/10 before:to-cyan-500/10",
          buttonType === "document" &&
            "before:bg-gradient-to-r before:from-green-500/10 before:to-emerald-500/10",
          buttonType === "code" &&
            "before:bg-gradient-to-r before:from-orange-500/10 before:to-amber-500/10",
          disabled && "cursor-not-allowed opacity-50"
        )}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => !isMobile && setHoveredButton(type)}
        onMouseLeave={() => !isMobile && setHoveredButton(null)}
      >
        <Icon
          size={20}
          className={cn(
            "relative z-10 text-muted-foreground transition-transform duration-300",
            hoveredButton === buttonType && "rotate-12 transform"
          )}
        />
        <span
          className={cn(
            "absolute inset-0 z-0 bg-gradient-to-r opacity-0 transition-opacity duration-300",
            hoveredButton === buttonType && "opacity-10"
          )}
        />
      </Button>
    );

    return (
      <>
        {isMobile ? (
          <>
            {ButtonContent}
            <input
              type="file"
              accept={accept}
              // @ts-expect-error
              capture={capture}
              multiple
              ref={inputRef}
              className="sr-only"
              onChange={(e) => {
                handleFileSelect(e.target.files);
                e.target.value = "";
              }}
            />
          </>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>{ButtonContent}</TooltipTrigger>
            <TooltipContent
              className={cn(
                "fade-in-50 zoom-in-95 animate-in",
                "bg-gradient-to-r shadow-lg",
                buttonType === "image" && "from-pink-500/5 to-purple-500/5",
                buttonType === "audio" && "from-blue-500/5 to-cyan-500/5",
                buttonType === "document" &&
                  "from-green-500/5 to-emerald-500/5",
                buttonType === "code" && "from-orange-500/5 to-amber-500/5"
              )}
            >
              <p className="font-medium">{label}</p>
            </TooltipContent>
            <input
              type="file"
              accept={accept}
              // @ts-expect-error
              capture={capture}
              multiple
              ref={inputRef}
              className="sr-only"
              onChange={(e) => {
                handleFileSelect(e.target.files);
                e.target.value = "";
              }}
            />
          </Tooltip>
        )}
      </>
    );
  };

  return (
    <>
      {isMobile ? (
        <div className="flex items-center gap-3">
          <FileButton
            icon={ImageIcon}
            label="Photos & Videos"
            type="image"
            accept="image/*,video/*,.png,.jpg,.jpeg,.gif,.mp4,.mov,.avi"
            capture="environment"
            // @ts-expect-error
            inputRef={imageInputRef}
            buttonType="image"
          />
          <FileButton
            icon={FileAudioIcon}
            label="Audio Files"
            type="audio"
            accept="audio/*,.mp3,.wav,.ogg,.m4a"
            capture="user"
            // @ts-expect-error
            inputRef={audioInputRef}
            buttonType="audio"
          />
          <FileButton
            icon={FileIcon}
            label="Documents"
            type="document"
            accept=".pdf,.doc,.docx,.txt,.md"
            // @ts-expect-error
            inputRef={documentInputRef}
            buttonType="document"
          />
          <FileButton
            icon={FileCode}
            label="Code Files"
            type="code"
            accept=".ts,.tsx,.js,.jsx,.html,.css,.scss,.less,.json,.md,.py,.java,.c,.cpp,.cs,.rb,.php,.rs,.go,.kt,.swift,.xml,.yaml,.yml,.sql"
            // @ts-expect-error
            inputRef={codeInputRef}
            buttonType="code"
          />
        </div>
      ) : (
        <TooltipProvider>
          <div className="flex items-center gap-3">
            <FileButton
              icon={ImageIcon}
              label="Photos & Videos"
              type="image"
              accept="image/*,video/*,.png,.jpg,.jpeg,.gif,.mp4,.mov,.avi"
              capture="environment"
              // @ts-expect-error
              inputRef={imageInputRef}
              buttonType="image"
            />
            <FileButton
              icon={FileAudioIcon}
              label="Audio Files"
              type="audio"
              accept="audio/*,.mp3,.wav,.ogg,.m4a"
              capture="user"
              // @ts-expect-error
              inputRef={audioInputRef}
              buttonType="audio"
            />
            <FileButton
              icon={FileIcon}
              label="Documents"
              type="document"
              accept=".pdf,.doc,.docx,.txt,.md"
              // @ts-expect-error
              inputRef={documentInputRef}
              buttonType="document"
            />
            <FileButton
              icon={FileCode}
              label="Code Files"
              type="code"
              accept=".ts,.tsx,.js,.jsx,.html,.css,.scss,.less,.json,.md,.py,.java,.c,.cpp,.cs,.rb,.php,.rs,.go,.kt,.swift,.xml,.yaml,.yml,.sql"
              // @ts-expect-error
              inputRef={codeInputRef}
              buttonType="code"
            />
          </div>
        </TooltipProvider>
      )}
    </>
  );
}
