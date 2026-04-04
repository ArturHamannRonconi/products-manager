# Categories — PRD 3

---

## Conventions

> Applies to all PRDs. Never omit.

- Every aggregate, entity, value-object, service, controller, and mapper follows the pattern file from `backend/docs/files-patterns/`.
- `ddd-tool-kit` is the sole source of DDD primitives: `Aggregate`, `Entity`, `ValueObject`, `Output`, `IError`, `IdValueObject`, `DateValueObject`, `IBaseDomainAggregate`, `IBaseDomainEntity`, `IBaseDomainValueObject`, `IBidirectionalMapper`, `IUnidirectionalMapper`, `throwFailOutput`, `throwFailInternalServer`, `verifyAllPropsExists`, `verifyAreValueObjects`, `HttpStatus`.
- Error responses follow `{ status_code, status_name, error_message }` produced by `getCorrectNestjsErrorByOutput(output)`.
- All controllers have `@ApiTags`, `@ApiOperation`, `@ApiResponse`.
- **No `TODO.md` items**: no price-range filter, no sorting.

---

## Overview

Backend-only PRD. Two deliverables:

1. **Categories module** — domain + schema + repository. No HTTP routes — all category creation and deletion happens internally through the Products module (PRD 4). `MongooseCategoryRepository` is exported for injection into product services.

2. **File Providers** — abstract upload interface + two implementations (`S3FileProvider` and `NodeFsFileProvider`) + a NestJS module that injects the right implementation via the `FILE_PROVIDER` token.

No frontend changes in this PRD.

---

## Prerequisites

PRDs 1 and 2 completed:
- `AppModule` running with global `ConfigModule`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` available via `ConfigService`
- `SellersModule` and `CustomersModule` registered

---

## Backend

### Categories Domain

**Location:** `src/modules/categories/domain/`

#### `category.props.ts`
```ts
interface ICategoryProps extends IBaseDomainAggregate {
  name: CategoryNameValueObject;
}
export { ICategoryProps };
```

#### `category.errors.ts`
```ts
export const INVALID_CATEGORY = { message: 'Invalid category props.', statusCode: HttpStatus.BAD_REQUEST };
export const CATEGORY_NOT_FOUND = { message: 'Category not found.', statusCode: HttpStatus.NOT_FOUND };
```

#### `category.aggregate-root.ts`
Follows `aggregate-root.md`.
- No mutation methods — categories are immutable after creation (name never changes).
- `isValidProps()`: `verifyAllPropsExists(["name", ...defaultValueObjects], this)` + `verifyAreValueObjects(["name"], this)`

#### Value Object: `CategoryNameValueObject`

**`value-objects/category-name/`**:
- Props: `IBaseDomainValueObject<string>`
- `isValidProps()`: `this.props.value.length >= 1 && this.props.value.length <= 100`
- `sanitizeProps()`: `this.props.value = this.props.value.trim().toLowerCase()` — **important**: lowercase ensures consistent lookups ("Electronics" and "electronics" resolve to the same category)
- Error: `INVALID_CATEGORY_NAME = { message: "Category name must be between 1 and 100 characters.", statusCode: HttpStatus.BAD_REQUEST }`

**`category-name.value-object.spec.ts`:**
- Valid: 1-char name, 100-char name
- Invalid: empty string
- Sanitization: `"Electronics"` becomes `"electronics"`, leading/trailing spaces removed

---

### Schema

**`src/modules/categories/repositories/categories/schema/category.schema.ts`:**
```ts
interface ICategorySchema {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

const CategorySchema = new Schema<ICategorySchema>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
});

CategorySchema.index({ id: 1 }, { unique: true });
CategorySchema.index({ name: 1 }, { unique: true });
```

---

### Mapper

**`category.mapper.ts`** implements `IBidirectionalMapper<ICategorySchema, CategoryAggregate>`:

```ts
toRightSide(schema: ICategorySchema): CategoryAggregate {
  return CategoryAggregate.init({
    id: IdValueObject.init({ value: schema.id }).result as IdValueObject,
    name: CategoryNameValueObject.init({ value: schema.name }).result as CategoryNameValueObject,
    createdAt: DateValueObject.init({ value: schema.created_at }).result as DateValueObject,
    updatedAt: DateValueObject.init({ value: schema.updated_at }).result as DateValueObject,
  }).result as CategoryAggregate;
}

