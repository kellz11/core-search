#!/usr/bin/env python3
"""Reconstruct the complete CORE Launchpad source tree from transparent manifests."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MANIFEST_DIR = ROOT / ".core-launchpad-manifest"
OUTPUT_DIR = ROOT / "core-launchpad"


def main() -> None:
    grouped: dict[str, dict[int, str]] = {}
    for manifest in sorted(MANIFEST_DIR.glob("*")):
        if not manifest.is_file():
            continue
        for line_number, line in enumerate(manifest.read_text(encoding="utf-8").splitlines(), 1):
            if not line.strip():
                continue
            try:
                payload = json.loads(line)
            except json.JSONDecodeError as exc:
                raise SystemExit(f"Invalid JSON in {manifest}:{line_number}: {exc}") from exc
            for chunk in payload["chunks"]:
                grouped.setdefault(chunk["path"], {})[int(chunk["index"])] = chunk["content"]

    if not grouped:
        raise SystemExit("No launchpad source manifests were found.")

    written = 0
    for relative_path, chunks in grouped.items():
        indexes = sorted(chunks)
        expected = list(range(indexes[-1] + 1))
        if indexes != expected:
            raise SystemExit(f"Missing chunks for {relative_path}: got {indexes}, expected {expected}")
        target = OUTPUT_DIR / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text("".join(chunks[index] for index in indexes), encoding="utf-8")
        written += 1

    required = [
        OUTPUT_DIR / "README.md",
        OUTPUT_DIR / "programs/core-launchpad/src/lib.rs",
        OUTPUT_DIR / "services/migrator/src/migrate.ts",
        OUTPUT_DIR / "apps/web/package.json",
    ]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        raise SystemExit(f"Materialization completed with missing required files: {missing}")

    print(f"CORE Launchpad materialized successfully: {written} files in {OUTPUT_DIR}")
    print("Next: cd core-launchpad && cp .env.example .env && pnpm install")


if __name__ == "__main__":
    main()
