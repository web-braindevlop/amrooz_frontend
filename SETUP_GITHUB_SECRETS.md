# 🔐 Setup GitHub Secrets for Deployment

## ⚠️ IMPORTANT: Security Issue

Your deployment credentials are currently in the workflow file. This is **NOT secure** because:
- ❌ Anyone with repo access can see your password
- ❌ Password is visible in Git history
- ❌ Public repos expose your credentials to everyone

## ✅ Solution: Use GitHub Secrets

GitHub Secrets encrypt your credentials and inject them at runtime.

---

## Step-by-Step Setup

### 1. Go to Repository Settings

Visit: https://github.com/web-braindevlop/amrooz_frontend/settings/secrets/actions

Or manually:
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

---

### 2. Add These 4 Secrets

Click "New repository secret" for each one:

#### Secret 1: SSH_HOST
- **Name**: `SSH_HOST`
- **Value**: `145.79.30.125`
- Click **Add secret**

#### Secret 2: SSH_PORT
- **Name**: `SSH_PORT`  
- **Value**: `65002`
- Click **Add secret**

#### Secret 3: SSH_USERNAME
- **Name**: `SSH_USERNAME`
- **Value**: `u278943707`
- Click **Add secret**

#### Secret 4: SSH_PASSWORD
- **Name**: `SSH_PASSWORD`
- **Value**: `ZXC@789v`
- Click **Add secret**

---

### 3. Commit the Updated Workflow

The workflow file is already updated to use secrets:

```yaml
with:
  host: ${{ secrets.SSH_HOST }}
  username: ${{ secrets.SSH_USERNAME }}
  password: ${{ secrets.SSH_PASSWORD }}
  port: ${{ secrets.SSH_PORT }}
```

Just commit and push:

```bash
cd e:\amrooz_collection\frontend
git add .github/workflows/deploy-production.yml
git commit -m "Use GitHub Secrets for SSH credentials"
git push
```

---

### 4. Verify It Works

1. Go to: https://github.com/web-braindevlop/amrooz_frontend/actions
2. Click on the latest workflow run
3. Check if deployment succeeded
4. ✅ Green checkmark = Success!

---

## 🎯 What You'll See

### Before (Insecure):
```yaml
host: '145.79.30.125'        # ❌ Visible to everyone
password: 'ZXC@789v'         # ❌ Exposed in code
```

### After (Secure):
```yaml
host: ${{ secrets.SSH_HOST }}        # ✅ Encrypted
password: ${{ secrets.SSH_PASSWORD }} # ✅ Hidden
```

In the workflow logs, secrets are automatically masked:
```
Connecting to ***
Using username ***
Password: ***
```

---

## 📋 Quick Checklist

- [ ] Go to repository settings
- [ ] Navigate to Secrets and variables → Actions
- [ ] Add `SSH_HOST` = `145.79.30.125`
- [ ] Add `SSH_PORT` = `65002`
- [ ] Add `SSH_USERNAME` = `u278943707`
- [ ] Add `SSH_PASSWORD` = `ZXC@789v`
- [ ] Commit updated workflow file
- [ ] Push to GitHub
- [ ] Check Actions tab for deployment

---

## ⚡ After Setup

Once secrets are added:
1. Any push to `main` branch will auto-deploy
2. Your credentials are encrypted
3. Logs will show `***` instead of actual values
4. You can update secrets anytime without changing code

---

## 🔄 Bonus: Backend Repository

Do the same for your backend repository:

Visit: https://github.com/web-braindevlop/amrooz_backend/settings/secrets/actions

Add the same 4 secrets there too!

---

## ❓ Need Help?

If deployment fails after adding secrets:
1. Double-check all 4 secrets are added correctly
2. Make sure there are no extra spaces in values
3. Check the Actions tab for error logs
4. Secrets are case-sensitive: use exact names

**Security tip**: After setup, consider changing your SSH password and updating the secret!
