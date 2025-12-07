<p align="center">
  <img src="https://github.com/raptor-http/brand/raw/main/assets/logo.svg" width="150" height="150" alt="Raptor Framework" />
</p>

<p align="center">
  <a href="https://github.com/raptor-http/error/actions"><img src="https://github.com/raptor-http/error/workflows/ci/badge.svg" alt="Build Status"></a>
  <a href="jsr.io/@raptor/error"><img src="https://jsr.io/badges/@raptor/error?logoColor=3A9D95&color=3A9D95&labelColor=083344" /></a>
  <a href="jsr.io/@raptor/error score"><img src="https://jsr.io/badges/@raptor/error/score?logoColor=3A9D95&color=3A9D95&labelColor=083344" /></a>
  <a href="https://jsr.io/@raptor"><img src="https://jsr.io/badges/@raptor?logoColor=3A9D95&color=3A9D95&labelColor=083344" alt="" /></a>
</p>

## Raptor Error

See more information about the Raptor framework here: <a href="https://jsr.io/@raptor/framework">https://jsr.io/@raptor/framework</a>.

# Usage

> [!NOTE]
> This is currently under heavy development and is not yet suitable for production use. Please proceed with caution.

## Installation

To start using the error handling, simply install into an existing Raptor application via the CLI or import it directly from JSR.

### Using the Deno CLI

```
deno add jsr:@raptor/error
```

### Importing with JSR

Raptor is also available to import directly via JSR:
[https://jsr.io/@raptor/error](https://jsr.io/@raptor/error)

## Usage

The error handler supports both development and production mode.

```ts
import { ErrorHandler } from "jsr:@raptor/error";
import { Kernel, Context } from "jsr:@raptor/framework";

const app = new Kernel();

const handler = new ErrorHandler({
  env: "development"
});

app.add(() => "Hello, Dr Malcolm!");

app.catch((error: Error, context: Context) => {
  return handler.handle(error, context)
});

app.serve({ port: 8000 });
```

# License

_Copyright 2025, @briward. All rights reserved. The framework is licensed under
the MIT license._
