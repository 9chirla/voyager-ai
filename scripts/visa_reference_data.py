"""
Verified passport-alone visa statuses for matrix destinations.

Primary source for IN: India MEA Visa Facility page (updated 2 Feb 2026)
https://www.mea.gov.in/vffin
Supplemented by destination government sites and 2026 policy changes
(e.g. Albania MFA, Thailand May 2026 VOA reinstatement).

Statuses: visa-free | visa-on-arrival | e-visa | visa-required
"""

from __future__ import annotations

# Indian passport alone — all destinations in the xlsx matrix (83 ISO codes)
IN_PASSPORT_ALONE: dict[str, str] = {
    "AE": "visa-required",  # VOA only with qualifying UK/US/EU/CA/AU/NZ/JP/SG/KR visa (MEA)
    "AL": "e-visa",  # Albania MFA — e-visa.al; VF only with UK/US/Schengen visa
    "AM": "e-visa",  # MEA e-visa; VOA with qualifying residence permit
    "AR": "e-visa",  # MEA e-visa list
    "AU": "e-visa",  # MEA e-visa
    "AZ": "e-visa",
    "BH": "e-visa",  # MEA e-visa; VOA with qualifying visa
    "BR": "visa-required",
    "BT": "visa-free",  # MEA visa-free
    "CA": "visa-required",
    "CH": "visa-required",
    "CL": "e-visa",  # MEA e-visa
    "CN": "visa-required",
    "CO": "e-visa",
    "CR": "visa-required",  # VF with US/CA/UK/Schengen visa (held-visa sheet)
    "CU": "e-visa",  # MEA e-visa
    "CZ": "visa-required",
    "DE": "visa-required",
    "DO": "visa-required",  # MEA VF only with EU/US/CA/UK visa
    "EG": "e-visa",  # MEA e-visa; VOA with qualifying visa
    "ES": "visa-required",
    "ET": "visa-on-arrival",  # MEA e-visa + VOA at Addis Ababa
    "FJ": "visa-on-arrival",  # MEA VOA (not passport-alone VF)
    "FR": "visa-required",
    "GB": "visa-required",
    "GE": "e-visa",  # MEA e-visa
    "GH": "visa-on-arrival",  # MEA VOA
    "GR": "visa-required",
    "HK": "e-visa",  # MEA PAR e-visa
    "HR": "visa-required",
    "HU": "visa-required",
    "ID": "visa-on-arrival",  # MEA e-visa + 30-day VOA
    "IE": "visa-required",
    "IL": "e-visa",  # MEA e-visa
    "IN": "visa-free",
    "IS": "visa-required",
    "IT": "visa-required",
    "JM": "visa-free",  # MEA visa-free
    "JO": "e-visa",  # MEA e-visa + VOA
    "JP": "e-visa",  # MEA e-visa (xlsx wrongly had visa-required)
    "KE": "e-visa",  # MEA ETA
    "KH": "visa-on-arrival",  # MEA e-visa + VOA
    "KR": "visa-required",  # VF via UK/US/Schengen held visa
    "KW": "visa-required",
    "LA": "visa-on-arrival",  # MEA e-visa + VOA
    "LK": "e-visa",  # MEA e-visa + VOA
    "MA": "e-visa",  # MEA e-visa
    "MD": "e-visa",  # MEA e-visa (xlsx wrongly had VF)
    "ME": "visa-required",  # VF with UK/US/Schengen held visa
    "MG": "visa-on-arrival",
    "MK": "visa-required",  # VF with UK/US/Schengen held visa
    "MM": "visa-on-arrival",  # MEA e-visa + tourist VOA
    "MU": "visa-on-arrival",  # MEA VOA
    "MV": "visa-free",  # MEA visa-free
    "MX": "e-visa",  # VF with US/UK/Schengen/CA/AU/JP visa (held-visa sheet)
    "MY": "visa-free",  # MEA visa-free (till 31 Dec 2026)
    "NG": "visa-required",
    "NL": "visa-required",
    "NO": "visa-required",
    "NP": "visa-free",  # MEA visa-free
    "NZ": "e-visa",  # MEA e-visa
    "OM": "e-visa",  # MEA e-visa; VOA with qualifying visa
    "PA": "visa-required",  # VF with US/UK/CA/AU/JP/Schengen visa
    "PE": "visa-required",  # VF with US/UK/CA/AU/JP/Schengen visa
    "PH": "visa-free",  # MEA 14-day VF; 30 days with qualifying visa
    "PL": "visa-required",
    "PT": "visa-required",
    "QA": "visa-on-arrival",  # MEA VOA (not passport-alone VF)
    "RS": "e-visa",
    "RW": "visa-free",  # MEA visa-free (xlsx had VOA)
    "SA": "e-visa",  # Tourist e-visa; MEA VOA with qualifying visa
    "SC": "visa-free",  # MEA visa-free (STA required)
    "SE": "visa-required",
    "SG": "e-visa",  # MEA e-visa (xlsx wrongly had VF)
    "SN": "visa-free",  # MEA visa-free
    "TH": "visa-on-arrival",  # Thailand May 2026: India back on VOA (2,000 THB)
    "TN": "visa-required",  # Conditional VF only with qualifying visas
    "TW": "e-visa",  # MEA e-visa (restricted categories)
    "TZ": "visa-on-arrival",  # MEA e-visa + VOA
    "US": "visa-required",
    "VN": "e-visa",  # MEA e-visa
    "ZA": "e-visa",  # MEA e-visa / ETA (xlsx wrongly had VF)
    "ZW": "visa-on-arrival",  # MEA VOA
}

