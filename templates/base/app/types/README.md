## 🚀 Quick Start
This directory is for defining global types and schemas used throughout the application.

### Creating a Schema

```typescript
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be 18 or older').optional(),
});

export type User = z.infer<typeof userSchema>;
```

### Custom Type
```typescript
export type CustomType = {
  id: string;
  name: string;
  age: number;
};
```
