# Mobile Path (Phase 6)

When ready to add native mobile:

1. Create `apps/mobile` with Expo (`npx create-expo-app`)
2. Import shared types from `@travel-planner/core`
3. Reuse validation, pace rules, and export logic
4. Start with read-only trip view from share token / API
5. Add editing once web API is stable

```bash
# Future setup
cd apps/mobile
npx create-expo-app@latest . --template blank-typescript
npm install @travel-planner/core
```
