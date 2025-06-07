#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# populate_hashes.sh  –  fill sha256 & file_size_bytes for truck manual dataset
# ---------------------------------------------------------------------------

set -euo pipefail

CSV_IN="truck_manuals_dataset.csv"
CSV_OUT="truck_manuals_dataset_final.csv"
TMP_HASHES="$(mktemp)"
DEST_DIR="manuals"

# Tools check ---------------------------------------------------------------
command -v curl >/dev/null       || { echo "curl not found."; exit 1; }      # curl downloads files  [oai_citation:0‡stackoverflow.com](https://stackoverflow.com/questions/3405820/downloading-file-using-curl?utm_source=chatgpt.com)
command -v shasum >/dev/null      || { echo "shasum not found."; exit 1; }    # shasum calculates digests
command -v csvjoin >/dev/null    || { echo "csvkit (csvjoin) not found."; exit 1; } # csvjoin merges CSVs  [oai_citation:2‡csvkit.readthedocs.io](https://csvkit.readthedocs.io/en/latest/scripts/csvjoin.html?utm_source=chatgpt.com)

mkdir -p "$DEST_DIR"
echo "pdf_url,sha256,file_size_bytes" > "$TMP_HASHES"

# Iterate over URLs (skip header line)
csvcut -c pdf_url "$CSV_IN" | tail -n +2 | while read -r URL; do
    # Trim possible surrounding quotes
    URL=${URL%\"}
    URL=${URL#\"}
    [[ -z "$URL" ]] && continue   # skip empty cells

    FNAME="$(basename "${URL%%\?*}")"
    OUT="$DEST_DIR/$FNAME"

    # Download if missing
    if [[ ! -s "$OUT" ]]; then
        echo "Downloading $FNAME …"
        curl -L --fail -o "$OUT" "$URL"
    fi

    # Compute hash & size
    SHA=$(shasum -a 256 "$OUT" | awk '{print $1}')
    SIZE=$(stat -f%z "$OUT")

    # Append to temp CSV
    echo "$URL,$SHA,$SIZE" >> "$TMP_HASHES"
done

# Merge hashes back into the main dataset on pdf_url key
csvjoin -c pdf_url "$CSV_IN" "$TMP_HASHES" > "$CSV_OUT"
echo "✅  Updated dataset written to $CSV_OUT"

# Clean up
rm "$TMP_HASHES"