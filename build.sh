#!/bin/sh
cd "$(dirname "$0")"
{ cat src/head.html; echo '<script>'; cat src/content.js src/prehlad.js src/citanka.js src/avatar.js src/app.js; echo '</script>'; } > bystrik.html
echo "built $(wc -c < bystrik.html) bytes"
