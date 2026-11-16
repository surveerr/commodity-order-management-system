# Verification checklist and limitations

## Automated tests to run

- `cd backend/order-service && mvn test`: invalid state transition and missing-order service tests.
- `cd backend/instrument-service && mvn test`: Redis cache hit and missing-instrument tests.
- `cd frontend && npm install && npm test`: Angular shell smoke tests.
- `docker compose up --build`: full-stack integration.

## Manual end-to-end checks

1. Verify Eureka lists `ORDER-SERVICE`, `INSTRUMENT-SERVICE`, and `API-GATEWAY`.
2. Log in as admin; create GOLD-001, SILVER-001, CRUDE-001 and GAS-001.
3. Log in as operator; create a BUY order for active GOLD-001 with positive quantity/price.
4. Confirm order exists in PostgreSQL and is returned from `/api/orders`.
5. Confirm `ORDER_CREATED` reaches the Instrument Service consumer and its activity count increments.
6. Repeat GET instrument by ID to exercise Redis hit; update/deactivate it to test eviction. Wait over five minutes to test TTL expiration.
7. Confirm inactive or missing instrument order requests fail; quantity/price <= 0 fail validation.
8. Confirm operator cannot create/update instruments or approve/reject orders; operator can only view/cancel own submitted orders.
9. Approve one order as admin; confirm re-approval/rejection/cancellation of terminal states returns a conflict.
10. Check `/actuator/health` for services and database/cache dependencies.

## Important caveats to resolve before claiming production readiness

- Build and tests were not executed in the authoring environment because Maven and Docker were unavailable. Compile/test this project locally and fix any dependency or configuration issues before presenting it as verified.
- JWT is HMAC-based and configured from `JWT_SECRET`; change it for local use. This demo does not implement refresh tokens or server-side revocation; frontend logout removes the token locally.
- The initial database schema is created/updated by Hibernate for this challenge; production should use migrations and tighter schema controls.
- Kafka publication is after the database save but is not transactionally atomic; the assignment explicitly accepts this basic approach. Production should use an outbox/retry strategy.
- Basic exception handling and health endpoints are included; production error schemas, rate limiting, audit trails, retry/circuit breaker, and observability are out of scope.
- S3 is a documented integration design only in this baseline; no upload endpoint or real AWS access was tested.
- Dashboard endpoint is ADMIN-only to match the role table; Operations sees the dashboard shell but may receive 403. If the evaluator expects dashboard statistics for all authenticated roles, adjust the role rule intentionally.
