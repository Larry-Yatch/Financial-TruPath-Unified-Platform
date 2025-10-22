# 🚑 Quick Fix Reference Card

## When Things Break, Try This First:

### 1️⃣ "You need access" error
```bash
clasp deploy --description "Fresh Fix"
# Use the NEW URL it gives you
```

### 2️⃣ Infinite "Verifying..." loop
```javascript
// Add this to your callback:
if (!result) {
  showAlert('No response', 'error');
  return;
}
```

### 3️⃣ "Unexpected identifier" error
```bash
# Find the escaped backtick:
grep -n "\\\\`" Code.js
```

### 4️⃣ Check what's actually happening
```bash
node debug-sheets.js watch     # Run this first!
node debug-sheets.js sessions  # See if sessions work
```

### 5️⃣ Emergency bypass (skip login)
```
https://[YOUR-DEPLOYMENT-ID]/exec?route=dashboard&client=TEST001&session=test
```

## 🎯 Current Working Setup
- **URL:** `AKfycbzJ02GAvhdpOFS4ZBQig_xfnsSLkwacBrzwFRiGBvhWcYH2uIiVqyYVJ3WWEBFcsxuO`
- **Test ID:** `TEST001`
- **Sheet ID:** `18qpjnCvFVYDXOAN14CKb3ceoiG6G_nIFc9n3ZO5St24`

## 🔴 Red Flags = Quick Fixes
| You See | You Do |
|---------|--------|
| 403 error | New deployment |
| null error | Add null check |
| syntax error | Check backticks |
| blank page | Check console (F12) |

---
*Print this. Tape it to your monitor. Thank me later.*