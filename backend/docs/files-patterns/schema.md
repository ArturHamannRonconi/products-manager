> _**Observation:**_  
> _You will need to replace "Any" with the correct names when writing the files._

## any.schema.ts
```ts
import { Schema } from "mongoose";
import { IAny2Schema, Any2Schema } from "./any2.schema";

interface IAnySchema {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  password: string;
  anys: IAny2Schema[];
}

const AnySchema = new Schema<IAnySchema>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  anys: { type: [Any2Schema], required: true },
});

AnySchema.index({ id: 1 });
AnySchema.index({ name: 1 });

export { AnySchema, IAnySchema };

```