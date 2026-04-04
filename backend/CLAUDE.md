# Goal:
Develop a RESTful API for order and product management, focusing on best practices (SOLID), code organization into classes, and database manipulation.

## Functional Requirements:
- For sellers module requirements read this `@docs/requirements/sellers.md`.
- For customers module requirements read this `@docs/requirements/customers.md`.
- For categories module requirements read this `@docs/requirements/categories.md`.
- For products module requirements read this `@docs/requirements/products.md`.
- For orders module requirements read this `@docs/requirements/orders.md`.

## Technical Requirements:
- Using Node.js with NestJS.
- Using Mongodb with Mongoose.
- Use JWT for access and refresh tokens.
- Use "ddd-tool-kit" lib for domain aggregates, entities and value-objects (and another ddd utils). (https://www.npmjs.com/package/ddd-tool-kit)
- The Customers AccesToken and RefreshToken should be different of Sellers AccesToken and RefreshToken
- Document the all API routes with Swagger.
- Create a logging middleware (you can use any library).
- Create a auth middleware in routes needed this.
- Files with `.spec.ts` should be considered unit tests.
- Files with `.test.ts` files should be considered integration tests.
- Write unit tests for services, aggregate roots, entities and value objects.
- Write integration tests for providers, controllers and repositories.
- Product Images should be save in S3 bucket ("@aws-sdk/client-s3").
- S3 bucket and node:fs should be a file providers implementations.
- When you will use or write a aggregate-root class you can use this `@docs/files-patterns/aggregate-root.md` as a pattern.
- When you will use or write a bidirectional-mapper class you can use this `@docs/files-patterns/bidirectional-mapper.md` as a pattern.
- When you will use or write a controller class you can use this `@docs/files-patterns/controller.md` as a pattern.
- When you will use or write a entity class you can use this `@docs/files-patterns/entity.md` as a pattern.
- When you will use or write a repository class you can use this `@docs/files-patterns/repository.md` as a pattern.
- When you will use or write a schema class you can use this `@docs/files-patterns/schema.md` as a pattern.
- When you will use or write a service class you can use this `@docs/files-patterns/service.md` as a pattern.
- When you will use or write a unidirectional-mapper class you can use this `@docs/files-patterns/unidirectional-mapper.md` as a pattern.
- When you will use or write a value-object class you can use this `@docs/files-patterns/value-object.md` as a pattern.

- Use this directory structure:
```txt
  -src/
    |___-utils/ -> Should have utils functions
    |___-config/ -> Should have all config files (ex: environment configuration)
    |___-middlewares/ -> Should have all application middlewares
    |___-shared/  -> Should have all modules shared business rules (ex: PasswordValueObject is identical in Sellers and Customers module)
    |   |_______-entities/
    |   |_______-value-objects/
    |           |_____________-password/
    |                         |_________-password.value-object.ts
    |                         |_________-password.value-object.ts
    |                         |_________-password.value-object.spec.ts
    |
    |___-providers/ -> Should have all providers (any external axuliar tool) and with that implementations
    |   |___________-file/
    |               |_____-implementations/
    |               |     |_________________-s3/
    |               |     |                 |_______-s3.file-provider.ts
    |               |     |                 |_______-s3.file-provider.test.ts
    |               |     |_________________-node-fs/
    |               |                       |_______-node-fs.file-provider.ts
    |               |                       |_______-node-fs.file-provider.test.ts
    |               |
    |               |_____-file.interface.ts
    |
    |
    |___-modules/
        |_____-orders/
        |     |_______-domain/      -> Should have domain classes with business rules
        |     |       |_______-entities/  -> Should have entities (entities is considered with entity (Basically, whenever the aggregate attribute has an array, it will be an array of entities.))
        |     |       |       |_________-entity-name/
        |     |       |                 |_____-entity-name.props.ts
        |     |       |                 |_____-entity-name.errors.ts
        |     |       |                 |_____-entity-name.entity.ts
        |     |       |                 |_____-entity-name.entity.spec.ts
        |     |       |
        |     |       |_______-value-objects/
        |     |       |       |_________-value-object-name/
        |     |       |                 |___________________-value-object-name.props.ts
        |     |       |                 |___________________-value-object-name.errors.ts
        |     |       |                 |___________________-value-object-name.value-object.ts
        |     |       |                 |___________________-value-object-name.value-object.spec.ts
        |     |       |
        |     |       |_______-order.props.ts
        |     |       |_______-order.errors.ts
        |     |       |_______-order.aggregate-root.ts
        |     |       |_______-order.aggregate-root.spec.ts
        |     |
        |     |_______-repositories/    -> Should have all orders repositories (Typically, there will only be one repository for each module, which would be the module's own repository.)
        |     |       |_________-orders/
        |     |                 |_____-implementations/
        |     |                 |      |_________________-postgres/ -> This is only example, we will use mongodb as database
        |     |                 |      |                 |_______-postgres-provider.ts
        |     |                 |      |                 |_______-postgres-provider.test.ts
        |     |                 |      |
        |     |                 |      |_________________-mongodb/
        |     |                 |                        |_______-mongodb.order-repository.ts
        |     |                 |                        |_______-mongodb.order-repository.test.ts
        |     |                 |       
        |     |                 |_____-order-repository.interface.ts
        |     |
        |     |_______-services/  -> Should have all orders services + unit tests
        |     |       |_________-create-order/
        |     |                 |____________-create-order.usecase.ts
        |     |                 |____________-create-order.usecase.spec.ts
        |     |
        |     |_______-controllers/ -> Should have all orders controllers + integration tests
        |     |       |_____________-create-oder/
        |     |                     |_____________-create-order.controller.ts
        |     |                     |_____________-create-order.controller.test.ts
        |     |
        |     |_______-order.module.ts
        |
        |_____-sellers/
        |_____-products/
        |_____-customers/
        |_____-categories/
```