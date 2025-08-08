# Build Checklist for Tournament Application

This checklist ensures successful builds and deployments to Cloudflare Pages.

## Pre-Deployment Checklist

### ✅ MUST HAVE (Critical for Build Success)

#### 1. Git Repository Management
- [ ] **All source files committed**: Verify no untracked files in `src/` directory
  ```bash
  git status | grep "src/"
  ```
- [ ] **Required component files tracked**:
  - [ ] `src/components/PasswordModal.tsx`
  - [ ] `src/components/NavigationTabs.tsx`
  - [ ] `src/hooks/useAuth.ts`
  - [ ] All files in `src/components/tabs/`
- [ ] **No import of untracked files**: Run validation script
  ```bash
  node scripts/validate-build.js
  ```

#### 2. Build Configuration
- [ ] **TypeScript configuration**: `tsconfig.json` exists with proper path aliases
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/*": ["./src/*"]
      }
    }
  }
  ```
- [ ] **Dependencies installed**: All imports have corresponding packages in `package.json`
- [ ] **Environment variables set**:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `NEXT_PUBLIC_TOURNAMENT_ID`
- [ ] **Next.js static export**: Verify `next.config.js` has `output: 'export'`

#### 3. Code Quality
- [ ] **TypeScript compiles**: No TypeScript errors
  ```bash
  npx tsc --noEmit
  ```
- [ ] **ESLint passes**: No linting errors
  ```bash
  npm run lint
  ```
- [ ] **Build succeeds locally**:
  ```bash
  npm run build
  ```

### ❌ MUST NOT HAVE (Build Blockers)

#### 1. Git Anti-patterns
- [ ] ❌ **No untracked source files**: All files in `src/` must be in git
- [ ] ❌ **No import of missing files**: Every import must resolve to a tracked file
- [ ] ❌ **No conflicting file names**: Check for case sensitivity issues
- [ ] ❌ **No `.gitignore` blocking source files**: Verify `.gitignore` doesn't exclude needed files

#### 2. Security Anti-patterns
- [ ] ❌ **No sensitive data in NEXT_PUBLIC_* vars**: Passwords, secrets, keys should be server-side only
- [ ] ❌ **No hardcoded credentials**: Remove any fallback passwords in code
- [ ] ❌ **No exposed API keys**: Keep sensitive keys server-side
- [ ] ❌ **No client-only authentication**: Implement server-side validation

#### 3. Build Configuration Anti-patterns
- [ ] ❌ **No `ignoreBuildErrors: true`**: Fix TypeScript errors properly
- [ ] ❌ **No `ignoreDuringBuilds: true`**: Fix ESLint errors properly
- [ ] ❌ **No missing dependencies**: All imported packages must be in `package.json`
- [ ] ❌ **No incorrect path aliases**: Verify all `@/` imports resolve correctly

## Automated Validation

### Run Pre-Build Validation
```bash
# Run the validation script before deploying
node scripts/validate-build.js

# Expected output for successful validation:
# ✓ All required files present
# ✓ All imported files are tracked
# ✓ Environment variables checked
# ✓ Build configuration checked
# ✓ Git repository is clean
```

### Add to package.json
```json
{
  "scripts": {
    "validate": "node scripts/validate-build.js",
    "build": "npm run validate && next build",
    "pages:build": "npm run validate && NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

## Common Issues and Solutions

### Issue: Module not found during build
**Solution**: Check if the file exists locally and is tracked in git
```bash
# Check if file exists
ls -la src/components/YourComponent.tsx

# Add to git if untracked
git add src/components/YourComponent.tsx
git commit -m "Add missing component"
git push
```

### Issue: Environment variable missing
**Solution**: Add to Cloudflare Pages environment settings
1. Go to Cloudflare Pages dashboard
2. Settings → Environment variables
3. Add the missing variable
4. Trigger rebuild

### Issue: Build runs out of memory
**Solution**: Optimize bundle size or increase memory allocation
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

## Deployment Workflow

1. **Local Development**
   ```bash
   npm run dev
   ```

2. **Pre-deployment Check**
   ```bash
   npm run validate
   npm run build
   ```

3. **Commit Changes**
   ```bash
   git add .
   git status  # Verify all needed files are staged
   git commit -m "Your descriptive message"
   ```

4. **Deploy**
   ```bash
   git push origin main
   ```

5. **Monitor Deployment**
   - Check Cloudflare Pages dashboard
   - Review build logs for any errors
   - Verify deployment URL works

## Security Checklist

### Before Each Deployment
- [ ] No passwords in client-side code
- [ ] No API keys in NEXT_PUBLIC_* variables
- [ ] Authentication implemented server-side
- [ ] Environment variables properly scoped
- [ ] No console.log with sensitive data

## Performance Checklist

### Optimization Checks
- [ ] Bundle size under 500KB for initial load
- [ ] Images optimized and using next/image
- [ ] Unnecessary dependencies removed
- [ ] Code splitting implemented for large components
- [ ] Static pages where possible

## Post-Deployment Verification

### After Successful Deployment
- [ ] All pages load correctly
- [ ] Authentication works as expected
- [ ] API endpoints responding
- [ ] No console errors in browser
- [ ] Mobile responsive design working

## Emergency Rollback

If deployment fails or causes issues:
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

## Support

For build issues:
1. Run validation script first
2. Check this checklist
3. Review Cloudflare Pages build logs
4. Check for untracked files with `git status`

Last updated: 2025-08-08