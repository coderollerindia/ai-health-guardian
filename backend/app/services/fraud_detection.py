"""Deterministic cross-checks that back up Gemini's own bill-reasoning with
real arithmetic, so `verification.gst_correct` isn't solely dependent on the
LLM's math."""

# Standard Indian GST slabs applicable to hospital billing categories
# (most core healthcare services are exempt/0%, but medicines, room rent
# above threshold, and certain services attract 5/12/18%).
GST_SLABS = (0.0, 0.05, 0.12, 0.18)

# Tolerance band: GST computed on a slab is considered a match if it's within
# 5% (relative) or Rs. 5 (absolute) of the stated GST - accounts for rounding.
_RELATIVE_TOLERANCE = 0.05
_ABSOLUTE_TOLERANCE = 5.0


def cross_check_gst(subtotals: dict) -> bool:
    """Returns True if the stated GST plausibly matches one of the standard
    slabs applied to the pre-tax charges; False if it doesn't match any slab
    (a strong signal of an overcharge or billing error)."""
    try:
        medicine = float(subtotals.get("medicine_charges") or 0)
        room = float(subtotals.get("room_charges") or 0)
        consultation = float(subtotals.get("consultation_fees") or 0)
        lab = float(subtotals.get("lab_charges") or 0)
        gst = float(subtotals.get("gst") or 0)
    except (TypeError, ValueError):
        return True  # can't verify - don't falsely flag

    pre_tax = medicine + room + consultation + lab
    if pre_tax <= 0:
        return True  # nothing taxable to check

    for slab in GST_SLABS:
        expected = pre_tax * slab
        tolerance = max(expected * _RELATIVE_TOLERANCE, _ABSOLUTE_TOLERANCE)
        if abs(expected - gst) <= tolerance:
            return True

    return False


def detect_duplicate_line_items(line_items: list[dict]) -> list[str]:
    """Backend safety-net duplicate detector: flags line items with the same
    (normalized) description AND amount appearing more than once, in case
    Gemini's own duplicate_charges list missed any."""
    seen: dict[tuple[str, float], int] = {}
    duplicates: list[str] = []

    for item in line_items:
        description = (item.get("description") or "").strip().lower()
        try:
            amount = round(float(item.get("amount") or 0), 2)
        except (TypeError, ValueError):
            amount = 0.0
        if not description:
            continue
        key = (description, amount)
        seen[key] = seen.get(key, 0) + 1

    for (description, amount), count in seen.items():
        if count > 1:
            duplicates.append(f"{description} (billed {count}x at {amount})")

    return duplicates
