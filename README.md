# Hexacore

A TypeScript library built with tsup.

## Installation

```bash
npm install @honeycomb-app/hexacore
```

## Usage

```typescript
import { add, subtract } from '@honeycomb-app/hexacore';

const sum = add(5, 3); // 8
const difference = subtract(5, 3); // 2
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Build the library:
```bash
npm run build
```

3. Development mode with watch:
```bash
npm run dev
```

## Publishing to GitHub Packages

1. Create a GitHub Personal Access Token with `write:packages` scope.

2. Create or edit `.npmrc` in your project root:
```
@yourusername:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

3. Login to GitHub Packages:
```bash
npm login --registry=https://npm.pkg.github.com --scope=@yourusername
```

4. Publish your package:
```bash
npm publish
```

## License

MIT
