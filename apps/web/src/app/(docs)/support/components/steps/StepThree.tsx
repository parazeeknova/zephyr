import { Button } from '@zephyr/ui/shadui/button';
import { Textarea } from '@zephyr/ui/shadui/textarea';
import { motion } from 'framer-motion';
import { Loader2, Upload } from 'lucide-react';
import type { StepThreeProps } from '../../types';
import { SupportMediaPreview } from '../SupportMediaPreview';
import { stepVariants } from './variants';

export function StepThree({
  formData,
  setFormData,
  onBack,
  loading,
  attachments,
  fileInputRef,
  handleFileUpload,
  setAttachments,
}: StepThreeProps) {
  return (
    <motion.div
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-4"
    >
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Additional Information</h3>
        <p className="text-muted-foreground text-sm">
          Provide more details and any relevant files
        </p>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="Describe your issue or suggestion in detail..."
          required
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          className="min-h-[200px] w-full bg-background/50 backdrop-blur-sm"
        />

        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) {
                console.log('Files selected:', {
                  count: files.length,
                  details: Array.from(files).map((f) => ({
                    name: f.name,
                    type: f.type,
                    size: f.size,
                  })),
                });
                handleFileUpload(files);
              }
            }}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          <Button
            type="button"
            variant="outline"
            className="w-full bg-background/50 backdrop-blur-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled
          >
            <Upload className="mr-2 h-4 w-4" />
            Attach Files (We are working on this feature)
          </Button>
          {attachments.length > 0 && (
            <SupportMediaPreview
              attachments={attachments}
              onRemove={(index) => {
                setAttachments(attachments.filter((_, i) => i !== index));
              }}
            />
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="bg-background/50 backdrop-blur-sm"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading || !formData.message}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