# Indian passport cost/time overrides when xlsx still says "Free VF"
IN_COST_OVERRIDES: dict[str, dict] = {
    "AL": {"cost": "~€15 eVisa", "processing": "Up to 15 days"},
    "AM": {"cost": "~$6 eVisa", "processing": "3–5 days"},
    "AR": {"cost": "~$200 eVisa", "processing": "Varies"},
    "GE": {"cost": "~$20 eVisa", "processing": "5 days"},
    "HK": {"cost": "Free PAR", "processing": "Online before travel"},
    "ID": {"cost": "~$35 VOA", "processing": "On arrival"},
    "IL": {"cost": "~$30 eVisa", "processing": "Varies"},
    "JP": {"cost": "~¥3,000 / $20", "processing": "5–7 days"},
    "MD": {"cost": "~€20 eVisa", "processing": "Varies"},
    "ME": {"cost": "Embassy visa", "processing": "Varies"},
    "MK": {"cost": "Embassy visa", "processing": "Varies"},
    "QA": {"cost": "Free VOA", "processing": "On arrival"},
    "RS": {"cost": "~€20 eVisa", "processing": "Varies"},
    "SG": {"cost": "~$30 eVisa", "processing": "3–5 days"},
    "TH": {"cost": "2,000 THB VOA", "processing": "On arrival"},
    "AE": {"cost": "VOA with qualifying visa", "processing": "On arrival"},
    "ZA": {"cost": "~$50 ETA", "processing": "Instant"},
    "KR": {"cost": "Embassy visa", "processing": "Varies"},
    "CO": {"cost": "~$52 eVisa", "processing": "Instant"},
    "CR": {"cost": "Embassy visa", "processing": "Varies"},
    "DO": {"cost": "Tourist card + qualifying visa", "processing": "Varies"},
    "PA": {"cost": "Embassy visa", "processing": "Varies"},
    "PE": {"cost": "Embassy visa", "processing": "Varies"},
    "CL": {"cost": "~$50 eVisa", "processing": "Varies"},
    "BR": {"cost": "Embassy visa", "processing": "Varies"},
    "RW": {"cost": "Free VF", "processing": "30 days"},
    "FJ": {"cost": "Free VOA", "processing": "On arrival"},
    "MU": {"cost": "Free VOA", "processing": "On arrival"},
}

IN_NOTES_OVERRIDES: dict[str, str] = {
    "AL": "E-visa required; visa-free only with valid UK/US/Schengen multiple-entry visa (previously used)",
    "TH": "VOA reinstated May 2026 (2,000 THB); TDAC registration required before arrival",
    "AE": "VOA only with valid UK/US/EU/CA/AU/NZ/JP/SG/KR visa or residence permit",
    "DO": "Visa-free only with valid EU/US/Canada/UK visa",
    "PH": "14 days visa-free; 30 days with US/JP/AU/CA/Schengen/SG/UK visa",
    "MY": "Visa-free till 31 Dec 2026 per Malaysian High Commission",
}

# Corrections for other matrix passports (Henley / gov sources, 2025–2026)
OTHER_PASSPORT_CORRECTIONS: dict[tuple[str, str], str] = {
    # Brazil reinstated visa for US/CA/AU citizens (April 2024) — xlsx already VR for US/CA
    ("AU", "BR"): "visa-required",
    # Nigeria e-visa for Indian travellers (MEA)
    ("IN", "NG"): "visa-required",  # redundant with IN reference but explicit
}

PASSPORT_REFERENCES: dict[str, dict[str, str]] = {
    "IN": IN_PASSPORT_ALONE,
}
