```
npx create-turbo@latest
```

```
cd apps
nest new backend --strict --package-manager pnpm
npx sv create frontend
```

pnpm add @repo/typescript-config --filter backend --save-dev
pnpm add @repo/typescript-config --filter frontend --save-dev
