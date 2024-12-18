export interface FormData {
  email: string;
  type: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
  os: string;
  browser: string;
}

export interface StepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
}

export interface Attachment {
  name: any;
  file: File;
  url: string;
  key: string;
  originalName: string;
  size: number;
  type: string;
  isUploading: boolean;
  previewUrl?: string;
}

export interface StepThreeProps {
  formData: any;
  setFormData: (data: any) => void;
  onBack?: () => void;
  loading: boolean;
  attachments: Attachment[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (files: FileList) => Promise<void>;
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
}
