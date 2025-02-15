import { Button } from '@zephyr/ui/shadui/button';
import { Input } from '@zephyr/ui/shadui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@zephyr/ui/shadui/select';
import { motion } from 'framer-motion';
import { CATEGORIES, PRIORITIES } from '../../constants';
import type { StepProps } from '../../types';
import { stepVariants } from './variants';

export function StepTwo({ formData, setFormData, onBack, onNext }: StepProps) {
  return (
    <motion.div
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="space-y-4"
    >
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Request Details</h3>
        <p className="text-muted-foreground text-sm">
          Help us understand your request better
        </p>
      </div>

      <div className="space-y-4">
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={formData.priority}
          onValueChange={(value) =>
            setFormData({ ...formData, priority: value })
          }
        >
          <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Subject"
          required
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          className="w-full bg-background/50 backdrop-blur-sm"
        />

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
            type="button"
            className="flex-1"
            onClick={onNext}
            disabled={!formData.category || !formData.subject}
          >
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
