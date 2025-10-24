## 🚀 Quick Start
This directory contains all icon components use in the application. It's better to put icons here instead of importing them from a library for each component so that changing an icon here is easier and would result in a more consistent ui across the application

## 🚀 Creating a New Icon

### Step 1: Get the SVG

Get your icon from [Lucide Icons](https://lucide.dev), [Heroicons](https://heroicons.com), or your design team.

### Step 2: Create the Component

```typescript
import type { IconProps } from './icon-props';

export default function ChevronRight({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
```

```typescript
import type { IconProps } from './icon-props'
import { Eye } from 'lucide-react'

export default function EyeIcon({ className }: IconProps) {
  return <Eye className={className} />
}
```
