# AWS S3 Level 2 integration demonstration plan

The assignment explicitly permits a documented S3 integration design when AWS credentials/permissions are unavailable. This source intentionally does not include AWS keys or pretend that an upload has been tested.

1. Create a **private** S3 bucket and block all public access.
2. Grant the application's IAM role only `s3:PutObject`, `s3:GetObject`, and (if needed) `s3:DeleteObject` on the required bucket prefix. Prefer an EC2/ECS IAM role over long-lived access keys.
3. Add AWS SDK for Java v2 `software.amazon.awssdk:s3` to Order Service. Configure `S3Client` with `DefaultCredentialsProvider` and `AWS_REGION`/`S3_BUCKET` environment variables.
4. Add a document metadata entity/table containing `id`, `orderId`, `objectKey`, original filename, content type, byte size, uploader and created timestamp. Store only metadata in PostgreSQL; file bytes belong in S3.
5. Add an authenticated endpoint `POST /api/orders/{id}/documents` that verifies order ownership/ADMIN access, permits a strict allow-list of MIME types, enforces a small size limit, generates a random object key, and uploads with server-side encryption.
6. Add a controlled download endpoint that rechecks authorization and streams the object, or returns a short-lived presigned URL. Do not expose bucket objects publicly.
7. Use `AWS_REGION` and `S3_BUCKET` environment variables; never commit credentials. For local demos, use an AWS-compatible mock or present the design and explain that real cloud permissions were unavailable.

This integration is documented, not implemented or tested in this baseline. State that clearly during evaluation.
