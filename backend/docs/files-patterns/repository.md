> _**Observation:**_  
> _You will need to replace "Any" with the correct names when writing the files._

## Example usage in any.service.ts
```ts

const initAny = AnyAggregate.init({ ... });
...

const any = initAny.result as AnyAggregate;

await this.anyRepository.save(any);

```

## any-repository.interface.ts
```ts
import { IdValueObject } from "ddd-tool-kit";
import { AnyAggregate } from "../../../domain/aggregate/any.aggregate-root";
import { NameValueObject } from "../../../domain/value-objects/name/name.value-object";

interface AnyRepository {
  save(any: AnyAggregate): Promise<void>;
  findById(id: IdValueObject): Promise<AnyAggregate | null>;
  findByName(name: NameValueObject): Promise<AnyAggregate | null>;
}

export { AnyRepository };
```

## Implementation in Mongoose: mongoose.any-repository.ts
```ts
import { Model } from "mongoose";
import { IBidirectionalMapper, IdValueObject } from "ddd-tool-kit";

import { AnyRepository } from "../any.repository";
import { IAnySchema } from "../../../schema/any.schema";
import { AnyAggregate } from "../../../../domain/any.aggregate-root";
import { NameValueObject } from "../../../../domain/value-objects/name/name.value-object";

class AnyMongooseRepository implements AnyRepository {
  constructor(
    private readonly AnyModel: Model<IAnySchema>,
    private readonly AnyMapper: IBidirectionalMapper<
      IAnySchema,
      AnyAggregate
    >,
  ) {}

  async findById(id: IdValueObject): Promise<AnyAggregate | null> {
    const anySchema = await this.AnyModel.findOne({ id: id.value });

    if (!anySchema) return null;

    return this.AnyMapper.toRightSide(anySchema);
  }

  async findByName(
    name: NameValueObject,
  ): Promise<AnyAggregate | null> {
    const anySchema = await this.AnyModel.findOne({
      name: name.value,
    });

    if (!anySchema) return null;

    return this.AnyMapper.toRightSide(anySchema);
  }

  async save(any: AnyAggregate): Promise<void> {
    const alreadyExists = await this.AnyModel.exists({ id: any.id.value });
    const anySchema = this.AnyMapper.toLeftSide(any);

    if (!alreadyExists) {
      await this.AnyModel.insertOne(anySchema);
    } else {
      anySchema.updatedAt = new Date();
      await this.AnyModel.replaceOne({ id: anySchema.id }, anySchema);
    }
  }
}

export { AnyMongooseRepository };

```