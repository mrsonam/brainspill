import type { MutationCtx, QueryCtx } from "./_generated/server";

type AuthenticatedIdentity = NonNullable<
  Awaited<ReturnType<QueryCtx["auth"]["getUserIdentity"]>>
>;

async function getUserByTokenIdentifier(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
) {
  return await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", tokenIdentifier),
    )
    .unique();
}

function getIdentityName(identity: AuthenticatedIdentity) {
  return identity.name ?? identity.nickname ?? identity.email ?? undefined;
}

export async function requireAuthenticatedIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Authentication required.");
  }

  return identity;
}

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await requireAuthenticatedIdentity(ctx);

  return await getUserByTokenIdentifier(ctx, identity.tokenIdentifier);
}

export async function getOrCreateCurrentUser(ctx: MutationCtx) {
  const identity = await requireAuthenticatedIdentity(ctx);
  const existingUser = await getUserByTokenIdentifier(
    ctx,
    identity.tokenIdentifier,
  );

  if (existingUser) {
    return existingUser;
  }

  const now = Date.now();
  const userId = await ctx.db.insert("users", {
    tokenIdentifier: identity.tokenIdentifier,
    email: identity.email ?? undefined,
    name: getIdentityName(identity),
    imageUrl: identity.pictureUrl ?? undefined,
    createdAt: now,
    updatedAt: now,
  });
  const user = await ctx.db.get(userId);

  if (!user) {
    throw new Error("Could not create user.");
  }

  return user;
}