toLeftSide(aggregate: CategoryAggregate): ICategorySchema {
  return {
    id: aggregate.id.value,
    name: aggregate.name.value,
    created_at: aggregate.createdAt.value,
    updated_at: aggregate.updatedAt.value,
  };
}
```

---

### Repository

**`category-repository.interface.ts`:**
```ts
interface CategoryRepository {
  findById(id: IdValueObject): Promise<CategoryAggregate | null>;
  findByName(name: CategoryNameValueObject): Promise<CategoryAggregate | null>;
  save(category: CategoryAggregate): Promise<void>;
  delete(id: IdValueObject): Promise<void>;
}
```

**`mongoose.category-repository.ts`**: follows `repository.md`.
- `save()`: checks existence by `id`; uses `insertOne` or `replaceOne`
- `delete()`: `this.CategoryModel.deleteOne({ id: id.value })`
- `findByName()`: `this.CategoryModel.findOne({ name: name.value })` — works because `CategoryNameValueObject.sanitizeProps()` has already normalized the value to lowercase

**`mongoose.category-repository.test.ts`**: tests `save` (insert + update), `findByName`, `findById`, `delete`.

---

### Module Wiring

**`category.module.ts`:**
```ts
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
  ],
  providers: [
    CategoryMapper,
    MongooseCategoryRepository,
  ],
  exports: [MongooseCategoryRepository], // required — injected into product services in PRD 4
})
export class CategoryModule {}
```

Register `CategoryModule` in `AppModule`.

---

### Tests

`.spec.ts`: `CategoryAggregate`, `CategoryNameValueObject`.

`.test.ts`: `MongooseProductRepository`.

---

## File Providers

**Location:** `src/providers/file/`

### Interface

**`file.interface.ts`:**
```ts
export const FILE_PROVIDER = 'FILE_PROVIDER';

export interface IFileProvider {
  upload(params: {
    filename: string;
    buffer: Buffer;
    mimetype: string;
  }): Promise<{ url: string }>;

  delete(filename: string): Promise<void>;
}
```

---

### S3 Implementation

**`implementations/s3/s3.file-provider.ts`:**
```ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class S3FileProvider implements IFileProvider {
  constructor(
    private readonly s3Client: S3Client,
    private readonly bucketName: string,
    private readonly region: string,
  ) {}

  async upload({ filename, buffer, mimetype }: { filename: string; buffer: Buffer; mimetype: string }): Promise<{ url: string }> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: buffer,
        ContentType: mimetype,
        ACL: 'public-read',
      }),
    );
    return { url: `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${filename}` };
  }

  async delete(filename: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: filename }),
    );
  }
}
```

**`implementations/s3/s3.file-provider.test.ts`**: tests `upload` and `delete` by mocking `S3Client.send`.

---

### Node-fs Implementation

**`implementations/node-fs/node-fs.file-provider.ts`:**
```ts
import * as fs from 'node:fs';
import * as path from 'node:path';

export class NodeFsFileProvider implements IFileProvider {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload({ filename, buffer }: { filename: string; buffer: Buffer; mimetype: string }): Promise<{ url: string }> {
    fs.writeFileSync(path.join(this.uploadDir, filename), buffer);
    return { url: `/uploads/${filename}` };
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
```

**`implementations/node-fs/node-fs.file-provider.test.ts`**: writes to a temp directory, verifies `upload` writes the file and `delete` removes it.

---

### FileProviderModule

**`file-provider.module.ts`:**
```ts
@Module({
  providers: [
    {
      provide: FILE_PROVIDER,
      useFactory: (config: ConfigService) => {
        if (process.env.NODE_ENV === 'test') {
          return new NodeFsFileProvider();
        }
        const s3Client = new S3Client({
          region: config.get('AWS_REGION'),
          credentials: {
            accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
          },
        });
        return new S3FileProvider(
          s3Client,
          config.get('S3_BUCKET_NAME'),
          config.get('AWS_REGION'),
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: [FILE_PROVIDER],
})
export class FileProviderModule {}
```

Register `FileProviderModule` in `AppModule`.

---

## Frontend

No frontend changes in this PRD.

---

## Environment Variables

No new variables. All declared in PRD 1.

---

## Acceptance Criteria

1. `CategoryModule` registers in `AppModule` without compilation errors
2. `MongooseCategoryRepository.save()` persists a category to MongoDB
3. `MongooseCategoryRepository.findByName("Electronics")` returns the same category saved as `"electronics"` (case-insensitive via value-object normalization)
4. `MongooseCategoryRepository.delete()` removes the category
5. `FileProviderModule` registers without errors
6. `NodeFsFileProvider.upload()` creates a file in `uploads/`; `delete()` removes it
7. `S3FileProvider.upload()` sends `PutObjectCommand` to S3 (mock test passes)
8. The `FILE_PROVIDER` token is injectable in other modules via `FileProviderModule` export
