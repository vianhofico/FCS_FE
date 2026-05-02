# Phase 8 QA Checklist

## Smoke flows

- Buyer checkout: select address, select shipping option, place order, open payment session.
- Buyer order detail: verify tracking card and timeline render when tracking data is present.
- Seller financial: confirm bank account list loads and withdrawal modal submits.
- Manager moderation: confirm bulk order/return actions are available and update statuses.
- Audit: verify activity log list loads and details panel responds to row selection.

## Validation commands

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

## Release gate

- No TypeScript errors.
- No ESLint errors.
- Regression tests pass.
- Build succeeds.
