# Git Push Guide - Resolving Authentication Issues

## Current Status

✅ **Files Committed**: All Vercel deployment files have been committed locally
❌ **Push Failed**: Authentication error (403 Permission Denied)

## The Issue

The error shows:
```
remote: Permission to hatchettc84/ProGRC.git denied to hatchettc.
```

This indicates your local Git is authenticated as `hatchettc` but trying to push to `hatchettc84`'s repository.

## Solutions

### Option 1: Use SSH Instead of HTTPS (Recommended)

1. **Change remote URL to SSH**:
   ```bash
   git remote set-url origin git@github.com:hatchettc84/ProGRC.git
   ```

2. **Set up SSH key** (if not already done):
   ```bash
   # Check if you have SSH keys
   ls -la ~/.ssh
   
   # If no keys, generate one
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Add to SSH agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   
   # Copy public key to clipboard
   cat ~/.ssh/id_ed25519.pub | pbcopy
   ```

3. **Add SSH key to GitHub**:
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your public key
   - Save

4. **Test connection**:
   ```bash
   ssh -T git@github.com
   ```

5. **Push again**:
   ```bash
   git push origin main
   ```

### Option 2: Use Personal Access Token (PAT)

1. **Create Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" > "Generate new token (classic)"
   - Name: "Vercel Deployment"
   - Scopes: Check `repo` (full control of private repositories)
   - Generate token
   - **Copy the token immediately** (you won't see it again)

2. **Update remote URL with token**:
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/hatchettc84/ProGRC.git
   ```

   Or use your username:
   ```bash
   git remote set-url origin https://hatchettc84@github.com/hatchettc84/ProGRC.git
   ```
   
   (Git will prompt for password - use the PAT as password)

3. **Push**:
   ```bash
   git push origin main
   ```

### Option 3: Use GitHub CLI (Easiest)

1. **Install GitHub CLI**:
   ```bash
   brew install gh
   ```

2. **Authenticate**:
   ```bash
   gh auth login
   ```
   
   Follow prompts:
   - GitHub.com
   - HTTPS
   - Authenticate Git with your GitHub credentials
   - Login with web browser

3. **Push**:
   ```bash
   git push origin main
   ```

### Option 4: Use GitHub Desktop

1. **Download**: https://desktop.github.com/
2. **Sign in** with `hatchettc84` account
3. **Open repository** in GitHub Desktop
4. **Click "Push origin"**

## Verify After Push

```bash
# Check remote status
git remote -v

# Verify push succeeded
git log --oneline -3

# Check GitHub (should see new commit)
# Visit: https://github.com/hatchettc84/ProGRC
```

## Best Practices

### ✅ What Should Be Committed

- ✅ Source code (`.py` files)
- ✅ Configuration files (`vercel.json`, `requirements.txt`)
- ✅ Documentation (`.md` files)
- ✅ API endpoints (`api/*.py`)
- ✅ Build configuration files

### ❌ What Should NOT Be Committed

- ❌ AWS credentials (`.env` files, `.aws/` directory)
- ❌ Virtual environments (`.venv/`, `venv/`)
- ❌ Python cache (`__pycache__/`, `*.pyc`)
- ❌ Reports (`reports/` directory)
- ❌ IDE settings (`.vscode/`, `.idea/`)
- ❌ Private keys (`*.pem`)

### Current `.gitignore` Status

Your `.gitignore` already excludes:
- `__pycache__/`
- `.venv/`, `venv/`
- `.aws/`
- `*.pem`
- `reports/`
- `.vscode/`, `.idea/`

✅ **Good!** Sensitive files are already protected.

## After Successful Push

Once pushed, you can:

1. **Deploy to Vercel**:
   - Go to https://vercel.com/new
   - Import `hatchettc84/ProGRC`
   - Deploy

2. **Verify on GitHub**:
   - Visit: https://github.com/hatchettc84/ProGRC
   - Check that all files are visible
   - Verify commit history

## Troubleshooting

### Still Getting 403 Error?

1. **Check repository permissions**:
   - Ensure you have write access to `hatchettc84/ProGRC`
   - If it's not your repo, you need to fork it first

2. **Verify authentication**:
   ```bash
   # Check current Git user
   git config user.name
   git config user.email
   
   # Should match your GitHub account
   ```

3. **Clear cached credentials** (macOS):
   ```bash
   git credential-osxkeychain erase
   host=github.com
   protocol=https
   ```

4. **Try with explicit credentials**:
   ```bash
   git push https://hatchettc84@github.com/hatchettc84/ProGRC.git main
   ```

## Summary

**Current Status**: ✅ Committed locally, ❌ Not pushed yet

**Next Step**: Choose one of the authentication methods above and push to GitHub

**Recommended**: Use SSH (Option 1) for long-term ease, or GitHub CLI (Option 3) for quick setup

