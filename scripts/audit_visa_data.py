#!/usr/bin/env python3
"""Audit generated visa matrix against verified reference data."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from visa_reference_data import IN_PASSPORT_ALONE, PASSPORT_REFERENCES

NAME_TO_ISO_PATH = ROOT / "scripts/country_name_to_iso.json"
MATRIX_JS = ROOT / "src/data/visaMatrix.js"


def load_name_to_iso() -> dict:
    with open(NAME_TO_ISO_PATH, encoding="utf-8") as f:
        return json.load(f)


def parse_generated_matrix() -> dict[str, dict[str, str]]:
    text = MATRIX_JS.read_text(encoding="utf-8")
    buckets = {}
    for key, const in [
        ("visa-free", "VISA_FREE"),
        ("visa-on-arrival", "VISA_ON_ARRIVAL"),
        ("e-visa", "E_VISA"),
    ]:
        match = re.search(rf"export const {const} = (\{{[\s\S]*?\}});", text)
        buckets[key] = json.loads(match.group(1)) if match else {}

    result: dict[str, dict[str, str]] = {}
    passports = set()
    for bucket in buckets.values():
        passports.update(bucket.keys())

    for passport in passports:
        for dest in set().union(*[set(buckets[b].get(passport, [])) for b in buckets]):
            if dest in buckets["visa-free"].get(passport, []):
                result.setdefault(passport, {})[dest] = "visa-free"
            elif dest in buckets["visa-on-arrival"].get(passport, []):
                result.setdefault(passport, {})[dest] = "visa-on-arrival"
            elif dest in buckets["e-visa"].get(passport, []):
                result.setdefault(passport, {})[dest] = "e-visa"

    # visa-required: passport in matrix but dest not listed
    for passport in passports:
        if passport not in result:
            result[passport] = {}
        for dest, ref_status in PASSPORT_REFERENCES.get(passport, {}).items():
            if ref_status == "visa-required" and dest not in result[passport]:
                result[passport][dest] = "visa-required"
            elif dest in PASSPORT_REFERENCES.get(passport, {}):
                actual = result[passport].get(dest, "visa-required")
                if actual != ref_status:
                    result[passport][dest] = actual

    return result


def main() -> None:
    generated = parse_generated_matrix()
    mismatches = []

    for dest, expected in sorted(IN_PASSPORT_ALONE.items()):
        actual = generated.get("IN", {}).get(dest, "visa-required")
        if actual != expected:
            mismatches.append((dest, expected, actual))

    if mismatches:
        print("IN passport mismatches vs verified reference:")
        for dest, expected, actual in mismatches:
            print(f"  {dest}: expected {expected}, got {actual}")
        raise SystemExit(1)

    print(f"IN passport: {len(IN_PASSPORT_ALONE)} destinations verified OK")

    # Spot-check xlsx raw India column drift
    name_to_iso = load_name_to_iso()
    wb = openpyxl.load_workbook(ROOT / "Voyager_VisaIntelligence_June2026.xlsx", read_only=True, data_only=True)
    ws = wb["📊 Visa Matrix"]
    xlsx_wrong = 0
    for row in ws.iter_rows(values_only=True):
        if not isinstance(row[0], (int, float)) or not row[1]:
            continue
        dest_iso = name_to_iso.get(str(row[1]).strip())
        if dest_iso not in IN_PASSPORT_ALONE:
            continue
        raw = str(row[3] or "")
        expected = IN_PASSPORT_ALONE[dest_iso]
        normalized = {
            "visa-free": "Visa-Free",
            "visa-on-arrival": "Visa on Arrival",
            "e-visa": "e-Visa",
            "visa-required": "Visa Required",
        }[expected]
        if normalized not in raw and not (expected == "visa-free" and "Visa-Free" in raw):
            if raw and "N/A" not in raw:
                xlsx_wrong += 1
    print(f"xlsx India column entries differing from reference: {xlsx_wrong}/{len(IN_PASSPORT_ALONE)}")


if __name__ == "__main__":
    main()
