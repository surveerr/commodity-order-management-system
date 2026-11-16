# Commodity Order Management System

A training/demo application implementing **Level 1 and Level 2 only** from the NCDEX Full Stack Engineering Challenge. It is not an exchange and does not place real trades.

## Architecture

- Angular 19 SPA: login, dashboard, instruments, order creation/listing and role-aware actions.
- Spring Cloud Gateway (`8080`) routes frontend `/api/**` calls using Eureka service IDs.
- Eureka (`8761`) discovers Order Service and Instrument Service.
- Order Service (`8081`): Spring MVC, Spring Security/JWT, BCrypt, PostgreSQL/JPA, OpenFeign, Kafka producer.
- Instrument Service (`8082`): Spring MVC, Spring Security/JWT, MongoDB, Redis cache-aside, Kafka consumer.
- PostgreSQL stores users and orders; MongoDB stores instrument documents; Kafka topic `order-events` carries `ORDER_CREATED`; Redis caches instrument-by-ID for five minutes.

## Run with Docker

Requirements: Docker Engine + Compose plugin. From the project root:

```bash
# Optional: override the local demo signing secret with a random value of at least 32 bytes
export JWT_SECRET='replace-this-with-a-random-secret-at-least-32-bytes'
docker compose up --build
```

Open `http://localhost:4200`, Eureka at `http://localhost:8761`, Order OpenAPI at `http://localhost:8081/swagger-ui/index.html`, Instrument OpenAPI at `http://localhost:8082/swagger-ui/index.html`. API requests from the SPA go through Gateway at port 8080 (proxied by Nginx).

Demo credentials (local use only): `admin / Admin@123` (ADMIN) and `operator / Operator@123` (OPERATIONS). Passwords are seeded as BCrypt hashes. Do not expose this configuration publicly.

## Seed instruments

Create the following instruments as an administrator using the UI or `POST /api/instruments` through Gateway with a Bearer token:

```json
{"id":"GOLD-001","symbol":"GOLD","name":"Gold","category":"PRECIOUS_METAL","indicativePrice":15000,"active":true}
```

Also add `SILVER-001` / SILVER / Silver / PRECIOUS_METAL / 180, `CRUDE-001` / CRUDEOIL / Crude Oil / ENERGY / 6200 and `GAS-001` / NATGAS / Natural Gas / ENERGY / 250. These are demo indicative values, not market prices.

## Main APIs

- `POST /api/auth/login` `{ "username":"operator", "password":"Operator@123" }`
- `GET,POST /api/instruments`; `GET /api/instruments/{id}`; `PUT /api/instruments/{id}`; `PATCH /api/instruments/{id}/status?active=false`
- `GET,POST /api/orders`; `GET /api/orders/{id}`; `PATCH /api/orders/{id}/approve|reject|cancel`; `GET /api/orders/dashboard`
- Orders support `page`, `size`, `sort`, `direction`, `instrumentId`, and `status` query parameters.

## Security and business rules

- JWTs are stateless and validated by each business service; role checks are enforced server-side.
- ADMIN can maintain instruments, view all orders, and approve/reject submitted orders. OPERATIONS can view instruments, create orders, view their own orders, and cancel their own submitted orders.
- Quantity and price must be positive. Orders can transition only from SUBMITTED to APPROVED, REJECTED or CANCELLED. Final states cannot be processed again.
- Order Service verifies instrument existence and active status through OpenFeign before persisting an order. Each service accesses only its own database.

## Tests and verification

### Manual verification

The following application workflows have been tested manually:

- Admin and Operations login.
- Instrument creation and visibility across both roles.
- Order creation by Operations.
- Order approval and rejection by Admin.
- Dashboard order counts showing two orders: one approved and one rejected.
- Role-aware dashboard visibility for Admin and Operations.

### Automated Tests

The following automated tests were executed successfully:

- **Order Service:** Maven test lifecycle completed with BUILD SUCCESS.
- **Instrument Service:** Maven test lifecycle completed with BUILD SUCCESS.
- **Angular Frontend:** Jasmine/Karma tests completed successfully, with 2 of 2 tests passing.

Run the tests locally:

```bash
cd backend/order-service
mvn test

cd ../instrument-service
mvn test

cd ../../frontend
npm install
npm test
```

### Manual Integration Testing

The following workflows were verified manually:

- Admin and Operations users can log in with their respective roles.
- Operations can create orders and view available instruments.
- Admin can approve and reject submitted orders.
- Admin can create instruments, and the instruments are visible to Operations.
- Approved and rejected orders are reflected in the application.
- Operations receives HTTP 403 Forbidden when accessing the Admin-only dashboard API.
- Admin receives HTTP 200 OK when accessing the dashboard API.

### Security Verification

Role-based authorization is enforced on the backend. The dashboard endpoint is restricted to users with the ADMIN role.

The security check was verified using authenticated requests with both Operations and Admin JWTs.

### Notes

- Automated test results reflect the tests executed during development.
- Manual verification does not replace comprehensive automated integration testing.
- Demo credentials are intended for local development only. Do not expose them in a public deployment.
- Review application logs and test results when troubleshooting environment-specific issues.


## Level 2 integrations

- Gateway/Eureka: service discovery and load-balanced API routes.
- Kafka: Order Service publishes JSON `ORDER_CREATED`; Instrument Service consumes it and increments `orderActivityCount`.
- Redis: instrument lookup cache-aside with five-minute TTL; updates/status changes evict the cache.
- Actuator: health and basic metrics endpoints.
- OpenAPI/Swagger: each MVC service exposes API docs.
- AWS S3: no AWS credentials or bucket are bundled. `docs/S3-INTEGRATION.md` documents a safe private-bucket integration path; per assignment, do not commit credentials. Upload is not exposed as a working API in this baseline.

## Scope deliberately excluded

Level 3 stretch work such as OAuth2/OIDC, NgRx, Config Server, CI/CD, Kubernetes, Prometheus/Grafana is not included.
