---
name: Dependency remediation
description: Non-obvious dependency resolution and release-age constraints during security updates.
---

Do not assume that updating a direct parent, even with a recursive depth option, replaces vulnerable transitive resolutions. Check the resulting dependency tree and audit; use a compatible scoped override when the latest parent still preserves an affected resolution.

**Why:** Targeted and parent updates left affected Express transitives unchanged despite compatible patched releases being available.

**How to apply:** Verify actual installed versions after dependency updates, rather than inferring safety from the parent's version or allowed ranges.

Keep the one-day package release delay enabled during remediation. If the newest release is too recent, look for an older patched release before considering an exception.

**Why:** A newest release was initially ineligible while an older release in the same major version already contained the required fix.

**How to apply:** Compare advisory patch ranges with eligible release versions; do not disable supply-chain protections merely to install the newest patch.
