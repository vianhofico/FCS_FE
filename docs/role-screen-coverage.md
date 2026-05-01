# Role Screen Coverage Tracker

Nguồn chuẩn:
- `docs/FRONTEND_ROLE_SCREEN_API_SPEC.md`
- `docs/FRONTEND_BUYER_API_SPEC.md`
- `docs/FRONTEND_SELLER_API_SPEC.md`
- `docs/FRONTEND_MANAGER_API_SPEC.md`
- `docs/FRONTEND_ADMIN_API_SPEC.md`

Quy ước trạng thái:
- `S0`: Chưa scaffold
- `S1`: Scaffold UI + route
- `S2`: Tích hợp API đúng contract
- `S3`: Hoàn tất state Loading/Empty/Error/Data + QA cơ bản

## Buyer
- [ ] B-01 Login — S0
- [ ] B-02 Register — S0
- [ ] B-03 Forgot/Reset password — S0
- [ ] B-04 Product Listing — S0
- [ ] B-05 Product Detail — S0
- [ ] B-06 Wishlist — S0
- [ ] B-07 Addresses — S0
- [ ] B-08 Cart — S0
- [ ] B-09 Checkout & Create Order — S0
- [ ] B-10 Order History / Detail — S0
- [ ] B-11 Return Requests — S0
- [ ] B-12 Profile & Change Password — S0
- [ ] B-13 Wallet & Notifications — S0

## Seller
- [ ] S-01 Seller Dashboard — S0
- [ ] S-02 Create Consignment Request — S0
- [ ] S-03 Consignment List & Detail — S0
- [ ] S-04 Contract Signing — S0
- [ ] S-05 Seller Wallet — S0
- [ ] S-06 Withdrawal — S0
- [ ] S-07 Notifications & Chat — S0

## Manager
- [ ] M-01 Operations Dashboard — S0
- [ ] M-02 Consignment Moderation — S0
- [ ] M-03 Product Backoffice — S0
- [ ] M-04 Order Management — S0
- [ ] M-05 Return/Refund Processing — S0
- [ ] M-06 Withdrawal Approval — S0
- [ ] M-07 Voucher/Catalog Settings — S0
- [ ] M-08 User Ops — S0
- [ ] M-09 Notifications/Audit/Chat — S0

## Admin
- [ ] A-01 Role Management — S0
- [ ] A-02 Permission Management — S0
- [ ] A-03 User Governance — S0
- [ ] A-04 Token Preview / Security Ops — S0

## Phase 1 hardening checkpoints
- [x] API envelope chuẩn `ApiResponse<T>` + `errorCode/errors`
- [x] Pagination chuẩn `PageResponse<T>` (`content/totalElements/...`)
- [x] Endpoint roots bám backend controller mappings
- [x] Request interceptor tự động gắn bearer token
- [x] Response interceptor chuẩn hoá lỗi và clear session khi 401
- [x] Guard primitives cho authenticated/role-based route
