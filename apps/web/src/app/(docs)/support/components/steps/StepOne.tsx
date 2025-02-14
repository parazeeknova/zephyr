import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { SUPPORT_TYPES } from '../../constants';
import type { StepProps } from '../../types';

export function StepOne({ formData, setFormData, onNext }: StepProps) {
  return (
    <motion.div
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-4"
    >
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Basic Information</h3>
        <p className="text-muted-foreground text-sm">
          Let's start with your contact information
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Your email address"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full bg-background/50 backdrop-blur-sm"
        />

        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm">
            <SelectValue placeholder="Type of support needed" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="button"
            className="w-full"
            onClick={onNext}
            disabled={!formData.email || !formData.type}
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
};
