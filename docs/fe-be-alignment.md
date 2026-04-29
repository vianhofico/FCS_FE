# FE-BE Alignment Guide

## Principle

Frontend module structure mirrors backend package-by-feature modules.

## Module mapping

- `src/modules/iam` -> `com.fcs.be.modules.iam`
- `src/modules/catalog` -> `com.fcs.be.modules.catalog`
- `src/modules/product` -> `com.fcs.be.modules.product`
- `src/modules/consignment` -> `com.fcs.be.modules.consignment`
- `src/modules/order` -> `com.fcs.be.modules.order`
- `src/modules/financial` -> `com.fcs.be.modules.financial`
- `src/modules/notification` -> `com.fcs.be.modules.notification`
- `src/modules/audit` -> `com.fcs.be.modules.audit`
- `src/modules/health` -> `com.fcs.be.modules.health`

## App and shared boundaries

- App composition: `src/app` (router, layout, providers, config)
- Shared utilities/contracts: `src/shared`
- Feature-specific API adapters should stay inside each module when business APIs are implemented.

## API contract baseline

- Base URL from `VITE_API_BASE_URL` only.
- Response envelope assumed: `ApiResponse<T>` from `src/shared/contracts/apiContract.ts`.
- Error handling is centralized in `src/shared/api/http.ts`.
- Endpoint roots are centralized in `src/shared/api/endpoints.ts`.
- Each module owns typed API layer under `src/modules/<module>/api`.
