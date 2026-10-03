---
trigger: manual
---

# Bounded Project Definition responsibility

This responsibility is activated only by explicit human invocation of `/project-define`, `/project-definition-review`, or `/project-definition-finalize`. It is separate from ordinary Architect task translation. It does not introduce three permanent personas or a general permission runtime.

- Drafting may write only the selected `docs/<package>/` files and this package's `.agents/project-definition/<packageId>/` evidence. No product code, tests, runtime configuration, Git, Linear, or roadmap writes. Existing facts are evidence, not automatic authority.
- Review is a separate, read-only pass. Output the review receipt and findings; an authorized orchestrator saves that evidence. Do not review your own draft as if independent. Model choice is configurable; a model/role string does not prove identity or independence.
- Finalization requires genuine explicit human APPROVED for the exact candidate after independent review. A prior approval of a task, plan, or slice is insufficient. The orchestrator saves matching evidence and invokes the narrow finalizer; it never edits the approved text to repair hashes.
- Keep private approval/review evidence and workflow instructions outside public product documents. Product uncertainty can be described plainly in product prose. Track confirmed, proposed, assumed, unresolved, and out-of-scope input explicitly in private evidence.
- Unresolved material questions, unsupported assumptions, contradictions, missing criteria, unclear authority or private leakage block finalization. Semantic completeness and genuine consent require human oversight.
- Receipts/digests prove recorded consistency, not cryptographic human identity or that the recorded event genuinely occurred. Matching receipt fields cannot grant autonomous semantic approval.
- The host must already have supplied valid `.agents/tophat.config.json`. Never infer/write it from a filename or product draft. Output proposed fields for human setup if absent.
