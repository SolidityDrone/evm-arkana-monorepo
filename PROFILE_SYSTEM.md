# Profile System — feat/frost-multisig

## What was done

Added a one-time **profile bootstrap** flow so that on first connect (no IndexedDB record), the user must choose their main profile type before interacting with any form. Only one profile per account, cannot be changed after setup.

---

## Profile types

| Type | Description |
|---|---|
| `single` | Signing key derived directly from wallet signature (existing behaviour) |
| `2fa` | 2-of-2 FROST threshold — desktop share stored in IndexedDB, phone share derived deterministically on the second device |

Both modes use the same underlying user key from the wallet signature, unchanged.

---

## Files changed

### `frontend/lib/indexeddb.ts`
- Added `profileType?: 'single' | '2fa'` field to `AccountData`
- Updated `saveAccountData` / `loadAccountData` to serialize/deserialize `profileType`
- Added `saveProfileType(rawHex, type, twoFactorData?)` — persists profile to the rawHex-keyed IndexedDB record (same bucket as `twoFactor`)
- Added `checkProfileSetup(rawHex)` — returns `'no-db' | 'not-initialized' | 'single' | '2fa'`; distinguishes "DB unavailable, skip" from "not yet bootstrapped, show modal"

### `frontend/components/ProfileBootstrapModal.tsx` *(new)*
- Non-dismissable modal (backdrop click blocked, no X button, no cancel on step 1)
- Step 1 — choose Single Key or 2FA
- Step 2 (2FA only) — full DKG flow: generate desktop share → produce phone URL → wait for phone response → complete group key
- Calls `onComplete({ type, twoFactorData? })` when done; caller persists to IndexedDB

### `frontend/components/arcane-header.tsx`
- Added `profileBootstrapOpen` state
- `useEffect` on `zkAddress` — calls `checkProfileSetup`; if `'not-initialized'` opens the bootstrap modal
- `handleProfileBootstrapComplete` — saves profile via `saveProfileType` then closes modal
- Renders `<ProfileBootstrapModal>` alongside the other modals

### `frontend/components/AccountModal.tsx`
- Replaced `twoFactorActive: boolean` state with `profileType: 'single' | '2fa' | undefined`
- Profile loaded via `checkProfileSetup` when modal opens
- Account title now shows **"Single Key"** badge (subtle) or **"2FA"** badge (primary) based on profile type
- Mage / Archon mode entries remain separated as before; profile type is displayed as a header badge

---

## IndexedDB key format note

Two separate records per zkAddress exist in `arkana_account_db`:
- **`zk...` keyed** — token data, mageTokenData, archonTokenData
- **rawHex keyed** (strip `zk` prefix) — twoFactor, profileType

All profile/2FA operations use the rawHex key to stay consistent with the existing `saveTwoFactorData` / `loadTwoFactorData` pattern.
