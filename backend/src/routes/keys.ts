import { Router } from "express";
import { z } from "zod";
import { authMiddleware, requireSession } from "../middleware/auth";
import { keyLimiter } from "../middleware/rateLimit";
import { createApiKey, listApiKeys, revokeApiKey, rotateApiKey } from "../security/apiKeys";
import { audit } from "../security/audit";
import { SCOPES, isScope } from "../security/scopes";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authMiddleware, requireSession);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const keys = await listApiKeys(req.auth!.userId);
    res.json({ keys });
  })
);

router.post(
  "/",
  keyLimiter,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        name: z.string().trim().min(1).max(60),
        scopes: z.array(z.string()).max(SCOPES.length).optional(),
        expiresInDays: z.number().int().min(1).max(365).optional(),
      })
      .parse(req.body);
    const scopes = (body.scopes ?? ["agent:run"]).filter(isScope);
    if (!scopes.length) {
      return res.status(400).json({ error: "invalid_request", message: "Choose at least one scope" });
    }
    const expiresAt = body.expiresInDays ? new Date(Date.now() + body.expiresInDays * 86400000) : null;
    const created = await createApiKey({ userId: req.auth!.userId, name: body.name, scopes, expiresAt });
    await audit(req, "key_created", req.auth!.userId, { keyId: created.key.id, secretId: created.key.secret_id });
    res.status(201).json({
      secret: created.secret,
      key: created.key,
      warning: "Copy this secret now. It is stored only as a hash and cannot be shown again.",
    });
  })
);

router.post(
  "/:id/rotate",
  keyLimiter,
  asyncHandler(async (req, res) => {
    const id = z.string().uuid().parse(req.params.id);
    const rotated = await rotateApiKey(req.auth!.userId, id);
    await audit(req, "key_rotated", req.auth!.userId, { previousId: rotated.previousId, keyId: rotated.key.id });
    res.json({
      secret: rotated.secret,
      key: rotated.key,
      previousId: rotated.previousId,
      warning: "The previous secret stopped working. Copy the new secret now.",
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = z.string().uuid().parse(req.params.id);
    await revokeApiKey(req.auth!.userId, id);
    await audit(req, "key_revoked", req.auth!.userId, { keyId: id });
    res.json({ revoked: true, id });
  })
);

export default router;
