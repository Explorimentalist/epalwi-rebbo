import { d as defineEventHandler, a as assertMethod, r as readBody, c as createError, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import jwt from 'jsonwebtoken';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp } from 'firebase-admin/app';
import 'fs/promises';
import 'path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@iconify/utils';
import 'consola';
import 'firebase-functions';

function initFirebaseAdmin() {
  if (getApps().length === 0) {
    const config = useRuntimeConfig();
    const firebaseConfig = {
      projectId: config.public.firebaseProjectId
      // Add other config as needed
    };
    try {
      initializeApp(firebaseConfig);
    } catch (error) {
      console.error("Failed to initialize Firebase Admin:", error);
      throw error;
    }
  }
}
function verifyMagicLinkToken(token) {
  const config = useRuntimeConfig();
  if (!config.mailersendApiKey) {
    throw new Error("JWT secret not configured");
  }
  try {
    const payload = jwt.verify(token, config.mailersendApiKey, {
      algorithms: ["HS256"],
      issuer: "epalwi-rebbo",
      audience: "epalwi-rebbo-users"
    });
    const now = Math.floor(Date.now() / 1e3);
    if (payload.exp < now) {
      throw new Error("Token expired");
    }
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    } else {
      throw error;
    }
  }
}
async function createOrGetUserProfile(email) {
  var _a, _b, _c, _d;
  initFirebaseAdmin();
  const auth = getAuth();
  const db = getFirestore();
  try {
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        firebaseUser = await auth.createUser({
          email,
          emailVerified: true
          // Email is verified through magic link
        });
      } else {
        throw error;
      }
    }
    const userDocRef = db.collection("users").doc(firebaseUser.uid);
    const userDoc = await userDocRef.get();
    const now = /* @__PURE__ */ new Date();
    const trialEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1e3);
    if (!userDoc.exists) {
      const newUserProfile = {
        uid: firebaseUser.uid,
        email,
        displayName: firebaseUser.displayName || null,
        photoURL: firebaseUser.photoURL || null,
        role: "user",
        createdAt: now,
        lastLoginAt: now,
        subscription: {
          status: "trial"
        },
        trial: {
          startDate: now,
          endDate: trialEndDate,
          daysRemaining: 14,
          isExpired: false
        },
        emailVerified: true,
        isActive: true
      };
      await userDocRef.set(newUserProfile);
      const customClaims = {
        role: "user",
        subscriptionStatus: "trial",
        trialEndDate: trialEndDate.getTime()
      };
      await auth.setCustomUserClaims(firebaseUser.uid, customClaims);
      return newUserProfile;
    } else {
      const userData = userDoc.data();
      const trialStart = ((_b = (_a = userData["trial"]) == null ? void 0 : _a.startDate) == null ? void 0 : _b.toDate()) || userData["createdAt"].toDate();
      const trialEnd = ((_d = (_c = userData["trial"]) == null ? void 0 : _c.endDate) == null ? void 0 : _d.toDate()) || new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1e3);
      const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1e3)));
      const isExpired = now > trialEnd;
      const updatedProfile = {
        ...userData,
        lastLoginAt: now,
        emailVerified: true,
        trial: {
          startDate: trialStart,
          endDate: trialEnd,
          daysRemaining,
          isExpired
        }
      };
      await userDocRef.update({
        lastLoginAt: now,
        emailVerified: true,
        "trial.daysRemaining": daysRemaining,
        "trial.isExpired": isExpired
      });
      return updatedProfile;
    }
  } catch (error) {
    console.error("Error creating/getting user profile:", error);
    throw error;
  }
}
async function createFirebaseCustomToken(uid, claims) {
  initFirebaseAdmin();
  const auth = getAuth();
  try {
    const customToken = await auth.createCustomToken(uid, claims);
    return customToken;
  } catch (error) {
    console.error("Error creating custom token:", error);
    throw error;
  }
}
const verifyMagicLink_post = defineEventHandler(async (event) => {
  try {
    assertMethod(event, "POST");
    const body = await readBody(event);
    if (!body || !body.token) {
      throw createError({
        statusCode: 400,
        statusMessage: "Token is required"
      });
    }
    const { token } = body;
    let payload;
    try {
      payload = verifyMagicLinkToken(token);
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message || "Invalid token"
      });
    }
    const userProfile = await createOrGetUserProfile(payload.email);
    const customClaims = {
      role: userProfile.role,
      subscriptionStatus: userProfile.subscription.status,
      trialEndDate: userProfile.trial.endDate.getTime()
    };
    const firebaseToken = await createFirebaseCustomToken(userProfile.uid, customClaims);
    return {
      success: true,
      message: "Verificaci\xF3n exitosa",
      user: userProfile,
      firebaseToken
    };
  } catch (error) {
    console.error("\u274C Verify magic link error:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to verify magic link"
    });
  }
});

export { verifyMagicLink_post as default };
//# sourceMappingURL=verify-magic-link.post.mjs.map
