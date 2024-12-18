import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-medium text-primary">
          Step {currentStep}/{totalSteps}
        </span>
        <div className="h-2 w-2 rounded-full bg-primary/50" />
      </div>
      <motion.div
        className="text-muted-foreground text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {currentStep === 1 && "Basic Information"}
        {currentStep === 2 && "Request Details"}
        {currentStep === 3 && "Additional Information"}
      </motion.div>
    </div>
  );
}
